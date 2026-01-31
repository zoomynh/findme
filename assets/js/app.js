// assets/js/app.js
import { audioInitOnUserGesture, beep } from "./audio.js";

document.addEventListener("DOMContentLoaded", () => {

  // --- DOM ---
  const stepChoice   = document.getElementById("stepChoice");
  const stepTerminal = document.getElementById("stepTerminal");

  const yesBtn     = document.getElementById("yesBtn");
  const noBtn      = document.getElementById("noBtn");
  const replayBtn  = document.getElementById("replayBtn");
  const choiceHint = document.getElementById("choiceHint");

  const outEl = document.querySelector("[data-terminal-output]");
  const inEl  = document.querySelector("[data-terminal-input]");

  const IG_URL = "https://www.instagram.com/whereiam2026/";

function printToken(label, url) {
  const row = document.createElement("div");
  row.className = "termTokenRow";

  const a = document.createElement("a");
  a.href = url;
  a.target = "_blank";
  a.rel = "noopener";
  a.textContent = `[ ${label} ]`;
  a.className = "termToken";
  a.addEventListener("click", () => beep(900, 70, 0.04));

  row.appendChild(a);
  outEl.appendChild(row);
  outEl.scrollTop = outEl.scrollHeight;
}


  if (!yesBtn || !noBtn || !outEl || !inEl) {
    console.error("Critical DOM elements not found");
    return;
  }

  // --- AUDIO ---
  document.addEventListener("click", audioInitOnUserGesture, { once: true });
  document.addEventListener("keydown", audioInitOnUserGesture, { once: true });

  // --- UI HELPERS ---
  function showChoice() {
    stepTerminal.classList.add("hidden");
    stepChoice.classList.remove("hidden");
  }

  function showTerminal() {
    stepChoice.classList.add("hidden");
    stepTerminal.classList.remove("hidden");
    inEl.focus();
  }

  function printLine(text = "") {
    const div = document.createElement("div");
    div.textContent = text;
    outEl.appendChild(div);
    outEl.scrollTop = outEl.scrollHeight;
  }

  function resetTerminal() {
    outEl.innerHTML = "";
    printLine("=== HANDSHAKE ===");
    printLine("Connection established.");
    printLine("Type help");
    printLine("");
  }

  // --- STATE ---
  let stage = "handshake";

  // --- NO BUTTON FLY ---
  let noEvades = 0;
  const NO_MAX = 3;

  function moveNoButton() {
    noBtn.classList.add("evade");
    const pad = 20;
    const rect = noBtn.getBoundingClientRect();
    const maxX = Math.max(pad, window.innerWidth - rect.width - pad);
    const maxY = Math.max(pad, window.innerHeight - rect.height - pad);
    const x = Math.random() * maxX;
    const y = Math.random() * maxY;
    noBtn.style.left = `${x}px`;
    noBtn.style.top  = `${y}px`;
  }

  // --- BUTTONS ---
  yesBtn.addEventListener("click", () => {
    beep(800, 60, 0.04);
    showTerminal();
    resetTerminal();
    stage = "handshake";
  });

  noBtn.addEventListener("click", () => {
    beep(300, 80, 0.04);
    noEvades++;

    if (noEvades <= NO_MAX) {
      const texts = [
        "Не так просто.",
        "Виходу вже нема.",
        "Ти все одно натиснеш «Так»."
      ];
      if (choiceHint) choiceHint.textContent = texts[noEvades - 1];
      moveNoButton();
      return;
    }

    if (choiceHint) choiceHint.textContent = "Вибору більше немає.";
    noBtn.remove();
  });

  replayBtn?.addEventListener("click", () => showChoice());

  // --- TERMINAL ---
  inEl.addEventListener("keydown", (e) => {
    if (e.key !== "Enter") return;
    const cmd = inEl.value.trim().toLowerCase();
    if (!cmd) return;
    inEl.value = "";
    printLine("> " + cmd);
    handleCommand(cmd);
  });

  // === TRACE TIMER / PRESSURE ===
  let traceEndAt = 0;
  let traceTick = null;
  let bannerEl = null;

  function startTraceTimer(minutes = 10) {
    stopTraceTimer();
    document.body.classList.add("trace-mode");

    traceEndAt = Date.now() + minutes * 60 * 1000;

    bannerEl = document.createElement("div");
    bannerEl.className = "trace-banner";
    bannerEl.innerHTML = `<div class="t1">ALERT: TRACE ENABLED</div><div class="t2">TRACE: 10:00</div>`;
    document.body.appendChild(bannerEl);

    traceTick = setInterval(() => {
      const left = Math.max(0, traceEndAt - Date.now());
      const mm = String(Math.floor(left / 60000)).padStart(2, "0");
      const ss = String(Math.floor((left % 60000) / 1000)).padStart(2, "0");
      bannerEl.querySelector(".t2").textContent = `TRACE: ${mm}:${ss}`;

      // легке “тиснення” звуком
      if (left > 0 && left % 12000 < 250) beep(180, 35, 0.02);

      if (left <= 0) {
        stopTraceTimer();
        printLine("TRACE COMPLETE.");
        printLine("CHANNEL CLOSED.");
        printLine("returning to unlock…");
        stage = "unlock";
        traceResetGame();
      }
    }, 250);
  }

  function stopTraceTimer() {
    document.body.classList.remove("trace-mode");
    if (traceTick) clearInterval(traceTick);
    traceTick = null;
    traceEndAt = 0;
    if (bannerEl) bannerEl.remove();
    bannerEl = null;
  }

  // === TRACE MINI-GAME: A -> B -> C (scan -> isolate -> stabilize) ===
  let traceIndex = 0;                 // 0=a, 1=b, 2=c
  let traceCurrent = "a";
  let traceState = "need_scan";       // need_scan | need_isolate | need_stabilize

  function traceResetGame() {
    traceIndex = 0;
    traceCurrent = "a";
    traceState = "need_scan";
  }

  function traceAdvanceChannel() {
    traceIndex += 1;
    if (traceIndex === 1) traceCurrent = "b";
    else if (traceIndex === 2) traceCurrent = "c";
    else traceCurrent = "";
    traceState = "need_scan";
  }

  // --- COMMAND LOGIC ---
  function handleCommand(cmd) {

    // HANDSHAKE
    if (stage === "handshake") {
      if (cmd === "help") {
        printLine("available commands:");
        printLine("- help");
        printLine("- collect");
        return;
      }
      if (cmd === "collect") {
        printLine("Fragments detected.");
        printLine("Hint: view-source");
        printLine("example: unlock ********");
        stage = "unlock";
        return;
      }
      printLine("unknown command");
      return;
    }

    // UNLOCK
    if (stage === "unlock") {
      if (cmd.startsWith("unlock ")) {
        if (cmd.endsWith("06012025")) {
          printLine("UNLOCK OK.");
          printLine("TRACE ENABLED.");
          printLine("type: scan");
          traceResetGame();
          startTraceTimer(10);
          stage = "trace";
          return;
        }
        printLine("UNLOCK FAILED.");
        return;
      }
      printLine("expected: unlock ********");
      return;
    }

    // TRACE MINI-GAME
    if (stage === "trace") {
      if (cmd === "help") {
        printLine("commands:");
        printLine("- scan");
        printLine("- isolate <a|b|c>");
        printLine("- stabilize <a|b|c>");
        return;
      }

      if (cmd === "scan") {
        if (traceState !== "need_scan") {
          beep(140, 45, 0.03);
          printLine("scan blocked.");
          return;
        }
        printLine(`noise source detected on channel ${traceCurrent}`);
        traceState = "need_isolate";
        return;
      }

      if (cmd === `isolate ${traceCurrent}`) {
        if (traceState !== "need_isolate") {
          beep(140, 45, 0.03);
          printLine("action failed.");
          return;
        }
        printLine(`channel ${traceCurrent} isolated`);
        traceState = "need_stabilize";
        return;
      }

      if (cmd === `stabilize ${traceCurrent}`) {
        if (traceState !== "need_stabilize") {
          beep(140, 45, 0.03);
          printLine("action failed.");
          return;
        }
        printLine(`channel ${traceCurrent} stabilized`);

        // якщо це був "c" — кінець пастки
        if (traceCurrent === "c") {
          printLine("TRACE DISABLED");
          stopTraceTimer();
          stage = "post-unlock";
          return;
        }

        // інакше — наступний канал, але підказок не даємо
        traceAdvanceChannel();
        return;
      }

      // неправильні канали / команди — тиск
      beep(140, 45, 0.03);
      printLine("action failed.");
      return;
    }

    // POST
    if (stage === "post-unlock") {
      if (cmd === "help") {
        printLine("available commands:");
        printLine("- end");
        return;
      }
      if (cmd === "end") {
        printLine("ти точно готова?");
        stage = "ready";
        return;
      }
      printLine("unknown command");
      return;
    }

    // READY
if (stage === "ready") {
  if (cmd === "ready") {
    printLine("…");
    printLine("this path is not reversible.");
    printLine("type: open");
    stage = "final-open";
    return;
  }
  printLine("type: ready");
  return;
}

// FINAL OPEN
if (stage === "final-open") {
  if (cmd === "open") {
    printLine("opening external node…");
    printLine("session token generated:");
    printToken("where am i", IG_URL);
    printLine("click the token.");
    stage = "final-token";
    return;
  }
  printLine("type: open");
  return;
}

// FINAL TOKEN (після токена вже нічого не треба, але можемо підтримати ще раз open)
if (stage === "final-token") {
  if (cmd === "open") {
    // дубль на випадок якщо користувач не клікнув
    window.open(IG_URL, "_blank", "noopener,noreferrer");
    printLine("signal forwarded.");
    return;
  }
  printLine("click the token.");
  return;
}

  }

  showChoice();
});
