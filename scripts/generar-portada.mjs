/**
 * Genera la imagen de vista previa (public/portada.jpg), la que aparece al
 * compartir el enlace por WhatsApp o Telegram.
 *
 * Abre el sitio compilado en un navegador real, espera a que termine el viaje
 * y guarda un fotograma de la galaxia a 1200x630.
 *
 * Uso:
 *   npm run build
 *   npm run preview &
 *   node scripts/generar-portada.mjs
 */
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from '@playwright/test';

const aqui = dirname(fileURLToPath(import.meta.url));
const destino = resolve(aqui, '..', 'public', 'portada.jpg');
const url = process.env.URL_PREVIA ?? 'http://127.0.0.1:4173/';

const navegador = await chromium.launch({
  channel: 'chrome',
  args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'],
});

try {
  const pagina = await navegador.newPage({ viewport: { width: 1200, height: 630 } });
  pagina.setDefaultTimeout(180_000);

  await pagina.goto(url, { waitUntil: 'networkidle' });
  await pagina.locator('#intro-boton').click();
  await pagina.waitForFunction(() => window.__camara?.entradaTerminada === true, null, {
    timeout: 180_000,
  });
  // Un respiro para que las frases y las fotos acaben de aparecer.
  await pagina.waitForTimeout(3000);
  // JPEG: una vista previa de 1200x630 en PNG pesa medio mega sin ganar nada.
  await pagina.screenshot({ path: destino, type: 'jpeg', quality: 86 });

  console.log(`Portada guardada en ${destino}`);
} finally {
  await navegador.close();
}
