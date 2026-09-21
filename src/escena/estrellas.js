/**
 * Campo de estrellas de fondo.
 * Deliberadamente tenue: acompana a la galaxia sin competir con ella.
 */
import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  Color,
  Points,
  ShaderMaterial,
} from 'three';
import { crearAleatorio, entre, TAU } from '../lib/matematicas.js';
import { PALETA } from '../config/contenido.js';

const vertexShader = /* glsl */ `
  uniform float uTiempo;
  uniform float uTamano;
  uniform float uPixelRatio;

  attribute float aEscala;
  attribute float aFase;

  varying float vDestello;

  void main() {
    vec4 posicionVista = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * posicionVista;
    gl_PointSize = uTamano * aEscala * uPixelRatio / max(0.001, -posicionVista.z);
    vDestello = 0.35 + 0.65 * pow(abs(sin(uTiempo * 0.45 + aFase * 6.2831)), 2.0);
  }
`;

const fragmentShader = /* glsl */ `
  uniform vec3 uColor;
  uniform float uIntensidad;

  varying float vDestello;

  void main() {
    float distancia = length(gl_PointCoord - 0.5);
    float alfa = pow(max(0.0, 1.0 - distancia * 2.0), 2.6);
    if (alfa < 0.01) discard;
    gl_FragColor = vec4(uColor, alfa * vDestello * uIntensidad);

    #include <colorspace_fragment>
  }
`;

export function crearEstrellas(calidad) {
  const aleatorio = crearAleatorio(4242);
  const total = calidad.estrellas;

  const posiciones = new Float32Array(total * 3);
  const escalas = new Float32Array(total);
  const fases = new Float32Array(total);

  for (let i = 0; i < total; i += 1) {
    const i3 = i * 3;
    // Distribucion uniforme sobre una capa esferica lejana.
    const radio = entre(aleatorio, 130, 400);
    const theta = aleatorio() * TAU;
    const coseno = entre(aleatorio, -1, 1);
    const seno = Math.sqrt(1 - coseno * coseno);
    posiciones[i3] = radio * seno * Math.cos(theta);
    posiciones[i3 + 1] = radio * coseno * 0.65;
    posiciones[i3 + 2] = radio * seno * Math.sin(theta);
    escalas[i] = entre(aleatorio, 0.35, 1.25);
    fases[i] = aleatorio();
  }

  const geometria = new BufferGeometry();
  geometria.setAttribute('position', new BufferAttribute(posiciones, 3));
  geometria.setAttribute('aEscala', new BufferAttribute(escalas, 1));
  geometria.setAttribute('aFase', new BufferAttribute(fases, 1));

  const material = new ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms: {
      uTiempo: { value: 0 },
      uTamano: { value: 390 },
      uPixelRatio: { value: calidad.pixelRatio ?? 1 },
      uColor: { value: new Color(PALETA.estrella) },
      uIntensidad: { value: 0.5 },
    },
    transparent: true,
    depthWrite: false,
    blending: AdditiveBlending,
  });

  const puntos = new Points(geometria, material);
  puntos.name = 'estrellas';

  return {
    objeto: puntos,
    material,
    actualizar(tiempo) {
      material.uniforms.uTiempo.value = tiempo;
      puntos.rotation.y = tiempo * 0.006;
    },
    establecerIntensidad(valor) {
      material.uniforms.uIntensidad.value = valor;
    },
    liberar() {
      geometria.dispose();
      material.dispose();
    },
  };
}
