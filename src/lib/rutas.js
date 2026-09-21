/**
 * Resuelve rutas de recursos respetando la base del sitio.
 * Necesario para que el proyecto funcione igual en la raiz de un dominio
 * y en una ruta tipo usuario.github.io/flores-amarillas/.
 */
const BASE = (import.meta.env?.BASE_URL ?? './').replace(/\/?$/, '/');

export function recurso(ruta) {
  const limpia = String(ruta).replace(/^\.?\//, '');
  return `${BASE}${limpia}`;
}
