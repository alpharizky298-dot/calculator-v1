const display = document.getElementById("display");
const historyDisplay = document.getElementById("history");
const historyList = document.getElementById("historyList");
const themeBtn = document.getElementById("themeBtn");

let expression = "";
let memory = 0;
let history = JSON.parse(localStorage.getItem("calculatorHistory")) || [];

function updateDisplay() {
  display.textContent = expression || "0";
}

function append(value) {
  expression += value;
  updateDisplay();
}

function clearDisplay() {
  expression = "";
  historyDisplay.textContent = "";
  updateDisplay();
}

function backspace() {
  expression = expression.slice(0, -1);
  updateDisplay();
}

function toggleSign() {
  if (!expression) return;

  if (expression.startsWith("-(") && expression.endsWith(")")) {
    expression = expression.slice(2, -1);
  } else {
    expression = "-(" + expression + ")";
  }

  updateDisplay();
}

function factorial(n) {
  if (n < 0 || !Number.isInteger(n)) {
    throw new Error("Invalid factorial");
  }

  let result = 1;

  for (let i = 2; i <= n; i++) {
    result *= i;
  }

  return result;
}

function convertExpression(input) {

  let result = input
    .replace(/π/g, "Math.PI")
    .replace(/\be\b/g, "Math.E")
    .replace(/÷/g, "/")
    .replace(/×/g, "*");

  result = result.replace(
    /(\d+(?:\.\d+)?)%/g,
    "($1/100)"
  );

  return result;
}

function calculate() {

  if (!expression) return;

  try {

    let original = expression;

    let exp = convertExpression(expression);

    // Pangkat
    exp = exp.replace(
      /(\d+(?:\.\d+)?)\^(\d+(?:\.\d+)?)/g,
      "Math.pow($1,$2)"
    );

    let result = Function(
      '"use strict"; return (' + exp + ')'
    )();

    if (!Number.isFinite(result)) {
      throw new Error("Invalid result");
    }

    result = Number(
      parseFloat(result.toFixed(12))
    );

    historyDisplay.textContent = original + " =";
    expression = String(result);

    addHistory(original, result);
    updateDisplay();

  } catch {
    display.textContent = "Error";

    setTimeout(() => {
      expression = "";
      updateDisplay();
    }, 900);
  }
}

function scientific(type) {

  if (!expression) return;

  try {

    let value = Function(
      '"use strict"; return (' +
      convertExpression(expression) +
      ')'
    )();

    let result;

    switch (type) {

      case "sqrt":
        result = Math.sqrt(value);
        break;

      case "square":
        result = Math.pow(value, 2);
        break;

      case "cube":
        result = Math.pow(value, 3);
        break;

      case "inverse":
        result = 1 / value;
        break;

      case "sin":
        result = Math.sin(value * Math.PI / 180);
        break;

      case "cos":
        result = Math.cos(value * Math.PI / 180);
        break;

      case "tan":
        result = Math.tan(value * Math.PI / 180);
        break;

      case "log":
        result = Math.log10(value);
        break;

      case "ln":
        result = Math.log(value);
        break;

      case "abs":
        result = Math.abs(value);
        break;

      case "tenpow":
        result = Math.pow(10, value);
        break;

      case "factorial":
        result = factorial(value);
        break;
    }

    result = Number(
      parseFloat(result.toFixed(12))
    );

    historyDisplay.textContent =
      type + "(" + expression + ")";

    addHistory(
      type + "(" + expression + ")",
      result
    );

    expression = String(result);

    updateDisplay();

  } catch {

    display.textContent = "Error";

    setTimeout(() => {
      expression = "";
      updateDisplay();
    }, 900);
  }
}

/* MEMORY */

function getValue() {

  try {
    return Number(
      Function(
        '"use strict"; return (' +
        convertExpression(expression) +
        ')'
      )()
    );
  } catch {
    return 0;
  }
}

function memoryClear() {
  memory = 0;
}

function memoryRecall() {
  expression = String(memory);
  updateDisplay();
}

function memoryAdd() {
  memory += getValue();
}

function memorySubtract() {
  memory -= getValue();
}

/* HISTORY */

function addHistory(exp, result) {

  history.unshift({
    expression: exp,
    result: result
  });

  history = history.slice(0, 20);

  localStorage.setItem(
    "calculatorHistory",
    JSON.stringify(history)
  );

  renderHistory();
}

function renderHistory() {

  if (!history.length) {

    historyList.innerHTML =
      '<p class="empty">No calculations yet.</p>';

    return;
  }

  historyList.innerHTML = history
    .map(item => `
      <div class="history-item">
        <div class="history-expression">
          ${escapeHTML(item.expression)}
        </div>

        <div class="history-result">
          = ${escapeHTML(String(item.result))}
        </div>
      </div>
    `)
    .join("");
}

function clearHistory() {

  history = [];

  localStorage.removeItem(
    "calculatorHistory"
  );

  renderHistory();
}

function escapeHTML(text) {

  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

/* THEME */

themeBtn.addEventListener("click", () => {

  document.body.classList.toggle("dark");

  themeBtn.textContent =
    document.body.classList.contains("dark")
      ? "☾"
      : "☼";
});

/* KEYBOARD */

document.addEventListener("keydown", event => {

  const key = event.key;

  if (
    /[0-9+\-*/().%]/.test(key)
  ) {

    append(key);
    return;
  }

  if (key === "Enter" || key === "=") {
    event.preventDefault();
    calculate();
    return;
  }

  if (key === "Backspace") {
    backspace();
    return;
  }

  if (key === "Escape") {
    clearDisplay();
  }
});

renderHistory();
updateDisplay();
