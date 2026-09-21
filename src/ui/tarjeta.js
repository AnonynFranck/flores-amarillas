/**
 * Tarjeta de recuerdo: el dialogo que se abre al tocar una esfera.
 *
 * El mensaje se escribe letra por letra. Para lectores de pantalla se expone el
 * texto completo de una vez (el efecto es decorativo, no deberia leerse letra
 * a letra), y un clic impaciente lo completa al instante.
 */
import { crearMaquinaEscribir } from './maquinaEscribir.js';
import { recurso } from '../lib/rutas.js';
import { CIERRE } from '../config/contenido.js';

export function crearTarjeta({ reducido = false, alCerrar } = {}) {
  const dialogo = document.querySelector('#tarjeta');
  const imagen = document.querySelector('#tarjeta-imagen');
  const titulo = document.querySelector('#tarjeta-titulo');
  const mensaje = document.querySelector('#tarjeta-mensaje');
  const mensajeAccesible = document.querySelector('#tarjeta-mensaje-accesible');
  const botonCerrar = document.querySelector('#tarjeta-cerrar');
  const marco = dialogo?.querySelector('.tarjeta__marco');

  if (!dialogo) throw new Error('Falta el dialogo #tarjeta en el documento');

  if (botonCerrar) botonCerrar.textContent = CIERRE.texto;

  let maquina = null;

  const detenerMaquina = () => {
    maquina?.detener();
    maquina = null;
  };

  const cerrar = () => {
    detenerMaquina();
    if (dialogo.open) dialogo.close();
  };

  const completar = () => {
    if (maquina && !maquina.haTerminado) {
      maquina.completar();
    }
  };

  botonCerrar?.addEventListener('click', cerrar);
  dialogo.addEventListener('close', () => {
    detenerMaquina();
    mensaje.classList.remove('escribiendo');
    alCerrar?.();
  });

  // Clic fuera del marco = cerrar; clic dentro = completar el texto.
  dialogo.addEventListener('click', (evento) => {
    if (evento.target === dialogo) {
      cerrar();
      return;
    }
    if (evento.target !== botonCerrar) completar();
  });

  return {
    elemento: dialogo,
    abrir(recuerdo) {
      detenerMaquina();

      // La tarjeta muestra la foto entera; el recorte cuadrado es solo para
      // la textura del orbe.
      imagen.src = recurso(recuerdo.foto ?? recuerdo.imagen);
      imagen.alt = recuerdo.titulo ?? '';
      titulo.textContent = recuerdo.titulo ?? '';
      mensaje.textContent = '';
      mensajeAccesible.textContent = recuerdo.mensaje;
      mensaje.classList.add('escribiendo');

      if (!dialogo.open) dialogo.showModal();
      marco?.animate?.(
        [
          { transform: 'translateY(14px) scale(0.97)', opacity: 0 },
          { transform: 'translateY(0) scale(1)', opacity: 1 },
        ],
        { duration: reducido ? 1 : 420, easing: 'cubic-bezier(0.16, 1, 0.3, 1)' }
      );

      maquina = crearMaquinaEscribir({
        texto: recuerdo.mensaje,
        velocidad: 46,
        alEscribir: (parcial) => {
          mensaje.textContent = parcial;
        },
        alTerminar: () => mensaje.classList.remove('escribiendo'),
      });

      if (reducido) {
        maquina.completar();
      } else {
        maquina.iniciar();
      }
    },
    cerrar,
    get abierta() {
      return dialogo.open;
    },
  };
}
