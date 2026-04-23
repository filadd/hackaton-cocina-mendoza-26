// Escalar ingredientes según cantidad de empanadas y filtros (pasas/estilo/celíaco).
function scaleIngredients(count, { raisins, style, celiac }) {
  const factor = count / RECIPE_EMPANADAS.base;
  const out = [];
  for (const ing of RECIPE_EMPANADAS.ingredients) {
    if (ing.onlyIf === "raisins" && !raisins) continue;
    if (ing.onlyIf === "horno" && style !== "horno") continue;

    let qty = ing.qty;
    let unit = ing.unit;

    if (unit === "g") {
      qty = Math.max(25, Math.round((qty * factor) / 25) * 25);
    } else if (unit === "unid." || unit === "cdita" || unit === "cdas") {
      qty = Math.max(1, Math.round(qty * factor));
    }
    // "a gusto" queda igual.

    out.push({
      key: `${ing.group}:${ing.label}`,
      group: ing.group,
      label: ing.label,
      qty,
      unit,
      celiacNote: celiac ? ing.celiacNote : null,
    });
  }
  return out;
}

// Timer total en ms. 30s base × factor_cantidad × factor_habilidad.
// Piso de 0.5× para que con 6 empanadas el juego siga siendo jugable (~15s).
function computeTimerScale(count, skill) {
  const countFactor = Math.max(0.5, count / RECIPE_EMPANADAS.base);
  const skillFactor = skill === "basico" ? 1.3 : skill === "avanzado" ? 0.8 : 1.0;
  return 30000 * countFactor * skillFactor;
}

// Reparte el total entre los pasos según sus pesos.
function splitStepDurations(totalMs, steps) {
  const sum = steps.reduce((s, step) => s + step.weight, 0);
  return steps.map((step) => Math.round((step.weight / sum) * totalMs));
}
