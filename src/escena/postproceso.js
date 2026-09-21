/**
 * Post-proceso: el resplandor (bloom) que convierte los puntos dorados en luz.
 * En equipos modestos se omite y se dibuja directo a pantalla.
 */
import { Vector2 } from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

export function crearPostproceso(renderizador, escena, camara, calidad) {
  if (!calidad.bloom) {
    return {
      bloom: null,
      activo: false,
      dibujar() {
        renderizador.render(escena, camara);
      },
      redimensionar(ancho, alto) {
        renderizador.setSize(ancho, alto);
      },
      degradar() {
        return false;
      },
      liberar() {},
    };
  }

  const compositor = new EffectComposer(renderizador);
  compositor.addPass(new RenderPass(escena, camara));

  const bloom = new UnrealBloomPass(
    new Vector2(window.innerWidth, window.innerHeight),
    calidad.nivel === 'alta' ? 0.55 : 0.46, // intensidad
    0.34, // radio: mas alto reparte una neblina sobre toda la pantalla
    0.72 // umbral alto: florecen las particulas, no las fotos
  );
  compositor.addPass(bloom);
  compositor.addPass(new OutputPass());

  let activo = true;

  return {
    compositor,
    bloom,
    get activo() {
      return activo;
    },
    dibujar() {
      if (activo) compositor.render();
      else renderizador.render(escena, camara);
    },
    redimensionar(ancho, alto) {
      renderizador.setSize(ancho, alto);
      compositor.setSize(ancho, alto);
      bloom.setSize(ancho, alto);
    },
    /**
     * Red de seguridad: si el equipo no da la talla se apaga el resplandor.
     * Se pierde brillo, pero la escena vuelve a moverse con fluidez.
     * @returns {boolean} true si el cambio se aplico ahora
     */
    degradar() {
      if (!activo) return false;
      activo = false;
      return true;
    },
    liberar() {
      compositor.dispose?.();
    },
  };
}
