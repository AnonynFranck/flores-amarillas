/**
 * Controles de orbita.
 *
 * Se puede girar arrastrando con el boton izquierdo o con el derecho (y en
 * movil con un dedo). La galaxia gira sola, pero el giro automatico se detiene
 * mientras la persona explora y vuelve unos segundos despues de soltar.
 */
import { MOUSE, TOUCH } from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { OBJETIVO } from './camara.js';

const ESPERA_REANUDAR = 3200;

export function crearControles(camara, elemento, { autoGiro = 0.32 } = {}) {
  const controles = new OrbitControls(camara, elemento);

  controles.target.copy(OBJETIVO);
  controles.enableDamping = true;
  controles.dampingFactor = 0.055;
  controles.enablePan = false;
  controles.rotateSpeed = 0.55;
  controles.zoomSpeed = 0.7;
  controles.minDistance = 13;
  controles.maxDistance = 85;
  controles.enableZoom = true;
  // Se limita la inclinacion para no atravesar el plano de la galaxia.
  controles.minPolarAngle = 0.28;
  controles.maxPolarAngle = Math.PI * 0.49;
  controles.autoRotate = false;
  controles.autoRotateSpeed = autoGiro;

  controles.mouseButtons = {
    LEFT: MOUSE.ROTATE,
    MIDDLE: MOUSE.DOLLY,
    RIGHT: MOUSE.ROTATE,
  };
  controles.touches = {
    ONE: TOUCH.ROTATE,
    TWO: TOUCH.DOLLY_ROTATE,
  };

  let temporizador = null;
  let giroDeseado = false;

  const pausar = () => {
    controles.autoRotate = false;
    if (temporizador) clearTimeout(temporizador);
  };

  const reanudar = () => {
    if (temporizador) clearTimeout(temporizador);
    temporizador = setTimeout(() => {
      controles.autoRotate = giroDeseado;
    }, ESPERA_REANUDAR);
  };

  controles.addEventListener('start', pausar);
  controles.addEventListener('end', reanudar);

  return {
    controles,
    actualizar() {
      controles.update();
    },
    /** Enciende o apaga el deslizamiento automatico. */
    establecerGiroAutomatico(activo) {
      giroDeseado = activo;
      controles.autoRotate = activo;
    },
    establecerHabilitado(activo) {
      controles.enabled = activo;
    },
    /** Ajusta el rango de acercamiento al encuadre de la pantalla actual. */
    establecerLimites(distancia) {
      controles.minDistance = distancia * 0.4;
      controles.maxDistance = distancia * 2.1;
    },
    liberar() {
      if (temporizador) clearTimeout(temporizador);
      controles.removeEventListener('start', pausar);
      controles.removeEventListener('end', reanudar);
      controles.dispose();
    },
  };
}
