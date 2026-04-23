// Manejo de las dos pistas (milonga / cumbia) que suenan durante todo el juego.
// Autoplay solo arranca después del primer gesture del usuario (política del navegador).

const MUSIC_KEY = "empanada-quest-music";

const music = {
  track: null,          // "milonga" | "cumbia" | null
  volume: 0.55,         // 0..1
  muted: false,
  started: false,       // true después del primer gesture
  els: { milonga: null, cumbia: null },
};

function loadMusicPrefs() {
  try {
    const raw = localStorage.getItem(MUSIC_KEY);
    if (!raw) return;
    const p = JSON.parse(raw);
    if (p.track === "milonga" || p.track === "cumbia") music.track = p.track;
    if (typeof p.volume === "number") music.volume = p.volume;
    if (typeof p.muted === "boolean") music.muted = p.muted;
  } catch (_) {}
}

function saveMusicPrefs() {
  try {
    localStorage.setItem(MUSIC_KEY, JSON.stringify({
      track: music.track,
      volume: music.volume,
      muted: music.muted,
    }));
  } catch (_) {}
}

function initMusic() {
  music.els.milonga = document.getElementById("audio-milonga");
  music.els.cumbia  = document.getElementById("audio-cumbia");
  loadMusicPrefs();
  applyVolume();
  syncUi();

  // Controles flotantes
  document.querySelectorAll(".music-btn[data-track]").forEach((btn) => {
    btn.addEventListener("click", () => {
      setTrack(btn.dataset.track);
      ensureStarted();
    });
  });
  const volSlider = document.getElementById("volume");
  volSlider.value = Math.round(music.volume * 100);
  volSlider.addEventListener("input", (e) => {
    music.volume = parseInt(e.target.value, 10) / 100;
    if (music.muted && music.volume > 0) {
      music.muted = false;
      updateMuteBtn();
    }
    applyVolume();
    saveMusicPrefs();
  });
  document.getElementById("btn-mute").addEventListener("click", toggleMute);

  // Selector en welcome
  document.querySelectorAll("input[name='welcome-track']").forEach((r) => {
    if (r.value === music.track) r.checked = true;
    r.addEventListener("change", (e) => {
      setTrack(e.target.value);
      ensureStarted();
    });
  });

  // El primer gesture de cualquier tipo arranca la música si hay track elegida.
  const firstGesture = () => {
    ensureStarted();
    window.removeEventListener("pointerdown", firstGesture);
    window.removeEventListener("keydown", firstGesture);
  };
  window.addEventListener("pointerdown", firstGesture, { once: false });
  window.addEventListener("keydown", firstGesture, { once: false });
}

function setTrack(name) {
  if (name !== "milonga" && name !== "cumbia") return;
  music.track = name;
  saveMusicPrefs();

  // Pausar la otra, reproducir la elegida desde donde estaba.
  const other = name === "milonga" ? music.els.cumbia : music.els.milonga;
  const target = music.els[name];
  try { other.pause(); } catch (_) {}
  if (!music.muted && music.started) {
    target.play().catch(() => {}); // puede fallar si todavía no hubo gesture
  }
  syncUi();
}

function ensureStarted() {
  if (music.started) return;
  if (!music.track) return;
  const target = music.els[music.track];
  if (!target) return;
  const p = target.play();
  if (p && typeof p.then === "function") {
    p.then(() => { music.started = true; }).catch(() => {});
  } else {
    music.started = true;
  }
}

function toggleMute() {
  music.muted = !music.muted;
  applyVolume();
  if (music.muted) {
    try { music.els.milonga.pause(); } catch (_) {}
    try { music.els.cumbia.pause();  } catch (_) {}
  } else if (music.track && music.started) {
    music.els[music.track].play().catch(() => {});
  }
  updateMuteBtn();
  saveMusicPrefs();
}

function applyVolume() {
  const v = music.muted ? 0 : music.volume;
  if (music.els.milonga) music.els.milonga.volume = v;
  if (music.els.cumbia)  music.els.cumbia.volume  = v;
}

function updateMuteBtn() {
  const btn = document.getElementById("btn-mute");
  if (!btn) return;
  btn.textContent = music.muted ? "🔇" : "🔊";
  btn.title = music.muted ? "Activar sonido" : "Silenciar";
}

function syncUi() {
  document.querySelectorAll(".music-btn[data-track]").forEach((btn) => {
    btn.classList.toggle("is-active", btn.dataset.track === music.track);
  });
  document.querySelectorAll("input[name='welcome-track']").forEach((r) => {
    r.checked = r.value === music.track;
  });
  updateMuteBtn();
}

function stopMusic() {
  try { music.els.milonga && music.els.milonga.pause(); } catch (_) {}
  try { music.els.cumbia  && music.els.cumbia.pause();  } catch (_) {}
  music.started = false;
}
