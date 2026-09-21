import { expect, test } from '@playwright/test';
import { MUSICA, RECUERDOS } from '../../src/config/contenido.js';

const DURACION_ENTRADA = 9_000; // la secuencia completa dura ~6,5 s

test.describe('universo de flores amarillas', () => {
  test('la portada invita a entrar', async ({ page }) => {
    await page.goto('/');

    await expect(page.locator('#intro-boton')).toBeVisible();
    await expect(page.locator('#intro-texto')).toHaveText(/detalle inolvidable/i);
    await expect(page.locator('#lienzo')).toBeVisible();
    // El titulo solo aparece al final del viaje.
    await expect(page.locator('#titulo')).not.toHaveClass(/visible/);
  });

  test('tras el viaje se llega a la galaxia y aparece el titulo', async ({ page }) => {
    await page.goto('/');
    await page.locator('#intro-boton').click();

    await expect(page.locator('#titulo')).toHaveClass(/visible/, { timeout: DURACION_ENTRADA });
    await expect(page.locator('#titulo')).toContainText('flores amarillas');
    await expect(page.locator('#recuerdos-accesibles')).not.toHaveAttribute('hidden', '');
    await expect(page.locator('#intro')).toHaveClass(/intro--oculta/);
  });

  test('el lienzo dibuja la galaxia (no se queda en negro)', async ({ page }) => {
    await page.goto('/');
    await page.locator('#intro-boton').click();
    await expect(page.locator('#titulo')).toHaveClass(/visible/, { timeout: DURACION_ENTRADA });
    await page.waitForTimeout(1_200);

    // Se mide el brillo medio del lienzo: si nada se dibujo, seria casi cero.
    // La muestra la toma la propia escena dentro de su cuadro de dibujo.
    const brillo = await page.evaluate(() => window.__camara.brilloDelLienzo());

    expect(brillo).toBeGreaterThan(3);
  });

  test('un recuerdo se abre y escribe su mensaje', async ({ page }) => {
    await page.goto('/');
    await page.locator('#intro-boton').click();
    await expect(page.locator('#titulo')).toHaveClass(/visible/, { timeout: DURACION_ENTRADA });

    // La lista accesible es el camino de teclado: recibe foco y se despliega.
    await page.locator('#recuerdos-accesibles button').first().focus();
    await page.keyboard.press('Enter');

    const dialogo = page.locator('#tarjeta');
    // La tarjeta no sale de golpe: primero la camara se acerca al orbe.
    await expect(dialogo).toBeVisible({ timeout: 10_000 });
    // El texto se escribe letra por letra: se espera a que se complete.
    await expect(page.locator('#tarjeta-mensaje')).toHaveText(RECUERDOS[0].mensaje, {
      timeout: 20_000,
    });
    await expect(page.locator('#tarjeta-imagen')).toHaveJSProperty('complete', true);

    await page.locator('#tarjeta-cerrar').click();
    await expect(dialogo).toBeHidden();
  });

  test('al abrir un recuerdo la camara se acerca y luego vuelve', async ({ page }) => {
    await page.goto('/');
    await page.locator('#intro-boton').click();
    await expect(page.locator('#titulo')).toHaveClass(/visible/, { timeout: DURACION_ENTRADA });

    const lejos = await page.evaluate(() => window.__camara.distancia);

    await page.locator('#recuerdos-accesibles button').nth(2).focus();
    await page.keyboard.press('Enter');
    await expect(page.locator('#tarjeta')).toBeVisible({ timeout: 10_000 });

    const cerca = await page.evaluate(() => window.__camara.distancia);
    expect(cerca).toBeLessThan(lejos / 2);

    await page.keyboard.press('Escape');
    await expect(page.locator('#tarjeta')).toBeHidden();
    await page.waitForTimeout(2_500);

    const devuelta = await page.evaluate(() => window.__camara.distancia);
    expect(Math.abs(devuelta - lejos)).toBeLessThan(lejos * 0.15);
  });

  test('la musica arranca sola y se puede pausar', async ({ page }) => {
    test.skip(MUSICA.length === 0, 'No hay canciones configuradas');

    await page.goto('/');
    const descargas = [];
    page.on('request', (peticion) => {
      if (peticion.url().includes('/musica/')) descargas.push(peticion.url());
    });

    await page.locator('#intro-boton').click();
    await expect(page.locator('#titulo')).toHaveClass(/visible/, { timeout: DURACION_ENTRADA });

    const mando = page.locator('#musica');
    await expect(mando).toBeVisible();
    await expect(mando).toHaveClass(/musica--sonando/, { timeout: 10_000 });
    await expect(page.locator('#musica-titulo')).not.toBeEmpty();

    // Solo debe descargarse la cancion que suena, no las siete.
    expect(descargas.length).toBeLessThanOrEqual(2);

    await page.locator('#musica-alternar').click();
    await expect(mando).not.toHaveClass(/musica--sonando/);
  });

  test('se puede cerrar la tarjeta con la tecla Escape', async ({ page }) => {
    await page.goto('/');
    await page.locator('#intro-boton').click();
    await expect(page.locator('#titulo')).toHaveClass(/visible/, { timeout: DURACION_ENTRADA });

    await page.locator('#recuerdos-accesibles button').nth(1).focus();
    await page.keyboard.press('Enter');
    await expect(page.locator('#tarjeta')).toBeVisible();

    await page.keyboard.press('Escape');
    await expect(page.locator('#tarjeta')).toBeHidden();
  });

  test('arrastrar con el boton derecho gira la camara', async ({ page }, info) => {
    test.skip(info.project.name === 'movil', 'El boton derecho no aplica en tactil');

    await page.goto('/');
    await page.locator('#intro-boton').click();
    await expect(page.locator('#titulo')).toHaveClass(/visible/, { timeout: DURACION_ENTRADA });

    const antes = await page.evaluate(() => window.__camara?.azimut ?? null);
    const caja = await page.locator('#lienzo').boundingBox();
    await page.mouse.move(caja.x + caja.width / 2, caja.y + caja.height / 2);
    await page.mouse.down({ button: 'right' });
    await page.mouse.move(caja.x + caja.width / 2 + 260, caja.y + caja.height / 2, { steps: 12 });
    await page.mouse.up({ button: 'right' });
    await page.waitForTimeout(600);
    const despues = await page.evaluate(() => window.__camara?.azimut ?? null);

    expect(antes).not.toBeNull();
    expect(Math.abs(despues - antes)).toBeGreaterThan(0.1);
  });

  test('sin movimiento preferido la galaxia aparece sin viaje', async ({ browser }) => {
    const contexto = await browser.newContext({ reducedMotion: 'reduce' });
    const pagina = await contexto.newPage();

    await pagina.goto('/');
    await pagina.locator('#intro-boton').click();
    await expect(pagina.locator('#titulo')).toHaveClass(/visible/, { timeout: 5_000 });

    await contexto.close();
  });
});
