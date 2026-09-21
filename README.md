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

| Momento   | Qué pasa                                                                        |
| --------- | ------------------------------------------------------------------------------- |
| Portada   | Una tarjeta con la foto y el botón **Descubrir magia**                          |
| Viaje     | La cámara atraviesa un túnel de estelas doradas y un fogonazo de luz            |
| Galaxia   | Brazos espirales, anillos de polvo, corazón de partículas y girasoles flotando  |
| Recuerdos | Al tocar una foto la cámara vuela hasta su órbita y ahí se abre su tarjeta      |
| Música    | Las canciones suenan encadenadas y bajan de volumen mientras se lee un recuerdo |

La galaxia **se desliza sola** al llegar. Se puede girar arrastrando con el
botón izquierdo **o con el derecho**, acercar con la rueda y explorar con un
dedo en el móvil. El giro automático se detiene mientras exploras y vuelve unos
segundos después.

Al tocar una foto la cámara se acerca a su órbita y **la sigue mientras lees**,
porque la foto no deja de moverse; al cerrar la tarjeta vuelve exactamente a la
vista que tenías.

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
npm run medios     # prepara fotos y música desde medios-originales/
npm run portada    # regenera la vista previa del enlace (public/portada.jpg)
```

---

## Personalizar: fotos, mensajes y música

Todo lo editable vive en un único archivo: [`src/config/contenido.js`](src/config/contenido.js).

### 1. Añade fotos o canciones

Deja los archivos tal cual (sí, con el nombre raro de WhatsApp) en:

- `medios-originales/fotos/`
- `medios-originales/musica/`

Y ejecuta:

```bash
npm run medios
```

Eso genera, con nombres limpios y peso razonable:

| Se genera                | Para qué                                  |
| ------------------------ | ----------------------------------------- |
| `public/imagenes/orbes/` | recorte cuadrado de 512 px para cada orbe |
| `public/imagenes/fotos/` | la foto entera para la tarjeta            |
| `public/musica/`         | la canción a 128 kbps                     |

Las fotos se numeran por orden de captura, así que `01.jpg` es la más antigua.
La carpeta `medios-originales/` no se sube al repositorio: es tu copia de
seguridad local.

### 2. Escribe los mensajes

```js
export const RECUERDOS = [
  {
    id: 'sonrisa', // identificador único
    imagen: 'imagenes/orbes/05.jpg', // el orbe
    foto: 'imagenes/fotos/05.jpg', // la tarjeta
    titulo: 'Esa sonrisa', // rótulo pequeño
    mensaje: 'Tu sonrisa me arregla cualquier día, siempre',
  },
  // ...
];
```

**No hace falta indicar la posición**: las órbitas se reparten solas en anillos
concéntricos (ver [`src/lib/orbitas.js`](src/lib/orbitas.js)). Si quieres mover
una foto en concreto, añádele `radio`, `altura`, `fase` o `velocidad` y mandará
sobre el reparto automático.

Puedes tener entre 4 y 40 recuerdos. Si borras o añades uno, las órbitas y la
lista accesible del teclado se reajustan solas.

### 3. La música

```js
export const MUSICA = [
  { archivo: 'musica/te-quiero-amor.mp3', titulo: 'Te quiero amor' },
  { archivo: 'musica/only.mp3', titulo: 'ONLY', artista: 'LeeHi' },
];
```

Suenan **en orden distinto en cada visita** y todas antes de repetir ninguna, se
funden unas con otras y bajan de volumen mientras se lee un recuerdo. Solo se
descarga la que suena y la siguiente, así que abrir la página no cuesta treinta
megas. El mando está arriba a la derecha: pausa y salto de canción.

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

### 4. Comprueba que no se rompió nada

```bash
npm test
```

Hay pruebas que verifican que **cada foto y cada canción referenciada existe de
verdad** en `public/`, así que si te equivocas con un nombre de archivo te
enterarás aquí y no cuando lo abra ella.

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

### La vista previa al compartir el enlace

`public/portada.jpg` es la imagen que se ve al pegar el enlace en WhatsApp o
Telegram. Cuando cambies las fotos, regénerala con el sitio ya compilado:

```bash
npm run build
npm run preview &
npm run portada
```

Usa el navegador de verdad para fotografiar la galaxia, así que la vista previa
siempre coincide con lo que ella va a ver.

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
│   ├── flores.js           # girasoles flotando
│   ├── enfoque.js          # el acercamiento a un orbe
│   ├── textos.js           # frases flotantes
│   ├── entrada.js          # la coreografía del viaje (GSAP)
│   ├── encuadre.js         # encuadre adaptado a cada pantalla
│   ├── camara.js · controles.js · renderer.js · postproceso.js
├── ui/
│   ├── intro.js · tarjeta.js · interfaz.js
│   ├── musica.js           # encadenado, atenuación y descarga bajo demanda
│   ├── controlMusica.js    # el mando de la esquina
│   └── maquinaEscribir.js  # efecto de escritura (sin DOM, por eso es testeable)
├── lib/                    # matemáticas, órbitas, lista de canciones, texturas
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
- **Las órbitas se calculan, no se escriben.** Con veintitantas fotos, colocarlas
  a mano acaba en montones y huecos; se reparten en anillos con más fotos cuanto
  mayor es el anillo.
- **La música se descarga a cuentagotas.** Dos elementos de audio que se turnan:
  mientras uno se apaga el otro se enciende, y la canción que ya sonó suelta su
  descarga.

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

| Recurso          | Tamaño                                                   |
| ---------------- | -------------------------------------------------------- |
| JS               | ~175 kB gzip (three.js y su post-proceso son la mayoría) |
| CSS              | ~4 kB gzip                                               |
| Orbes (26 fotos) | ~1,1 MB en total, se cargan al entrar                    |
| Fotos de tarjeta | ~110 kB cada una, solo al abrir su tarjeta               |
| Música           | ~4 MB por canción, solo la que suena                     |

Está por encima del presupuesto habitual de una página de aterrizaje porque es
una escena 3D completa con fotos y música; a cambio nada se descarga antes de
hacer falta. `npm run medios` se encarga de la compresión, así que no hace falta
preparar nada a mano.

## Créditos y música

Los girasoles que flotan por la galaxia están dibujados por
[`scripts/generar-placeholders.mjs`](scripts/generar-placeholders.mjs) y se
regeneran con `npm run imagenes:ejemplo`.

Las canciones son grabaciones comerciales de sus autores. En un sitio público
las estás redistribuyendo, aunque sea un regalo personal: si prefieres evitarlo,
puedes quitar `public/musica/` del repositorio (la experiencia funciona sin
música: basta con dejar `MUSICA` vacío en `contenido.js`).

## Licencia

MIT — ver [LICENSE](LICENSE).
