export function flagOf(country) {
  if (!country || country.length !== 2) return "";
  return String.fromCodePoint(...[...country.toUpperCase()].map(c => 0x1F1E6 + c.charCodeAt(0) - 65));
}

export function agoOf(ts) {
  if (!ts) return "";
  const s = Math.floor((Date.now() - ts) / 1000);
  if (s < 90) return "just now";
  if (s < 5400) return Math.round(s / 60) + "m ago";
  if (s < 129600) return Math.round(s / 3600) + "h ago";
  if (s < 3024000) return Math.round(s / 86400) + "d ago";
  return new Date(ts).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

export function captionOf(d) {
  const place = [flagOf(d.country), d.city].filter(Boolean).join(" ");
  return [place, agoOf(d.ts)].filter(Boolean).join(" · ") || "a visitor";
}

export function openLightbox(d) {
  const old = document.querySelector(".lightbox");
  if (old) old.remove();
  const box = document.createElement("div");
  box.className = "lightbox";
  box.innerHTML = `
    <figure>
      <img src="${d.img}" alt="Visitor drawing">
      <figcaption>${captionOf(d)}</figcaption>
    </figure>`;
  const closeIt = () => {
    box.classList.remove("show");
    setTimeout(() => box.remove(), 180);
    removeEventListener("keydown", onKey);
  };
  const onKey = e => { if (e.key === "Escape") { e.stopPropagation(); closeIt(); } };
  box.addEventListener("click", closeIt);
  addEventListener("keydown", onKey, true);
  document.body.appendChild(box);
  requestAnimationFrame(() => box.classList.add("show"));
}

function init(body) {
  const root = body.querySelector(".wall");
  const grid = root.querySelector(".wall-grid");
  const sub = root.querySelector(".sub");
  let items = [];

  async function load() {
    if (!document.contains(root)) return;
    try {
      items = await (await fetch("/api/drawings")).json();
      sub.textContent = items.length
        ? `${items.length} drawing${items.length === 1 ? "" : "s"} by visitors`
        : "Drawings by visitors";
      grid.innerHTML = items.length
        ? items.map((d, i) => `
            <figure class="wall-item" data-i="${i}" tabindex="0">
              <img src="${d.img}" alt="Visitor drawing" loading="lazy">
              <figcaption>${captionOf(d)}</figcaption>
            </figure>`).join("")
        : `<span class="wall-empty">Nothing here yet — open the <a href="#studio" data-launch="studio">Studio</a> and be first.</span>`;
    } catch {
      grid.innerHTML = `<span class="wall-empty">The wall is unreachable right now.</span>`;
    }
  }

  grid.addEventListener("click", e => {
    const f = e.target.closest(".wall-item");
    if (f) openLightbox(items[Number(f.dataset.i)]);
  });
  grid.addEventListener("keydown", e => {
    const f = e.target.closest(".wall-item");
    if (f && e.key === "Enter") openLightbox(items[Number(f.dataset.i)]);
  });

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
