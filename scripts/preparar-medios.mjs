/**
 * Prepara los medios originales para la web.
 *
 * Los archivos tal como salen de WhatsApp no sirven para publicar: nombres con
 * espacios y parentesis (que rompen las URL), fotos de 1600 px y canciones a
 * 192 kbps. Este script deja en public/ versiones con nombre limpio y peso
 * razonable, y conserva los originales intactos en medios-originales/.
 *
 * Necesita ImageMagick (magick) y ffmpeg.
 *
 * Uso: node scripts/preparar-medios.mjs
 */
import { execFile } from 'node:child_process';
import { mkdir, readdir, writeFile } from 'node:fs/promises';
import { dirname, extname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';

const ejecutar = promisify(execFile);
const aqui = dirname(fileURLToPath(import.meta.url));
const raiz = resolve(aqui, '..');

const ORIGEN_FOTOS = join(raiz, 'medios-originales', 'fotos');
const ORIGEN_MUSICA = join(raiz, 'medios-originales', 'musica');
const DESTINO_ORBES = join(raiz, 'public', 'imagenes', 'orbes');
const DESTINO_FOTOS = join(raiz, 'public', 'imagenes', 'fotos');
const DESTINO_MUSICA = join(raiz, 'public', 'musica');

/** Lado del recorte cuadrado que viaja como textura de cada orbe. */
const LADO_ORBE = 512;
/** Lado mayor de la foto que se ve en la tarjeta. */
const LADO_TARJETA = 1100;
/** Suficiente para musica de fondo en un movil; la mitad de peso que 192k. */
const BITRATE = '128k';

/**
 * Ordena los nombres de WhatsApp por hora y por el numero entre parentesis,
 * para que el orden sea el mismo en cualquier maquina.
 */
function ordenarNombres(nombres) {
  const clave = (nombre) => {
    const hora = nombre.match(/(\d{1,2})\.(\d{2})\.(\d{2})/);
    const copia = nombre.match(/\((\d+)\)/);
    const segundos = hora
      ? Number(hora[1]) * 3600 + Number(hora[2]) * 60 + Number(hora[3])
      : Number.MAX_SAFE_INTEGER;
    return [segundos, copia ? Number(copia[1]) : 0, nombre];
  };
  return [...nombres].sort((a, b) => {
    const [ha, ca, na] = clave(a);
    const [hb, cb, nb] = clave(b);
    return ha - hb || ca - cb || na.localeCompare(nb);
  });
}

async function listar(directorio, extensiones) {
  try {
    const entradas = await readdir(directorio);
    return entradas.filter((nombre) => extensiones.includes(extname(nombre).toLowerCase()));
  } catch {
    return [];
  }
}

async function prepararFotos() {
  const nombres = ordenarNombres(await listar(ORIGEN_FOTOS, ['.jpg', '.jpeg', '.png', '.webp']));
  if (nombres.length === 0) {
    console.log('No hay fotos en medios-originales/fotos; se omite ese paso.');
    return [];
  }

  await mkdir(DESTINO_ORBES, { recursive: true });
  await mkdir(DESTINO_FOTOS, { recursive: true });

  const generadas = [];
  for (const [indice, nombre] of nombres.entries()) {
    const numero = String(indice + 1).padStart(2, '0');
    const origen = join(ORIGEN_FOTOS, nombre);

    // Orbe: recorte cuadrado centrado, porque en la escena se ve en circulo.
    await ejecutar('magick', [
      origen,
      '-auto-orient',
      '-resize',
      `${LADO_ORBE}x${LADO_ORBE}^`,
      '-gravity',
      'center',
      '-extent',
      `${LADO_ORBE}x${LADO_ORBE}`,
      '-quality',
      '82',
      '-strip',
      join(DESTINO_ORBES, `${numero}.jpg`),
    ]);

    // Tarjeta: la foto entera, sin recortar, solo mas ligera.
    await ejecutar('magick', [
      origen,
      '-auto-orient',
      '-resize',
      `${LADO_TARJETA}x${LADO_TARJETA}>`,
      '-quality',
      '84',
      '-strip',
      join(DESTINO_FOTOS, `${numero}.jpg`),
    ]);

    generadas.push({ numero, origen: nombre });
  }

  console.log(`Fotos preparadas: ${generadas.length}`);
  return generadas;
}

/** Nombres limpios para las canciones; la clave es parte del archivo original. */
const CANCIONES = [
  { busca: 'Antídoto', archivo: 'antidoto-y-veneno.mp3' },
  { busca: 'Enamorado', archivo: 'enamorado-de-ti.mp3' },
  { busca: 'Luz de Día', archivo: 'luz-de-dia.mp3' },
  { busca: 'Love Language', archivo: 'love-language.mp3' },
  { busca: 'Te Quiero Amor', archivo: 'te-quiero-amor.mp3' },
  { busca: 'Sweet Dreams', archivo: 'sweet-dreams-tn.mp3' },
  { busca: 'ONLY', archivo: 'only.mp3' },
];

async function prepararMusica() {
  const nombres = await listar(ORIGEN_MUSICA, ['.mp3', '.m4a', '.ogg', '.wav']);
  if (nombres.length === 0) {
    console.log('No hay musica en medios-originales/musica; se omite ese paso.');
    return [];
  }

  await mkdir(DESTINO_MUSICA, { recursive: true });
  const generadas = [];

  for (const nombre of nombres) {
    const conocida = CANCIONES.find((cancion) => nombre.includes(cancion.busca));
    const destino = conocida
      ? conocida.archivo
      : `${nombre
          .replace(/\.[^.]+$/, '')
          .normalize('NFD')
          .replace(/[̀-ͯ]/g, '')
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '')}.mp3`;

    await ejecutar('ffmpeg', [
      '-y',
      '-loglevel',
      'error',
      '-i',
      join(ORIGEN_MUSICA, nombre),
      '-map',
      '0:a',
      '-c:a',
      'libmp3lame',
      '-b:a',
      BITRATE,
      '-map_metadata',
      '-1',
      join(DESTINO_MUSICA, destino),
    ]);

    generadas.push({ archivo: destino, origen: nombre });
  }

  console.log(`Canciones preparadas: ${generadas.length}`);
  return generadas;
}

const fotos = await prepararFotos();
const musica = await prepararMusica();

// Un inventario por si hay que rehacer la configuracion a mano.
await writeFile(
  join(raiz, 'medios-originales', 'inventario.json'),
  `${JSON.stringify({ fotos, musica }, null, 2)}\n`,
  'utf8'
);

console.log('Listo. Revisa public/imagenes/ y public/musica/.');
