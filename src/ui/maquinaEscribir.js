/**
 * Maquina de escribir.
 *
 * No toca el DOM a proposito: emite el texto parcial y quien lo use decide
 * donde pintarlo. Eso la hace facil de probar y de reutilizar.
 */

const SIGNOS_PAUSA = new Set(['.', ',', ';', ':', '!', '?', '…']);

export function crearMaquinaEscribir({
  texto,
  alEscribir,
  alTerminar,
  velocidad = 42,
  pausaSigno = 260,
  programar = (fn, ms) => setTimeout(fn, ms),
  cancelarProgramado = (id) => clearTimeout(id),
}) {
  const caracteres = Array.from(String(texto ?? ''));
  let indice = 0;
  let temporizador = null;
  let terminada = false;

  const emitir = () => alEscribir?.(caracteres.slice(0, indice).join(''));

  const finalizar = () => {
    if (terminada) return;
    terminada = true;
    temporizador = null;
    alTerminar?.();
  };

  const paso = () => {
    if (indice >= caracteres.length) {
      finalizar();
      return;
    }
    const caracter = caracteres[indice];
    indice += 1;
    emitir();
    const espera = SIGNOS_PAUSA.has(caracter) ? pausaSigno : velocidad;
    temporizador = programar(paso, espera);
  };

  return {
    iniciar() {
      if (terminada || temporizador) return;
      emitir();
      temporizador = programar(paso, velocidad);
    },
    /** Muestra el texto completo de golpe (clic impaciente o menos movimiento). */
    completar() {
      if (terminada) return;
      if (temporizador) cancelarProgramado(temporizador);
      indice = caracteres.length;
      emitir();
      finalizar();
    },
    detener() {
      if (temporizador) cancelarProgramado(temporizador);
      temporizador = null;
      terminada = true;
    },
    get haTerminado() {
      return terminada;
    },
    get progreso() {
      return caracteres.length === 0 ? 1 : indice / caracteres.length;
    },
  };
}
