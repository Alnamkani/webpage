async function fetchWall() {
  const res = await fetch("/api/drawings");
  return res.json();
}

function init(body) {
  const root = body.querySelector(".wall");
  const grid = root.querySelector(".wall-grid");
  const sub = root.querySelector(".sub");

  async function load() {
    if (!document.contains(root)) return;
    try {
      const items = await fetchWall();
      sub.textContent = items.length
        ? `${items.length} drawing${items.length === 1 ? "" : "s"} by visitors`
        : "Drawings by visitors";
      grid.innerHTML = items.length
        ? items.map(d => `<img src="${d}" alt="Visitor drawing" loading="lazy">`).join("")
        : `<span class="wall-empty">Nothing here yet — open the <a href="#studio" data-launch="studio">Studio</a> and be first.</span>`;
    } catch {
      grid.innerHTML = `<span class="wall-empty">The wall is unreachable right now.</span>`;
    }
  }

  document.addEventListener("wall:changed", load);
  const timer = setInterval(() => {
    if (!document.contains(root)) { clearInterval(timer); return; }
    load();
  }, 60000);
  load();
}

export const wallApp = {
  id: "wall", title: "The Wall", icon: "wall", hidden: true,
  w: 640, h: 560, init,
  html: `
    <div class="wall">
      <h1>The Wall</h1>
      <div class="sub">Drawings by visitors</div>
      <div class="wall-grid"><span class="wall-empty">Loading…</span></div>
    </div>
  `
};
