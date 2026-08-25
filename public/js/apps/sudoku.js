function shuffled(a) {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function firstEmpty(g) {
  for (let i = 0; i < 81; i++) if (!g[i]) return i;
  return -1;
}

function fits(g, i, v) {
  const r = Math.floor(i / 9), c = i % 9;
  for (let k = 0; k < 9; k++) if (g[r * 9 + k] === v || g[k * 9 + c] === v) return false;
  const br = r - r % 3, bc = c - c % 3;
  for (let dr = 0; dr < 3; dr++)
    for (let dc = 0; dc < 3; dc++)
      if (g[(br + dr) * 9 + bc + dc] === v) return false;
  return true;
}

function fill(g) {
  const i = firstEmpty(g);
  if (i < 0) return true;
  for (const v of shuffled([1, 2, 3, 4, 5, 6, 7, 8, 9])) {
    if (fits(g, i, v)) {
      g[i] = v;
      if (fill(g)) return true;
      g[i] = 0;
    }
  }
  return false;
}

function countSolutions(g, cap) {
  let n = 0;
  const rec = () => {
    if (n >= cap) return;
    const i = firstEmpty(g);
    if (i < 0) { n++; return; }
    for (let v = 1; v <= 9; v++) {
      if (fits(g, i, v)) {
        g[i] = v;
        rec();
        g[i] = 0;
        if (n >= cap) return;
      }
    }
  };
  rec();
  return n;
}

function generate(givens) {
  const g = Array(81).fill(0);
  fill(g);
  const solution = [...g];
  let removed = 0;
  for (const i of shuffled([...Array(81).keys()])) {
    if (removed >= 81 - givens) break;
    const keep = g[i];
    g[i] = 0;
    if (countSolutions([...g], 2) !== 1) g[i] = keep;
    else removed++;
  }
  return { puzzle: g, solution };
}

const LEVELS = { easy: 40, medium: 32, hard: 26 };

function init(body) {
  const root = body.querySelector(".sudoku");
  const gridEl = root.querySelector(".sk-grid");
  const timeEl = root.querySelector(".sk-time");
  const msgEl = root.querySelector(".sk-msg");
  const levelEl = root.querySelector(".sk-level");

  let puzzle, board, given, sel = -1, start, timer, done;

  function fmt(s) {
    return String(Math.floor(s / 60)).padStart(2, "0") + ":" + String(s % 60).padStart(2, "0");
  }

  function startTimer() {
    clearInterval(timer);
    start = Date.now();
    timer = setInterval(() => {
      if (!document.contains(root)) { clearInterval(timer); return; }
      if (!done) timeEl.textContent = fmt(Math.floor((Date.now() - start) / 1000));
    }, 1000);
  }

  function newGame() {
    ({ puzzle } = generate(LEVELS[levelEl.value]));
    board = [...puzzle];
    given = puzzle.map(v => v !== 0);
    sel = -1;
    done = false;
    msgEl.textContent = "";
    timeEl.textContent = "00:00";
    startTimer();
    render();
  }

  function conflicts() {
    const bad = new Set();
    for (let i = 0; i < 81; i++) {
      const v = board[i];
      if (!v) continue;
      const r = Math.floor(i / 9), c = i % 9, br = r - r % 3, bc = c - c % 3;
      for (let k = 0; k < 9; k++) {
        const peers = [r * 9 + k, k * 9 + c, (br + Math.floor(k / 3)) * 9 + bc + k % 3];
        for (const p of peers) if (p !== i && board[p] === v) { bad.add(i); bad.add(p); }
      }
    }
    return bad;
  }

  function render() {
    const bad = conflicts();
    const selVal = sel >= 0 ? board[sel] : 0;
    gridEl.querySelectorAll(".sk-cell").forEach((cell, i) => {
      const v = board[i];
      cell.textContent = v || "";
      cell.className = "sk-cell";
      if (given[i]) cell.classList.add("given");
      if (i === sel) cell.classList.add("sel");
      else if (sel >= 0) {
        const r = Math.floor(i / 9), sr = Math.floor(sel / 9);
        const sameBox = Math.floor(r / 3) === Math.floor(sr / 3) && Math.floor(i % 9 / 3) === Math.floor(sel % 9 / 3);
        if (r === sr || i % 9 === sel % 9 || sameBox) cell.classList.add("peer");
      }
      if (v && v === selVal && i !== sel) cell.classList.add("same");
      if (bad.has(i)) cell.classList.add("bad");
    });
    if (!done && firstEmpty(board) < 0 && bad.size === 0) {
      done = true;
      msgEl.textContent = "Solved in " + timeEl.textContent + " — nice.";
    }
  }

  function input(v) {
    if (done || sel < 0 || given[sel]) return;
    board[sel] = v;
    render();
  }

  gridEl.addEventListener("pointerdown", e => {
    const cell = e.target.closest(".sk-cell");
    if (!cell) return;
    sel = Number(cell.dataset.i);
    gridEl.focus();
    render();
    e.preventDefault();
  });

  gridEl.addEventListener("keydown", e => {
    if (e.key >= "1" && e.key <= "9") { input(Number(e.key)); e.preventDefault(); }
    else if (e.key === "Backspace" || e.key === "Delete" || e.key === "0") { input(0); e.preventDefault(); }
    else if (e.key.startsWith("Arrow")) {
      if (sel < 0) sel = 0;
      else if (e.key === "ArrowUp" && sel > 8) sel -= 9;
      else if (e.key === "ArrowDown" && sel < 72) sel += 9;
      else if (e.key === "ArrowLeft" && sel % 9 > 0) sel -= 1;
      else if (e.key === "ArrowRight" && sel % 9 < 8) sel += 1;
      render();
      e.preventDefault();
    }
  });

  root.querySelector(".sk-pad").addEventListener("click", e => {
    const b = e.target.closest("button");
    if (!b) return;
    input(Number(b.dataset.v));
    gridEl.focus();
  });

  root.querySelector(".sk-new").addEventListener("click", newGame);
  levelEl.addEventListener("change", newGame);

  for (let i = 0; i < 81; i++) {
    const cell = document.createElement("div");
    cell.className = "sk-cell";
    cell.dataset.i = i;
    gridEl.appendChild(cell);
  }
  newGame();
}

export const sudokuApp = {
  id: "sudoku", title: "Sudoku", icon: "game", dock: false,
  w: 470, h: 660, init,
  html: `
    <div class="sudoku">
      <div class="sk-top">
        <select class="sk-level" aria-label="Difficulty">
          <option value="easy">Easy</option>
          <option value="medium" selected>Medium</option>
          <option value="hard">Hard</option>
        </select>
        <span class="sk-time">00:00</span>
        <button class="sk-new">New game</button>
      </div>
      <div class="sk-grid" tabindex="0" aria-label="Sudoku grid"></div>
      <div class="sk-pad">
        ${[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => `<button data-v="${n}">${n}</button>`).join("")}
        <button data-v="0" class="sk-erase">⌫</button>
      </div>
      <div class="sk-msg" role="status"></div>
    </div>
  `
};
