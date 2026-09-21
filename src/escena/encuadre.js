/**
 * Encuadre adaptativo.
 *
 * Una camara con campo de vision fijo recorta la galaxia en pantallas
 * verticales: el angulo horizontal se estrecha al bajar la relacion de aspecto.
 * En vez de deformar el objetivo, aqui se calcula a que distancia hay que
 * ponerse para que la galaxia entre entera, con un margen que depende de la
 * forma de la pantalla.
 */
import { MathUtils, Vector3 } from 'three';
import { OBJETIVO } from './camara.js';

/**
 * Elevacion del mirador. En apaisado se mira mas desde arriba (la elipse se
 * aplana y deja sitio al titulo); en vertical se baja el punto de vista para
 * que la galaxia llene mas alto y el corazon se vea de frente.
 */
const ELEVACION_APAISADA = MathUtils.degToRad(33);
const ELEVACION_VERTICAL = MathUtils.degToRad(23);

function direccionDelMirador(aspecto, destino = new Vector3()) {
  const mezcla = Math.min(1, Math.max(0, (aspecto - 0.5) / 0.7));
  const elevacion = ELEVACION_VERTICAL + (ELEVACION_APAISADA - ELEVACION_VERTICAL) * mezcla;
  return destino.set(0, Math.sin(elevacion), Math.cos(elevacion));
}

/** Radio util de la escena (galaxia mas un margen para las frases cercanas). */
const RADIO_ESCENA = 15;

/** Altura visible aproximada: el disco inclinado mas el corazon. */
const FACTOR_ALTURA = 0.55;

/**
 * Que porcion del semiancho de pantalla debe ocupar la galaxia.
 * En apaisado se deja aire alrededor; en vertical se aprovecha casi todo el
 * ancho, porque si no la galaxia quedaria diminuta en medio de la pantalla.
 */
export function ocupacionDeseada(aspecto) {
  if (aspecto >= 1.2) return 0.5;
  return Math.min(1.02, 0.5 + (1.2 - aspecto) * 0.68);
}

export function distanciaDeEncuadre(camara, radio = RADIO_ESCENA) {
  const campoVertical = MathUtils.degToRad(camara.fov);
  const campoHorizontal = 2 * Math.atan(Math.tan(campoVertical / 2) * camara.aspect);
  const ocupacion = ocupacionDeseada(camara.aspect);

  const porAncho = radio / (ocupacion * Math.tan(campoHorizontal / 2));
  const porAlto = (radio * FACTOR_ALTURA) / (ocupacion * Math.tan(campoVertical / 2));
  return Math.max(porAncho, porAlto);
}

/** Posicion del mirador final para la pantalla actual. */
export function posicionDeMirador(camara, destino = new Vector3()) {
  return direccionDelMirador(camara.aspect, destino)
    .multiplyScalar(distanciaDeEncuadre(camara))
    .add(OBJETIVO);
}

/**
 * Cuanto hay que agrandar textos y fotos para que sigan siendo legibles y
 * tocables cuando la camara se aleja (pantallas estrechas).
 */
export function escalaDeLegibilidad(camara, referencia = 36) {
  return Math.min(2, Math.max(1, distanciaDeEncuadre(camara) / referencia));
}

/**
 * Las fotos crecen menos que el texto: si se agrandan igual tapan el corazon
 * y la galaxia deja de leerse como un conjunto.
 */
export function escalaDeFotos(camara) {
  return Math.pow(escalaDeLegibilidad(camara), 0.45);
}

/**
 * Reencuadra sin mover el angulo de vista: solo acerca o aleja.
 * Se usa al cambiar el tamano de la ventana o al girar el movil.
 */
export function reencuadrar(camara, objetivo = OBJETIVO) {
  const direccion = camara.position.clone().sub(objetivo);
  if (direccion.lengthSq() === 0) return;
  direccion.setLength(distanciaDeEncuadre(camara));
  camara.position.copy(objetivo).add(direccion);
}
