import { defineConfig } from 'vite';

/**
 * Política de seguridad de contenido.
 * GitHub Pages no permite configurar cabeceras, así que se inyecta como meta
 * en la compilación de producción (en desarrollo estorbaría al recargado en
 * caliente de Vite).
 */
const CSP = [
  "default-src 'self'",
  "script-src 'self'",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com",
  "img-src 'self' data: blob:",
  "connect-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "form-action 'none'",
].join('; ');

function politicaSeguridad() {
  return {
    name: 'csp-produccion',
    apply: 'build',
    transformIndexHtml() {
      return [
        {
          tag: 'meta',
          attrs: { 'http-equiv': 'Content-Security-Policy', content: CSP },
          injectTo: 'head-prepend',
        },
      ];
    },
  };
}

export default defineConfig({
  // Rutas relativas: el sitio funciona igual en la raíz de un dominio propio
  // que en usuario.github.io/flores-amarillas/.
  base: './',
  plugins: [politicaSeguridad()],
  build: {
    target: 'es2022',
    assetsInlineLimit: 2048,
    chunkSizeWarningLimit: 900,
    sourcemap: false,
  },
  test: {
    environment: 'node',
    include: ['tests/unit/**/*.test.js'],
    coverage: {
      provider: 'v8',
      include: ['src/lib/**', 'src/ui/maquinaEscribir.js', 'src/config/**'],
    },
  },
});
