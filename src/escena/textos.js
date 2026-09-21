/**
 * Frases que flotan por el universo.
 *
 * Se dibujan en canvas y viajan como sprites, asi que siempre quedan de frente
 * a la camara (legibles desde cualquier angulo, sin deformacion en perspectiva).
 * Los angulos se reparten de forma equiespaciada para que no se amontonen.
 */
import { Group, Sprite, SpriteMaterial, Vector3 } from 'three';
import { anillosEquiespaciados, crearAleatorio, entre } from '../lib/matematicas.js';
import { texturaTexto } from '../lib/texturas.js';

const ALTURA_TEXTO = 0.92;

/** Franja inferior de la pantalla reservada al titulo y a la pista. */
const ZONA_TITULO = { desdeY: -0.5, anchoX: 0.62 };

const proyeccion = new Vector3();

/**
 * Devuelve cuanto debe verse una frase segun invada o no la zona del titulo.
 * Sin esto las frases se cruzan con "Feliz dia de las flores amarillas" y el
 * mensaje principal deja de leerse.
 */
function libreDeTitulo(sprite, camara) {
  proyeccion.copy(sprite.position).project(camara);
  if (proyeccion.z > 1) return 1; // detras de la camara: da igual

  // Se apaga al asomarse por los bordes, para no dejar palabras cortadas.
  const borde = 1 - Math.min(1, Math.max(0, (Math.abs(proyeccion.x) - 0.74) / 0.22));

  const dentroX = Math.abs(proyeccion.x) < ZONA_TITULO.anchoX;
  if (!dentroX) return borde;
  const invasion = (ZONA_TITULO.desdeY - proyeccion.y) / 0.35;
  return borde * (1 - Math.min(1, Math.max(0, invasion)));
}

export function crearFrases(frases, { calidad } = {}) {
  const grupo = new Group();
  grupo.name = 'frases';

  const aleatorio = crearAleatorio(9091);
  const angulos = anillosEquiespaciados(frases.length, aleatorio, 0.45);
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
          const cerca = Math.min(1, Math.max(0, (distancia - 9) / 9));
          const lejos = 1 - Math.min(1, Math.max(0, (distancia - 46) / 30));
          sprite.material.opacity =
            datos.opacidadBase * cerca * lejos * aparicion * libreDeTitulo(sprite, camara);
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
