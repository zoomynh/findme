export function createTerminal({ outputEl, inputEl, onCommand }) {
  function printLine(text) {
    const div = document.createElement("div");
    div.textContent = text;
    outputEl.appendChild(div);
    outputEl.scrollTop = outputEl.scrollHeight;
  }

  function bind() {
    inputEl.addEventListener("keydown", (e) => {
      if (e.key !== "Enter") return;
      const value = inputEl.value;
      inputEl.value = "";
      const clean = value.trim();
      printLine("> " + clean);
      onCommand(clean);

    });
  }

  return { printLine, bind };
}
