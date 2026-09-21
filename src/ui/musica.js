/**
 * Banda sonora.
 *
 * Varias canciones encadenadas: suenan en orden distinto en cada visita, se
 * funden entre si al terminar y bajan de volumen cuando se abre una tarjeta,
 * para que las palabras pesen mas que la musica.
 *
 * Se usan dos elementos de audio que se turnan: mientras uno se apaga el otro
 * se enciende. Solo se descarga la cancion que suena y la siguiente, asi que
 * abrir la pagina no cuesta veintitantos megas.
 */
import { avanzar, crearCola } from '../lib/listaReproduccion.js';
import { recurso } from '../lib/rutas.js';

const VOLUMEN = 0.55;
/** Segundos de fundido entre canciones. */
const CRUCE = 6;
/** Cada cuanto se revisa si toca encadenar (ms). */
const LATIDO = 250;
const CLAVE_SILENCIO = 'flores-amarillas:silencio';

function leerSilencio() {
  try {
    return localStorage.getItem(CLAVE_SILENCIO) === '1';
  } catch {
    return false;
  }
}

function guardarSilencio(silencio) {
  try {
    localStorage.setItem(CLAVE_SILENCIO, silencio ? '1' : '0');
  } catch {
    // Navegacion privada o cookies bloqueadas: no es motivo para fallar.
  }
}

export function crearReproductor(lista, { alCambiar } = {}) {
  const inactivo = {
    iniciar() {},
    alternar() {},
    siguiente() {},
    agachar() {},
    get sonando() {
      return false;
    },
    liberar() {},
  };
  if (!lista || lista.length === 0) return inactivo;

  const reproductores = [new Audio(), new Audio()].map((audio) => {
    audio.preload = 'none';
    audio.volume = 0;
    audio.crossOrigin = 'anonymous';
    return audio;
  });

  let activo = 0;
  let cola = crearCola(lista.length);
  let posicion = 0;
  let silencio = leerSilencio();
  let atenuacion = 1; // 1 = normal, <1 = agachada mientras se lee una tarjeta
  let sonando = false;
  let latido = null;
  let cruzando = false;

  const actual = () => reproductores[activo];
  const reserva = () => reproductores[1 - activo];
  const cancion = () => lista[cola[posicion]];

  const volumenObjetivo = () => (silencio ? 0 : VOLUMEN * atenuacion);

  function anunciar() {
    alCambiar?.({ cancion: cancion(), sonando, silencio });
  }

  function cargar(audio, indice) {
    audio.src = recurso(lista[indice].archivo);
    audio.load();
  }

  async function arrancar(audio) {
    try {
      await audio.play();
      sonando = true;
    } catch {
      // El navegador puede rechazar la reproduccion si no hubo un gesto claro.
      // No es un error que deba romper nada: se queda en pausa y la persona
      // puede darle al boton.
      sonando = false;
    }
    anunciar();
  }

  /** Funde del audio activo al de reserva con la siguiente cancion. */
  function encadenar() {
    if (cruzando) return;
    cruzando = true;

    const saliente = actual();
    const entrante = reserva();
    const estado = avanzar(cola, posicion);
    cola = estado.cola;
    posicion = estado.posicion;

    cargar(entrante, cola[posicion]);
    entrante.volume = 0;
    activo = 1 - activo;
    arrancar(entrante);

    const inicio = performance.now();
    const volumenSalida = saliente.volume;
    const paso = () => {
      const avance = Math.min(1, (performance.now() - inicio) / (CRUCE * 1000));
      saliente.volume = volumenSalida * (1 - avance);
      entrante.volume = volumenObjetivo() * avance;
      if (avance < 1) {
        requestAnimationFrame(paso);
        return;
      }
      saliente.pause();
      saliente.removeAttribute('src');
      saliente.load(); // suelta la descarga de la cancion que ya no suena
      cruzando = false;
    };
    requestAnimationFrame(paso);
  }

  function vigilar() {
    const audio = actual();
    if (!sonando || cruzando || !Number.isFinite(audio.duration)) return;
    if (audio.duration - audio.currentTime <= CRUCE) encadenar();
  }

  reproductores.forEach((audio) => {
    // Si una cancion no se puede descargar, se pasa a la siguiente en vez de
    // dejar el silencio para siempre.
    audio.addEventListener('error', () => {
      if (audio === actual() && sonando) encadenar();
    });
    audio.addEventListener('ended', () => {
      if (audio === actual()) encadenar();
    });
  });

  return {
    /** Debe llamarse desde un gesto de la persona (el boton de la portada). */
    iniciar() {
      if (latido) return;
      cargar(actual(), cola[posicion]);
      actual().volume = 0;
      arrancar(actual());

      // Subida suave: entrar de golpe a todo volumen asusta.
      const inicio = performance.now();
      const subir = () => {
        const avance = Math.min(1, (performance.now() - inicio) / 2500);
        if (!cruzando) actual().volume = volumenObjetivo() * avance;
        if (avance < 1) requestAnimationFrame(subir);
      };
      requestAnimationFrame(subir);

      latido = setInterval(vigilar, LATIDO);
      anunciar();
    },

    alternar() {
      if (sonando) {
        actual().pause();
        sonando = false;
      } else {
        if (!actual().src) cargar(actual(), cola[posicion]);
        actual().volume = volumenObjetivo();
        arrancar(actual());
      }
      anunciar();
    },

    siguiente() {
      if (!latido) return;
      encadenar();
    },

    /** Baja el volumen mientras se lee una tarjeta, y lo devuelve al cerrarla. */
    agachar(activa) {
      atenuacion = activa ? 0.28 : 1;
      if (!cruzando) actual().volume = volumenObjetivo();
    },

    silenciar(valor) {
      silencio = valor;
      guardarSilencio(silencio);
      if (!cruzando) actual().volume = volumenObjetivo();
      anunciar();
    },

    get silenciado() {
      return silencio;
    },
    get sonando() {
      return sonando;
    },
    get cancionActual() {
      return cancion();
    },

    liberar() {
      if (latido) clearInterval(latido);
      latido = null;
      reproductores.forEach((audio) => {
        audio.pause();
        audio.removeAttribute('src');
      });
    },
  };
}
