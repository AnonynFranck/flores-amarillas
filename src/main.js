/**
 * Punto de entrada de la experiencia.
 *
 * Orquesta la escena (galaxia, corazon, estrellas, tunel, esferas y frases),
 * la entrada cinematografica y la interaccion con el puntero y el teclado.
 */
import { Clock, Raycaster, Scene, Vector2 } from 'three';
import { FLORES, FRASES, INTRO, MUSICA, PERSONA, RECUERDOS } from './config/contenido.js';
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
import { crearFlores } from './escena/flores.js';
import { crearFrases } from './escena/textos.js';
import { crearEnfoque } from './escena/enfoque.js';
import { aplicarEstadoCamara, crearEstadoEntrada, reproducirEntrada } from './escena/entrada.js';
import { crearIntro } from './ui/intro.js';
import { crearTarjeta } from './ui/tarjeta.js';
import { crearInterfaz } from './ui/interfaz.js';
import { crearReproductor } from './ui/musica.js';
import { crearControlMusica } from './ui/controlMusica.js';
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

  const flores = crearFlores(FLORES, { calidad });

  escena.add(galaxia.grupo, corazon.grupo, estrellas.objeto, esferas.grupo, flores.grupo);
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

  const enfoque = crearEnfoque({ camara, controles: gestorControles.controles, reducido });

  const reproductor = crearReproductor(MUSICA, {
    alCambiar: (estadoMusica) => control.actualizar(estadoMusica),
  });
  const control = crearControlMusica(reproductor);

  const tarjeta = crearTarjeta({
    reducido,
    alCerrar: () => {
      reproductor.agachar(false);
      enfoque.alejar().then(() => {
        gestorControles.establecerHabilitado(true);
        gestorControles.establecerGiroAutomatico(!reducido);
      });
    },
  });

  // Indice por identificador: la lista accesible entrega un recuerdo, y para
  // acercarse hace falta su orbe.
  const orbePorId = new Map(esferas.sprites.map((sprite) => [sprite.userData.recuerdo.id, sprite]));

  /**
   * Abre un recuerdo: primero la camara se acerca a su orbita y luego, ya
   * encima, aparece la tarjeta. El acercamiento es el que da la sensacion de
   * entrar en ese momento concreto.
   */
  function abrirRecuerdo(recuerdo) {
    const sprite = orbePorId.get(recuerdo.id);
    reproductor.agachar(true);
    gestorControles.establecerHabilitado(false);
    gestorControles.establecerGiroAutomatico(false);
    enfoque.acercar(sprite).then(() => tarjeta.abrir(recuerdo));
  }

  const interfaz = crearInterfaz({
    persona: PERSONA,
    recuerdos: RECUERDOS,
    alElegirRecuerdo: abrirRecuerdo,
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
    flores.establecerEscala(escalaDeFotos(camara));
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
    if (objetivo) abrirRecuerdo(objetivo.userData.recuerdo);
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

  // --- Muestreo del lienzo ---------------------------------------------------
  // Sin preserveDrawingBuffer (lo normal, por rendimiento) el contenido del
  // lienzo WebGL solo se puede leer dentro del mismo cuadro en que se dibujo.
  // Por eso la muestra se toma aqui y no desde fuera.
  let peticionDeMuestra = null;

  function brilloMedioDelLienzo() {
    const reducido = document.createElement('canvas');
    reducido.width = 160;
    reducido.height = 100;
    const contexto = reducido.getContext('2d');
    contexto.drawImage(lienzo, 0, 0, reducido.width, reducido.height);
    const { data } = contexto.getImageData(0, 0, reducido.width, reducido.height);
    let suma = 0;
    for (let i = 0; i < data.length; i += 4) {
      suma += (data[i] + data[i + 1] + data[i + 2]) / 3;
    }
    return suma / (data.length / 4);
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

    // Los orbes se mueven antes que la camara: al acercarse a uno, la camara
    // lo sigue usando su posicion de este cuadro, no la del anterior.
    esferas.actualizar(tiempo, delta);
    esferas.establecerAparicion(estado.esferas);

    if (!entradaTerminada) {
      aplicarEstadoCamara(camara, estado);
    } else if (!enfoque.aplicar()) {
      gestorControles.actualizar();
    }

    galaxia.actualizar(tiempo);
    galaxia.establecerAparicion(estado.galaxia);
    corazon.actualizar(tiempo, camara);
    corazon.establecerAparicion(estado.corazon);
    estrellas.actualizar(tiempo);
    estrellas.establecerIntensidad(estado.estrellas);
    warp.actualizar(delta, estado.velocidadWarp);
    flores.actualizar(tiempo);
    flores.establecerAparicion(estado.esferas);
    if (frases) {
      frases.establecerAparicion(estado.frases);
      frases.actualizar(tiempo, camara);
    }
    interfaz.establecerDestello(estado.destello);

    postproceso.dibujar();

    if (peticionDeMuestra) {
      const responder = peticionDeMuestra;
      peticionDeMuestra = null;
      responder(brilloMedioDelLienzo());
    }

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
        control.mostrar();
        reproductor.iniciar();
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
    /** Brillo medio del ultimo cuadro: sirve para comprobar que se dibujo algo. */
    brilloDelLienzo() {
      return new Promise((resolver) => {
        peticionDeMuestra = resolver;
      });
    },
  };
}

iniciar();
