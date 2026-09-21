/**
 * Tunel de luz para la entrada: el viaje a velocidad de destello.
 *
 * El objeto cuelga de la camara, asi que su espacio local ya es el espacio de
 * la camara: las estelas se reciclan con un mod() en el shader y nunca hay que
 * reposicionarlas desde la CPU. Cuando la velocidad es alta cada punto se
 * estira hacia el espectador y se convierte en una estela.
 */
import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  Color,
  LineSegments,
  ShaderMaterial,
} from 'three';
import { crearAleatorio, entre, TAU } from '../lib/matematicas.js';

const LARGO_TUNEL = 320;
const RADIO_TUNEL = 48;

const vertexShader = /* glsl */ `
  uniform float uAvance;
  uniform float uEstela;
  uniform float uLargoTunel;

  attribute float aLado;
  attribute float aEscala;

  varying float vAlfa;
  varying float vBrillo;

  void main() {
    float z = mod(position.z + uAvance, uLargoTunel) - uLargoTunel;
    z += aLado * uEstela * aEscala;

    vec3 lugar = vec3(position.xy, min(z, -0.5));
    vec4 posicionVista = modelViewMatrix * vec4(lugar, 1.0);
    float profundidad = -lugar.z;

    // Se desvanece al pasar junto a la camara y en el fondo del tunel.
    float cerca = smoothstep(0.0, 26.0, profundidad);
    float lejos = 1.0 - smoothstep(uLargoTunel * 0.62, uLargoTunel, profundidad);
    float centro = 1.0 - smoothstep(0.0, 1.0, length(position.xy) / 48.0);

    vAlfa = cerca * lejos * (0.35 + centro * 0.65);
    vBrillo = aEscala;

    gl_Position = projectionMatrix * posicionVista;
  }
`;

const fragmentShader = /* glsl */ `
  uniform vec3 uColorInterior;
  uniform vec3 uColorExterior;
  uniform float uOpacidad;

  varying float vAlfa;
  varying float vBrillo;

  void main() {
    vec3 color = mix(uColorExterior, uColorInterior, vBrillo);
    gl_FragColor = vec4(color, vAlfa * uOpacidad);

    #include <colorspace_fragment>
  }
`;

export function crearWarp(calidad) {
  const aleatorio = crearAleatorio(31337);
  const total = calidad.warp;

  const posiciones = new Float32Array(total * 2 * 3);
  const lados = new Float32Array(total * 2);
  const escalas = new Float32Array(total * 2);

  for (let i = 0; i < total; i += 1) {
    // Mas densidad cerca del eje de vuelo: es lo que crea el nucleo brillante.
    const radio = Math.pow(aleatorio(), 1.7) * RADIO_TUNEL + 0.4;
    const angulo = aleatorio() * TAU;
    const x = Math.cos(angulo) * radio;
    const y = Math.sin(angulo) * radio;
    const z = -aleatorio() * LARGO_TUNEL;
    const escala = entre(aleatorio, 0.45, 1);

    const base = i * 6;
    posiciones[base] = x;
    posiciones[base + 1] = y;
    posiciones[base + 2] = z;
    posiciones[base + 3] = x;
    posiciones[base + 4] = y;
    posiciones[base + 5] = z;

    lados[i * 2] = 0;
    lados[i * 2 + 1] = 1;
    escalas[i * 2] = escala;
    escalas[i * 2 + 1] = escala;
  }

  const geometria = new BufferGeometry();
  geometria.setAttribute('position', new BufferAttribute(posiciones, 3));
  geometria.setAttribute('aLado', new BufferAttribute(lados, 1));
  geometria.setAttribute('aEscala', new BufferAttribute(escalas, 1));

  const material = new ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms: {
      uAvance: { value: 0 },
      uEstela: { value: 0 },
      uLargoTunel: { value: LARGO_TUNEL },
      uOpacidad: { value: 0 },
      uColorInterior: { value: new Color(0xfff4d2) },
      uColorExterior: { value: new Color(0xffa41f) },
    },
    transparent: true,
    depthWrite: false,
    depthTest: false,
    blending: AdditiveBlending,
  });

  const lineas = new LineSegments(geometria, material);
  lineas.name = 'warp';
  lineas.frustumCulled = false;
  lineas.renderOrder = -1;
  lineas.visible = false;

  let avance = 0;

  return {
    objeto: lineas,
    material,
    /**
     * @param {number} delta segundos desde el cuadro anterior
     * @param {number} velocidad 0 = quieto, 1 = velocidad de destello
     */
    actualizar(delta, velocidad) {
      avance += delta * (12 + velocidad * 620);
      material.uniforms.uAvance.value = avance;
      material.uniforms.uEstela.value = velocidad * 52;
      material.uniforms.uOpacidad.value = Math.min(1, velocidad * 1.35);
      lineas.visible = velocidad > 0.001;
    },
    liberar() {
      geometria.dispose();
      material.dispose();
    },
  };
}
