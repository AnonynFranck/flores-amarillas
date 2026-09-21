/**
 * Orden de reproduccion.
 *
 * La idea: que cada visita empiece por una cancion distinta, pero que suenen
 * todas antes de repetir ninguna. Es una baraja, no un dado.
 *
 * Sin DOM ni audio a proposito, para poder probarlo.
 */

/** Baraja de Fisher-Yates sobre una copia: no toca el array original. */
export function barajar(elementos, aleatorio = Math.random) {
  const copia = [...elementos];
  for (let i = copia.length - 1; i > 0; i -= 1) {
    const j = Math.floor(aleatorio() * (i + 1));
    [copia[i], copia[j]] = [copia[j], copia[i]];
  }
  return copia;
}

/**
 * Cola de reproduccion: los indices 0..cantidad-1 en orden aleatorio.
 * @param {number} cantidad
 */
export function crearCola(cantidad, aleatorio = Math.random) {
  if (cantidad <= 0) return [];
  return barajar(
    Array.from({ length: cantidad }, (_, i) => i),
    aleatorio
  );
}

/**
 * Avanza en la cola. Al llegar al final se vuelve a barajar, evitando que la
 * primera de la nueva vuelta sea la misma que acaba de sonar.
 *
 * @returns {{cola: number[], posicion: number}} estado nuevo
 */
export function avanzar(cola, posicion, aleatorio = Math.random) {
  if (cola.length === 0) return { cola, posicion: 0 };
  if (cola.length === 1) return { cola, posicion: 0 };

  if (posicion + 1 < cola.length) {
    return { cola, posicion: posicion + 1 };
  }

  const ultima = cola[posicion];
  let nueva = barajar(cola, aleatorio);
  if (nueva[0] === ultima) {
    // Mover la repetida al final es suficiente y conserva la baraja.
    nueva = [...nueva.slice(1), nueva[0]];
  }
  return { cola: nueva, posicion: 0 };
}
