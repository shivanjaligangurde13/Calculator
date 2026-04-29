const display = document.getElementById("display");
const keys = document.querySelector(".keys");

let expression = "";
let justEvaluated = false;

function setDisplay(text) {
  display.textContent = text || "0";
}

function isOperator(ch) {
  return ch === "+" || ch === "-" || ch === "*" || ch === "/";
}

function sanitize(expr) {
  // Allow digits, decimal points, operators, percent, and parentheses
  return expr.replace(/[^\d.+\-*/()%]/g, "");
}

function evalExpression(expr) {
  const safe = sanitize(expr);
  if (!safe) return "0";

  // Convert percent: "50%" -> "(50/100)"
  const withPercent = safe.replace(/(\d+(\.\d+)?)%/g, "($1/100)");

  try {
    // eslint-disable-next-line no-new-func
    const result = Function(`"use strict"; return (${withPercent});`)();
    if (!Number.isFinite(result)) return "Error";
    return String(+result.toFixed(12)).replace(/\.0+$/, "").replace(/\.$/, "");
  } catch {
    return "Error";
  }
}

function appendValue(v) {
  if (justEvaluated && /[0-9.]/.test(v)) expression = "";
  justEvaluated = false;

  const last = expression.slice(-1);
  if (isOperator(v)) {
    if (!expression) return;
    if (isOperator(last)) {
      expression = expression.slice(0, -1) + v;
    } else {
      expression += v;
    }
    setDisplay(expression);
    return;
  }

  if (v === ".") {
    const parts = expression.split(/[+\-*/]/);
    const current = parts[parts.length - 1] ?? "";
    if (current.includes(".")) return;
  }

  expression += v;
  setDisplay(expression);
}

function clearAll() {
  expression = "";
  justEvaluated = false;
  setDisplay("0");
}

function backspace() {
  expression = expression.slice(0, -1);
  setDisplay(expression);
}

function equals() {
  const result = evalExpression(expression);
  setDisplay(result);
  expression = result === "Error" ? "" : result;
  justEvaluated = true;
}

keys.addEventListener("click", (e) => {
  const btn = e.target.closest("button");
  if (!btn) return;

  const action = btn.dataset.action;
  const value = btn.dataset.value;

  if (action === "clear") return clearAll();
  if (action === "back") return backspace();
  if (action === "equals") return equals();
  if (value) return appendValue(value);
});

document.addEventListener("keydown", (e) => {
  const k = e.key;

  if (k === "Enter" || k === "=") {
    e.preventDefault();
    return equals();
  }
  if (k === "Backspace") return backspace();
  if (k === "Escape") return clearAll();

  if (/^[0-9]$/.test(k)) return appendValue(k);
  if (k === ".") return appendValue(".");
  if (k === "+" || k === "-" || k === "*" || k === "/") return appendValue(k);
  if (k === "%") return appendValue("%");
});

setDisplay("0");

