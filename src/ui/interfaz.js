/**
 * Capa de interfaz sobre el lienzo: titulo, pista, fogonazo de entrada y la
 * lista accesible que permite abrir cada recuerdo con el teclado (las esferas
 * 3D no son alcanzables con tabulador por si solas).
 */

export function crearInterfaz({ persona, recuerdos, alElegirRecuerdo }) {
  const destello = document.querySelector('#destello');
  const titulo = document.querySelector('#titulo');
  const pista = document.querySelector('#pista');
  const lista = document.querySelector('#recuerdos-accesibles');

  if (titulo) titulo.textContent = persona.titulo;
  if (pista) pista.textContent = persona.pista;

  const botones = new Map();
  if (lista) {
    recuerdos.forEach((recuerdo) => {
      const elemento = document.createElement('li');
      const boton = document.createElement('button');
      boton.type = 'button';
      boton.textContent = `Abrir recuerdo: ${recuerdo.titulo}`;
      boton.addEventListener('click', () => alElegirRecuerdo?.(recuerdo));
      elemento.append(boton);
      lista.append(elemento);
      botones.set(recuerdo.id, boton);
    });
  }

  return {
    establecerDestello(valor) {
      if (destello) destello.style.opacity = String(valor);
    },
    revelar() {
      titulo?.classList.add('visible');
      pista?.classList.add('visible');
      lista?.removeAttribute('hidden');
    },
    botones,
  };
}
