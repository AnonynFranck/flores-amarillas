/**
 * Contenido editable de la experiencia.
 *
 * Este es el unico archivo que necesitas tocar para personalizar el regalo:
 * nombre, frases, fotos y mensajes. El resto del proyecto lee de aqui.
 */

export const PERSONA = {
  nombre: 'Nathaly',
  titulo: 'Feliz día de las flores amarillas, Nathaly',
  pista: 'Desliza para explorar el universo · Toca las esferas',
};

export const INTRO = {
  imagen: 'imagenes/intro.svg',
  texto: 'Un detalle inolvidable para ti…',
  boton: 'Descubrir magia',
  cargando: 'Encendiendo las estrellas…',
};

export const CIERRE = {
  texto: 'Cerrar',
};

/**
 * Cada recuerdo es una esfera que orbita la galaxia.
 * - imagen: archivo dentro de public/imagenes (cuadrado, idealmente 600x600)
 * - mensaje: se escribe letra por letra al abrir la tarjeta
 * - radio / altura / fase / velocidad: posicion y movimiento en la orbita
 */
export const RECUERDOS = [
  {
    id: 'brillo',
    imagen: 'imagenes/01.svg',
    titulo: 'Tu brillo',
    mensaje: 'Un amor tan brillante y puro como el oro',
    radio: 6.2,
    altura: 1.35,
    fase: 0.0,
    velocidad: 0.085,
  },
  {
    id: 'abrazo',
    imagen: 'imagenes/02.svg',
    titulo: 'Nuestro abrazo',
    mensaje: 'Contigo hasta el último rincón del universo',
    radio: 8.1,
    altura: 0.5,
    fase: 0.9,
    velocidad: 0.07,
  },
  {
    id: 'flores',
    imagen: 'imagenes/03.svg',
    titulo: 'Flores amarillas',
    mensaje: 'Estas flores amarillas son la excusa; tú eres el motivo',
    radio: 10.4,
    altura: 2.1,
    fase: 1.9,
    velocidad: 0.058,
  },
  {
    id: 'sol',
    imagen: 'imagenes/04.svg',
    titulo: 'Mi sol',
    mensaje: 'Eres el sol que le da color a todos mis días',
    radio: 9.2,
    altura: -0.9,
    fase: 2.9,
    velocidad: 0.066,
  },
  {
    id: 'eterno',
    imagen: 'imagenes/05.svg',
    titulo: 'Amor eterno',
    mensaje: 'Si el universo se apagara, tú seguirías iluminándome',
    radio: 12.1,
    altura: 1.7,
    fase: 4.0,
    velocidad: 0.05,
  },
  {
    id: 'siempre',
    imagen: 'imagenes/06.svg',
    titulo: 'Siempre tú',
    mensaje: 'Gracias por existir, Nathaly. Te amo más que a las estrellas',
    radio: 7.2,
    altura: 2.6,
    fase: 5.1,
    velocidad: 0.078,
  },
];

/** Frases que flotan por el universo. Entre 10 y 16 se ven bien. */
export const FRASES = [
  'Eres espectacular',
  'Siempre contigo',
  'Amor eterno',
  'Magia pura',
  'Te mereces todo',
  'Tu brillo es infinito',
  'Mi sol de cada día',
  'Un detalle inolvidable',
  'Siempre floreces en mí',
  'Infinito amor',
  'Mi lugar favorito',
  'Contigo todo es oro',
];

/** Paleta dorada compartida entre el CSS y los shaders. */
export const PALETA = {
  nucleo: 0xfff6d5,
  interior: 0xffd34e,
  exterior: 0xe98c0a,
  polvo: 0xffb020,
  corazon: 0xffe066,
  estrella: 0xfff3cf,
};
