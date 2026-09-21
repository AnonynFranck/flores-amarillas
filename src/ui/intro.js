/**
 * Portada. Ademas de presentar el regalo cumple una funcion tecnica: el
 * navegador necesita un gesto de la persona antes de lanzar animaciones
 * pesadas (y sonido, si algun dia se anade).
 */

import { INTRO } from '../config/contenido.js';
import { recurso } from '../lib/rutas.js';

export function crearIntro() {
  const capa = document.querySelector('#intro');
  const boton = document.querySelector('#intro-boton');
  const texto = document.querySelector('#intro-texto');
  const imagen = document.querySelector('#intro-imagen');
  if (!capa || !boton) throw new Error('Falta la portada #intro en el documento');

  // El HTML trae los textos por defecto (para que la pagina tenga sentido sin
  // JavaScript); aqui manda la configuracion.
  if (texto) texto.textContent = INTRO.texto;
  if (imagen) imagen.src = recurso(INTRO.imagen);
  boton.textContent = INTRO.boton;

  return {
    capa,
    boton,
    /** @returns {Promise<void>} se resuelve cuando la persona pulsa el boton */
    esperarGesto() {
      return new Promise((resolver) => {
        const activar = () => {
          boton.removeEventListener('click', activar);
          resolver();
        };
        boton.addEventListener('click', activar, { once: true });
        boton.focus({ preventScroll: true });
      });
    },
    ocultar() {
      capa.classList.add('intro--oculta');
      capa.setAttribute('aria-hidden', 'true');
      // inert evita que el teclado siga entrando en la portada ya invisible.
      capa.inert = true;
      window.setTimeout(() => {
        capa.style.display = 'none';
      }, 900);
    },
    marcarListo() {
      boton.disabled = false;
      capa.classList.add('intro--listo');
    },
  };
}
