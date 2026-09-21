import { describe, expect, test } from 'vitest';
import { visibilidadPorTurno } from '../../src/escena/textos.js';

/**
 * Con muchas frases no caben todas a la vez en el cielo, asi que se turnan.
 * Lo que se comprueba aqui es que el turno reparte de verdad: que nunca hay
 * demasiadas encendidas y que ninguna se queda sin su momento.
 */
describe('turno de las frases', () => {
  test('con pocas frases se ven todas siempre', () => {
    for (let t = 0; t < 120; t += 7) {
      expect(visibilidadPorTurno(t, 0.3, 1)).toBe(1);
    }
  });

  test('la visibilidad nunca se sale de 0 a 1', () => {
    for (let t = 0; t < 200; t += 0.5) {
      const valor = visibilidadPorTurno(t, 0.41, 0.32);
      expect(valor).toBeGreaterThanOrEqual(0);
      expect(valor).toBeLessThanOrEqual(1);
    }
  });

  test('cada frase llega a verse del todo en algun momento', () => {
    const total = 37;
    const reparto = 12 / total;

    for (let i = 0; i < total; i += 1) {
      const turno = i / total;
      let maximo = 0;
      for (let t = 0; t < 60; t += 0.25) {
        maximo = Math.max(maximo, visibilidadPorTurno(t, turno, reparto));
      }
      expect(maximo, `la frase ${i} nunca se ve`).toBeGreaterThan(0.9);
    }
  });

  test('no se encienden muchas mas de las permitidas a la vez', () => {
    const total = 37;
    const permitidas = 12;
    const reparto = permitidas / total;

    for (let t = 0; t < 90; t += 1) {
      const encendidas = Array.from({ length: total }, (_, i) =>
        visibilidadPorTurno(t, i / total, reparto)
      ).filter((valor) => valor > 0.05).length;
      // Se permite algo de margen por los fundidos de entrada y salida.
      expect(encendidas).toBeLessThanOrEqual(permitidas + 2);
    }
  });

  test('siempre hay frases en pantalla, nunca un cielo vacio', () => {
    const total = 37;
    const reparto = 12 / total;

    for (let t = 0; t < 90; t += 1) {
      const encendidas = Array.from({ length: total }, (_, i) =>
        visibilidadPorTurno(t, i / total, reparto)
      ).filter((valor) => valor > 0.3).length;
      expect(encendidas, `en el segundo ${t} no se ve ninguna frase`).toBeGreaterThan(3);
    }
  });
});
