import { describe, expect, test } from 'vitest';
import { avanzar, barajar, crearCola } from '../../src/lib/listaReproduccion.js';
import { crearAleatorio } from '../../src/lib/matematicas.js';

describe('lista de reproduccion', () => {
  test('barajar conserva todos los elementos', () => {
    const original = ['a', 'b', 'c', 'd', 'e'];
    const mezclada = barajar(original, crearAleatorio(1));

    expect([...mezclada].sort()).toEqual([...original].sort());
    expect(mezclada).toHaveLength(original.length);
  });

  test('barajar no toca el array original', () => {
    const original = ['a', 'b', 'c'];
    barajar(original, crearAleatorio(2));

    expect(original).toEqual(['a', 'b', 'c']);
  });

  test('la cola contiene cada cancion una sola vez', () => {
    const cola = crearCola(7, crearAleatorio(3));

    expect(cola).toHaveLength(7);
    expect([...cola].sort((a, b) => a - b)).toEqual([0, 1, 2, 3, 4, 5, 6]);
  });

  test('sin canciones la cola esta vacia', () => {
    expect(crearCola(0)).toEqual([]);
  });

  test('avanzar recorre toda la cola antes de repetir', () => {
    const aleatorio = crearAleatorio(4);
    let cola = crearCola(5, aleatorio);
    let posicion = 0;
    const sonadas = [cola[posicion]];

    for (let i = 0; i < 4; i += 1) {
      ({ cola, posicion } = avanzar(cola, posicion, aleatorio));
      sonadas.push(cola[posicion]);
    }

    expect(new Set(sonadas).size).toBe(5);
  });

  test('al empezar una vuelta nueva no repite la que acaba de sonar', () => {
    const aleatorio = crearAleatorio(9);
    let cola = crearCola(4, aleatorio);
    let posicion = cola.length - 1;
    const ultima = cola[posicion];

    ({ cola, posicion } = avanzar(cola, posicion, aleatorio));

    expect(posicion).toBe(0);
    expect(cola[0]).not.toBe(ultima);
  });

  test('con una sola cancion se queda donde esta', () => {
    const resultado = avanzar([0], 0);
    expect(resultado).toEqual({ cola: [0], posicion: 0 });
  });

  test('con la cola vacia no se rompe', () => {
    expect(avanzar([], 0)).toEqual({ cola: [], posicion: 0 });
  });
});
