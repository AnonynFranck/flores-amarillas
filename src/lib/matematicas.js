/** Utilidades matematicas puras usadas por la escena. Sin dependencias. */

export const TAU = Math.PI * 2;

export function limitar(valor, minimo, maximo) {
  return Math.min(maximo, Math.max(minimo, valor));
}

export function interpolar(desde, hasta, factor) {
  return desde + (hasta - desde) * limitar(factor, 0, 1);
}

/**
 * Generador pseudoaleatorio con semilla (mulberry32).
 * Se usa para que la galaxia se vea identica en cada carga: eso hace que las
 * pruebas visuales sean deterministas y que la composicion no cambie sola.
 */
export function crearAleatorio(semilla = 1) {
  let estado = semilla >>> 0;
  return function aleatorio() {
    estado = (estado + 0x6d2b79f5) >>> 0;
    let t = estado;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function entre(aleatorio, minimo, maximo) {
  return minimo + aleatorio() * (maximo - minimo);
}

/** Desvio con mas densidad cerca del centro (misma idea que un ruido gaussiano barato). */
export function desvioConcentrado(aleatorio, potencia, escala) {
  const signo = aleatorio() < 0.5 ? -1 : 1;
  return Math.pow(aleatorio(), potencia) * signo * escala;
}

/**
 * Curva clasica del corazon, normalizada para que quepa en un radio de 1.
 * x = 16 sen^3(t), y = 13 cos(t) - 5 cos(2t) - 2 cos(3t) - cos(4t)
 */
export function corazon2D(t) {
  const sen = Math.sin(t);
  return {
    x: (16 * sen * sen * sen) / 17,
    y: (13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)) / 17,
  };
}

/**
 * Reparte n elementos alrededor de un circulo evitando que se amontonen:
 * angulos equiespaciados mas un jitter controlado.
 */
export function anillosEquiespaciados(cantidad, aleatorio, jitter = 0.35) {
  const paso = TAU / Math.max(1, cantidad);
  const angulos = [];
  for (let i = 0; i < cantidad; i += 1) {
    angulos.push(i * paso + (aleatorio() - 0.5) * paso * jitter * 2);
  }
  return angulos;
}

/** Amortiguacion independiente de los FPS (para seguimientos suaves de camara). */
export function amortiguar(actual, objetivo, suavizado, delta) {
  return interpolar(actual, objetivo, 1 - Math.exp(-suavizado * delta));
}
