const STORAGE_KEY = "empanada-quest-state";

const state = {
  name: "",
  province: "",
  skill: "",               // "basico" | "intermedio" | "avanzado"
  recipe: {
    style: "horno",        // "horno" | "fritas"
    raisins: false,
    count: 24,             // cantidad final de empanadas
    countMode: "empanadas",
  },
  celiac: false,
  shopping: {},            // { [ingredientKey]: boolean }
  timer: {
    total: 0,              // ms
    elapsed: 0,            // ms
    stepIndex: 0,
    paused: false,
    running: false,
  },
};

function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      name: state.name,
      province: state.province,
      skill: state.skill,
      recipe: state.recipe,
      celiac: state.celiac,
    }));
  } catch (_) {
    // localStorage puede fallar en modo privado; ignoramos.
  }
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw);
    Object.assign(state, parsed, {
      recipe: Object.assign({}, state.recipe, parsed.recipe || {}),
    });
  } catch (_) {}
}

function resetState() {
  state.name = "";
  state.province = "";
  state.skill = "";
  state.recipe = { style: "horno", raisins: false, count: 24, countMode: "empanadas" };
  state.celiac = false;
  state.shopping = {};
  state.timer = { total: 0, elapsed: 0, stepIndex: 0, paused: false, running: false };
  try { localStorage.removeItem(STORAGE_KEY); } catch (_) {}
}
