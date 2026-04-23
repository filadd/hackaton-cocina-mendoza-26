# 🥟 Empanada Quest

Juego web para aprender a cocinar recetas típicas argentinas. Arranca con
**empanadas criollas de carne**. Proyecto de la hackaton de Filadd en Mendoza.

Estética **8 bits gaucho**: paleta limitada, tipografía pixel, sprites pixel art,
animaciones por pasos y banda sonora elegible (milonga o cumbia).

---

## Cómo correr

```sh
python3 -m http.server 8000
```

Y abrir `http://localhost:8000/` en Chrome o Firefox.

No hay build step ni dependencias — es HTML + CSS + JS puro.

## Flujo del juego

1. **Perfil**: nombre, provincia (grid clickeable sobre mapa de Argentina),
   género (él / ella) y nivel de cocina (Básico / Intermedio / Avanzado). El
   avatar del skill-selector cambia según el género.
2. **Receta**: horno o fritas, con o sin pasas, cantidad por empanadas (6–48)
   o por comensales (× 4).
3. **Ingredientes**: escalados desde la receta base de 24 unidades, agrupados
   en Relleno / Condimentos / Masa, cada uno con su sprite.
4. **Compras**: comercios curados por provincia (Mendoza, Córdoba, CABA, BsAs,
   Salta + fallback), tabla comparativa de marcas de tapas (La Salteña, Danal,
   Ottonello, Il Bambino) con precios estimados y destaque ⭐ por provincia,
   recomendaciones de corte de carne según skill, tip de mayorista, y soporte
   para adaptación sin TACC si hay comensales celíacos.
5. **Checklist**: la lista está agrupada en tres comercios (**Carnicería**,
   **Verdulería**, **Pulpería/Almacén**). Cada uno abre un modal con el fondo
   del local, diálogo del vendedor y solo sus ingredientes. Barra de progreso
   global; el botón "A la cocina" se habilita cuando los tres comercios
   están completos.
6. **Cocina**: tu avatar aparece en escena junto a los utensilios (tabla,
   cuchillo, olla, bowl, sartén, fuego) y un mensaje adaptado al skill.
7. **Paso a paso con timer**: 30 s base × `max(0.5, count/24)` × `factor_habilidad`
   (Básico 1.3, Intermedio 1.0, Avanzado 0.8). Cada paso tiene su sprite,
   se auto-tildan, y hay botones **Pausar** y **Saltar paso**.
8. **¡Listo!**: mensaje personalizado, resumen (provincia, skill, cantidad,
   tiempo, adaptación celíaca) y botón de compartir que copia al clipboard.

La música suena durante todo el juego (loop) y se puede cambiar o silenciar
desde el control flotante en la esquina inferior derecha. Por política del
navegador, arranca recién con la primera interacción del usuario.

## Estructura

```
.
├── index.html             # 8 secciones de pantalla
├── styles.css             # estética 8-bit gaucho, paleta, animaciones steps()
├── js/
│   ├── app.js             # router, event wiring, init
│   ├── state.js           # estado global + persistencia en localStorage
│   ├── data.js            # receta, comercios por provincia, marcas de tapas
│   ├── scaling.js         # escalado de ingredientes y duración del timer
│   ├── screens.js         # render de cada pantalla
│   └── music.js           # audio milonga/cumbia, volumen, mute, persistencia
├── assets/
│   ├── carnage.png        # fondo carnicería (modal checklist)
│   ├── greengrocery.png   # fondo verdulería (modal checklist)
│   ├── kitchen.png        # fondo pulpería/almacén (modal checklist)
│   └── sprites/           # PNGs individuales de sprites (avatares m/f, ingredientes,
│                          #   utensilios, empanadas, mapa, pergamino, botón)
└── music/
    ├── milonga.mp3
    └── cumbia.mp3
```

## Stack

Vanilla HTML + CSS + JS, sin frameworks ni bundler. Persistencia en
`localStorage`. Sprites pixelados con `image-rendering: pixelated`.
Tipografías `Press Start 2P` y `VT323` desde Google Fonts.

## Próximos pasos

- Más recetas (asado, locro, milanesas).
- Geolocalización real con la API del navegador.
- Precios reales por scraping o API.
- Dibujar versiones 16×16 / 32×32 nativas de los sprites (las actuales son
  recortes del spritesheet grande).
- Chiptune SFX en botones y pasos.

## Créditos

Hecho en la hackaton de Filadd en Mendoza por Diego Piloni (dpiloni) y Matute,
con asistencia de Claude Code.
