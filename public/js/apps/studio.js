const SIZE = 320;
const COLORS = ["#1A1A1C", "#1B8A9E", "#C23B2E", "#C9A227", "#2E7D4F", "#8A5A9E"];
const BRUSHES = [3, 7, 14];

const UNDO_ICON = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M9 14 4 9l5-5"/><path d="M4 9h10a6 6 0 0 1 0 12h-3"/></svg>`;
const TRASH_ICON = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14M10 11v6M14 11v6"/></svg>`;

function init(body) {
  const root = body.querySelector(".studio");
  const canvas = root.querySelector("canvas");
  const status = root.querySelector(".st-status");
  const saveBtn = root.querySelector(".st-save");
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  canvas.width = SIZE * dpr;
  canvas.height = SIZE * dpr;
  const ctx = canvas.getContext("2d");
  ctx.scale(dpr, dpr);
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.fillStyle = "#FFFDF8";
  ctx.fillRect(0, 0, SIZE, SIZE);

  let color = COLORS[0], width = BRUSHES[0], drawing = false, strokes = 0, px = 0, py = 0;
  const undoStack = [];

  function pick(list, btn) {
    root.querySelectorAll(list).forEach(b => b.classList.remove("on"));
    btn.classList.add("on");
  }
  root.querySelectorAll(".st-color").forEach((b, i) =>
    b.addEventListener("click", () => { color = COLORS[i]; pick(".st-color", b); }));
  root.querySelectorAll(".st-size").forEach((b, i) =>
    b.addEventListener("click", () => { width = BRUSHES[i]; pick(".st-size", b); }));

  function pos(e) {
    const r = canvas.getBoundingClientRect();
    return [(e.clientX - r.left) * (SIZE / r.width), (e.clientY - r.top) * (SIZE / r.height)];
  }

  canvas.addEventListener("pointerdown", e => {
    drawing = true;
    strokes++;
    if (undoStack.length >= 20) undoStack.shift();
    undoStack.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
    canvas.setPointerCapture(e.pointerId);
    [px, py] = pos(e);
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.beginPath();
    ctx.moveTo(px, py);
    ctx.lineTo(px + .01, py + .01);
    ctx.stroke();
    e.preventDefault();
  });
  canvas.addEventListener("pointermove", e => {
    if (!drawing) return;
    const [x, y] = pos(e);
    ctx.beginPath();
    ctx.moveTo(px, py);
    ctx.lineTo(x, y);
    ctx.stroke();
    [px, py] = [x, y];
  });
  canvas.addEventListener("pointerup", () => { drawing = false; });

  root.querySelector(".st-undo").addEventListener("click", () => {
    const snap = undoStack.pop();
    if (!snap) return;
    ctx.putImageData(snap, 0, 0);
    strokes = Math.max(0, strokes - 1);
  });

  root.querySelector(".st-clear").addEventListener("click", () => {
    if (undoStack.length >= 20) undoStack.shift();
    undoStack.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
    ctx.fillStyle = "#FFFDF8";
    ctx.fillRect(0, 0, SIZE, SIZE);
    strokes = 0;
    status.textContent = "";
  });

  function exportPng() {
    const out = document.createElement("canvas");
    out.width = SIZE;
    out.height = SIZE;
    out.getContext("2d").drawImage(canvas, 0, 0, SIZE, SIZE);
    return out.toDataURL("image/png");
  }

  saveBtn.addEventListener("click", async () => {
    if (!strokes) { status.textContent = "draw something first"; return; }
    saveBtn.disabled = true;
    status.textContent = "hanging it up…";
    try {
      const res = await fetch("/api/drawings", { method: "POST", body: exportPng() });
      if (res.ok) {
        status.textContent = "on the wall ✓";
        document.dispatchEvent(new CustomEvent("wall:changed"));
        setTimeout(() => { saveBtn.disabled = false; }, 60000);
      } else {
        status.textContent = await res.text();
        saveBtn.disabled = false;
      }
    } catch {
      status.textContent = "could not save";
      saveBtn.disabled = false;
    }
  });
}

export const studioApp = {
  id: "studio", title: "Studio", icon: "brush", dock: true,
  w: 540, h: 600, init,
  html: `
    <div class="studio">
      <h1>Studio</h1>
      <div class="sub">Draw something for the wall</div>
      <canvas style="width:${SIZE}px;height:${SIZE}px" aria-label="Drawing canvas"></canvas>
      <div class="st-island">
        ${COLORS.map((c, i) => `<button class="st-btn st-color${i === 0 ? " on" : ""}" aria-label="Color ${c}"><i style="background:${c}"></i></button>`).join("")}
        <span class="st-div"></span>
        ${BRUSHES.map((b, i) => `<button class="st-btn st-size${i === 0 ? " on" : ""}" aria-label="Brush ${b}px"><i style="width:${4 + i * 4}px;height:${4 + i * 4}px"></i></button>`).join("")}
        <span class="st-div"></span>
        <button class="st-btn st-undo" aria-label="Undo">${UNDO_ICON}</button>
        <button class="st-btn st-clear" aria-label="Clear canvas">${TRASH_ICON}</button>
        <button class="st-save">Save</button>
      </div>
      <div class="st-status" role="status"></div>
      <div class="st-foot">It goes to <a href="#wall" data-launch="wall">the wall</a> for everyone to see.</div>
    </div>
  `
};
