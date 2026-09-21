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
import { distribuirOrbitas } from '../lib/orbitas.js';

/**
 * Tamano de referencia de un orbe. Con muchas fotos conviene encogerlas para
 * que la galaxia siga leyendose como un conjunto y no como un mural.
 */
const ESCALA_BASE = 2.5;
const ESCALA_MINIMA = 1.75;
/** Cuanto crece una esfera al pasar el puntero por encima. */
const RESALTE = 1.18;

function escalaSegunCantidad(cantidad) {
  if (cantidad <= 8) return ESCALA_BASE;
  const reducida = ESCALA_BASE * Math.sqrt(8 / cantidad);
  return Math.max(ESCALA_MINIMA, reducida);
}

export function crearEsferas(recuerdos, { alDetectarFallo } = {}) {
  const grupo = new Group();
  grupo.name = 'esferas';

  const orbitas = distribuirOrbitas(recuerdos.length);
  const escalaInicial = escalaSegunCantidad(recuerdos.length);

  const cargador = new ImageLoader();
  const sprites = recuerdos.map((recuerdo, indice) => {
    // La orbita se reparte sola, pero el contenido puede sobrescribirla.
    const orbita = { ...orbitas[indice], ...recuerdo };
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
    sprite.scale.setScalar(escalaInicial);
    sprite.userData = {
      recuerdo,
      orbita,
      escalaBase: escalaInicial,
      escalaObjetivo: escalaInicial,
      escalaActual: escalaInicial,
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
        const { orbita } = sprite.userData;
        const angulo = orbita.fase + tiempo * orbita.velocidad;
        sprite.position.set(
          Math.cos(angulo) * orbita.radio,
          orbita.altura + Math.sin(tiempo * 0.55 + orbita.fase) * 0.34,
          Math.sin(angulo) * orbita.radio
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
        datos.escalaBase = escalaInicial * factor;
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
