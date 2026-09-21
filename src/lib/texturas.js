/**
 * Fabrica de texturas generadas en canvas.
 * Generarlas en tiempo de ejecucion evita descargar sprites y mantiene el
 * peso del sitio bajo: todo el brillo dorado sale de gradientes.
 */
import { CanvasTexture, LinearFilter, SRGBColorSpace } from 'three';

const cache = new Map();

function lienzo(ancho, alto) {
  const elemento = document.createElement('canvas');
  elemento.width = ancho;
  elemento.height = alto;
  return elemento;
}

function aTextura(elemento, { srgb = true } = {}) {
  const textura = new CanvasTexture(elemento);
  textura.minFilter = LinearFilter;
  textura.magFilter = LinearFilter;
  textura.generateMipmaps = false;
  if (srgb) textura.colorSpace = SRGBColorSpace;
  textura.needsUpdate = true;
  return textura;
}

/** Punto suave con nucleo brillante: la base de cada particula. */
export function texturaPunto() {
  if (cache.has('punto')) return cache.get('punto');
  const tam = 128;
  const elemento = lienzo(tam, tam);
  const ctx = elemento.getContext('2d');
  const gradiente = ctx.createRadialGradient(tam / 2, tam / 2, 0, tam / 2, tam / 2, tam / 2);
  gradiente.addColorStop(0, 'rgba(255,255,255,1)');
  gradiente.addColorStop(0.18, 'rgba(255,246,213,0.95)');
  gradiente.addColorStop(0.45, 'rgba(255,190,60,0.35)');
  gradiente.addColorStop(1, 'rgba(255,160,20,0)');
  ctx.fillStyle = gradiente;
  ctx.fillRect(0, 0, tam, tam);
  const textura = aTextura(elemento);
  cache.set('punto', textura);
  return textura;
}

/** Halo amplio para el nucleo de la galaxia. */
export function texturaHalo() {
  if (cache.has('halo')) return cache.get('halo');
  const tam = 256;
  const elemento = lienzo(tam, tam);
  const ctx = elemento.getContext('2d');
  const gradiente = ctx.createRadialGradient(tam / 2, tam / 2, 0, tam / 2, tam / 2, tam / 2);
  gradiente.addColorStop(0, 'rgba(255,255,250,0.95)');
  gradiente.addColorStop(0.25, 'rgba(255,228,150,0.55)');
  gradiente.addColorStop(0.6, 'rgba(255,170,40,0.16)');
  gradiente.addColorStop(1, 'rgba(255,150,20,0)');
  ctx.fillStyle = gradiente;
  ctx.fillRect(0, 0, tam, tam);
  const textura = aTextura(elemento);
  cache.set('halo', textura);
  return textura;
}

/**
 * Recorta una imagen en circulo y le anade el aro dorado con resplandor
 * que se ve en las esferas de recuerdos.
 */
export function texturaAvatar(imagen, { tam = 512 } = {}) {
  const elemento = lienzo(tam, tam);
  const ctx = elemento.getContext('2d');
  const centro = tam / 2;
  const radioFoto = tam * 0.37;

  const resplandor = ctx.createRadialGradient(
    centro,
    centro,
    radioFoto * 0.9,
    centro,
    centro,
    centro
  );
  resplandor.addColorStop(0, 'rgba(255,205,70,0.35)');
  resplandor.addColorStop(0.45, 'rgba(255,175,35,0.13)');
  resplandor.addColorStop(1, 'rgba(255,160,20,0)');
  ctx.fillStyle = resplandor;
  ctx.fillRect(0, 0, tam, tam);

  ctx.save();
  ctx.beginPath();
  ctx.arc(centro, centro, radioFoto, 0, Math.PI * 2);
  ctx.closePath();
  ctx.clip();
  ctx.fillStyle = '#fdfaf3';
  ctx.fillRect(0, 0, tam, tam);

  if (imagen) {
    const escala = Math.max((radioFoto * 2) / imagen.width, (radioFoto * 2) / imagen.height);
    const ancho = imagen.width * escala;
    const alto = imagen.height * escala;
    ctx.drawImage(imagen, centro - ancho / 2, centro - alto / 2, ancho, alto);
  }
  ctx.restore();

  ctx.lineWidth = tam * 0.022;
  ctx.strokeStyle = 'rgba(255,214,102,0.95)';
  ctx.shadowColor = 'rgba(255,196,46,0.9)';
  ctx.shadowBlur = tam * 0.045;
  ctx.beginPath();
  ctx.arc(centro, centro, radioFoto + ctx.lineWidth * 0.5, 0, Math.PI * 2);
  ctx.stroke();

  return aTextura(elemento);
}

/**
 * Texto dibujado en canvas para poder vivir dentro de la escena 3D.
 * Devuelve tambien la relacion de aspecto para escalar el sprite sin deformarlo.
 */
export function texturaTexto(texto, opciones = {}) {
  const {
    fuente = '"Cormorant Garamond", Georgia, serif',
    estilo = 'italic 600',
    tamano = 64,
    color = 'rgba(255,233,163,0.96)',
    resplandor = 'rgba(255,183,44,0.65)',
    relleno = 1.35,
  } = opciones;

  const densidad = Math.min(window.devicePixelRatio || 1, 2);
  const medidor = lienzo(8, 8).getContext('2d');
  medidor.font = `${estilo} ${tamano}px ${fuente}`;
  const ancho = Math.ceil(medidor.measureText(texto).width) + tamano * 0.8;
  const alto = Math.ceil(tamano * relleno);

  const elemento = lienzo(Math.ceil(ancho * densidad), Math.ceil(alto * densidad));
  const ctx = elemento.getContext('2d');
  ctx.scale(densidad, densidad);
  ctx.font = `${estilo} ${tamano}px ${fuente}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.shadowColor = resplandor;
  ctx.shadowBlur = tamano * 0.42;
  ctx.fillStyle = color;
  ctx.fillText(texto, ancho / 2, alto / 2);
  ctx.shadowBlur = 0;
  ctx.fillText(texto, ancho / 2, alto / 2);

  return { textura: aTextura(elemento), aspecto: ancho / alto, ancho, alto };
}

export function limpiarCacheTexturas() {
  cache.forEach((textura) => textura.dispose());
  cache.clear();
}
