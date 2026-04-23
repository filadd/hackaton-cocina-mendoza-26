const SCREEN_ORDER = ["welcome", "recipe", "ingredients", "shopping", "checklist", "kitchen", "cooking", "done"];

function showScreen(id) {
  document.querySelectorAll(".screen").forEach((s) => {
    s.classList.toggle("is-active", s.dataset.screen === id);
  });
  window.scrollTo({ top: 0, behavior: "instant" });
  const renderer = RENDERERS[id];
  if (renderer) renderer();
}

const RENDERERS = {
  welcome: renderWelcome,
  recipe: renderRecipe,
  ingredients: renderIngredients,
  shopping: renderShopping,
  checklist: renderChecklist,
  kitchen: renderKitchen,
  cooking: renderCooking,
  done: renderDone,
};

function wireEvents() {
  // Welcome
  $("#input-name").addEventListener("input", (e) => {
    state.name = e.target.value;
    saveState();
    updateWelcomeButton();
  });
  $$("#skill-group input[name='skill']").forEach((r) =>
    r.addEventListener("change", (e) => {
      state.skill = e.target.value;
      saveState();
      updateWelcomeButton();
    })
  );
  $$("#gender-group input[name='gender']").forEach((r) =>
    r.addEventListener("change", (e) => {
      state.gender = e.target.value;
      saveState();
      refreshSkillAvatars();
      updateWelcomeButton();
    })
  );
  $("#btn-to-recipe").addEventListener("click", () => showScreen("recipe"));

  // Recipe
  $$("input[name='style']").forEach((r) =>
    r.addEventListener("change", (e) => { state.recipe.style = e.target.value; saveState(); })
  );
  $$("input[name='raisins']").forEach((r) =>
    r.addEventListener("change", (e) => { state.recipe.raisins = e.target.value === "si"; saveState(); })
  );
  $$("input[name='countMode']").forEach((r) =>
    r.addEventListener("change", (e) => {
      state.recipe.countMode = e.target.value;
      saveState();
      updateCountMode();
      syncCountReadouts();
    })
  );
  $("#input-empanadas").addEventListener("input", syncCountReadouts);
  $("#input-comensales").addEventListener("input", syncCountReadouts);

  $("#btn-to-ingredients").addEventListener("click", () => {
    state.recipe.count = computeCount();
    showScreen("ingredients");
  });

  // Ingredients
  $("#btn-to-shopping").addEventListener("click", () => showScreen("shopping"));

  // Shopping
  $("#input-celiac").addEventListener("change", (e) => {
    state.celiac = e.target.checked;
    $("#celiac-note").classList.toggle("is-hidden", !state.celiac);
    saveState();
    renderShopping();
  });
  $("#btn-to-checklist").addEventListener("click", () => showScreen("checklist"));

  // Checklist
  $("#btn-to-kitchen").addEventListener("click", () => showScreen("kitchen"));
  $("#shop-modal-close").addEventListener("click", closeShopModal);
  $("#shop-modal-done").addEventListener("click", closeShopModal);
  // Click fuera del panel cierra también
  $("#shop-modal").addEventListener("click", (e) => {
    if (e.target.id === "shop-modal") closeShopModal();
  });

  // Kitchen
  $("#btn-start-cooking").addEventListener("click", () => showScreen("cooking"));

  // Cooking — pause wired dentro de renderCooking

  // Done
  $("#btn-replay").addEventListener("click", () => {
    stopCooking();
    resetState();
    // Resetear inputs visuales
    $("#input-name").value = "";
    $$(".prov-tile").forEach((t) => t.classList.remove("is-selected"));
    $$("input[name='skill']").forEach((r) => (r.checked = false));
    $$("input[name='gender']").forEach((r) => (r.checked = false));
    $("#input-celiac").checked = false;
    $("#celiac-note").classList.add("is-hidden");
    showScreen("welcome");
  });
  $("#btn-share").addEventListener("click", shareResult);

  // Back buttons
  $$("[data-back]").forEach((btn) =>
    btn.addEventListener("click", (e) => {
      stopCooking();
      showScreen(btn.dataset.back);
    })
  );
}

function shareResult() {
  const txt = `🥟 Empanada Quest — Acabo de cocinar ${state.recipe.count} empanadas ${state.recipe.style === "horno" ? "al horno" : "fritas"} desde ${state.province}. ¡Probalo!`;
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(txt).then(() => {
      $("#btn-share").textContent = "✓ Copiado";
      setTimeout(() => ($("#btn-share").textContent = "📋 Compartir"), 1500);
    });
  } else {
    alert(txt);
  }
}

function init() {
  loadState();
  initMusic();
  wireEvents();
  showScreen("welcome");
}

window.app = { showScreen };

document.addEventListener("DOMContentLoaded", init);
