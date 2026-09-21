/**
 * Deteccion de capacidades del dispositivo y preferencias del usuario.
 * La escena escala la cantidad de particulas y el post-proceso segun esto,
 * en vez de enviar el mismo peso a un movil de gama baja y a un equipo de escritorio.
 */

const CALIDADES = {
  alta: {
    nivel: 'alta',
    galaxia: 62000,
    anillos: 16000,
    corazon: 4200,
    estrellas: 2600,
    warp: 2400,
    bloom: true,
    maxPixelRatio: 2,
  },
  media: {
    nivel: 'media',
    galaxia: 34000,
    anillos: 9000,
    corazon: 2600,
    estrellas: 1600,
    warp: 1500,
    bloom: true,
    maxPixelRatio: 1.75,
  },
  baja: {
    nivel: 'baja',
    galaxia: 15000,
    anillos: 4500,
    corazon: 1200,
    estrellas: 800,
    warp: 800,
    bloom: false,
    maxPixelRatio: 1.35,
  },
};

export function prefiereMenosMovimiento() {
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function soportaWebGL() {
  try {
    const lienzo = document.createElement('canvas');
    return Boolean(
      window.WebGLRenderingContext && (lienzo.getContext('webgl2') || lienzo.getContext('webgl'))
    );
  } catch {
    return false;
  }
}

/**
 * Elige un nivel de calidad a partir de senales baratas y fiables:
 * ancho de pantalla, nucleos logicos, memoria declarada y densidad de pixeles.
 */
export function detectarCalidad() {
  if (typeof window === 'undefined') return { ...CALIDADES.media };

  const nucleos = navigator.hardwareConcurrency || 4;
  const memoria = navigator.deviceMemory || 4;
  const ancho = window.innerWidth;
  const densidad = window.devicePixelRatio || 1;
  const esMovil = ancho < 768 || /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

  let puntos = 0;
  if (nucleos >= 8) puntos += 2;
  else if (nucleos >= 4) puntos += 1;
  if (memoria >= 8) puntos += 2;
  else if (memoria >= 4) puntos += 1;
  if (!esMovil) puntos += 2;
  if (ancho >= 1440) puntos += 1;
  if (densidad > 2.5) puntos -= 1;

  const nivel = puntos >= 6 ? 'alta' : puntos >= 3 ? 'media' : 'baja';
  const calidad = { ...CALIDADES[nivel] };
  calidad.pixelRatio = Math.min(densidad, calidad.maxPixelRatio);
  calidad.esMovil = esMovil;
  return calidad;
}

export const NIVELES_CALIDAD = CALIDADES;
