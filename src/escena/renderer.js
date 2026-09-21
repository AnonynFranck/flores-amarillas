/** Renderizador WebGL configurado para particulas aditivas sobre fondo oscuro. */
import { NoToneMapping, SRGBColorSpace, WebGLRenderer } from 'three';

export function crearRenderizador(lienzo, calidad) {
  const renderizador = new WebGLRenderer({
    canvas: lienzo,
    antialias: calidad.nivel !== 'baja',
    alpha: false,
    powerPreference: 'high-performance',
    stencil: false,
  });

  renderizador.setPixelRatio(calidad.pixelRatio ?? 1);
  renderizador.setSize(window.innerWidth, window.innerHeight);
  renderizador.setClearColor(0x040305, 1);
  renderizador.outputColorSpace = SRGBColorSpace;
  // Sin mapeo de tonos: queremos que el dorado conserve su saturacion y que el
  // brillo lo aporte el bloom, no una curva filmica que lo lleve al blanco.
  renderizador.toneMapping = NoToneMapping;

  return renderizador;
}
