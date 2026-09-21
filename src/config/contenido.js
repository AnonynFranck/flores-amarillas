/**
 * Contenido editable de la experiencia.
 *
 * Este es el unico archivo que necesitas tocar para personalizar el regalo:
 * nombre, frases, fotos, mensajes y canciones. El resto del proyecto lee de aqui.
 */

export const PERSONA = {
  nombre: 'Nathaly',
  titulo: 'Feliz día de las flores amarillas, Nathaly',
  pista: 'Desliza para explorar · Toca las fotos',
};

export const INTRO = {
  imagen: 'imagenes/orbes/05.jpg',
  texto: 'Un detalle inolvidable para ti…',
  boton: 'Descubrir magia',
  cargando: 'Encendiendo las estrellas…',
};

export const CIERRE = {
  texto: 'Volver al universo',
};

/**
 * Cada recuerdo es una foto que orbita la galaxia.
 *
 * Solo hace falta el contenido: la posicion en la orbita se reparte sola
 * (ver src/lib/orbitas.js). Si quieres mover una foto en concreto, puedes
 * anadirle `radio`, `altura`, `fase` o `velocidad` y mandara sobre el reparto.
 *
 * - imagen: version cuadrada para el orbe (public/imagenes/orbes/)
 * - foto: version completa para la tarjeta (public/imagenes/fotos/)
 */
export const RECUERDOS = [
  {
    id: 'comienzo',
    imagen: 'imagenes/orbes/01.jpg',
    foto: 'imagenes/fotos/01.jpg',
    titulo: 'Donde empezó todo',
    mensaje: 'La primera foto de lo más grande que nos ha pasado',
  },
  {
    id: 'pikachu-tres',
    imagen: 'imagenes/orbes/02.jpg',
    foto: 'imagenes/fotos/02.jpg',
    titulo: 'Día de juego',
    mensaje: 'Contigo el mundo entero se vuelve un lugar para jugar',
  },
  {
    id: 'pikachu-dos',
    imagen: 'imagenes/orbes/03.jpg',
    foto: 'imagenes/fotos/03.jpg',
    titulo: 'Tonterías nuestras',
    mensaje: 'Hasta las tonterías contigo son mi parte favorita del día',
  },
  {
    id: 'cerca',
    imagen: 'imagenes/orbes/04.jpg',
    foto: 'imagenes/fotos/04.jpg',
    titulo: 'Mi lugar seguro',
    mensaje: 'Tu hombro sigue siendo el sitio más tranquilo del mundo',
  },
  {
    id: 'sonrisa',
    imagen: 'imagenes/orbes/05.jpg',
    foto: 'imagenes/fotos/05.jpg',
    titulo: 'Esa sonrisa',
    mensaje: 'Tu sonrisa me arregla cualquier día, siempre',
  },
  {
    id: 'campo',
    imagen: 'imagenes/orbes/06.jpg',
    foto: 'imagenes/fotos/06.jpg',
    titulo: 'Lejos de todo',
    mensaje: 'Lejos de todo y aun así justo donde quiero estar: contigo',
  },
  {
    id: 'manos',
    imagen: 'imagenes/orbes/07.jpg',
    foto: 'imagenes/fotos/07.jpg',
    titulo: 'Tu mano',
    mensaje: 'Tu mano en la mía sigue siendo mi respuesta favorita',
  },
  {
    id: 'helados',
    imagen: 'imagenes/orbes/08.jpg',
    foto: 'imagenes/fotos/08.jpg',
    titulo: 'Dos helados',
    mensaje: 'Un helado y tú: no necesito un plan mejor',
  },
  {
    id: 'antojos',
    imagen: 'imagenes/orbes/09.jpg',
    foto: 'imagenes/fotos/09.jpg',
    titulo: 'Noche de antojos',
    mensaje: 'Nuestras noches de antojos son mis noches preferidas',
  },
  {
    id: 'salida',
    imagen: 'imagenes/orbes/10.jpg',
    foto: 'imagenes/fotos/10.jpg',
    titulo: 'Una salida más',
    mensaje: 'Cada salida contigo termina siendo una historia que contar',
  },
  {
    id: 'gafas',
    imagen: 'imagenes/orbes/11.jpg',
    foto: 'imagenes/fotos/11.jpg',
    titulo: 'Sin vergüenza',
    mensaje: 'Ridículos y felices, exactamente como debe ser',
  },
  {
    id: 'pequenas-cosas',
    imagen: 'imagenes/orbes/12.jpg',
    foto: 'imagenes/fotos/12.jpg',
    titulo: 'Cosas pequeñas',
    mensaje: 'Hasta las cosas más pequeñas brillan cuando estás tú',
  },
  {
    id: 'atardecer',
    imagen: 'imagenes/orbes/13.jpg',
    foto: 'imagenes/fotos/13.jpg',
    titulo: 'Ese atardecer',
    mensaje: 'Ese atardecer sabía perfectamente que lo mirábamos juntos',
  },
  {
    id: 'pintados',
    imagen: 'imagenes/orbes/14.jpg',
    foto: 'imagenes/fotos/14.jpg',
    titulo: 'Con la cara pintada',
    mensaje: 'Te amo incluso con la cara pintada, sobre todo así',
  },
  {
    id: 'serie',
    imagen: 'imagenes/orbes/15.jpg',
    foto: 'imagenes/fotos/15.jpg',
    titulo: 'Comida y serie',
    mensaje: 'Comida, una serie y tú: mi plan perfecto no ha cambiado',
  },
  {
    id: 'siesta',
    imagen: 'imagenes/orbes/16.jpg',
    foto: 'imagenes/fotos/16.jpg',
    titulo: 'Dormir tranquilo',
    mensaje: 'Duermo tranquilo cuando sé que estás cerca',
  },
  {
    id: 'espejo',
    imagen: 'imagenes/orbes/17.jpg',
    foto: 'imagenes/fotos/17.jpg',
    titulo: 'Frente al espejo',
    mensaje: 'Me gusta demasiado cómo nos vemos juntos',
  },
  {
    id: 'pegaditos',
    imagen: 'imagenes/orbes/18.jpg',
    foto: 'imagenes/fotos/18.jpg',
    titulo: 'Pegaditos',
    mensaje: 'Tu cara pegada a la mía es mi foto favorita del mundo',
  },
  {
    id: 'tira-fotos',
    imagen: 'imagenes/orbes/19.jpg',
    foto: 'imagenes/fotos/19.jpg',
    titulo: 'Nuestra tira',
    mensaje: 'Cuatro fotitos que guardo como si fueran un tesoro',
  },
  {
    id: 'pollo',
    imagen: 'imagenes/orbes/20.jpg',
    foto: 'imagenes/fotos/20.jpg',
    titulo: 'Hasta la comida',
    mensaje: 'Hasta la comida sabe mejor si la comparto contigo',
  },
  {
    id: 'cargarte',
    imagen: 'imagenes/orbes/21.jpg',
    foto: 'imagenes/fotos/21.jpg',
    titulo: 'Te cargo',
    mensaje: 'Te cargaría a ti y al mundo entero si hiciera falta',
  },
  {
    id: 'otra-vez',
    imagen: 'imagenes/orbes/22.jpg',
    foto: 'imagenes/fotos/22.jpg',
    titulo: 'Otra vez',
    mensaje: 'Repetir contigo nunca, nunca aburre',
  },
  {
    id: 'cualquier-rincon',
    imagen: 'imagenes/orbes/23.jpg',
    foto: 'imagenes/fotos/23.jpg',
    titulo: 'Cualquier rincón',
    mensaje: 'Cualquier rincón se vuelve bonito si apareces tú',
  },
  {
    id: 'pizza',
    imagen: 'imagenes/orbes/24.jpg',
    foto: 'imagenes/fotos/24.jpg',
    titulo: 'Una pizza',
    mensaje: 'Una pizza, dos personas y mil risas de más',
  },
  {
    id: 'orejitas',
    imagen: 'imagenes/orbes/25.jpg',
    foto: 'imagenes/fotos/25.jpg',
    titulo: 'Mi persona favorita',
    mensaje: 'Mi persona favorita, con orejitas y con todo',
  },
  {
    id: 'beso',
    imagen: 'imagenes/orbes/26.jpg',
    foto: 'imagenes/fotos/26.jpg',
    titulo: 'Y al final',
    mensaje: 'Y al final de cada historia, siempre este beso',
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

/**
 * Girasoles que flotan sueltos por la galaxia.
 * Son las flores dibujadas en public/imagenes; se reparten solas.
 */
export const FLORES = [
  'imagenes/flores/01.svg',
  'imagenes/flores/02.svg',
  'imagenes/flores/03.svg',
  'imagenes/flores/04.svg',
  'imagenes/flores/05.svg',
  'imagenes/flores/06.svg',
];

/**
 * Banda sonora. Suenan encadenadas, en orden distinto en cada visita, y bajan
 * de volumen solas mientras se lee una tarjeta.
 */
export const MUSICA = [
  { archivo: 'musica/te-quiero-amor.mp3', titulo: 'Te quiero amor' },
  { archivo: 'musica/enamorado-de-ti.mp3', titulo: 'Enamorado de ti' },
  {
    archivo: 'musica/luz-de-dia.mp3',
    titulo: 'Luz de día',
    artista: 'Hombres G · Enanitos Verdes',
  },
  { archivo: 'musica/love-language.mp3', titulo: 'Love Language' },
  {
    archivo: 'musica/antidoto-y-veneno.mp3',
    titulo: 'Antídoto y veneno',
    artista: 'Eddie Santiago',
  },
  {
    archivo: 'musica/sweet-dreams-tn.mp3',
    titulo: 'Sweet Dreams, TN',
    artista: 'The Last Shadow Puppets',
  },
  { archivo: 'musica/only.mp3', titulo: 'ONLY', artista: 'LeeHi' },
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
