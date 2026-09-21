---
name: experiencia-galaxia
description: Ajustar, depurar y extender la escena 3D de partículas doradas de este proyecto (galaxia, corazón, túnel de entrada, fotos en órbita y frases flotantes). Úsala al cambiar el aspecto visual, el encuadre, el rendimiento o la coreografía de entrada, y cuando algo se vea sobreexpuesto, recortado o lento.
---

# Experiencia galaxia

Guía de trabajo para la escena de `src/escena/`. Recoge las decisiones tomadas y
los errores que ya se cometieron una vez, para no repetirlos.

## Antes de tocar nada

1. `npm run dev` y mira la escena; casi todo se juzga en pantalla, no en el código.
2. Para capturar la escena sin GPU (contenedores, CI) usa Chrome del sistema:

   ```js
   chromium.launch({
     channel: 'chrome',
     args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'],
   });
   ```

   El renderizado por software va a 1-3 FPS: dale timeouts largos (120 s) a las
   capturas y espera a `window.__camara.entradaTerminada === true` en vez de a
   un `waitForTimeout` fijo.

## Dónde se ajusta cada cosa

| Quieres cambiar                    | Archivo                 | Parámetro                                           |
| ---------------------------------- | ----------------------- | --------------------------------------------------- |
| Tamaño y densidad de la galaxia    | `escena/galaxia.js`     | `RADIO_MAXIMO`, `BRAZOS`, `GIRO_BRAZO`, `anillos[]` |
| Cuántas partículas según el equipo | `lib/preferencias.js`   | tabla `CALIDADES`                                   |
| Brillo general                     | `escena/postproceso.js` | intensidad, radio y umbral del bloom                |
| Encuadre y distancia de cámara     | `escena/encuadre.js`    | `ocupacionDeseada`, `RADIO_ESCENA`, elevaciones     |
| Coreografía de entrada             | `escena/entrada.js`     | tiempos de la línea GSAP                            |
| Corazón                            | `escena/corazon.js`     | `escala`, `altura`, `uFlujo`                        |
| Órbitas de las fotos               | `config/contenido.js`   | `radio`, `altura`, `fase`, `velocidad`              |

## Trampas conocidas

### 1. El tamaño de punto es en píxeles, no en unidades

```glsl
gl_PointSize = uTamano * aEscala * uPixelRatio / max(0.001, -posicionVista.z);
```

`uTamano` se lee como "píxeles a una unidad de distancia". Con la cámara a 30
unidades, `uTamano = 95` da puntos de ~3 px. Multiplicar además por una
constante (por ejemplo `* 150.0`) produce puntos de 100 px y **la pantalla
entera se vuelve blanca**: con mezcla aditiva y 80 000 partículas, saturar es
instantáneo.

### 2. Un bloom con radio alto tiñe toda la pantalla

`UnrealBloomPass` con radio > 0.5 reparte una neblina morada sobre el fondo
oscuro. Valores que funcionan aquí: intensidad 0.5-0.6, radio ~0.34, **umbral
0.7** (alto). Un umbral bajo hace florecer también las fotos y las convierte en
bolas de luz sin motivo reconocible.

### 3. GSAP frena las animaciones en equipos lentos

Por defecto `gsap.ticker.lagSmoothing(500, 33)` limita cuánto avanza el tiempo
en cada cuadro. A 2 FPS, un viaje de 6 s tarda minutos. En `escena/entrada.js`
se desactiva con `gsap.ticker.lagSmoothing(0)` para que la línea de tiempo siga
al reloj real. No lo reactives.

### 4. El atributo `color` no está declarado solo

three declara `position`, `normal` y `uv` en el prefijo del shader; `color` solo
bajo `USE_COLOR`. En este proyecto se usa un atributo propio `aColor` declarado
explícitamente: es más claro y no depende de defines.

### 5. `position` guarda desvíos, no posiciones

En `galaxia.js` y `corazon.js` el atributo `position` contiene el desvío de cada
partícula respecto a su órbita ideal; la posición real se calcula en el shader.
Por eso la esfera envolvente que calcula three no sirve y los `Points` llevan
`frustumCulled = false`. Si lo quitas, la galaxia desaparece según dónde mires.

### 6. `smoothstep` con los bordes invertidos

`smoothstep(0.0, -26.0, z)` es comportamiento indefinido en GLSL. Usa la
profundidad positiva: `smoothstep(0.0, 26.0, -z)`.

## Al cambiar el encuadre

La cámara no tiene una posición fija: `escena/encuadre.js` calcula a qué
distancia ponerse para que la galaxia entre entera en la pantalla actual, y con
qué elevación. Si tocas `RADIO_MAXIMO` de la galaxia, ajusta también
`RADIO_ESCENA`. Después comprueba **siempre** dos relaciones de aspecto:
1280×800 y 390×844. Lo que encuadra bien en apaisado se sale por los lados en
vertical.

Las frases y las fotos se agrandan cuando la cámara se aleja
(`escalaDeLegibilidad` y `escalaDeFotos`); si no, en móvil quedan ilegibles.

## Al añadir un elemento nuevo a la escena

Sigue el contrato que usan todos los módulos de `escena/`:

```js
export function crearAlgo(calidad) {
  // ...
  return {
    grupo,                       // u objeto
    actualizar(tiempo, camara),  // llamado cada cuadro
    establecerAparicion(valor),  // 0 a 1, lo anima la entrada
    liberar(),                   // dispose de geometría y material
  };
}
```

Luego añádelo en `main.js` (crear, `escena.add`, actualizar en el bucle) y, si
debe aparecer durante el viaje, dale su tramo en la línea de tiempo de
`escena/entrada.js` y un campo en `crearEstadoEntrada()`.

## Comprobaciones antes de dar algo por terminado

```bash
npm test          # incluye que las imágenes de contenido.js existan
npm run build
npm run test:e2e  # portada, viaje, tarjeta, teclado y giro con botón derecho
```

Y mira la escena en 1280×800 y en 390×844 antes de cerrar.
