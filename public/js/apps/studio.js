const SIZE = 280;
const COLORS = ["#1A1A1C", "#1B8A9E", "#C23B2E", "#C9A227", "#2E7D4F", "#8A5A9E"];

function init(body) {
  const root = body.querySelector(".studio");
  const canvas = root.querySelector("canvas");
  const status = root.querySelector(".st-status");
  const saveBtn = root.querySelector(".st-save");
  const gallery = root.querySelector(".st-gallery");
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  canvas.width = SIZE * dpr;
  canvas.height = SIZE * dpr;
  const ctx = canvas.getContext("2d");
  ctx.scale(dpr, dpr);
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.fillStyle = "#FFFDF8";
  ctx.fillRect(0, 0, SIZE, SIZE);

  let color = COLORS[0], width = 4, drawing = false, strokes = 0, px = 0, py = 0;

  const swatches = root.querySelectorAll(".st-color");
  swatches.forEach((b, i) => {
    b.addEventListener("click", () => {
      color = COLORS[i];
      swatches.forEach(s => s.classList.remove("on"));
      b.classList.add("on");
    });
  });
  root.querySelectorAll(".st-size").forEach(b => {
    b.addEventListener("click", () => {
      width = Number(b.dataset.w);
      root.querySelectorAll(".st-size").forEach(s => s.classList.remove("on"));
      b.classList.add("on");
    });
  });

  function pos(e) {
    const r = canvas.getBoundingClientRect();
    return [(e.clientX - r.left) * (SIZE / r.width), (e.clientY - r.top) * (SIZE / r.height)];
  }

  canvas.addEventListener("pointerdown", e => {
    drawing = true;
    strokes++;
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

  root.querySelector(".st-clear").addEventListener("click", () => {
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

  async function loadGallery() {
    try {
      const items = await (await fetch("/api/drawings")).json();
      gallery.innerHTML = items.length
        ? items.map(d => `<img src="${d}" alt="Visitor drawing" loading="lazy">`).join("")
        : `<span class="st-empty">Nothing here yet — yours could be first.</span>`;
    } catch {
      gallery.innerHTML = `<span class="st-empty">Gallery unavailable.</span>`;
    }
  }

  saveBtn.addEventListener("click", async () => {
    if (!strokes) { status.textContent = "draw something first"; return; }
    saveBtn.disabled = true;
    status.textContent = "hanging it up…";
    try {
      const res = await fetch("/api/drawings", { method: "POST", body: exportPng() });
      if (res.ok) {
        status.textContent = "on the wall ✓";
        loadGallery();
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

  loadGallery();
}

export const studioApp = {
  id: "studio", title: "Studio", icon: "brush", dock: true,
  w: 700, h: 620, init,
  html: `
    <div class="studio">
      <h1>Studio</h1>
      <div class="sub">Draw something, leave it on the wall</div>
      <div class="st-flex">
        <div class="st-left">
          <canvas style="width:${SIZE}px;height:${SIZE}px" aria-label="Drawing canvas"></canvas>
          <div class="st-tools">
            ${COLORS.map((c, i) => `<button class="st-color${i === 0 ? " on" : ""}" style="background:${c}" aria-label="Color ${c}"></button>`).join("")}
            <span class="st-gap"></span>
            <button class="st-size on" data-w="4" aria-label="Thin brush"><i style="width:4px;height:4px"></i></button>
            <button class="st-size" data-w="11" aria-label="Thick brush"><i style="width:11px;height:11px"></i></button>
            <span class="st-gap"></span>
            <button class="st-clear">Clear</button>
            <button class="st-save">Save</button>
          </div>
          <div class="st-status" role="status"></div>
        </div>
        <div class="st-right">
          <div class="st-cap">The wall</div>
          <div class="st-gallery"></div>
        </div>
      </div>
    </div>
  `
};
