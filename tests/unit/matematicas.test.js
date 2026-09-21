import { describe, expect, test } from 'vitest';
import {
  amortiguar,
  anillosEquiespaciados,
  corazon2D,
  crearAleatorio,
  desvioConcentrado,
  entre,
  interpolar,
  limitar,
  TAU,
} from '../../src/lib/matematicas.js';

describe('utilidades matematicas', () => {
  test('limitar mantiene el valor dentro del rango', () => {
    expect(limitar(5, 0, 1)).toBe(1);
    expect(limitar(-5, 0, 1)).toBe(0);
    expect(limitar(0.4, 0, 1)).toBe(0.4);
  });

  test('interpolar recorta el factor fuera de [0, 1]', () => {
    expect(interpolar(0, 10, 0.5)).toBe(5);
    expect(interpolar(0, 10, 2)).toBe(10);
    expect(interpolar(0, 10, -1)).toBe(0);
  });

  test('la misma semilla produce siempre la misma galaxia', () => {
    const primera = Array.from({ length: 5 }, crearAleatorio(42));
    const a = crearAleatorio(42);
    const b = crearAleatorio(42);

    expect(Array.from({ length: 5 }, a)).toEqual(Array.from({ length: 5 }, b));
    expect(primera).toHaveLength(5);
  });

  test('el generador devuelve valores dentro de [0, 1)', () => {
    const aleatorio = crearAleatorio(7);
    for (let i = 0; i < 500; i += 1) {
      const valor = aleatorio();
      expect(valor).toBeGreaterThanOrEqual(0);
      expect(valor).toBeLessThan(1);
    }
  });

  test('entre respeta los limites pedidos', () => {
    const aleatorio = crearAleatorio(3);
    for (let i = 0; i < 200; i += 1) {
      const valor = entre(aleatorio, -2, 5);
      expect(valor).toBeGreaterThanOrEqual(-2);
      expect(valor).toBeLessThanOrEqual(5);
    }
  });

  test('el desvio concentrado nunca supera la escala', () => {
    const aleatorio = crearAleatorio(11);
    for (let i = 0; i < 200; i += 1) {
      expect(Math.abs(desvioConcentrado(aleatorio, 3, 0.5))).toBeLessThanOrEqual(0.5);
    }
  });

  test('la curva del corazon cabe en un radio de 1', () => {
    for (let i = 0; i <= 64; i += 1) {
      const { x, y } = corazon2D((i / 64) * TAU);
      expect(Math.hypot(x, y)).toBeLessThanOrEqual(1.05);
    }
  });

  test('la curva del corazon es simetrica respecto al eje vertical', () => {
    // El reflejo de la curva es t -> -t: invierte la x y conserva la y.
    const derecha = corazon2D(Math.PI * 0.25);
    const izquierda = corazon2D(-Math.PI * 0.25);

    expect(izquierda.x).toBeCloseTo(-derecha.x, 6);
    expect(izquierda.y).toBeCloseTo(derecha.y, 6);
  });

  test('los angulos equiespaciados no se amontonan', () => {
    const angulos = anillosEquiespaciados(12, crearAleatorio(5), 0.4);
    const paso = TAU / 12;

    expect(angulos).toHaveLength(12);
    angulos.forEach((angulo, indice) => {
      expect(Math.abs(angulo - indice * paso)).toBeLessThanOrEqual(paso * 0.4);
    });
  });

  test('amortiguar se acerca al objetivo sin pasarse', () => {
    let valor = 0;
    for (let i = 0; i < 60; i += 1) {
      valor = amortiguar(valor, 10, 6, 1 / 60);
    }

    expect(valor).toBeGreaterThan(9);
    expect(valor).toBeLessThanOrEqual(10);
  });
});
