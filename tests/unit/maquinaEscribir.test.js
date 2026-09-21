import { describe, expect, test, vi } from 'vitest';
import { crearMaquinaEscribir } from '../../src/ui/maquinaEscribir.js';

describe('maquina de escribir', () => {
  test('emite el texto letra por letra', () => {
    vi.useFakeTimers();
    const emitidos = [];

    // Arrange
    const maquina = crearMaquinaEscribir({
      texto: 'hola',
      velocidad: 10,
      alEscribir: (parcial) => emitidos.push(parcial),
    });

    // Act
    maquina.iniciar();
    vi.advanceTimersByTime(100);

    // Assert
    expect(emitidos.at(-1)).toBe('hola');
    expect(emitidos).toContain('ho');
    vi.useRealTimers();
  });

  test('avisa una sola vez al terminar', () => {
    vi.useFakeTimers();
    const alTerminar = vi.fn();

    const maquina = crearMaquinaEscribir({ texto: 'ab', velocidad: 5, alTerminar });
    maquina.iniciar();
    vi.advanceTimersByTime(200);

    expect(alTerminar).toHaveBeenCalledTimes(1);
    expect(maquina.haTerminado).toBe(true);
    vi.useRealTimers();
  });

  test('completar muestra el mensaje entero de inmediato', () => {
    vi.useFakeTimers();
    let ultimo = '';

    const maquina = crearMaquinaEscribir({
      texto: 'te amo mas que a las estrellas',
      velocidad: 40,
      alEscribir: (parcial) => {
        ultimo = parcial;
      },
    });
    maquina.iniciar();
    vi.advanceTimersByTime(80);
    maquina.completar();

    expect(ultimo).toBe('te amo mas que a las estrellas');
    expect(maquina.progreso).toBe(1);
    vi.useRealTimers();
  });

  test('hace una pausa mas larga despues de un signo de puntuacion', () => {
    vi.useFakeTimers();
    const emitidos = [];

    const maquina = crearMaquinaEscribir({
      texto: 'a.b',
      velocidad: 10,
      pausaSigno: 500,
      alEscribir: (parcial) => emitidos.push(parcial),
    });
    maquina.iniciar();
    vi.advanceTimersByTime(60);

    // Tras escribir el punto espera la pausa larga, asi que "b" aun no llego.
    expect(emitidos.at(-1)).toBe('a.');
    vi.advanceTimersByTime(600);
    expect(emitidos.at(-1)).toBe('a.b');
    vi.useRealTimers();
  });

  test('detener corta la escritura sin emitir mas texto', () => {
    vi.useFakeTimers();
    const emitidos = [];

    const maquina = crearMaquinaEscribir({
      texto: 'larga frase de prueba',
      velocidad: 10,
      alEscribir: (parcial) => emitidos.push(parcial),
    });
    maquina.iniciar();
    vi.advanceTimersByTime(30);
    const cuantos = emitidos.length;
    maquina.detener();
    vi.advanceTimersByTime(500);

    expect(emitidos.length).toBe(cuantos);
    vi.useRealTimers();
  });

  test('un texto vacio termina sin fallar', () => {
    vi.useFakeTimers();
    const alTerminar = vi.fn();

    const maquina = crearMaquinaEscribir({ texto: '', alTerminar });
    maquina.iniciar();
    vi.advanceTimersByTime(100);

    expect(alTerminar).toHaveBeenCalledTimes(1);
    vi.useRealTimers();
  });
});
