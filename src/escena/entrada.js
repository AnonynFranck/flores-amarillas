/**
 * Entrada cinematografica: el viaje desde el vacio hasta la galaxia dorada.
 *
 * La camara recorre una curva suave dentro del tunel de luz, la galaxia se
 * enciende cuando ya esta cerca y, al llegar al mirador, los controles quedan
 * en manos de quien mira.
 */
import { CatmullRomCurve3, Vector3 } from 'three';
import gsap from 'gsap';
import { OBJETIVO, POSICION_FINAL, POSICION_INICIAL } from './camara.js';

/**
 * Por defecto GSAP "suaviza" los cuadros lentos limitando cuanto avanza el
 * tiempo en cada uno. En un equipo con pocos FPS eso alargaria el viaje hasta
 * volverlo interminable, asi que aqui la linea de tiempo avanza con el reloj
 * real: la entrada dura lo mismo en cualquier maquina.
 */
gsap.ticker.lagSmoothing(0);

/**
 * Curva de vuelo: una ese suave, mas interesante que una linea recta.
 * El punto final depende de la pantalla (ver encuadre.js), asi que la curva se
 * construye al empezar el viaje y no al cargar el modulo.
 */
function construirTrayectoria(destino = POSICION_FINAL) {
  const distancia = destino.length();
  return new CatmullRomCurve3([
    POSICION_INICIAL.clone().setLength(Math.max(POSICION_INICIAL.length(), distancia * 4)),
    new Vector3(3.2, 3.0, 188),
    new Vector3(-3.6, 4.4, 96),
    new Vector3(1.6, destino.y * 0.45, destino.z * 1.7),
    destino.clone(),
  ]);
}

let TRAYECTORIA = construirTrayectoria();

export function crearEstadoEntrada() {
  return {
    avance: 0,
    balanceo: 0,
    velocidadWarp: 0,
    galaxia: 0,
    corazon: 0,
    esferas: 0,
    frases: 0,
    estrellas: 0,
    destello: 0,
  };
}

/** Coloca la camara en el punto del viaje indicado por el estado. */
export function aplicarEstadoCamara(camara, estado) {
  const punto = TRAYECTORIA.getPoint(Math.min(1, Math.max(0, estado.avance)));
  camara.position.copy(punto);
  camara.lookAt(OBJETIVO);
  if (estado.balanceo) camara.rotateZ(estado.balanceo);
}

/**
 * @param {object} opciones
 * @param {object} opciones.estado estado compartido con el bucle de animacion
 * @param {Function} opciones.alTerminar se llama cuando la escena queda lista
 * @param {boolean} opciones.reducido respeta prefers-reduced-motion
 * @param {import('three').Vector3} [opciones.mirador] punto final del viaje
 * @returns {gsap.core.Timeline}
 */
export function reproducirEntrada({ estado, alTerminar, reducido = false, mirador }) {
  if (mirador) TRAYECTORIA = construirTrayectoria(mirador);
  const linea = gsap.timeline({ onComplete: alTerminar });

  if (reducido) {
    // Sin viaje ni destellos: la escena simplemente aparece.
    estado.avance = 1;
    linea
      .to(estado, { estrellas: 0.78, duration: 0.6, ease: 'none' }, 0)
      .to(estado, { galaxia: 1, duration: 0.9, ease: 'power1.out' }, 0)
      .to(estado, { corazon: 1, esferas: 1, frases: 1, duration: 0.9, ease: 'power1.out' }, 0.2);
    return linea;
  }

  linea
    .to(estado, { avance: 1, duration: 5.4, ease: 'power2.inOut' }, 0)
    .fromTo(estado, { balanceo: 0.22 }, { balanceo: 0, duration: 5.4, ease: 'power2.out' }, 0)
    // El tunel acelera, mantiene la velocidad y frena al llegar.
    .to(estado, { velocidadWarp: 1, duration: 1.3, ease: 'power2.in' }, 0)
    .to(estado, { velocidadWarp: 0, duration: 1.9, ease: 'power2.out' }, 3.6)
    .to(estado, { estrellas: 0.78, duration: 2.2, ease: 'none' }, 2.4)
    // La galaxia se enciende de lejos y crece al acercarnos.
    .to(estado, { galaxia: 1, duration: 2.7, ease: 'power1.out' }, 2.5)
    // Fogonazo al cruzar el umbral.
    .to(estado, { destello: 0.9, duration: 0.22, ease: 'power2.in' }, 3.5)
    .to(estado, { destello: 0, duration: 1.1, ease: 'power2.out' }, 3.75)
    .to(estado, { corazon: 1, duration: 1.6, ease: 'power1.out' }, 4.0)
    .to(estado, { esferas: 1, duration: 1.5, ease: 'power1.out' }, 4.5)
    .to(estado, { frases: 1, duration: 1.6, ease: 'power1.out' }, 4.9);

  return linea;
}

export const TRAYECTORIA_ENTRADA = TRAYECTORIA;
