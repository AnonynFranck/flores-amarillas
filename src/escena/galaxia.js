/**
 * Galaxia espiral de particulas doradas.
 *
 * Todo el movimiento ocurre en el vertex shader: cada particula guarda su radio
 * y su angulo, y el shader la hace girar con velocidad inversa al radio
 * (rotacion diferencial, como una galaxia real). Asi no se recalculan miles de
 * posiciones en la CPU en cada cuadro.
 */
import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  Color,
  Points,
  ShaderMaterial,
  Sprite,
  SpriteMaterial,
  Group,
} from 'three';
import { crearAleatorio, desvioConcentrado, entre, TAU } from '../lib/matematicas.js';
import { texturaHalo } from '../lib/texturas.js';
import { PALETA } from '../config/contenido.js';

const RADIO_MAXIMO = 14;
const BRAZOS = 5;
const GIRO_BRAZO = 1.4;

const vertexShader = /* glsl */ `
  uniform float uTiempo;
  uniform float uTamano;
  uniform float uGiro;
  uniform float uPixelRatio;

  attribute float aRadio;
  attribute float aAngulo;
  attribute float aEscala;
  attribute float aFase;
  attribute vec3 aColor;

  varying vec3 vColor;
  varying float vDestello;

  void main() {
    float velocidad = uGiro / (0.55 + aRadio * 0.26);
    float angulo = aAngulo + uTiempo * velocidad;

    // "position" guarda el desvio de cada particula respecto a su orbita ideal.
    vec3 lugar = vec3(cos(angulo) * aRadio, 0.0, sin(angulo) * aRadio) + position;
    lugar.y += sin(uTiempo * 0.5 + aFase * 6.2831) * 0.07;

    vec4 posicionVista = modelViewMatrix * vec4(lugar, 1.0);
    gl_Position = projectionMatrix * posicionVista;
    // Atenuacion por distancia: el tamano en pixeles es uTamano dividido
    // entre la profundidad, de modo que uTamano se lee como "pixeles a 1 unidad".
    gl_PointSize = uTamano * aEscala * uPixelRatio / max(0.001, -posicionVista.z);

    vColor = aColor;
    vDestello = 0.55 + 0.45 * sin(uTiempo * 1.7 + aFase * 6.2831);
  }
`;

const fragmentShader = /* glsl */ `
  uniform float uAparicion;

  varying vec3 vColor;
  varying float vDestello;

  void main() {
    float distancia = length(gl_PointCoord - 0.5);
    float alfa = pow(max(0.0, 1.0 - distancia * 2.0), 2.2);
    if (alfa < 0.01) discard;

    vec3 color = vColor * (0.78 + vDestello * 0.5);
    gl_FragColor = vec4(color, alfa * uAparicion * (0.4 + vDestello * 0.35));

    #include <colorspace_fragment>
  }
`;

function colorPorRadio(radio, destino) {
  const nucleo = new Color(PALETA.nucleo);
  const interior = new Color(PALETA.interior);
  const exterior = new Color(PALETA.exterior);
  const t = Math.min(1, radio / RADIO_MAXIMO);
  if (t < 0.28) {
    destino.copy(nucleo).lerp(interior, t / 0.28);
  } else {
    destino.copy(interior).lerp(exterior, (t - 0.28) / 0.72);
  }
  return destino;
}

/**
 * Construye las tres poblaciones de particulas en un solo buffer:
 * brazos espirales, anillos concentricos y polvo del nucleo.
 */
function construirGeometria(calidad) {
  const aleatorio = crearAleatorio(20260921);
  const totalBrazos = calidad.galaxia;
  const totalAnillos = calidad.anillos;
  const totalNucleo = Math.round(calidad.galaxia * 0.11);
  const total = totalBrazos + totalAnillos + totalNucleo;

  const desvios = new Float32Array(total * 3);
  const colores = new Float32Array(total * 3);
  const radios = new Float32Array(total);
  const angulos = new Float32Array(total);
  const escalas = new Float32Array(total);
  const fases = new Float32Array(total);

  const color = new Color();
  let i = 0;

  const escribir = (radio, angulo, desvio, escala) => {
    const i3 = i * 3;
    desvios[i3] = desvio.x;
    desvios[i3 + 1] = desvio.y;
    desvios[i3 + 2] = desvio.z;
    colorPorRadio(radio, color);
    colores[i3] = color.r;
    colores[i3 + 1] = color.g;
    colores[i3 + 2] = color.b;
    radios[i] = radio;
    angulos[i] = angulo;
    escalas[i] = escala;
    fases[i] = aleatorio();
    i += 1;
  };

  // 1. Brazos espirales
  for (let n = 0; n < totalBrazos; n += 1) {
    const radio = Math.pow(aleatorio(), 0.62) * RADIO_MAXIMO;
    const brazo = ((n % BRAZOS) / BRAZOS) * TAU;
    const angulo = brazo + radio * GIRO_BRAZO * 0.16;
    const dispersion = 0.12 + radio * 0.055;
    escribir(
      radio,
      angulo,
      {
        x: desvioConcentrado(aleatorio, 2.6, dispersion),
        y: desvioConcentrado(aleatorio, 3.4, dispersion * 0.34),
        z: desvioConcentrado(aleatorio, 2.6, dispersion),
      },
      entre(aleatorio, 0.45, 1.5)
    );
  }

  // 2. Anillos concentricos de polvo
  const anillos = [5.8, 8.4, 11.2, 13.4];
  for (let n = 0; n < totalAnillos; n += 1) {
    const radioBase = anillos[n % anillos.length];
    const radio = radioBase + desvioConcentrado(aleatorio, 1.8, 0.62);
    escribir(
      radio,
      aleatorio() * TAU,
      {
        x: desvioConcentrado(aleatorio, 2.2, 0.1),
        y: desvioConcentrado(aleatorio, 3.0, 0.14),
        z: desvioConcentrado(aleatorio, 2.2, 0.1),
      },
      entre(aleatorio, 0.5, 1.25)
    );
  }

  // 3. Polvo denso del nucleo
  for (let n = 0; n < totalNucleo; n += 1) {
    const radio = Math.pow(aleatorio(), 2.4) * 2.6;
    escribir(
      radio,
      aleatorio() * TAU,
      {
        x: desvioConcentrado(aleatorio, 2.0, 0.22),
        y: desvioConcentrado(aleatorio, 2.6, 0.2),
        z: desvioConcentrado(aleatorio, 2.0, 0.22),
      },
      entre(aleatorio, 0.6, 1.8)
    );
  }

  const geometria = new BufferGeometry();
  geometria.setAttribute('position', new BufferAttribute(desvios, 3));
  geometria.setAttribute('aColor', new BufferAttribute(colores, 3));
  geometria.setAttribute('aRadio', new BufferAttribute(radios, 1));
  geometria.setAttribute('aAngulo', new BufferAttribute(angulos, 1));
  geometria.setAttribute('aEscala', new BufferAttribute(escalas, 1));
  geometria.setAttribute('aFase', new BufferAttribute(fases, 1));
  return geometria;
}

export function crearGalaxia(calidad) {
  const grupo = new Group();
  grupo.name = 'galaxia';

  const geometria = construirGeometria(calidad);
  const material = new ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms: {
      uTiempo: { value: 0 },
      uTamano: { value: calidad.nivel === 'baja' ? 135 : 95 },
      uGiro: { value: 0.16 },
      uAparicion: { value: 0 },
      uPixelRatio: { value: calidad.pixelRatio ?? 1 },
    },
    transparent: true,
    depthWrite: false,
    blending: AdditiveBlending,
  });

  const puntos = new Points(geometria, material);
  // El atributo "position" solo guarda desvios, asi que la esfera envolvente
  // calculada por three no representa el tamano real: desactivamos el culling.
  puntos.frustumCulled = false;
  grupo.add(puntos);

  // Nucleo luminoso
  const halo = new Sprite(
    new SpriteMaterial({
      map: texturaHalo(),
      color: PALETA.nucleo,
      transparent: true,
      depthWrite: false,
      blending: AdditiveBlending,
      opacity: 0,
    })
  );
  halo.scale.setScalar(4.4);
  grupo.add(halo);

  return {
    grupo,
    puntos,
    material,
    halo,
    radioMaximo: RADIO_MAXIMO,
    actualizar(tiempo) {
      material.uniforms.uTiempo.value = tiempo;
      halo.scale.setScalar(4.4 + Math.sin(tiempo * 0.9) * 0.25);
    },
    /** 0 = invisible, 1 = totalmente encendida. Lo anima la entrada. */
    establecerAparicion(valor) {
      material.uniforms.uAparicion.value = valor;
      halo.material.opacity = valor * 0.32;
    },
    liberar() {
      geometria.dispose();
      material.dispose();
      halo.material.dispose();
    },
  };
}
