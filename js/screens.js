// Helpers de DOM
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => Array.from(document.querySelectorAll(sel));

function spriteImg(name, alt = "", extra = "") {
  return el("img", {
    src: `assets/sprites/${name}.png`,
    alt,
    class: `sprite ${extra}`.trim(),
    loading: "lazy",
  });
}

// Mapa: label del ingrediente → sprite (los condimentos no tienen sprite)
const INGREDIENT_SPRITES = {
  "Carne vacuna (cortada a cuchillo)": "ing-carne",
  "Cebolla blanca": "ing-cebolla",
  "Cebolla de verdeo": "ing-verdeo",
  "Huevos duros": "ing-huevos",
  "Aceitunas verdes sin carozo": "ing-aceitunas",
  "Pasas de uva": "ing-pasas",
  "Grasa vacuna (o aceite)": "ing-grasa",
  "Tapas de empanada": "ing-tapas",
  "Huevo (para pincelar)": "ing-huevos",
};

// Utensilios → sprites
const UTENSIL_SPRITES = {
  "Tabla de madera": "tabla",
  "Cuchillo filoso": "cuchillo",
  "Olla mediana o sartén honda": "olla",
  "Bowl grande": "bowl-relleno",
  "Placa para horno o sartén para freír": "sarten",
};

// Pasos de cocción → sprite principal
const STEP_SPRITES = ["ing-cebolla", "ing-carne", "olla", "manos-armando", "fuego"];

function el(tag, attrs = {}, ...children) {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === "class") node.className = v;
    else if (k === "html") node.innerHTML = v;
    else if (k.startsWith("on") && typeof v === "function") node.addEventListener(k.slice(2), v);
    else if (v === true) node.setAttribute(k, "");
    else if (v !== false && v != null) node.setAttribute(k, v);
  }
  for (const child of children.flat()) {
    if (child == null) continue;
    node.appendChild(typeof child === "string" ? document.createTextNode(child) : child);
  }
  return node;
}

// ---------- 1. Welcome ----------
function renderWelcome() {
  const grid = $("#map-grid");
  if (grid.children.length === 0) {
    for (const prov of PROVINCES) {
      const btn = el("button", {
        class: "prov-tile",
        type: "button",
        "data-prov": prov,
        onclick: () => selectProvince(prov),
      }, prov);
      grid.appendChild(btn);
    }
  }
  // Restaurar valores si hay state cargado.
  if (state.name) $("#input-name").value = state.name;
  if (state.province) highlightProvince(state.province);
  if (state.skill) {
    const r = document.querySelector(`input[name="skill"][value="${state.skill}"]`);
    if (r) r.checked = true;
  }
  updateWelcomeButton();
}

function selectProvince(prov) {
  state.province = prov;
  highlightProvince(prov);
  saveState();
  updateWelcomeButton();
}

function highlightProvince(prov) {
  $$(".prov-tile").forEach((t) => {
    t.classList.toggle("is-selected", t.dataset.prov === prov);
  });
}

function updateWelcomeButton() {
  const ready = state.name.trim() && state.province && state.skill;
  $("#btn-to-recipe").disabled = !ready;
  // Marcar la card del skill seleccionado
  $$(".skill-card").forEach((card) => {
    const input = card.querySelector("input");
    card.classList.toggle("is-selected", !!input && input.checked);
  });
}

// ---------- 2. Recipe selection ----------
function renderRecipe() {
  // Sincroniza UI con state
  const styleInput = document.querySelector(`input[name="style"][value="${state.recipe.style}"]`);
  if (styleInput) styleInput.checked = true;
  const raisinsInput = document.querySelector(`input[name="raisins"][value="${state.recipe.raisins ? "si" : "no"}"]`);
  if (raisinsInput) raisinsInput.checked = true;
  const modeInput = document.querySelector(`input[name="countMode"][value="${state.recipe.countMode}"]`);
  if (modeInput) modeInput.checked = true;
  updateCountMode();
  syncCountReadouts();
}

function updateCountMode() {
  const mode = state.recipe.countMode;
  $("#count-empanadas").classList.toggle("is-hidden", mode !== "empanadas");
  $("#count-comensales").classList.toggle("is-hidden", mode !== "comensales");
}

function syncCountReadouts() {
  const emp = parseInt($("#input-empanadas").value, 10);
  const com = parseInt($("#input-comensales").value, 10);
  $("#readout-empanadas").textContent = emp;
  $("#readout-comensales").textContent = com * 4;
}

function computeCount() {
  if (state.recipe.countMode === "comensales") {
    const com = parseInt($("#input-comensales").value, 10);
    return Math.max(4, com * 4);
  }
  return parseInt($("#input-empanadas").value, 10);
}

// ---------- 3. Ingredients ----------
function renderIngredients() {
  state.recipe.count = computeCount();
  $("#ingredients-sub").textContent = `Para ${state.recipe.count} empanadas`;

  const ingredients = scaleIngredients(state.recipe.count, {
    raisins: state.recipe.raisins,
    style: state.recipe.style,
    celiac: state.celiac,
  });
  const container = $("#ingredients-list");
  container.innerHTML = "";

  const groups = {};
  for (const ing of ingredients) {
    (groups[ing.group] = groups[ing.group] || []).push(ing);
  }

  for (const [groupName, items] of Object.entries(groups)) {
    const section = el("div", { class: "ingredient-group" },
      el("h3", { class: "ingredient-group__title" }, groupName),
      el("ul", { class: "ingredient-group__list" },
        items.map((ing) => {
          const spriteName = INGREDIENT_SPRITES[ing.label];
          const iconNode = spriteName
            ? spriteImg(spriteName, ing.label, "ingredient-item__icon")
            : el("span", { class: "ingredient-item__icon ingredient-item__icon--dot" }, "•");
          return el("li", { class: "ingredient-item" },
            iconNode,
            el("span", { class: "ingredient-item__qty" }, formatQty(ing)),
            el("span", { class: "ingredient-item__label" }, ing.label + (ing.celiacNote ? ` (${ing.celiacNote})` : ""))
          );
        })
      )
    );
    container.appendChild(section);
  }
}

function formatQty(ing) {
  if (ing.unit === "a gusto") return "a gusto";
  // Singular/plural para cucharas: "1 cda" vs "2 cdas".
  let unit = ing.unit;
  if (ing.qty === 1) {
    if (unit === "cdas") unit = "cda";
  }
  return `${ing.qty} ${unit}`;
}

// ---------- 4. Shopping ----------
function renderShopping() {
  // Celíaco
  $("#input-celiac").checked = !!state.celiac;
  $("#celiac-note").classList.toggle("is-hidden", !state.celiac);

  // Stores
  const stores = storesForProvince(state.province);
  const storesList = $("#stores-list");
  storesList.innerHTML = "";
  for (const s of stores) {
    const dirLink = s.coords
      ? el("a", {
          class: "store-card__dir",
          href: `https://www.google.com/maps/dir/?api=1&destination=${s.coords}`,
          target: "_blank",
          rel: "noopener",
        }, "🗺 Cómo llegar")
      : null;
    const card = el("div", { class: "store-card" },
      el("div", { class: "store-card__head" },
        el("span", { class: "store-card__name" }, s.name),
        el("span", { class: "store-card__type" }, s.type)
      ),
      el("div", { class: "store-card__meta" }, `${s.address} · ${s.distance}`),
      el("p", { class: "store-card__pick" }, s.pick),
      dirLink
    );
    storesList.appendChild(card);
  }

  // Tapas table
  const brands = brandsForProvince(state.province);
  const table = $("#tapas-table");
  table.innerHTML = "";
  table.appendChild(
    el("div", { class: "tapas-row tapas-row--head" },
      el("span", {}, "Marca"),
      el("span", {}, "Variante"),
      el("span", {}, "Precio"),
      el("span", {}, "Dónde / nota")
    )
  );
  for (const b of brands) {
    const highlight = b.presence[state.province] === "star";
    const row = el("div", { class: `tapas-row ${highlight ? "tapas-row--star" : ""}` },
      el("span", { class: "tapas-brand" }, highlight ? `⭐ ${b.brand}` : b.brand),
      el("span", {}, b.variant),
      el("span", {}, b.price),
      el("span", {},
        el("span", { class: "tapas-where" }, b.where),
        el("span", { class: "tapas-badge" }, b.badge)
      )
    );
    table.appendChild(row);
  }

  // Recommendations
  const cut = MEAT_CUTS[state.skill] || MEAT_CUTS.intermedio;
  const tip = WHOLESALE_TIPS[state.province] || "Buscá el mayorista más cercano para ahorrar si hacés mucha cantidad.";
  const rec = $("#recommendations");
  rec.innerHTML = "";
  rec.appendChild(el("div", { class: "reco-card" },
    el("h4", {}, `🔪 Corte de carne para ${state.skill}`),
    el("p", {}, `${cut.cut} — ${cut.note}`)
  ));
  rec.appendChild(el("div", { class: "reco-card" },
    el("h4", {}, "💰 Tip mayorista"),
    el("p", {}, tip)
  ));
  rec.appendChild(el("div", { class: "reco-card" },
    el("h4", {}, "🫒 Otros ingredientes clave"),
    el("p", {}, "Aceitunas verdes rellenas de morrón (marca Nucete o Vitta, ~$1.800/frasco). Pimentón dulce La Virginia (~$900/50g). Grasa de pella en carnicería (~$500/100g).")
  ));
}

// ---------- 5. Checklist ----------
function renderChecklist() {
  const ingredients = scaleIngredients(state.recipe.count, {
    raisins: state.recipe.raisins,
    style: state.recipe.style,
    celiac: state.celiac,
  });
  const container = $("#checklist");
  container.innerHTML = "";
  state.shopping = {};

  for (const ing of ingredients) {
    state.shopping[ing.key] = false;
    const checkbox = el("input", {
      type: "checkbox",
      "data-key": ing.key,
      onchange: (e) => {
        state.shopping[ing.key] = e.target.checked;
        e.target.closest(".check-item").classList.toggle("is-done", e.target.checked);
        updateChecklistProgress();
      },
    });
    const spriteName = INGREDIENT_SPRITES[ing.label];
    const iconNode = spriteName
      ? spriteImg(spriteName, ing.label, "check-item__icon")
      : el("span", { class: "check-item__icon check-item__icon--dot" }, "•");
    const item = el("label", { class: "check-item" },
      checkbox,
      iconNode,
      el("span", { class: "check-item__qty" }, formatQty(ing)),
      el("span", { class: "check-item__label" }, ing.label + (ing.celiacNote ? ` (${ing.celiacNote})` : ""))
    );
    container.appendChild(item);
  }
  updateChecklistProgress();
}

function updateChecklistProgress() {
  const total = Object.keys(state.shopping).length;
  const done = Object.values(state.shopping).filter(Boolean).length;
  const pct = total === 0 ? 0 : (done / total) * 100;
  $("#progress-bar").style.width = `${pct}%`;
  $("#progress-label").textContent = `${done} / ${total}`;
  $("#btn-to-kitchen").disabled = done < total || total === 0;
}

// ---------- 6. Kitchen ----------
function renderKitchen() {
  $("#kitchen-bubble").textContent = KITCHEN_VIBE[state.skill] || "¡A cocinar!";
  // Avatar del gaucho según la habilidad elegida
  const gauchoImg = $("#kitchen-gaucho");
  if (gauchoImg) {
    gauchoImg.src = `assets/sprites/avatar-${state.skill || "intermedio"}.png`;
  }

  const list = $("#utensils-list");
  list.innerHTML = "";
  for (const u of RECIPE_EMPANADAS.utensils) {
    const spriteName = UTENSIL_SPRITES[u];
    const li = el("li", { class: "utensil-item" });
    if (spriteName) li.appendChild(spriteImg(spriteName, u, "utensil-item__icon"));
    li.appendChild(el("span", { class: "utensil-item__label" }, u));
    list.appendChild(li);
  }
}

// ---------- 7. Cooking ----------
let cookingTicker = null;
let cookingDurations = [];

function renderCooking() {
  const steps = buildStepsForCurrentState();
  const total = computeTimerScale(state.recipe.count, state.skill);
  const durations = splitStepDurations(total, steps);
  cookingDurations = durations;
  state.timer.total = total;
  state.timer.elapsed = 0;
  state.timer.stepIndex = 0;
  state.timer.paused = false;
  state.timer.running = true;

  $("#total-time").textContent = Math.round(total / 1000);

  const list = $("#steps-list");
  list.innerHTML = "";
  steps.forEach((step, i) => {
    // último paso usa sartén (fritas) o sartén-alt (horno) en vez de fuego genérico
    let spriteName = STEP_SPRITES[i];
    if (i === steps.length - 1) {
      spriteName = state.recipe.style === "fritas" ? "sarten" : "sarten-alt";
    }
    const li = el("li", { class: "step-item", "data-idx": i },
      el("div", { class: "step-item__head" },
        spriteImg(spriteName, step.title, "step-item__icon"),
        el("span", { class: "step-item__title" }, `${i + 1}. ${step.title}`),
        el("span", { class: "step-item__dur" }, `${Math.round(durations[i] / 1000)}s`)
      ),
      el("p", { class: "step-item__text" }, step.text)
    );
    list.appendChild(li);
  });

  // Arrancar el ticker
  if (cookingTicker) clearInterval(cookingTicker);
  const start = performance.now();
  let lastTick = start;
  highlightStep(0);

  cookingTicker = setInterval(() => {
    if (state.timer.paused) {
      lastTick = performance.now();
      return;
    }
    const now = performance.now();
    state.timer.elapsed += now - lastTick;
    lastTick = now;

    // Barra
    const pct = Math.min(100, (state.timer.elapsed / total) * 100);
    $("#cook-bar").style.width = `${pct}%`;
    const remaining = Math.max(0, total - state.timer.elapsed);
    $("#cook-label").textContent = formatMs(remaining);

    // Pasos
    let acc = 0;
    let current = 0;
    for (let i = 0; i < durations.length; i++) {
      acc += durations[i];
      if (state.timer.elapsed < acc) { current = i; break; }
      current = i + 1;
    }
    if (current !== state.timer.stepIndex) {
      markStepDone(state.timer.stepIndex);
      state.timer.stepIndex = current;
      if (current < durations.length) highlightStep(current);
    }

    if (state.timer.elapsed >= total) {
      clearInterval(cookingTicker);
      cookingTicker = null;
      state.timer.running = false;
      markStepDone(durations.length - 1);
      setTimeout(() => window.app.showScreen("done"), 600);
    }
  }, 100);

  $("#btn-pause").textContent = "⏸ Pausar";
  $("#btn-pause").onclick = togglePause;
  $("#btn-skip").onclick = skipStep;
}

// Saltar el paso actual: lleva el elapsed al final del paso y deja que el tick
// del próximo ciclo marque el paso como done y resalte el siguiente.
function skipStep() {
  if (!state.timer.running || state.timer.paused) return;
  if (!cookingDurations.length) return;
  let endOfStep = 0;
  for (let i = 0; i <= state.timer.stepIndex; i++) {
    endOfStep += cookingDurations[i];
  }
  state.timer.elapsed = Math.max(state.timer.elapsed, endOfStep);
}

function buildStepsForCurrentState() {
  return RECIPE_EMPANADAS.steps.map((s, i) => {
    if (i === RECIPE_EMPANADAS.steps.length - 1) {
      return Object.assign({}, s, { text: RECIPE_EMPANADAS.cookingByStyle[state.recipe.style] });
    }
    return s;
  });
}

function highlightStep(i) {
  $$(".step-item").forEach((n) => n.classList.remove("is-current"));
  const current = document.querySelector(`.step-item[data-idx="${i}"]`);
  if (current) current.classList.add("is-current");
}

function markStepDone(i) {
  const node = document.querySelector(`.step-item[data-idx="${i}"]`);
  if (node) node.classList.add("is-done");
}

function togglePause() {
  state.timer.paused = !state.timer.paused;
  $("#btn-pause").textContent = state.timer.paused ? "▶ Reanudar" : "⏸ Pausar";
}

function formatMs(ms) {
  const s = Math.ceil(ms / 1000);
  const mm = Math.floor(s / 60).toString().padStart(2, "0");
  const ss = (s % 60).toString().padStart(2, "0");
  return `${mm}:${ss}`;
}

function stopCooking() {
  if (cookingTicker) {
    clearInterval(cookingTicker);
    cookingTicker = null;
  }
  state.timer.running = false;
}

// ---------- 8. Done ----------
function renderDone() {
  const styleLabel = state.recipe.style === "horno" ? "al horno" : "fritas";
  const name = state.name || "amigo/a";
  $("#done-title").textContent = `¡Bien ahí, ${name}!`;
  $("#done-message").textContent = `Te quedaron ${state.recipe.count} empanadas ${styleLabel}${state.recipe.raisins ? " (con pasitas)" : ""}. ${DONE_VIBE[state.skill] || ""}`;

  const summary = $("#done-summary");
  summary.innerHTML = "";
  summary.appendChild(el("li", {}, `📍 Provincia: ${state.province}`));
  summary.appendChild(el("li", {}, `🎚 Nivel: ${state.skill}`));
  summary.appendChild(el("li", {}, `🥟 Cantidad: ${state.recipe.count}`));
  summary.appendChild(el("li", {}, `⏱ Tiempo de juego: ${formatMs(state.timer.total)}`));
  if (state.celiac) summary.appendChild(el("li", {}, "🌾 Adaptación sin TACC aplicada"));
}
