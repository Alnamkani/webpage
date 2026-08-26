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
  let removed = 0;
  for (const i of shuffled([...Array(81).keys()])) {
    if (removed >= 81 - givens) break;
    const keep = g[i];
    g[i] = 0;
    if (countSolutions([...g], 2) !== 1) g[i] = keep;
    else removed++;
  }
  return g;
}

function solveSteps(board) {
  const g = [...board];
  const steps = [];
  const rec = () => {
    const i = firstEmpty(g);
    if (i < 0) return true;
    for (let v = 1; v <= 9; v++) {
      if (fits(g, i, v)) {
        g[i] = v;
        steps.push({ i, v, back: false });
        if (rec()) return true;
        g[i] = 0;
        steps.push({ i, v: 0, back: true });
      }
    }
    return false;
  };
  rec();
  return steps;
}

function init(body) {
  const root = body.querySelector(".sudoku");
  const gridEl = root.querySelector(".sk-grid");
  const msgEl = root.querySelector(".sk-msg");
  const solveBtn = root.querySelector(".sk-solve");
  let puzzle, board, given, solving = false, solved = false, run = 0;

  function render() {
    gridEl.querySelectorAll(".sk-cell").forEach((cell, i) => {
      cell.textContent = board[i] || "";
      cell.className = "sk-cell" + (given[i] ? " given" : "");
    });
  }

  function newGame() {
    run++;
    solving = false;
    solved = false;
    puzzle = generate(32);
    board = [...puzzle];
    given = puzzle.map(v => v !== 0);
    msgEl.textContent = "";
    solveBtn.textContent = "Solve";
    render();
  }

  function solve() {
    if (solving || solved) return;
    solving = true;
    run++;
    const myRun = run;
    board = [...puzzle];
    const steps = solveSteps(board);
    solveBtn.textContent = "Solving…";
    const cells = gridEl.querySelectorAll(".sk-cell");
    const rate = Math.max(80, Math.min(900, steps.length / 10));
    let idx = 0, acc = 0, last = performance.now(), tries = 0, backs = 0;
    const frame = now => {
      if (run !== myRun || !document.contains(root)) return;
      acc += (now - last) / 1000 * rate;
      last = now;
      let activeCell = -1;
      const flashed = [];
      while (acc >= 1 && idx < steps.length) {
        const s = steps[idx++];
        board[s.i] = s.v;
        if (s.back) { backs++; flashed.push(s.i); } else { tries++; activeCell = s.i; }
        acc--;
      }
      render();
      if (activeCell >= 0) cells[activeCell].classList.add("solving");
      flashed.forEach(i => cells[i].classList.add("backtrack"));
      msgEl.textContent = `${tries} placements · ${backs} backtracks`;
      if (idx < steps.length) requestAnimationFrame(frame);
      else {
        solving = false;
        solved = true;
        solveBtn.textContent = "Solve";
        render();
        msgEl.textContent = `Solved: ${tries} placements, ${backs} backtracks.`;
      }
    };
    requestAnimationFrame(frame);
  }

  root.querySelector(".sk-new").addEventListener("click", newGame);
  solveBtn.addEventListener("click", solve);

  for (let i = 0; i < 81; i++) {
    const cell = document.createElement("div");
    cell.className = "sk-cell";
    gridEl.appendChild(cell);
  }
  newGame();
}

export const sudokuApp = {
  id: "sudoku", title: "Sudoku Solver", icon: "game", dock: false,
  w: 470, h: 600, init,
  html: `
    <div class="sudoku">
      <div class="sk-top">
        <button class="sk-new">Generate</button>
        <span class="sk-msg" role="status"></span>
        <button class="sk-solve">Solve</button>
      </div>
      <div class="sk-grid" aria-label="Sudoku grid"></div>
      <p class="sk-note">Watch the backtracking search think — every placement
      and retreat, live.</p>
    </div>
  `
};
