# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

**Empanada Quest** — vanilla HTML/CSS/JS web game to learn to cook Argentine
recipes (starting with empanadas criollas). Hackaton project, no build step,
no framework. UI language and code identifiers are in Spanish; sprites and
data reflect Argentine context.

## Running / testing

```sh
python3 -m http.server 8000          # serve, then open http://localhost:8000/
node -c js/<file>.js                 # syntax check a single JS file
```

There is no test suite. For end-to-end smoke testing in Node, jsdom needs to
be installed outside the repo (e.g. `cd /tmp && npm install jsdom`) — the
repo has no `package.json` and should stay dependency-free.

## Architecture

The whole game is a single HTML page (`index.html`) with eight `<section class="screen">` elements. Only one is `.is-active` at a time.

- **`js/app.js`** — entry point. `showScreen(id)` swaps the active section and calls the matching function from `RENDERERS`. Event listeners are wired once in `wireEvents()`; per-screen logic lives in the renderers.
- **`js/screens.js`** — one `render<Screen>` function per screen. They read from `state`, produce DOM via an `el(tag, attrs, children)` helper, and mutate existing nodes by id/class. No virtual DOM.
- **`js/state.js`** — a single mutable `state` object (name, province, skill, gender, recipe, celiac, shopping, timer). `saveState()` / `loadState()` persist a subset to `localStorage`. Music has its own storage key in `js/music.js`.
- **`js/data.js`** — all hardcoded content: `RECIPE_EMPANADAS` (base = 24 units), `STORES_BY_PROVINCE`, `TAPAS_BRANDS` + `brandsForProvince()`, `MEAT_CUTS`, `WHOLESALE_TIPS`, and copy strings. Adding a new province or brand means editing only this file.
- **`js/scaling.js`** — `scaleIngredients(count, flags)` scales the base recipe (rounds grams to multiples of 25, units to integers); `computeTimerScale(count, skill)` returns total ms = `30000 × max(0.5, count/24) × skillFactor` where skill factors are 1.3 / 1.0 / 0.8; `splitStepDurations(total, steps)` distributes time proportional to each step's `weight`.
- **`js/music.js`** — two `<audio loop>` elements (milonga / cumbia) managed as a module-level `music` singleton. Browser autoplay policy requires a user gesture: `initMusic` attaches one-shot `pointerdown`/`keydown` listeners that call `ensureStarted()`.

Script load order in `index.html` matters: `data.js → state.js → scaling.js → music.js → screens.js → app.js`. Everything lives on the global scope (no modules), so `data.js` constants are referenced unqualified from the other files.

### Cooking timer

`renderCooking` stores step durations in the module-local `cookingDurations`, then starts a `setInterval(100ms)` that advances `state.timer.elapsed` by the real delta since the last tick (so `paused` freezes without drift). When `elapsed` crosses a step boundary, the previous step is marked `.is-done` and the next one gets `.is-current`. `skipStep()` advances `elapsed` to the end of the current step; the next tick auto-advances the UI. `stopCooking()` clears the interval and is called on replay and back-navigation.

### Sprites and shop backgrounds

Character/item sprites live in `assets/sprites/*.png`, individually sliced from 2816×1536 spritesheets via Python PIL (those spritesheets are no longer in-repo). For new sprites, use PIL + `image.crop((x1, y1, x2, y2))` + `save(..., optimize=True)`. Avatars follow the pattern `avatar-{basico|intermedio|avanzado}[-f].png`; `avatarSrc(skill, gender)` in `screens.js` is the single place that builds that path — always route through it.

Shop backgrounds (`assets/carnage.png`, `assets/greengrocery.png`, `assets/kitchen.png`) are full-size illustrations used as the modal background on the checklist screen. Each `SHOPS[i].bg` in `data.js` points to one.

`INGREDIENT_SPRITES`, `UTENSIL_SPRITES` and `STEP_SPRITES` in `screens.js` map recipe labels / step indices to sprite basenames. Ingredients without a sprite (condimentos) fall back to a `•` dot.

### Shopping checklist (`renderChecklist`)

The checklist groups ingredients by shop (`SHOPS` in `data.js`: `carniceria`, `verduleria`, `almacen`). Each shop card in the screen opens a modal (`#shop-modal`) whose background is the shop image and whose content is the subset of ingredients whose `label` appears in `shop.ingredients`. `state.shopping` is still the flat `{ingredientKey: boolean}` map — the shop view re-derives completion from it. `updateChecklistProgress()` is what gates the "A la cocina" button based on the global count.

## Visual language ("8 bits gaucho")

- Palette defined as CSS variables in `:root`. Use those, don't hardcode hex.
- Pixel borders are faked with stepped `box-shadow` (no `border-radius` on game elements).
- All transitions use `steps(N)`, never `ease`.
- Every `<img>` must be treated as pixel art: `image-rendering: pixelated`.
- Tipografía: `Press Start 2P` for titles/buttons, `VT323` for body.

## Conventions

- BEM-ish class names in Spanish (`.btn--primary`, `.screen__title`). IDs use kebab-case.
- JS identifiers are in Spanish where they mirror domain concepts (`empanadas`, `pasas`, `celiaco`), English for generic plumbing (`state`, `ticker`).
- Copy is informal Argentine Spanish ("tildá", "pedí", "bola de lomo").
- Prices are marked as estimates with a date reference (currently April 2026).
- Don't introduce a package manager, framework, or build step — the hackaton brief is explicit about keeping it zero-dep.
