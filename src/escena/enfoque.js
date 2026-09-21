/**
 * Acercamiento a un orbe.
 *
 * Al tocar una foto la camara se lanza hacia ella y se queda siguiendola
 * mientras la foto sigue recorriendo su orbita; al cerrar la tarjeta vuelve
 * exactamente a donde estaba mirando antes.
 *
 * La mezcla entre "vista libre" y "vista pegada al orbe" es un solo numero
 * (0 a 1) que anima GSAP. Cada cuadro se interpola la posicion y el punto de
 * mira, asi que el seguimiento funciona aunque el orbe no pare de moverse.
 */
import { Vector3 } from 'three';
import gsap from 'gsap';

/** A que distancia del orbe se queda la camara al acercarse. */
const DISTANCIA_CERCA = 4.6;
/** Cuanto se eleva la camara sobre el orbe, para no mirarlo de canto. */
const ELEVACION_CERCA = 0.9;

export function crearEnfoque({ camara, controles, reducido = false }) {
  const posicionLibre = new Vector3();
  const objetivoLibre = new Vector3();
  const direccion = new Vector3();
  const posicionDeseada = new Vector3();
  const objetivoDeseado = new Vector3();

  const mezcla = { valor: 0 };
  let spriteEnfocado = null;
  let animacion = null;

  const duracion = reducido ? 0.25 : 1.05;

  return {
    get activo() {
      return spriteEnfocado !== null;
    },
    get sprite() {
      return spriteEnfocado;
    },

    /**
     * Vuela hasta el orbe indicado.
     * @returns {Promise<void>} se resuelve cuando la camara ya esta encima
     */
    acercar(sprite) {
      if (!sprite) return Promise.resolve();

      // Se guarda la vista actual para poder devolverla tal cual al cerrar.
      // Si ya se estaba enfocando otro orbe, la de partida sigue siendo la
      // original: guardarla ahora dejaria a la camara sin sitio al que volver.
      if (!spriteEnfocado) {
        posicionLibre.copy(camara.position);
        objetivoLibre.copy(controles.target);
      }
      spriteEnfocado = sprite;

      animacion?.kill();
      return new Promise((resolver) => {
        animacion = gsap.to(mezcla, {
          valor: 1,
          duration: duracion,
          ease: 'power3.inOut',
          onComplete: resolver,
        });
      });
    },

    /** Vuelve a la vista general. */
    alejar() {
      if (!spriteEnfocado) return Promise.resolve();

      animacion?.kill();
      return new Promise((resolver) => {
        animacion = gsap.to(mezcla, {
          valor: 0,
          duration: duracion * 1.15,
          ease: 'power2.inOut',
          onComplete: () => {
            spriteEnfocado = null;
            resolver();
          },
        });
      });
    },

    /**
     * Coloca la camara segun la mezcla actual.
     * @returns {boolean} true si el enfoque manda sobre la camara este cuadro
     */
    aplicar() {
      if (!spriteEnfocado || mezcla.valor <= 0.0001) return false;

      const orbe = spriteEnfocado.position;

      // Se mantiene la direccion desde la que se estaba mirando: el
      // acercamiento se siente como avanzar, no como un salto a otro sitio.
      direccion.copy(posicionLibre).sub(objetivoLibre).normalize();
      posicionDeseada
        .copy(orbe)
        .addScaledVector(direccion, DISTANCIA_CERCA)
        .addScaledVector(camara.up, ELEVACION_CERCA);
      objetivoDeseado.copy(orbe);

      camara.position.lerpVectors(posicionLibre, posicionDeseada, mezcla.valor);
      controles.target.lerpVectors(objetivoLibre, objetivoDeseado, mezcla.valor);
      camara.lookAt(controles.target);
      return true;
    },

    liberar() {
      animacion?.kill();
      animacion = null;
      spriteEnfocado = null;
    },
  };
}
