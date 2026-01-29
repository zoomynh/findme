import { glitchBurst, rampHum } from "./audio.js";

let wrong = 0;
let lockUntil = 0;

let bannerEl = null;
let overlayEl = null;
let timerInt = null;

let successCb = null;
let failCb = null;

export function trapEnable(opts = {}) {
  const seconds = Number(opts.seconds ?? 600);
  successCb = typeof opts.onSuccess === "function" ? opts.onSuccess : null;
  failCb = typeof opts.onFail === "function" ? opts.onFail : null;

  document.body.classList.add("trace-mode");
  showBanner(seconds);
  showMiniGame(seconds);

  rampHum(0.035, 0.35);

  const end = Date.now() + seconds * 1000;
  timerInt = setInterval(() => {
    const left = Math.max(0, end - Date.now());
    updateBanner(left);

    if (left <= 0) {
      clearInterval(timerInt);
      setBannerText("trace complete");
      endFail();
    }
  }, 200);
}

export function trapDisable() {
  document.body.classList.remove("trace-mode");
  rampHum(0.02, 0.2);

  if (timerInt) clearInterval(timerInt);
  timerInt = null;

  if (bannerEl) bannerEl.remove();
  bannerEl = null;

  if (overlayEl) overlayEl.remove();
  overlayEl = null;

  wrong = 0;
  lockUntil = 0;
  successCb = null;
  failCb = null;
}

export function trapOnWrongCommand() {
  wrong += 1;
  glitchBurst();

  if (wrong >= 3) {
    lockUntil = Date.now() + 10_000;
    wrong = 0;
    setBannerText("lockdown 10s");
  }
}

export function trapCanInput() {
  return Date.now() >= lockUntil;
}

// ===== mini-game =====
// simple: click a shown sequence of digits (0-3) in order.
// if completed -> success.
function showMiniGame(totalSeconds) {
  overlayEl = document.createElement("div");
  overlayEl.className = "trap-overlay";
  overlayEl.innerHTML = `
    <div class="trap-card">
      <div class="trap-title">signal stabilizer</div>
      <div class="trap-sub">repeat the sequence before the trace completes.</div>
      <div class="trap-seq" id="trapSeq"></div>
      <div class="trap-buttons" id="trapBtns"></div>
      <div class="trap-status" id="trapStatus">progress: 0%</div>
    </div>
  `;
  document.body.appendChild(overlayEl);

  const seqEl = overlayEl.querySelector("#trapSeq");
  const btnsEl = overlayEl.querySelector("#trapBtns");
  const statusEl = overlayEl.querySelector("#trapStatus");

  const steps = 8;
  const seq = Array.from({ length: steps }, () => String(Math.floor(Math.random() * 4)));
  let pos = 0;

  seqEl.textContent = seq.join(" ");

  // render buttons 0-3 shuffled positions each click to add tension
  function renderButtons() {
    btnsEl.innerHTML = "";
    const labels = ["0","1","2","3"].sort(() => Math.random() - 0.5);
    labels.forEach(l => {
      const b = document.createElement("button");
      b.className = "btn ghost trap-btn";
      b.type = "button";
      b.textContent = l;
      b.addEventListener("click", () => onPress(l));
      btnsEl.appendChild(b);
    });
  }

  function onPress(label) {
    glitchBurst();
    if (label === seq[pos]) {
      pos += 1;
      const pct = Math.floor((pos / steps) * 100);
      statusEl.textContent = `progress: ${pct}%`;

      if (pos >= steps) {
        statusEl.textContent = "stabilized.";
        endSuccess();
        return;
      }
      renderButtons();
      return;
    }

    // wrong click -> reset a bit
    pos = Math.max(0, pos - 1);
    statusEl.textContent = "unstable…";
    setTimeout(() => {
      const pct = Math.floor((pos / steps) * 100);
      statusEl.textContent = `progress: ${pct}%`;
    }, 500);
    renderButtons();
  }

  renderButtons();
}

function endSuccess() {
  const cb = successCb;
  trapDisable();
  if (cb) cb();
}

function endFail() {
  const cb = failCb;
  trapDisable();
  if (cb) cb();
}

function showBanner(totalSeconds) {
  bannerEl = document.createElement("div");
  bannerEl.className = "trace-banner";
  bannerEl.innerHTML = `
    <div class="t1">alert: trace enabled</div>
    <div class="t2">trace: ${formatMs(totalSeconds * 1000)}</div>
  `;
  document.body.appendChild(bannerEl);
}

function updateBanner(leftMs) {
  if (!bannerEl) return;
  const t2 = bannerEl.querySelector(".t2");
  if (!t2) return;
  if (t2.textContent.includes("lockdown")) return;
  t2.textContent = "trace: " + formatMs(leftMs);
}

function setBannerText(text) {
  if (!bannerEl) return;
  const t2 = bannerEl.querySelector(".t2");
  if (t2) t2.textContent = String(text);
}

function formatMs(ms) {
  const s = Math.ceil(ms / 1000);
  const mm = String(Math.floor(s / 60)).padStart(2, "0");
  const ss = String(s % 60).padStart(2, "0");
  return `${mm}:${ss}`;
}
