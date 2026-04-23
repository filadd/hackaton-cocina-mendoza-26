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

async function shareResult() {
  const btn = $("#btn-share");
  const originalLabel = btn.textContent;
  const styleLabel = state.recipe.style === "horno" ? "al horno" : "fritas";
  const raisins = state.recipe.raisins ? " con pasitas" : "";
  const txt = `🥟 El Repulgue — Acabo de cocinar ${state.recipe.count} empanadas ${styleLabel}${raisins} desde ${state.province}. ¡Probalo!`;

  btn.disabled = true;
  btn.textContent = "⏳ Generando…";

  try {
    const blob = await generateStoryImage();
    const file = new File([blob], "el-repulgue.png", { type: "image/png" });

    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      await navigator.share({ files: [file], title: "El Repulgue", text: txt });
      btn.textContent = "✓ Compartido";
    } else {
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "el-repulgue.png";
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(txt).catch(() => {});
      }
      btn.textContent = "✓ Descargado";
    }
  } catch (err) {
    if (err && err.name === "AbortError") {
      btn.textContent = originalLabel;
    } else {
      console.error(err);
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(txt).catch(() => {});
        btn.textContent = "✓ Copiado";
      } else {
        alert(txt);
        btn.textContent = originalLabel;
      }
    }
  }

  setTimeout(() => {
    btn.textContent = originalLabel;
    btn.disabled = false;
  }, 1800);
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

async function generateStoryImage() {
  const W = 1080;
  const H = 1920;
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  ctx.imageSmoothingEnabled = false;

  // Fondo: gradiente noche → pampa
  const bg = ctx.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, "#1a1410");
  bg.addColorStop(0.6, "#3a2a1c");
  bg.addColorStop(1, "#4a7a2a");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  // Marco pixelado (amarillo sol)
  ctx.fillStyle = "#ffcc33";
  const m = 28;
  const t = 12;
  ctx.fillRect(m, m, W - m * 2, t);
  ctx.fillRect(m, H - m - t, W - m * 2, t);
  ctx.fillRect(m, m, t, H - m * 2);
  ctx.fillRect(W - m - t, m, t, H - m * 2);

  // Scanlines sutiles
  ctx.fillStyle = "rgba(0,0,0,0.18)";
  for (let y = 0; y < H; y += 6) ctx.fillRect(0, y, W, 2);

  // Asegurar fuentes cargadas
  if (document.fonts && document.fonts.ready) {
    try { await document.fonts.ready; } catch (_) {}
  }

  // Título
  ctx.textAlign = "center";
  ctx.fillStyle = "#fff9ec";
  ctx.font = '64px "Press Start 2P", monospace';
  ctx.shadowColor = "#70162a";
  ctx.shadowOffsetX = 6;
  ctx.shadowOffsetY = 6;
  ctx.fillText("EL REPULGUE", W / 2, 200);
  ctx.shadowColor = "transparent";
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;

  ctx.font = '34px "VT323", monospace';
  ctx.fillStyle = "#ffcc33";
  ctx.fillText("Cocina argentina, nivel 8 bits", W / 2, 260);

  // Avatar + empanada
  try {
    const avatar = await loadImage(avatarSrc(state.skill, state.gender));
    const empanada = await loadImage("assets/sprites/empanada-cocida.png");
    const avSize = 420;
    ctx.drawImage(avatar, W / 2 - avSize / 2 - 140, 340, avSize, avSize);
    const emSize = 300;
    ctx.drawImage(empanada, W / 2 + 60, 460, emSize, emSize);
  } catch (e) {
    console.warn("No se pudo cargar sprite para la historia", e);
  }

  // Nombre + logro
  const name = state.name || "Chef";
  const styleLabel = state.recipe.style === "horno" ? "al horno" : "fritas";
  const raisinsLabel = state.recipe.raisins ? " con pasitas" : "";

  ctx.fillStyle = "#fff9ec";
  ctx.font = '54px "VT323", monospace';
  ctx.fillText(`¡${name} cocinó!`, W / 2, 900);

  ctx.font = '140px "Press Start 2P", monospace';
  ctx.fillStyle = "#ffcc33";
  ctx.shadowColor = "#1a1410";
  ctx.shadowOffsetX = 6;
  ctx.shadowOffsetY = 6;
  ctx.fillText(String(state.recipe.count), W / 2, 1080);
  ctx.shadowColor = "transparent";
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;

  ctx.font = '44px "VT323", monospace';
  ctx.fillStyle = "#fff9ec";
  ctx.fillText(`empanadas criollas ${styleLabel}${raisinsLabel}`, W / 2, 1160);
  ctx.fillText(`desde ${state.province}`, W / 2, 1220);

  // Stats
  ctx.font = '32px "VT323", monospace';
  ctx.fillStyle = "#d9d2c4";
  const stats = [
    `Nivel: ${state.skill}`,
    `Tiempo de juego: ${formatMs(state.timer.total)}`,
  ];
  if (state.celiac) stats.push("Adaptado sin TACC");
  stats.forEach((line, i) => ctx.fillText(line, W / 2, 1320 + i * 46));

  // Footer
  ctx.font = '22px "Press Start 2P", monospace';
  ctx.fillStyle = "#ffcc33";
  ctx.fillText("EL REPULGUE", W / 2, 1780);
  ctx.font = '26px "VT323", monospace';
  ctx.fillStyle = "#d9d2c4";
  ctx.fillText("hackaton filadd · mendoza", W / 2, 1820);

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error("toBlob devolvió null"));
    }, "image/png");
  });
}

function init() {
  loadState();
  initMusic();
  wireEvents();
  showScreen("welcome");
}

window.app = { showScreen };

document.addEventListener("DOMContentLoaded", init);
