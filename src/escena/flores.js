/**
 * Girasoles flotando por la galaxia.
 *
 * Son decoracion pura: no se pueden tocar ni abren nada, y por eso se quedan
 * fuera del raycaster. Giran despacio sobre si mismas y se mecen, para que el
 * espacio entre las fotos no quede vacio.
 *
 * Las texturas (unas pocas) se comparten; el material es propio de cada flor,
 * que es lo que permite darle a cada una su opacidad.
 */
import { Group, Sprite, SpriteMaterial, SRGBColorSpace, TextureLoader } from 'three';
import { crearAleatorio, entre, TAU } from '../lib/matematicas.js';
import { recurso } from '../lib/rutas.js';

/** Cuantos girasoles segun la potencia del equipo. */
const CANTIDADES = { alta: 26, media: 18, baja: 10 };

const vacio = {
  actualizar() {},
  establecerAparicion() {},
  establecerEscala() {},
  liberar() {},
};

export function crearFlores(rutas, { calidad } = {}) {
  const grupo = new Group();
  grupo.name = 'flores';

  if (!rutas || rutas.length === 0) return { grupo, sprites: [], ...vacio };

  const cantidad = CANTIDADES[calidad?.nivel ?? 'media'] ?? CANTIDADES.media;
  const aleatorio = crearAleatorio(5150);

  const cargador = new TextureLoader();
  const texturas = rutas.map((ruta) => {
    const textura = cargador.load(recurso(ruta));
    textura.colorSpace = SRGBColorSpace;
    textura.generateMipmaps = false;
    return textura;
  });

  const sprites = [];
  for (let i = 0; i < cantidad; i += 1) {
    const material = new SpriteMaterial({
      map: texturas[i % texturas.length],
      transparent: true,
      depthWrite: false,
      opacity: 0,
    });

    const sprite = new Sprite(material);
    const escala = entre(aleatorio, 0.55, 1.35);
    sprite.userData = {
      escalaBase: escala,
      radio: entre(aleatorio, 4.5, 19),
      altura: entre(aleatorio, -4.5, 7.5),
      angulo: aleatorio() * TAU,
      velocidad: entre(aleatorio, 0.01, 0.038) * (aleatorio() < 0.5 ? -1 : 1),
      giro: entre(aleatorio, -0.35, 0.35),
      balanceo: entre(aleatorio, 0.2, 0.75),
      fase: aleatorio() * TAU,
      opacidadBase: entre(aleatorio, 0.45, 0.9),
    };
    sprite.scale.setScalar(escala);
    grupo.add(sprite);
    sprites.push(sprite);
  }

  let escalaGlobal = 1;

  return {
    grupo,
    sprites,
    actualizar(tiempo) {
      sprites.forEach((sprite) => {
        const datos = sprite.userData;
        const angulo = datos.angulo + tiempo * datos.velocidad;
        sprite.position.set(
          Math.cos(angulo) * datos.radio,
          datos.altura + Math.sin(tiempo * 0.35 + datos.fase) * datos.balanceo,
          Math.sin(angulo) * datos.radio
        );
        // El sprite siempre mira a la camara, pero su textura puede girar: eso
        // es lo que hace que cada girasol parezca dar vueltas sobre su tallo.
        sprite.material.rotation = tiempo * datos.giro + datos.fase;
        sprite.scale.setScalar(datos.escalaBase * escalaGlobal);
      });
    },
    establecerAparicion(valor) {
      sprites.forEach((sprite) => {
        sprite.material.opacity = sprite.userData.opacidadBase * valor;
      });
    },
    establecerEscala(factor) {
      escalaGlobal = factor;
    },
    liberar() {
      sprites.forEach((sprite) => sprite.material.dispose());
      texturas.forEach((textura) => textura.dispose());
    },
  };
}
