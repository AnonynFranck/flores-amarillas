import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, test } from 'vitest';
import { FRASES, INTRO, PERSONA, RECUERDOS } from '../../src/config/contenido.js';

const raizPublica = resolve(import.meta.dirname, '../../public');

/**
 * Estas pruebas protegen lo unico que se edita a mano: el contenido.
 * Si cambias el nombre de una foto y olvidas actualizar la configuracion,
 * fallan aqui en vez de dejar una esfera vacia en el regalo.
 */
describe('contenido', () => {
  test('la persona tiene nombre, titulo y pista', () => {
    expect(PERSONA.nombre.trim().length).toBeGreaterThan(0);
    expect(PERSONA.titulo).toContain(PERSONA.nombre);
    expect(PERSONA.pista.trim().length).toBeGreaterThan(0);
  });

  test('hay recuerdos suficientes para llenar la orbita', () => {
    expect(RECUERDOS.length).toBeGreaterThanOrEqual(4);
    expect(RECUERDOS.length).toBeLessThanOrEqual(12);
  });

  test('cada recuerdo tiene identificador unico', () => {
    const identificadores = new Set(RECUERDOS.map((recuerdo) => recuerdo.id));
    expect(identificadores.size).toBe(RECUERDOS.length);
  });

  test('cada recuerdo esta completo y bien colocado', () => {
    RECUERDOS.forEach((recuerdo) => {
      expect(recuerdo.titulo.trim().length).toBeGreaterThan(0);
      expect(recuerdo.mensaje.trim().length).toBeGreaterThan(0);
      expect(recuerdo.radio).toBeGreaterThan(3);
      expect(recuerdo.radio).toBeLessThan(16);
      expect(Math.abs(recuerdo.altura)).toBeLessThan(6);
      expect(recuerdo.velocidad).toBeGreaterThan(0);
    });
  });

  test('las imagenes referenciadas existen en public/', () => {
    const rutas = [INTRO.imagen, ...RECUERDOS.map((recuerdo) => recuerdo.imagen)];
    rutas.forEach((ruta) => {
      expect(existsSync(resolve(raizPublica, ruta)), `falta public/${ruta}`).toBe(true);
    });
  });

  test('las frases flotantes no se repiten ni se pasan de largas', () => {
    expect(new Set(FRASES).size).toBe(FRASES.length);
    FRASES.forEach((frase) => {
      expect(frase.length).toBeLessThanOrEqual(46);
    });
  });
});
