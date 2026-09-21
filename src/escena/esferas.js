/**
 * Esferas de recuerdos: las fotos que orbitan la galaxia.
 *
 * Cada foto se recorta en circulo sobre un canvas (con su aro dorado) y viaja
 * como sprite, de modo que siempre mira a la camara y se lee desde cualquier
 * angulo. Si una imagen no carga, la esfera se queda con su marco dorado en vez
 * de desaparecer.
 */
import { Group, ImageLoader, Sprite, SpriteMaterial } from 'three';
import { texturaAvatar } from '../lib/texturas.js';
import { recurso } from '../lib/rutas.js';

const ESCALA_BASE = 2.5;
/** Cuanto crece una esfera al pasar el puntero por encima. */
const RESALTE = 1.18;

export function crearEsferas(recuerdos, { alDetectarFallo } = {}) {
  const grupo = new Group();
  grupo.name = 'esferas';

  const cargador = new ImageLoader();
  const sprites = recuerdos.map((recuerdo) => {
    const material = new SpriteMaterial({
      map: texturaAvatar(null),
      transparent: true,
      depthWrite: false,
      opacity: 0,
      // Un punto por debajo del blanco puro: evita que el resplandor las
      // convierta en manchas de luz sin foto reconocible.
      color: 0xdcd2c2,
    });

    const sprite = new Sprite(material);
    sprite.scale.setScalar(ESCALA_BASE);
    sprite.userData = {
      recuerdo,
      escalaBase: ESCALA_BASE,
      escalaObjetivo: ESCALA_BASE,
      escalaActual: ESCALA_BASE,
      resaltado: false,
    };
    grupo.add(sprite);

    cargador.load(
      recurso(recuerdo.imagen),
      (imagen) => {
        material.map?.dispose();
        material.map = texturaAvatar(imagen);
        material.needsUpdate = true;
      },
      undefined,
      () => alDetectarFallo?.(recuerdo)
    );

    return sprite;
  });

  let aparicion = 0;

  return {
    grupo,
    sprites,
    actualizar(tiempo, delta) {
      sprites.forEach((sprite) => {
        const { recuerdo } = sprite.userData;
        const angulo = recuerdo.fase + tiempo * recuerdo.velocidad;
        sprite.position.set(
          Math.cos(angulo) * recuerdo.radio,
          recuerdo.altura + Math.sin(tiempo * 0.55 + recuerdo.fase) * 0.34,
          Math.sin(angulo) * recuerdo.radio
        );

        // Suavizado del resaltado, independiente de los FPS.
        const datos = sprite.userData;
        const factor = 1 - Math.exp(-11 * delta);
        datos.escalaActual += (datos.escalaObjetivo - datos.escalaActual) * factor;
        sprite.scale.setScalar(datos.escalaActual);
      });
    },
    /** Agranda las fotos en pantallas estrechas para que se puedan tocar. */
    establecerEscalaBase(factor) {
      sprites.forEach((sprite) => {
        const datos = sprite.userData;
        datos.escalaBase = ESCALA_BASE * factor;
        datos.escalaObjetivo = datos.escalaBase * (datos.resaltado ? RESALTE : 1);
      });
    },
    resaltar(sprite, activo) {
      if (!sprite) return;
      sprite.userData.resaltado = activo;
      sprite.userData.escalaObjetivo = sprite.userData.escalaBase * (activo ? RESALTE : 1);
    },
    establecerAparicion(valor) {
      aparicion = valor;
      sprites.forEach((sprite) => {
        sprite.material.opacity = valor;
      });
    },
    get aparicion() {
      return aparicion;
    },
    liberar() {
      sprites.forEach((sprite) => {
        sprite.material.map?.dispose();
        sprite.material.dispose();
      });
    },
  };
}
