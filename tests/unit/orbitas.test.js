import { describe, expect, test } from 'vitest';
import { ANILLOS_ORBITA, distribuirOrbitas, repartirPorAnillo } from '../../src/lib/orbitas.js';
import { TAU } from '../../src/lib/matematicas.js';

describe('reparto de orbitas', () => {
  test('coloca exactamente las fotos que se le piden', () => {
    [1, 4, 6, 12, 26, 40].forEach((cantidad) => {
      expect(distribuirOrbitas(cantidad)).toHaveLength(cantidad);
    });
  });

  test('sin fotos no coloca nada', () => {
    expect(distribuirOrbitas(0)).toEqual([]);
    expect(repartirPorAnillo(0)).toEqual([]);
  });

  test('el reparto por anillo suma el total', () => {
    [5, 13, 26, 33].forEach((cantidad) => {
      const reparto = repartirPorAnillo(cantidad);
      expect(reparto.reduce((suma, n) => suma + n, 0)).toBe(cantidad);
    });
  });

  test('los anillos grandes reciben al menos tantas fotos como los pequenos', () => {
    const reparto = repartirPorAnillo(26);
    for (let i = 1; i < reparto.length; i += 1) {
      expect(reparto[i]).toBeGreaterThanOrEqual(reparto[i - 1]);
    }
  });

  test('con pocas fotos no se amontonan todas en el anillo interior', () => {
    expect(repartirPorAnillo(6).length).toBeGreaterThanOrEqual(2);
    expect(repartirPorAnillo(3).length).toBe(1);
  });

  test('todas las orbitas caen dentro de la galaxia', () => {
    const radios = ANILLOS_ORBITA.map((anillo) => anillo.radio);
    distribuirOrbitas(26).forEach((orbita) => {
      expect(radios).toContain(orbita.radio);
      expect(Math.abs(orbita.altura)).toBeLessThan(5);
      expect(orbita.velocidad).not.toBe(0);
    });
  });

  test('dentro de un anillo las fotos quedan separadas', () => {
    const orbitas = distribuirOrbitas(26);
    const porRadio = new Map();
    orbitas.forEach((orbita) => {
      const grupo = porRadio.get(orbita.radio) ?? [];
      grupo.push(orbita.fase);
      porRadio.set(orbita.radio, grupo);
    });

    porRadio.forEach((fases) => {
      const separacionMinima = TAU / fases.length - 1e-9;
      const ordenadas = [...fases].sort((a, b) => a - b);
      for (let i = 1; i < ordenadas.length; i += 1) {
        expect(ordenadas[i] - ordenadas[i - 1]).toBeGreaterThanOrEqual(separacionMinima);
      }
    });
  });

  test('anillos contiguos giran en sentidos opuestos', () => {
    const orbitas = distribuirOrbitas(26);
    const sentidoPorRadio = new Map();
    orbitas.forEach((orbita) => {
      sentidoPorRadio.set(orbita.radio, Math.sign(orbita.velocidad));
    });

    const sentidos = [...sentidoPorRadio.entries()]
      .sort((a, b) => a[0] - b[0])
      .map(([, sentido]) => sentido);
    for (let i = 1; i < sentidos.length; i += 1) {
      expect(sentidos[i]).toBe(-sentidos[i - 1]);
    }
  });
});
