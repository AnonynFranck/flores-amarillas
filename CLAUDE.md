# Flores amarillas — guía del repositorio

Experiencia web 3D de regalo: túnel de luz → galaxia dorada → tarjetas con
mensaje escrito a máquina. Vanilla JS + three.js + GSAP, compilado con Vite y
publicado como sitio estático.

## Comandos

```bash
npm run dev        # desarrollo
npm run build      # produce dist/
npm test           # Vitest (unitarias)
npm run test:e2e   # Playwright (usa el Chrome del sistema)
npm run format     # Prettier — el CI ejecuta format:check
npm run medios     # prepara fotos y música desde medios-originales/
```

## Medios

Los originales viven en `medios-originales/` (fuera de git) y `npm run medios`
genera las versiones publicables en `public/`. Nunca edites a mano lo que hay en
`public/imagenes/orbes`, `public/imagenes/fotos` ni `public/musica`: se
regeneran.

## Convenciones

- **Todo en español**: nombres de archivos, funciones, variables y comentarios.
  Los identificadores no llevan acentos; los textos que ve la persona, sí.
- **Un archivo, una responsabilidad.** 200-400 líneas; nunca más de 800.
- Los módulos de `src/escena/` devuelven un objeto con
  `actualizar(tiempo, camara)`, `establecerAparicion(valor)` y `liberar()`.
- **No hay estado global.** `main.js` crea todo y lo conecta; los módulos no se
  conocen entre sí.
- `src/config/contenido.js` es el único archivo pensado para editarse a mano
  (fotos, mensajes, frases, girasoles, canciones). Trátalo como datos, no como
  código: la colocación en la escena se calcula, no se escribe ahí.
- Sin `console.log` en el código de producción.

## Antes de dar por terminada una tarea

1. `npm test` — incluye una prueba que verifica que las imágenes referenciadas
   existen en `public/`.
2. `npm run build`.
3. Si tocaste la escena, míralas en 1280×800 **y** en 390×844.

## Para trabajar en la escena 3D

Carga la skill `experiencia-galaxia` (en `.claude/skills/`): documenta los
parámetros de cada módulo y las trampas ya conocidas (tamaño de punto, umbral
del bloom, `lagSmoothing` de GSAP, culling de los `Points`).
