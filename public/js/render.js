import { ME, APPS, ICONS } from "./content.js";
import { launch, isOpen } from "./wm.js";
import { wallGridHTML, stockRowsHTML } from "./widgets.js";

export function renderDesktop() {
  const iconWrap = document.getElementById("icons");
  const dockWrap = document.getElementById("dock");

  APPS.filter(a => !a.hidden).forEach(app => {
    const b = document.createElement("button");
    b.className = "icon";
    const glyph = app.img ? `<img src="${app.img}" alt="" width="36" height="36">` : ICONS[app.icon];
    b.innerHTML = `${glyph}<span>${app.title}</span>`;
    const open = () => app.href ? window.open(app.href, "_blank", "noopener") : launch(app.id);
    b.addEventListener("click", open);
    b.addEventListener("keydown", e => { if (e.key === "Enter") open(); });
    iconWrap.appendChild(b);

    if (app.dock) {
      const d = document.createElement("button");
      d.className = "dock-item";
      d.dataset.id = app.id;
      d.innerHTML = `${ICONS[app.icon]}<span class="dot"></span><span class="tip">${app.title}</span>`;
      d.addEventListener("click", () => {
        if (!isOpen(app.id)) {
          d.classList.add("bounce");
          setTimeout(() => d.classList.remove("bounce"), 500);
        }
        launch(app.id);
      });
      dockWrap.appendChild(d);
    }
  });

  document.addEventListener("wm:change", () => {
    dockWrap.querySelectorAll(".dock-item").forEach(d =>
      d.classList.toggle("run", isOpen(d.dataset.id)));
  });
}

const M_HOME = ["writing", "library", "studio", "sudoku", "atat", "fraud-lab", "wall", "srmed"];
const M_DOCK = ["about", "projects", "resume", "contact"];
const M_LABELS = { about: "About", sudoku: "Sudoku" };

const M_SIG = `
  <svg viewBox="0 0 18 12" fill="currentColor"><rect x="0" y="7.5" width="3" height="4.5" rx="1"/><rect x="5" y="5" width="3" height="7" rx="1"/><rect x="10" y="2.5" width="3" height="9.5" rx="1"/><rect x="15" y="0" width="3" height="12" rx="1"/></svg>
  <svg viewBox="0 0 17 12" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M1.5 4.2a10.5 10.5 0 0 1 14 0"/><path d="M4.3 7.1a6.4 6.4 0 0 1 8.4 0"/><path d="M7.2 9.9a2.4 2.4 0 0 1 2.6 0"/></svg>
  <svg viewBox="0 0 25 12" fill="none"><rect x=".6" y=".6" width="21" height="10.8" rx="3" stroke="currentColor" stroke-width="1.1" opacity=".45"/><rect x="23" y="3.8" width="1.8" height="4.4" rx=".9" fill="currentColor" opacity=".45"/><rect x="2.4" y="2.4" width="14.5" height="7.2" rx="1.6" fill="currentColor"/></svg>`;

export function renderMobile() {
  const mob = document.getElementById("mobile");
  const byId = id => APPS.find(a => a.id === id);
  const label = a => M_LABELS[a.id] || a.title;
  const tile = a => {
    const glyph = a.img ? `<img src="${a.img}" alt="">` : ICONS[a.icon];
    return `<button class="p-app" data-app="${a.id}" aria-label="Open ${label(a)}">
      <span class="p-tile">${glyph}</span><span class="p-label">${label(a)}</span></button>`;
  };

  mob.innerHTML = `
    <div class="p-status"><span class="p-time"></span><span class="p-sig">${M_SIG}</span></div>
    <div class="p-home">
      <div class="p-widget">
        <div class="p-name">${ME.name}</div>
        <div class="p-role">${ME.role} · ${ME.place}</div>
      </div>
      <div class="p-widgets">
        <button class="p-wg p-wg-wall" data-app="wall" aria-label="Open the wall">
          <div class="wg-title">The Wall</div>
          <div class="wg-grid"><span class="wg-note">loading…</span></div>
        </button>
        <div class="p-wg p-wg-stocks">
          <div class="wg-title">Markets</div>
          <div class="wg-rows"><span class="wg-note">loading…</span></div>
        </div>
      </div>
      <div class="p-grid">${M_HOME.map(id => tile(byId(id))).join("")}</div>
    </div>
    <div class="p-dock">${M_DOCK.map(id => tile(byId(id))).join("")}</div>
    <div class="p-screens"></div>
    <button class="p-homebar" aria-label="Go to home screen"></button>`;

  if (!matchMedia("(max-width:820px), (pointer:coarse)").matches) return;

  const screens = mob.querySelector(".p-screens");
  const stack = [];

  const tickClock = () => {
    mob.querySelector(".p-time").textContent =
      new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", hour12: false }).format(new Date());
  };
  tickClock();
  setInterval(tickClock, 20000);

  const loadWall = async () => {
    try { mob.querySelector(".p-wg-wall .wg-grid").innerHTML = await wallGridHTML(); } catch {}
  };
  const loadStocks = async () => {
    try {
      const html = await stockRowsHTML();
      if (html) mob.querySelector(".p-wg-stocks .wg-rows").innerHTML = html;
    } catch {}
  };
  document.addEventListener("wall:changed", loadWall);
  loadWall();
  loadStocks();
  setInterval(loadWall, 60000);
  setInterval(loadStocks, 300000);

  function sync() {
    mob.classList.toggle("in-app", stack.length > 0);
    const top = stack[stack.length - 1];
    history.replaceState(null, "", top ? "#" + top.dataset.id : location.pathname);
  }

  function open(id) {
    const app = byId(id);
    if (!app) return;
    if (app.href) { window.open(app.href, "_blank", "noopener"); return; }
    if (stack.length && stack[stack.length - 1].dataset.id === id) return;

    let scr = screens.querySelector(`.p-screen[data-id="${id}"]`);
    if (!scr) {
      scr = document.createElement("div");
      scr.className = "p-screen" + (app.plain ? " plain" : "");
      scr.dataset.id = id;
      scr.innerHTML = `
        <div class="p-appbar">
          <button class="p-back"></button>
          <span class="p-apptitle">${app.title}</span>
        </div>
        <div class="body">${app.html}</div>`;
      screens.appendChild(scr);
      if (app.init) app.init(scr.querySelector(".body"));
      scr.querySelector(".p-back").addEventListener("click", closeTop);
    }

    const under = stack[stack.length - 1];
    scr.querySelector(".p-back").textContent = "‹ " + (under ? label(byId(under.dataset.id)) : "Home");

    const i = stack.indexOf(scr);
    if (i >= 0) stack.splice(i, 1);
    screens.appendChild(scr);
    stack.push(scr);

    scr.classList.add("open");
    void scr.offsetHeight;
    scr.classList.add("on");
    sync();
  }

  function closeTop() {
    const scr = stack.pop();
    if (!scr) return;
    scr.classList.remove("on");
    setTimeout(() => { if (!stack.includes(scr)) scr.classList.remove("open"); }, 340);
    sync();
  }

  mob.querySelector(".p-homebar").addEventListener("click", () => {
    while (stack.length) closeTop();
  });

  mob.addEventListener("click", e => {
    const t = e.target.closest("[data-app],[data-launch]");
    if (!t) return;
    if (t.dataset.launch !== undefined) e.preventDefault();
    open(t.dataset.app || t.dataset.launch);
  });

  const initial = location.hash.slice(1);
  const app0 = initial && byId(initial);
  if (app0 && !app0.href) open(app0.id);
}
