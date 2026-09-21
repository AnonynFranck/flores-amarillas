# Flores amarillas · un universo para Nathaly

Una experiencia web en 3D para el **día de las flores amarillas**: se entra
volando a través de un túnel de luz, se llega a una galaxia dorada con un
corazón de partículas en el centro y, al tocar cada foto que orbita, aparece una
tarjeta que escribe su mensaje letra por letra.

Hecho con [three.js](https://threejs.org) y [GSAP](https://gsap.com), sin
dependencias pesadas y sin servidor: son archivos estáticos que se pueden
publicar en GitHub Pages.

---

## Cómo se ve

| Momento   | Qué pasa                                                                         |
| --------- | -------------------------------------------------------------------------------- |
| Portada   | Una tarjeta con la foto y el botón **Descubrir magia**                           |
| Viaje     | La cámara atraviesa un túnel de estelas doradas y un fogonazo de luz             |
| Galaxia   | Brazos espirales, anillos de polvo, corazón de partículas y estrellas de fondo   |
| Recuerdos | Cada foto orbita; al tocarla se abre su tarjeta con el mensaje escrito a máquina |

La galaxia **se desliza sola** al llegar. Se puede girar arrastrando con el
botón izquierdo **o con el derecho**, acercar con la rueda y explorar con un
dedo en el móvil. El giro automático se detiene mientras exploras y vuelve unos
segundos después.

---

## Empezar

```bash
npm install
npm run dev        # http://localhost:5173
```

Otros comandos:

```bash
npm run build      # compila a dist/
npm run preview    # sirve dist/ en http://localhost:4173
npm test           # pruebas unitarias (Vitest)
npm run test:e2e   # pruebas end to end (Playwright)
npm run format     # Prettier
```

---

## Personalizar: fotos y mensajes

Todo lo editable vive en un único archivo: [`src/config/contenido.js`](src/config/contenido.js).

### 1. Cambia las fotos

Pon tus imágenes en `public/imagenes/` (cuadradas, idealmente 600×600 px, en
`.jpg`, `.png`, `.webp` o `.svg`) y referencia el nombre del archivo:

```js
export const RECUERDOS = [
  {
    id: 'brillo', // identificador único
    imagen: 'imagenes/nuestra-foto.jpg',
    titulo: 'Tu brillo', // rótulo pequeño de la tarjeta
    mensaje: 'Un amor tan brillante y puro como el oro',
    radio: 6.2, // distancia al centro de la galaxia (6 a 13)
    altura: 1.35, // altura sobre el disco (-3 a 3)
    fase: 0.0, // posición inicial en la órbita (0 a 6.28)
    velocidad: 0.085, // vueltas por segundo (0.04 a 0.09)
  },
  // ...
];
```

Puedes tener entre 4 y 12 recuerdos. Si borras o añades uno, la lista accesible
del teclado y las órbitas se ajustan solas.

La foto de la portada se cambia en `INTRO.imagen`.

### 2. Cambia los textos

```js
export const PERSONA = {
  nombre: 'Nathaly',
  titulo: 'Feliz día de las flores amarillas, Nathaly',
  pista: 'Desliza para explorar el universo · Toca las esferas',
};

export const FRASES = ['Eres espectacular', 'Siempre contigo' /* ... */];
```

Las `FRASES` son las que flotan por el universo: entre 10 y 16 funcionan bien, y
conviene que sean cortas (máximo unos 45 caracteres).

### 3. Comprueba que no se rompió nada

```bash
npm test
```

Hay una prueba que verifica que **cada imagen referenciada existe de verdad** en
`public/`, así que si te equivocas con un nombre de archivo te enterarás aquí y
no cuando lo abra ella.

---

## Publicar en GitHub Pages

1. Crea el repositorio y sube el proyecto:

   ```bash
   git remote add origin https://github.com/TU-USUARIO/flores-amarillas.git
   git push -u origin main
   ```

2. En **Settings → Pages → Build and deployment**, elige **GitHub Actions**.

3. Listo: cada `push` a `main` compila y publica mediante
   [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml).

La URL será `https://TU-USUARIO.github.io/flores-amarillas/`. El proyecto usa
rutas relativas (`base: './'`), así que funciona igual en un subdirectorio que
en un dominio propio.

---

## Cómo está hecho

```
src/
├── config/contenido.js     # lo único que se edita a mano
├── escena/
│   ├── galaxia.js          # brazos espirales + anillos + polvo del núcleo
│   ├── corazon.js          # corazón de partículas que fluyen por la curva
│   ├── estrellas.js        # campo de estrellas de fondo
│   ├── warp.js             # túnel de luz de la entrada
│   ├── esferas.js          # fotos en órbita
│   ├── textos.js           # frases flotantes
│   ├── entrada.js          # la coreografía del viaje (GSAP)
│   ├── encuadre.js         # encuadre adaptado a cada pantalla
│   ├── camara.js · controles.js · renderer.js · postproceso.js
├── ui/
│   ├── intro.js · tarjeta.js · interfaz.js
│   └── maquinaEscribir.js  # efecto de escritura (sin DOM, por eso es testeable)
├── lib/                    # matemáticas, texturas, rutas y detección de equipo
└── estilos/                # tokens, base e interfaz
```

Decisiones que vale la pena conocer:

- **El movimiento ocurre en la GPU.** Cada partícula guarda su radio y su ángulo;
  el shader la hace girar con velocidad inversa al radio (rotación diferencial,
  como una galaxia real). No se recalculan 80 000 posiciones por cuadro en la CPU.
- **Aleatoriedad con semilla.** La galaxia se genera con un generador
  pseudoaleatorio sembrado, así que se ve idéntica en cada carga y las pruebas
  visuales son deterministas.
- **Calidad adaptativa.** Se detectan núcleos, memoria y tamaño de pantalla para
  elegir entre 15 000 y 78 000 partículas. Si aun así los FPS caen, la escena se
  degrada sola: primero apaga el resplandor y luego baja la resolución.
- **Encuadre adaptativo.** En pantallas verticales la cámara se aleja y baja el
  punto de vista para que la galaxia entre entera, y las frases y fotos crecen
  para seguir siendo legibles y tocables.
- **El viaje dura lo mismo en cualquier equipo.** Se desactiva el suavizado de
  retardo de GSAP para que la línea de tiempo avance con el reloj real.

---

## Accesibilidad

- **Teclado**: al tabular aparece un panel con la lista de recuerdos; `Enter`
  abre cada tarjeta y `Escape` la cierra.
- **Lectores de pantalla**: el mensaje de cada tarjeta se expone completo (el
  efecto de escritura es decorativo y está marcado como tal).
- **`prefers-reduced-motion`**: se omiten el viaje, el túnel y la escritura
  progresiva; la galaxia aparece quieta.
- **Sin WebGL**: se muestra una versión en texto con los mensajes.

## Rendimiento

| Recurso             | Tamaño (gzip)                                           |
| ------------------- | ------------------------------------------------------- |
| JS                  | ~170 kB (three.js y su post-proceso son la mayor parte) |
| CSS                 | ~3 kB                                                   |
| Imágenes de ejemplo | ~2 kB cada una (SVG)                                    |

Está por encima del presupuesto habitual de una página de aterrizaje porque es
una escena 3D completa; a cambio no hay fuentes pesadas, ni vídeo, ni sprites.
Si sustituyes las imágenes de ejemplo por fotos, comprímelas antes (WebP o AVIF,
600×600 px es suficiente).

## Créditos

Las imágenes incluidas son flores generadas por
[`scripts/generar-placeholders.mjs`](scripts/generar-placeholders.mjs); puedes
regenerarlas con `node scripts/generar-placeholders.mjs`. Sustitúyelas por tus
propias fotos.

## Licencia

MIT — ver [LICENSE](LICENSE).
