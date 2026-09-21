/**
 * Frases que flotan por el universo.
 *
 * Se dibujan en canvas y viajan como sprites, asi que siempre quedan de frente
 * a la camara (legibles desde cualquier angulo, sin deformacion en perspectiva).
 * Los angulos se reparten de forma equiespaciada para que no se amontonen.
 */
import { Group, Sprite, SpriteMaterial, Vector3 } from 'three';
import { anillosEquiespaciados, crearAleatorio, entre } from '../lib/matematicas.js';
import { barajar } from '../lib/listaReproduccion.js';
import { texturaTexto } from '../lib/texturas.js';

const ALTURA_TEXTO = 0.92;

/** Franja inferior de la pantalla reservada al titulo y a la pista. */
const ZONA_TITULO = { desdeY: -0.5, anchoX: 0.62 };

/**
 * Cuantas frases pueden verse a la vez. Si hay mas, se turnan: cada una
 * aparece, se queda un rato y deja su sitio. Asi se pueden escribir todas las
 * frases que uno quiera sin que el cielo se llene de texto.
 */
const VISIBLES_A_LA_VEZ = 12;
/** Segundos que tarda la rueda de frases en dar una vuelta completa. */
const CICLO = 42;
/** Parte del turno que se va en aparecer y en desaparecer. */
const FUNDIDO = 0.12;

function suavizar(desde, hasta, valor) {
  const t = Math.min(1, Math.max(0, (valor - desde) / (hasta - desde)));
  return t * t * (3 - 2 * t);
}

/**
 * Cuanto se ve una frase segun su turno.
 * @param {number} tiempo segundos desde que arranco la escena
 * @param {number} turno posicion de la frase en la rueda (0 a 1)
 * @param {number} reparto fraccion del ciclo que dura cada turno
 */
export function visibilidadPorTurno(tiempo, turno, reparto) {
  if (reparto >= 1) return 1;
  const fase = (tiempo / CICLO + turno) % 1;
  if (fase > reparto) return 0;
  const fundido = Math.min(FUNDIDO, reparto / 3);
  return suavizar(0, fundido, fase) * (1 - suavizar(reparto - fundido, reparto, fase));
}

const proyeccion = new Vector3();
const proyeccionLateral = new Vector3();
const derechaCamara = new Vector3();

/**
 * Devuelve cuanto debe verse una frase: se apaga si invade la zona del titulo
 * o si se asoma por un lado de la pantalla.
 *
 * El calculo usa el ancho real del sprite, no solo su centro: una frase larga
 * centrada dentro de la pantalla puede tener media palabra fuera, y una frase
 * cortada por la mitad se lee como un error, no como profundidad.
 *
 * @param {import('three').Vector3} derecha eje horizontal de la camara
 */
function visibilidadComoda(sprite, camara, derecha) {
  proyeccion.copy(sprite.position).project(camara);
  if (proyeccion.z > 1) return 0; // detras de la camara

  proyeccionLateral
    .copy(sprite.position)
    .addScaledVector(derecha, sprite.scale.x * 0.5)
    .project(camara);
  const semiancho = Math.abs(proyeccionLateral.x - proyeccion.x);
  const extremo = Math.abs(proyeccion.x) + semiancho;

  const borde = 1 - Math.min(1, Math.max(0, (extremo - 0.86) / 0.22));
  if (borde <= 0) return 0;

  if (Math.abs(proyeccion.x) >= ZONA_TITULO.anchoX) return borde;
  const invasion = (ZONA_TITULO.desdeY - proyeccion.y) / 0.35;
  return borde * (1 - Math.min(1, Math.max(0, invasion)));
}

export function crearFrases(frases, { calidad } = {}) {
  const grupo = new Group();
  grupo.name = 'frases';

  const aleatorio = crearAleatorio(9091);
  const angulos = anillosEquiespaciados(frases.length, aleatorio, 0.45);
  // Con pocas frases se ven todas siempre; con muchas, por tandas.
  const reparto = Math.min(1, VISIBLES_A_LA_VEZ / Math.max(1, frases.length));
  // El turno se baraja aparte del angulo: si fueran el mismo orden, cada tanda
  // aparecería amontonada en el mismo lado del cielo.
  const turnos = barajar(
    Array.from({ length: frases.length }, (_, i) => i),
    crearAleatorio(6161)
  );
  const tamanoFuente = calidad?.nivel === 'baja' ? 48 : 64;

  const sprites = frases.map((frase, indice) => {
    const { textura, aspecto } = texturaTexto(frase, { tamano: tamanoFuente });
    const material = new SpriteMaterial({
      map: textura,
      transparent: true,
      depthWrite: false,
      opacity: 0,
    });

    const sprite = new Sprite(material);
    sprite.scale.set(ALTURA_TEXTO * aspecto, ALTURA_TEXTO, 1);
    sprite.userData = {
      aspecto,
      // Turnos repartidos: dos frases vecinas en el cielo no entran a la vez.
      turno: turnos[indice] / frases.length,
      radio: entre(aleatorio, 11, 22),
      altura: entre(aleatorio, -3.2, 8),
      angulo: angulos[indice],
      velocidad: entre(aleatorio, 0.012, 0.03) * (aleatorio() < 0.5 ? -1 : 1),
      balanceo: entre(aleatorio, 0.25, 0.6),
      fase: aleatorio() * Math.PI * 2,
      opacidadBase: entre(aleatorio, 0.55, 0.95),
    };
    grupo.add(sprite);
    return sprite;
  });

  let aparicion = 0;

  return {
    grupo,
    sprites,
    actualizar(tiempo, camara) {
      // Los umbrales de desvanecido son relativos a lo lejos que este la
      // camara: con valores fijos, en movil (camara mas atras) se apagarian
      // casi todas las frases.
      const alcance = camara ? camara.position.length() : 36;
      if (camara) derechaCamara.setFromMatrixColumn(camara.matrixWorld, 0);
      const entraDesde = alcance * 0.26;
      const entraHasta = alcance * 0.46;
      const saleDesde = alcance * 1.5;
      const saleHasta = alcance * 2.1;

      sprites.forEach((sprite) => {
        const datos = sprite.userData;
        const angulo = datos.angulo + tiempo * datos.velocidad;
        sprite.position.set(
          Math.cos(angulo) * datos.radio,
          datos.altura + Math.sin(tiempo * 0.4 + datos.fase) * datos.balanceo,
          Math.sin(angulo) * datos.radio
        );

        if (camara) {
          // Las frases muy lejanas o pegadas a la camara estorban: se atenuan.
          const distancia = sprite.position.distanceTo(camara.position);
          const cerca = Math.min(
            1,
            Math.max(0, (distancia - entraDesde) / (entraHasta - entraDesde))
          );
          const lejos =
            1 - Math.min(1, Math.max(0, (distancia - saleDesde) / (saleHasta - saleDesde)));
          sprite.material.opacity =
            datos.opacidadBase *
            cerca *
            lejos *
            aparicion *
            visibilidadPorTurno(tiempo, datos.turno, reparto) *
            visibilidadComoda(sprite, camara, derechaCamara);
        }
      });
    },
    establecerAparicion(valor) {
      aparicion = valor;
    },
    /** Agranda las frases cuando la camara mira desde mas lejos. */
    establecerEscala(factor) {
      sprites.forEach((sprite) => {
        const alto = ALTURA_TEXTO * factor;
        sprite.scale.set(alto * sprite.userData.aspecto, alto, 1);
      });
    },
    liberar() {
      sprites.forEach((sprite) => {
        sprite.material.map?.dispose();
        sprite.material.dispose();
      });
    },
  };
}
