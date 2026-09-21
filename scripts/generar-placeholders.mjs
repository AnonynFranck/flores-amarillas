/**
 * Genera las imágenes de ejemplo (flores amarillas) que se usan hasta que
 * subas tus propias fotos a public/imagenes.
 *
 * Uso: node scripts/generar-placeholders.mjs
 */
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const aqui = dirname(fileURLToPath(import.meta.url));
const destino = resolve(aqui, '..', 'public', 'imagenes');

const PALETA = [
  ['#ffd94a', '#f0a91b', '#fff8e4'],
  ['#ffe27a', '#e69512', '#fdf3df'],
  ['#ffcf3c', '#d98a0f', '#fff6e0'],
  ['#ffe9a1', '#eda31c', '#fdf7ea'],
  ['#ffd24a', '#e08e10', '#fff4dd'],
  ['#ffdf6b', '#dd9214', '#fdf6e6'],
  ['#ffe07d', '#e59a16', '#fffaf0'],
];

/**
 * Girasol suelto, sin fondo: el que flota por la galaxia.
 * Va con un resplandor propio para que no se vea recortado sobre el negro.
 */
function girasol(indice, { petalos = 12, tam = 400 } = {}) {
  const [claro, oscuro] = PALETA[indice % PALETA.length];
  const centro = tam / 2;
  const giro = (indice * 17) % 30;

  const hojas = Array.from({ length: petalos }, (_, i) => {
    const angulo = (360 / petalos) * i + giro;
    return `<ellipse cx="${centro}" cy="${centro - tam * 0.23}" rx="${tam * 0.058}" ry="${
      tam * 0.16
    }" fill="url(#petalo${indice})" transform="rotate(${angulo} ${centro} ${centro})"/>`;
  }).join('\n    ');

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${tam}" height="${tam}" viewBox="0 0 ${tam} ${tam}" role="img" aria-label="Girasol">
  <defs>
    <linearGradient id="petalo${indice}" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${claro}"/>
      <stop offset="100%" stop-color="${oscuro}"/>
    </linearGradient>
    <radialGradient id="nucleo${indice}" cx="42%" cy="38%" r="70%">
      <stop offset="0%" stop-color="#7a4d0c"/>
      <stop offset="100%" stop-color="#3d2404"/>
    </radialGradient>
    <radialGradient id="halo${indice}" cx="50%" cy="50%" r="50%">
      <stop offset="55%" stop-color="${claro}" stop-opacity="0.32"/>
      <stop offset="100%" stop-color="${claro}" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <circle cx="${centro}" cy="${centro}" r="${centro}" fill="url(#halo${indice})"/>
  <g>
    ${hojas}
  </g>
  <circle cx="${centro}" cy="${centro}" r="${tam * 0.072}" fill="url(#nucleo${indice})"/>
</svg>
`;
}

function flor(indice, { petalos = 8, tam = 600 } = {}) {
  const [claro, oscuro, fondo] = PALETA[indice % PALETA.length];
  const centro = tam / 2;
  const giro = (indice * 13) % 45;

  const hojas = Array.from({ length: petalos }, (_, i) => {
    const angulo = (360 / petalos) * i + giro;
    return `<ellipse cx="${centro}" cy="${centro - tam * 0.21}" rx="${tam * 0.085}" ry="${
      tam * 0.155
    }" fill="url(#petalo${indice})" transform="rotate(${angulo} ${centro} ${centro})"/>`;
  }).join('\n    ');

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${tam}" height="${tam}" viewBox="0 0 ${tam} ${tam}" role="img" aria-label="Flor amarilla">
  <defs>
    <radialGradient id="fondo${indice}" cx="50%" cy="42%" r="72%">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="100%" stop-color="${fondo}"/>
    </radialGradient>
    <linearGradient id="petalo${indice}" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${claro}"/>
      <stop offset="100%" stop-color="${oscuro}"/>
    </linearGradient>
    <radialGradient id="nucleo${indice}" cx="42%" cy="38%" r="70%">
      <stop offset="0%" stop-color="#8c5a10"/>
      <stop offset="100%" stop-color="#4a2c05"/>
    </radialGradient>
  </defs>
  <rect width="${tam}" height="${tam}" fill="url(#fondo${indice})"/>
  <g opacity="0.96">
    ${hojas}
  </g>
  <circle cx="${centro}" cy="${centro}" r="${tam * 0.088}" fill="url(#nucleo${indice})"/>
  <path d="M ${centro} ${centro + tam * 0.3}
           c 0 -${tam * 0.05} ${tam * 0.075} -${tam * 0.05} ${tam * 0.075} 0
           c 0 ${tam * 0.045} -${tam * 0.075} ${tam * 0.085} -${tam * 0.075} ${tam * 0.085}
           c 0 0 -${tam * 0.075} -${tam * 0.04} -${tam * 0.075} -${tam * 0.085}
           c 0 -${tam * 0.05} ${tam * 0.075} -${tam * 0.05} ${tam * 0.075} 0 z"
        fill="${oscuro}" opacity="0.5"/>
</svg>
`;
}

const favicon = `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64">
  <g>
    ${Array.from(
      { length: 8 },
      (_, i) =>
        `<ellipse cx="32" cy="18" rx="7" ry="13" fill="#ffd23c" transform="rotate(${i * 45} 32 32)"/>`
    ).join('\n    ')}
  </g>
  <circle cx="32" cy="32" r="7" fill="#5a3607"/>
</svg>
`;

await mkdir(destino, { recursive: true });
await mkdir(resolve(destino, 'flores'), { recursive: true });

const archivos = [
  ['intro.svg', flor(0, { petalos: 10 })],
  ['01.svg', flor(1, { petalos: 8 })],
  ['02.svg', flor(2, { petalos: 7 })],
  ['03.svg', flor(3, { petalos: 9 })],
  ['04.svg', flor(4, { petalos: 6 })],
  ['05.svg', flor(5, { petalos: 11 })],
  ['06.svg', flor(6, { petalos: 8 })],
];

await Promise.all(
  archivos.map(([nombre, contenido]) => writeFile(resolve(destino, nombre), contenido, 'utf8'))
);

// Girasoles sueltos, sin fondo: son los que flotan por la galaxia.
const girasoles = Array.from({ length: 6 }, (_, i) => [
  `flores/${String(i + 1).padStart(2, '0')}.svg`,
  girasol(i, { petalos: 10 + (i % 4) }),
]);
await Promise.all(
  girasoles.map(([nombre, contenido]) => writeFile(resolve(destino, nombre), contenido, 'utf8'))
);

await writeFile(resolve(aqui, '..', 'public', 'favicon.svg'), favicon, 'utf8');

console.log(
  `Generadas ${archivos.length} imágenes de ejemplo y ${girasoles.length} girasoles en public/imagenes`
);
