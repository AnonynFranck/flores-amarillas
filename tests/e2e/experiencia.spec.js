import { expect, test } from '@playwright/test';

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
    await expect(dialogo).toBeVisible();
    // El texto se escribe letra por letra: se espera a que se complete.
    await expect(page.locator('#tarjeta-mensaje')).toHaveText(/oro/, { timeout: 15_000 });
    await expect(page.locator('#tarjeta-imagen')).toHaveJSProperty('complete', true);

    await page.locator('#tarjeta-cerrar').click();
    await expect(dialogo).toBeHidden();
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
