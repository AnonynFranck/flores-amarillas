import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, test } from 'vitest';
import { FLORES, FRASES, INTRO, MUSICA, PERSONA, RECUERDOS } from '../../src/config/contenido.js';

const raizPublica = resolve(import.meta.dirname, '../../public');

const existeEnPublico = (ruta) => existsSync(resolve(raizPublica, ruta));

/**
 * Estas pruebas protegen lo unico que se edita a mano: el contenido.
 * Si cambias el nombre de una foto o de una cancion y olvidas actualizar la
 * configuracion, fallan aqui en vez de dejar un hueco en el regalo.
 */
describe('contenido', () => {
  test('la persona tiene nombre, titulo y pista', () => {
    expect(PERSONA.nombre.trim().length).toBeGreaterThan(0);
    expect(PERSONA.titulo).toContain(PERSONA.nombre);
    expect(PERSONA.pista.trim().length).toBeGreaterThan(0);
  });

  test('hay recuerdos suficientes para llenar la galaxia', () => {
    expect(RECUERDOS.length).toBeGreaterThanOrEqual(4);
    expect(RECUERDOS.length).toBeLessThanOrEqual(40);
  });

  test('cada recuerdo tiene identificador unico', () => {
    const identificadores = new Set(RECUERDOS.map((recuerdo) => recuerdo.id));
    expect(identificadores.size).toBe(RECUERDOS.length);
  });

  test('cada recuerdo tiene titulo y mensaje', () => {
    RECUERDOS.forEach((recuerdo) => {
      expect(recuerdo.titulo.trim().length, recuerdo.id).toBeGreaterThan(0);
      expect(recuerdo.mensaje.trim().length, recuerdo.id).toBeGreaterThan(0);
    });
  });

  test('las fotos de los recuerdos existen en public/', () => {
    RECUERDOS.forEach((recuerdo) => {
      expect(existeEnPublico(recuerdo.imagen), `falta public/${recuerdo.imagen}`).toBe(true);
      if (recuerdo.foto) {
        expect(existeEnPublico(recuerdo.foto), `falta public/${recuerdo.foto}`).toBe(true);
      }
    });
  });

  test('la portada existe', () => {
    expect(existeEnPublico(INTRO.imagen), `falta public/${INTRO.imagen}`).toBe(true);
  });

  test('si un recuerdo fija su orbita a mano, los valores son razonables', () => {
    RECUERDOS.filter((recuerdo) => recuerdo.radio !== undefined).forEach((recuerdo) => {
      expect(recuerdo.radio).toBeGreaterThan(3);
      expect(recuerdo.radio).toBeLessThan(16);
      expect(Math.abs(recuerdo.altura ?? 0)).toBeLessThan(6);
    });
  });

  test('las frases flotantes no se repiten ni se pasan de largas', () => {
    expect(new Set(FRASES).size).toBe(FRASES.length);
    FRASES.forEach((frase) => {
      expect(frase.length).toBeLessThanOrEqual(46);
    });
  });

  test('los girasoles existen en public/', () => {
    expect(FLORES.length).toBeGreaterThan(0);
    FLORES.forEach((ruta) => {
      expect(existeEnPublico(ruta), `falta public/${ruta}`).toBe(true);
    });
  });

  test('las canciones existen y tienen titulo', () => {
    expect(MUSICA.length).toBeGreaterThan(0);
    MUSICA.forEach((cancion) => {
      expect(cancion.titulo.trim().length, cancion.archivo).toBeGreaterThan(0);
      expect(existeEnPublico(cancion.archivo), `falta public/${cancion.archivo}`).toBe(true);
    });
  });

  test('no hay canciones repetidas', () => {
    const archivos = MUSICA.map((cancion) => cancion.archivo);
    expect(new Set(archivos).size).toBe(archivos.length);
  });
});
