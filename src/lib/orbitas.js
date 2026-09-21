/**
 * Reparto de orbitas.
 *
 * Con dos o tres fotos se pueden colocar a mano, pero con veintitantas no:
 * se amontonan o dejan huecos. Aqui se reparten en anillos concentricos, con
 * mas fotos cuanto mayor es el anillo (mas sitio disponible), angulos
 * equiespaciados dentro de cada anillo y alturas alternas para que nunca
 * queden dos en la misma linea de vision.
 */
import { TAU } from './matematicas.js';

/** Anillos disponibles, del interior al exterior. */
const ANILLOS = [
  { radio: 6.3, velocidad: 0.082, altura: 1.5 },
  { radio: 8.5, velocidad: 0.068, altura: -1.2 },
  { radio: 10.7, velocidad: 0.056, altura: 2.4 },
  { radio: 12.9, velocidad: 0.047, altura: -0.4 },
];

/** Cuanto se separa cada foto de la altura base de su anillo. */
const VARIACION_ALTURA = 1.9;

/**
 * Decide cuantas fotos van en cada anillo, proporcionalmente a su radio:
 * un anillo el doble de grande admite el doble de fotos sin apelmazarse.
 */
export function repartirPorAnillo(cantidad, anillos = ANILLOS) {
  if (cantidad <= 0) return [];

  // Un anillo por cada siete fotos, pero a partir de cinco ya se usan dos:
  // en un solo anillo quedarian pegadas unas a otras.
  const deseados = Math.max(cantidad >= 5 ? 2 : 1, Math.ceil(cantidad / 7));
  const usados = anillos.slice(0, Math.min(anillos.length, deseados));
  const total = usados.reduce((suma, anillo) => suma + anillo.radio, 0);

  const reparto = usados.map((anillo) => Math.floor((cantidad * anillo.radio) / total));
  let restantes = cantidad - reparto.reduce((suma, n) => suma + n, 0);

  // Los que sobran por el redondeo van a los anillos mas amplios.
  for (let i = reparto.length - 1; restantes > 0; i = (i - 1 + reparto.length) % reparto.length) {
    reparto[i] += 1;
    restantes -= 1;
  }
  return reparto;
}

/**
 * Devuelve la orbita de cada elemento: radio, altura, fase y velocidad.
 * @param {number} cantidad cuantas fotos hay que colocar
 * @returns {Array<{radio:number, altura:number, fase:number, velocidad:number}>}
 */
export function distribuirOrbitas(cantidad, anillos = ANILLOS) {
  const reparto = repartirPorAnillo(cantidad, anillos);
  const orbitas = [];

  reparto.forEach((cuantas, indiceAnillo) => {
    const anillo = anillos[indiceAnillo];
    const paso = TAU / Math.max(1, cuantas);
    // Cada anillo arranca girado respecto al anterior: evita que las fotos
    // queden alineadas como los radios de una rueda.
    const desfase = indiceAnillo * 0.7;

    for (let i = 0; i < cuantas; i += 1) {
      // La altura sube y baja alternando, con un tercer valor intermedio para
      // que el patron no se lea como un zigzag perfecto.
      const ciclo = i % 3;
      const desvio = ciclo === 0 ? VARIACION_ALTURA : ciclo === 1 ? -VARIACION_ALTURA : 0;

      orbitas.push({
        radio: anillo.radio,
        altura: anillo.altura + desvio * 0.62,
        fase: desfase + i * paso,
        velocidad: anillo.velocidad * (indiceAnillo % 2 === 0 ? 1 : -1),
      });
    }
  });

  return orbitas;
}

export const ANILLOS_ORBITA = ANILLOS;
