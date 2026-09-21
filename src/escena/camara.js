/** Camara y sus posiciones clave: el inicio del viaje y el mirador final. */
import { PerspectiveCamera, Vector3 } from 'three';

/** Punto de partida: lejos, dentro del tunel de luz. */
export const POSICION_INICIAL = new Vector3(0, 2.4, 310);

/** Mirador final sobre la galaxia, la vista que queda al terminar la entrada. */
export const POSICION_FINAL = new Vector3(0, 21, 30);

/** Centro de atencion: algo por encima del nucleo, donde late el corazon. */
export const OBJETIVO = new Vector3(0, 1.8, 0);

export function crearCamara() {
  const camara = new PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 900);
  camara.position.copy(POSICION_INICIAL);
  camara.lookAt(OBJETIVO);
  return camara;
}
