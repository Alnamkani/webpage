import { launch } from "./wm.js";
import { captionOf } from "./apps/wall.js";

function fmtPrice(p) {
  return p >= 1000 ? Math.round(p).toLocaleString("en-US") : p.toFixed(2);
}

export async function wallGridHTML() {
  const items = await (await fetch("/api/drawings")).json();
  return items.length
    ? items.slice(0, 6).map(d => `<img src="${d.img}" alt="" title="${captionOf(d)}">`).join("")
    : `<span class="wg-note">be the first to draw</span>`;
}

export async function stockRowsHTML() {
  const rows = await (await fetch("/api/stocks")).json();
  return rows.map(r => `
    <div class="wg-row">
      <span class="wg-sym">${r.name}</span>
      <span class="wg-price">${fmtPrice(r.price)}</span>
      <span class="wg-chg ${r.change >= 0 ? "up" : "down"}">${r.change >= 0 ? "+" : ""}${r.change.toFixed(2)}%</span>
    </div>`).join("");
}

export function renderWidgets() {
  const host = document.getElementById("widgets");
  host.innerHTML = `
    <div class="widget wg-wall" role="button" tabindex="0" aria-label="Open the wall">
      <div class="wg-title">The wall</div>
      <div class="wg-grid"><span class="wg-note">loading…</span></div>
      <div class="wg-foot">tap to visit · drawn by visitors</div>
    </div>
    <div class="widget wg-stocks">
      <div class="wg-title">Markets</div>
      <div class="wg-rows"><span class="wg-note">loading…</span></div>
    </div>`;

  const wallWidget = host.querySelector(".wg-wall");
  wallWidget.addEventListener("click", () => launch("wall"));
  wallWidget.addEventListener("keydown", e => { if (e.key === "Enter") launch("wall"); });

  async function loadWall() {
    try { host.querySelector(".wg-grid").innerHTML = await wallGridHTML(); } catch {}
  }

  async function loadStocks() {
    try {
      const html = await stockRowsHTML();
      if (html) host.querySelector(".wg-rows").innerHTML = html;
    } catch {}
  }

  document.addEventListener("wall:changed", loadWall);
  loadWall();
  loadStocks();
  setInterval(loadWall, 60000);
  setInterval(loadStocks, 300000);
}
