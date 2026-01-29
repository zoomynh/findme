const stepChoice = document.getElementById("stepChoice");
const stepTerminal = document.getElementById("stepTerminal");

const yesBtn = document.getElementById("yesBtn");
const noBtn = document.getElementById("noBtn");
const btnArea = document.getElementById("btnArea");
const question = document.getElementById("question");
const choiceHint = document.getElementById("choiceHint");

const terminal = document.getElementById("terminal");
const afterTitle = document.getElementById("afterTitle");
const replayBtn = document.getElementById("replayBtn");

let noClicks = 0;

function rand(min, max){
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function moveNoButton(){
  const area = btnArea.getBoundingClientRect();
  const btn = noBtn.getBoundingClientRect();

  const pad = 10;
  const maxX = Math.max(pad, area.width - btn.width - pad);
  const maxY = Math.max(pad, area.height - btn.height - pad);

  const x = rand(pad, maxX);
  const y = rand(pad, maxY);

  noBtn.style.left = x + "px";
  noBtn.style.top = y + "px";
  noBtn.style.right = "auto";
}

noBtn.addEventListener("click", () => {
  noClicks++;

  if (noClicks === 1) choiceHint.textContent = "Серйозно? 🙂";
  if (noClicks === 2) choiceHint.textContent = "Ти можеш бігти, але не сховаєшся.";
  if (noClicks >= 3) {
    noBtn.classList.add("hidden");

    // друга "Так"
    const yes2 = document.createElement("button");
    yes2.className = "btn yes";
    yes2.textContent = "Так";
    yes2.style.left = rand(40, 210) + "px";
    yes2.style.top = rand(18, 110) + "px";
    yes2.addEventListener("click", startTerminal);

    btnArea.appendChild(yes2);
    choiceHint.textContent = "Вибір зроблено.";
    btnArea.classList.add("shake");
    setTimeout(() => btnArea.classList.remove("shake"), 400);
    return;
  }

  moveNoButton();
  btnArea.classList.add("shake");
  setTimeout(() => btnArea.classList.remove("shake"), 350);
});

yesBtn.addEventListener("click", startTerminal);

replayBtn.addEventListener("click", () => {
  // reset
  noClicks = 0;
  terminal.innerHTML = "";
  choiceHint.textContent = "";
  noBtn.classList.remove("hidden");

  // прибрати другу кнопку "Так", якщо є
  [...btnArea.querySelectorAll("button")].forEach((b, i) => {
    if (i > 1) b.remove();
  });

  // повернути "Ні" в стартову позицію
  noBtn.style.right = "46px";
  noBtn.style.left = "auto";
  noBtn.style.top = "62px";

  stepTerminal.classList.add("hidden");
  stepChoice.classList.remove("hidden");

  question.textContent = "Правда хочеш знайти мене?";
  afterTitle.textContent = "Ти сама захотіла.";
});

function addLine(text){
  const div = document.createElement("div");
  div.className = "line cursor";
  div.textContent = text;

  // зняти курсор з попередніх
  terminal.querySelectorAll(".cursor").forEach(x => x.classList.remove("cursor"));

  terminal.appendChild(div);
  terminal.scrollTop = terminal.scrollHeight;
}

const LINES = [
  ">> INIT: handshake",
  ">> ROUTE: internal-node / 0x14",
  ">> CHANNEL: intercepted",
  ">> AUTH: override sequence...",
  ">> AUTH: accepted",
  ">> INDEX: mirror.dossiers [mounted]",
  ">> EXPORT: fragments [retrieved]",
  ">> TRACE: watcher-mode enabled",
  ">> NOTICE: ти зробила крок, який не всі роблять",
  ">> NOTICE: уважність важливіша за швидкість",
  ">> NEXT: підказку залишено у вихідному коді"
];

function startTerminal(){
  stepChoice.classList.add("hidden");
  stepTerminal.classList.remove("hidden");

  document.body.classList.add("flash");
  setTimeout(()=>document.body.classList.remove("flash"), 300);

  afterTitle.textContent = "Ти сама захотіла.";
  terminal.innerHTML = "";

  let i = 0;
  const t = setInterval(() => {
    addLine(LINES[i]);
    i++;

    // легкий “глітч” раз на кілька рядків
    if (i === 4 || i === 8) {
      stepTerminal.classList.add("shake");
      setTimeout(()=>stepTerminal.classList.remove("shake"), 250);
    }

    if (i >= LINES.length) {
      clearInterval(t);
      // фінальний рядок без курсора
      terminal.querySelectorAll(".cursor").forEach(x => x.classList.remove("cursor"));
    }
  }, 780);
}
