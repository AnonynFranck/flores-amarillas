/**
 * Mando de la musica: una pastilla discreta en una esquina.
 *
 * Muestra que suena, deja pausar y pasar a la siguiente. Las barras solo se
 * mueven mientras hay musica, asi que se ve de un vistazo si esta sonando.
 */

export function crearControlMusica(reproductor) {
  const caja = document.querySelector('#musica');
  const botonAlternar = document.querySelector('#musica-alternar');
  const botonSiguiente = document.querySelector('#musica-siguiente');
  const titulo = document.querySelector('#musica-titulo');

  if (!caja || !botonAlternar) {
    return { mostrar() {}, actualizar() {} };
  }

  botonAlternar.addEventListener('click', () => reproductor.alternar());
  botonSiguiente?.addEventListener('click', () => reproductor.siguiente());

  return {
    mostrar() {
      caja.hidden = false;
      caja.classList.add('musica--visible');
    },

    /** @param {{cancion: object, sonando: boolean}} estado */
    actualizar({ cancion, sonando } = {}) {
      if (cancion && titulo) {
        titulo.textContent = cancion.artista
          ? `${cancion.titulo} · ${cancion.artista}`
          : cancion.titulo;
      }
      caja.classList.toggle('musica--sonando', Boolean(sonando));
      botonAlternar.setAttribute('aria-label', sonando ? 'Pausar la música' : 'Poner la música');
      botonAlternar.setAttribute('aria-pressed', sonando ? 'true' : 'false');
    },
  };
}
