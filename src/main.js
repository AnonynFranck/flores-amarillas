/**
 * Punto de entrada de la experiencia.
 *
 * Orquesta la escena (galaxia, corazon, estrellas, tunel, esferas y frases),
 * la entrada cinematografica y la interaccion con el puntero y el teclado.
 */
import { Clock, Raycaster, Scene, Vector2 } from 'three';
import { FRASES, INTRO, PERSONA, RECUERDOS } from './config/contenido.js';
import { detectarCalidad, prefiereMenosMovimiento, soportaWebGL } from './lib/preferencias.js';
import { crearRenderizador } from './escena/renderer.js';
import { crearCamara } from './escena/camara.js';
import {
  distanciaDeEncuadre,
  escalaDeFotos,
  escalaDeLegibilidad,
  posicionDeMirador,
  reencuadrar,
} from './escena/encuadre.js';
import { crearControles } from './escena/controles.js';
import { crearPostproceso } from './escena/postproceso.js';
import { crearGalaxia } from './escena/galaxia.js';
import { crearCorazon } from './escena/corazon.js';
import { crearEstrellas } from './escena/estrellas.js';
import { crearWarp } from './escena/warp.js';
import { crearEsferas } from './escena/esferas.js';
import { crearFrases } from './escena/textos.js';
import { aplicarEstadoCamara, crearEstadoEntrada, reproducirEntrada } from './escena/entrada.js';
import { crearIntro } from './ui/intro.js';
import { crearTarjeta } from './ui/tarjeta.js';
import { crearInterfaz } from './ui/interfaz.js';
import { recurso } from './lib/rutas.js';

const DISTANCIA_CLIC = 9; // px: mas que esto ya es un arrastre, no un clic
const DURACION_CLIC = 650; // ms

function mostrarAlternativa() {
  document.body.classList.add('sin-webgl');
  document.querySelector('#sin-webgl')?.removeAttribute('hidden');
  document.querySelector('#intro')?.setAttribute('hidden', '');
}

function iniciar() {
  const lienzo = document.querySelector('#lienzo');
  if (!lienzo || !soportaWebGL()) {
    mostrarAlternativa();
    return;
  }

  const calidad = detectarCalidad();
  const reducido = prefiereMenosMovimiento();

  const escena = new Scene();
  const camara = crearCamara();
  const renderizador = crearRenderizador(lienzo, calidad);
  const postproceso = crearPostproceso(renderizador, escena, camara, calidad);

  const galaxia = crearGalaxia(calidad);
  const corazon = crearCorazon(calidad);
  const estrellas = crearEstrellas(calidad);
  const warp = crearWarp(calidad);
  const esferas = crearEsferas(RECUERDOS, {
    alDetectarFallo: (recuerdo) => {
      // La esfera se queda con su marco dorado, pero conviene enterarse: casi
      // siempre es un nombre de archivo mal escrito en contenido.js.
      console.warn(`No se pudo cargar la imagen del recuerdo "${recuerdo.id}": ${recuerdo.imagen}`);
    },
  });

  escena.add(galaxia.grupo, corazon.grupo, estrellas.objeto, esferas.grupo);
  // El tunel cuelga de la camara para que siempre envuelva la vista.
  camara.add(warp.objeto);
  escena.add(camara);

  let frases = null;
  // Las frases se dibujan en canvas: hay que esperar a que la tipografia este
  // lista o se rasterizarian con la fuente de reserva.
  const fuentesListas = document.fonts?.ready ?? Promise.resolve();
  fuentesListas.then(() => {
    frases = crearFrases(FRASES, { calidad });
    frases.establecerEscala(escalaDeLegibilidad(camara));
    escena.add(frases.grupo);
  });

  const gestorControles = crearControles(camara, renderizador.domElement, {
    autoGiro: reducido ? 0 : 0.32,
  });
  gestorControles.establecerHabilitado(false);

  const tarjeta = crearTarjeta({ reducido });
  const interfaz = crearInterfaz({
    persona: PERSONA,
    recuerdos: RECUERDOS,
    alElegirRecuerdo: (recuerdo) => tarjeta.abrir(recuerdo),
  });
  const intro = crearIntro();

  const estado = crearEstadoEntrada();
  estado.velocidadWarp = 0.05; // deriva suave detras de la portada
  let entradaTerminada = false;

  /**
   * Las frases y las fotos viven en el espacio 3D: si la camara se aleja para
   * encuadrar una pantalla estrecha, encogen. Aqui se compensa para que sigan
   * leyendose y puedan tocarse con el dedo.
   */
  function aplicarEscalaLegible() {
    esferas.establecerEscalaBase(escalaDeFotos(camara));
    frases?.establecerEscala(escalaDeLegibilidad(camara));
  }

  // --- Interaccion con el puntero -------------------------------------------
  const rayo = new Raycaster();
  const puntero = new Vector2();
  let resaltada = null;
  let inicioPuntero = null;

  const actualizarPuntero = (evento) => {
    puntero.x = (evento.clientX / window.innerWidth) * 2 - 1;
    puntero.y = -(evento.clientY / window.innerHeight) * 2 + 1;
  };

  const esferaBajoPuntero = () => {
    rayo.setFromCamera(puntero, camara);
    const impactos = rayo.intersectObjects(esferas.sprites, false);
    return impactos.length > 0 ? impactos[0].object : null;
  };

  lienzo.addEventListener('pointermove', (evento) => {
    if (!entradaTerminada) return;
    actualizarPuntero(evento);
    const objetivo = esferaBajoPuntero();
    if (objetivo === resaltada) return;
    esferas.resaltar(resaltada, false);
    esferas.resaltar(objetivo, true);
    resaltada = objetivo;
    lienzo.style.cursor = objetivo ? 'pointer' : 'grab';
  });

  lienzo.addEventListener('pointerdown', (evento) => {
    inicioPuntero = { x: evento.clientX, y: evento.clientY, tiempo: performance.now() };
    lienzo.style.cursor = 'grabbing';
  });

  lienzo.addEventListener('pointerup', (evento) => {
    if (!entradaTerminada || !inicioPuntero) return;
    const distancia = Math.hypot(
      evento.clientX - inicioPuntero.x,
      evento.clientY - inicioPuntero.y
    );
    const duracion = performance.now() - inicioPuntero.tiempo;
    inicioPuntero = null;
    lienzo.style.cursor = 'grab';
    // Solo un toque corto y quieto abre la tarjeta: arrastrar es para girar.
    if (distancia > DISTANCIA_CLIC || duracion > DURACION_CLIC) return;

    actualizarPuntero(evento);
    const objetivo = esferaBajoPuntero();
    if (objetivo) tarjeta.abrir(objetivo.userData.recuerdo);
  });

  // El menu contextual estorba al girar con el boton derecho.
  lienzo.addEventListener('contextmenu', (evento) => evento.preventDefault());

  // --- Redimensionado --------------------------------------------------------
  let pendienteRedimension = false;
  const redimensionar = () => {
    if (pendienteRedimension) return;
    pendienteRedimension = true;
    requestAnimationFrame(() => {
      pendienteRedimension = false;
      const ancho = window.innerWidth;
      const alto = window.innerHeight;
      camara.aspect = ancho / alto;
      camara.updateProjectionMatrix();
      postproceso.redimensionar(ancho, alto);
      // Al cambiar la forma de la ventana hay que rehacer el encuadre o la
      // galaxia se sale por los lados (tipico al girar el movil).
      if (entradaTerminada) {
        reencuadrar(camara);
        gestorControles.establecerLimites(distanciaDeEncuadre(camara));
        aplicarEscalaLegible();
      }
    });
  };
  window.addEventListener('resize', redimensionar);
  window.addEventListener('orientationchange', redimensionar);

  // --- Vigilancia de rendimiento ---------------------------------------------
  // Si el equipo no sostiene un ritmo decente, la escena se simplifica sola en
  // vez de arrastrarse: primero se apaga el resplandor y luego baja la
  // resolucion. Es preferible menos brillo que una galaxia a tirones.
  const remedios = [
    () => postproceso.degradar(),
    () => {
      const actual = renderizador.getPixelRatio();
      if (actual <= 1) return false;
      renderizador.setPixelRatio(1);
      redimensionar();
      return true;
    },
  ];
  let remedioActual = 0;
  let cuadrosMedidos = 0;
  let tiempoMedido = 0;

  function vigilarRendimiento(delta) {
    if (remedioActual >= remedios.length || !entradaTerminada) return;
    cuadrosMedidos += 1;
    tiempoMedido += delta;
    if (tiempoMedido < 3) return;

    const fps = cuadrosMedidos / tiempoMedido;
    cuadrosMedidos = 0;
    tiempoMedido = 0;
    if (fps >= 28) {
      remedioActual = remedios.length; // ritmo sano: se deja de vigilar
      return;
    }
    while (remedioActual < remedios.length && !remedios[remedioActual]()) {
      remedioActual += 1;
    }
    remedioActual += 1;
  }

  // --- Bucle de animacion ----------------------------------------------------
  const reloj = new Clock();
  let tiempo = 0;
  let visible = true;

  document.addEventListener('visibilitychange', () => {
    visible = !document.hidden;
    if (visible) reloj.getDelta(); // descarta el salto de tiempo en segundo plano
  });

  function dibujar() {
    requestAnimationFrame(dibujar);
    if (!visible) return;

    const delta = Math.min(reloj.getDelta(), 0.05);
    tiempo += delta;

    if (!entradaTerminada) {
      aplicarEstadoCamara(camara, estado);
    } else {
      gestorControles.actualizar();
    }

    galaxia.actualizar(tiempo);
    galaxia.establecerAparicion(estado.galaxia);
    corazon.actualizar(tiempo, camara);
    corazon.establecerAparicion(estado.corazon);
    estrellas.actualizar(tiempo);
    estrellas.establecerIntensidad(estado.estrellas);
    warp.actualizar(delta, estado.velocidadWarp);
    esferas.actualizar(tiempo, delta);
    esferas.establecerAparicion(estado.esferas);
    if (frases) {
      frases.establecerAparicion(estado.frases);
      frases.actualizar(tiempo, camara);
    }
    interfaz.establecerDestello(estado.destello);

    postproceso.dibujar();
    vigilarRendimiento(delta);
  }
  dibujar();

  // --- Entrada ---------------------------------------------------------------
  intro.marcarListo();
  intro.esperarGesto().then(() => {
    intro.ocultar();
    const mirador = posicionDeMirador(camara);
    gestorControles.establecerLimites(distanciaDeEncuadre(camara));
    aplicarEscalaLegible();
    if (reducido) {
      camara.position.copy(mirador);
      estado.velocidadWarp = 0;
    }

    // Quien no quiera esperar puede acelerar el viaje tocando la pantalla.
    const acelerar = () => viaje?.timeScale(3.2);
    window.addEventListener('pointerdown', acelerar, { once: true });
    window.addEventListener('keydown', acelerar, { once: true });

    const viaje = reproducirEntrada({
      estado,
      reducido,
      mirador,
      alTerminar: () => {
        window.removeEventListener('pointerdown', acelerar);
        window.removeEventListener('keydown', acelerar);
        entradaTerminada = true;
        estado.velocidadWarp = 0;
        gestorControles.establecerHabilitado(true);
        gestorControles.establecerGiroAutomatico(!reducido);
        lienzo.style.cursor = 'grab';
        interfaz.revelar();
      },
    });
  });

  // Precarga de la imagen de la portada para que no parpadee al abrir tarjetas.
  const precarga = new Image();
  precarga.src = recurso(INTRO.imagen);

  // Ventana de inspeccion para las pruebas end to end: permite comprobar que la
  // camara realmente gira al arrastrar sin depender de comparar pixeles.
  window.__camara = {
    get azimut() {
      return gestorControles.controles.getAzimuthalAngle();
    },
    get distancia() {
      return camara.position.distanceTo(gestorControles.controles.target);
    },
    get entradaTerminada() {
      return entradaTerminada;
    },
  };
}

iniciar();
