/**
 * Corazon de particulas doradas que se alza sobre el nucleo de la galaxia.
 *
 * Las particulas recorren la curva del corazon dentro del shader, lo que da la
 * sensacion de oro liquido en movimiento. El grupo gira sobre su eje Y para
 * mirar siempre a la camara: asi la silueta se lee desde cualquier angulo.
 */
import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  Color,
  Group,
  Points,
  ShaderMaterial,
  Vector3,
} from 'three';
import { crearAleatorio, desvioConcentrado, entre } from '../lib/matematicas.js';
import { PALETA } from '../config/contenido.js';

const vertexShader = /* glsl */ `
  uniform float uTiempo;
  uniform float uTamano;
  uniform float uEscalaCorazon;
  uniform float uPixelRatio;
  uniform float uFlujo;

  attribute float aT;
  attribute float aEscala;
  attribute float aFase;

  varying float vDestello;

  void main() {
    float t = fract(aT + uTiempo * uFlujo);
    float angulo = t * 6.2831853;
    float s = sin(angulo);

    float x = (16.0 * s * s * s) / 17.0;
    float y = (13.0 * cos(angulo) - 5.0 * cos(2.0 * angulo) - 2.0 * cos(3.0 * angulo) - cos(4.0 * angulo)) / 17.0;

    float pulso = 1.0 + sin(uTiempo * 1.6) * 0.022;
    vec3 lugar = vec3(x, y, 0.0) * uEscalaCorazon * pulso + position;

    vec4 posicionVista = modelViewMatrix * vec4(lugar, 1.0);
    gl_Position = projectionMatrix * posicionVista;
    gl_PointSize = uTamano * aEscala * uPixelRatio / max(0.001, -posicionVista.z);

    vDestello = 0.5 + 0.5 * sin(uTiempo * 2.4 + aFase * 6.2831);
  }
`;

const fragmentShader = /* glsl */ `
  uniform vec3 uColor;
  uniform float uAparicion;

  varying float vDestello;

  void main() {
    float distancia = length(gl_PointCoord - 0.5);
    float alfa = pow(max(0.0, 1.0 - distancia * 2.0), 2.0);
    if (alfa < 0.01) discard;

    vec3 color = mix(uColor, vec3(1.0, 0.99, 0.9), vDestello * 0.55);
    gl_FragColor = vec4(color, alfa * uAparicion * (0.45 + vDestello * 0.4));

    #include <colorspace_fragment>
  }
`;

export function crearCorazon(calidad, { escala = 5, altura = 6.6 } = {}) {
  const aleatorio = crearAleatorio(777);
  const total = calidad.corazon;

  const desvios = new Float32Array(total * 3);
  const parametros = new Float32Array(total);
  const escalas = new Float32Array(total);
  const fases = new Float32Array(total);

  for (let i = 0; i < total; i += 1) {
    const i3 = i * 3;
    // Grosor del trazo: mucha densidad en el centro de la linea y poca fuera.
    desvios[i3] = desvioConcentrado(aleatorio, 2.4, 0.27);
    desvios[i3 + 1] = desvioConcentrado(aleatorio, 2.4, 0.27);
    desvios[i3 + 2] = desvioConcentrado(aleatorio, 2.0, 0.17);
    parametros[i] = aleatorio();
    escalas[i] = entre(aleatorio, 0.5, 1.6);
    fases[i] = aleatorio();
  }

  const geometria = new BufferGeometry();
  geometria.setAttribute('position', new BufferAttribute(desvios, 3));
  geometria.setAttribute('aT', new BufferAttribute(parametros, 1));
  geometria.setAttribute('aEscala', new BufferAttribute(escalas, 1));
  geometria.setAttribute('aFase', new BufferAttribute(fases, 1));

  const material = new ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms: {
      uTiempo: { value: 0 },
      uTamano: { value: calidad.nivel === 'baja' ? 120 : 90 },
      uEscalaCorazon: { value: escala },
      uPixelRatio: { value: calidad.pixelRatio ?? 1 },
      uFlujo: { value: 0.035 },
      uColor: { value: new Color(PALETA.corazon) },
      uAparicion: { value: 0 },
    },
    transparent: true,
    depthWrite: false,
    blending: AdditiveBlending,
  });

  const puntos = new Points(geometria, material);
  puntos.frustumCulled = false;

  const grupo = new Group();
  grupo.name = 'corazon';
  grupo.position.y = altura;
  grupo.add(puntos);

  const posicionMundo = new Vector3();

  return {
    grupo,
    material,
    actualizar(tiempo, camara) {
      material.uniforms.uTiempo.value = tiempo;
      if (camara) {
        grupo.getWorldPosition(posicionMundo);
        grupo.rotation.y = Math.atan2(
          camara.position.x - posicionMundo.x,
          camara.position.z - posicionMundo.z
        );
      }
    },
    establecerAparicion(valor) {
      material.uniforms.uAparicion.value = valor;
    },
    liberar() {
      geometria.dispose();
      material.dispose();
    },
  };
}
