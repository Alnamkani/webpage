import { APPS } from "./content.js";

const wins = new Map();
let z = 100, cascade = 0;
export let focused = null;

const GEO_KEY = "wm:geo:v2";
const geo = (() => {
  try { return JSON.parse(localStorage.getItem(GEO_KEY)) || {}; } catch { return {}; }
})();

function persistGeo(id, el) {
  geo[id] = { left: el.style.left, top: el.style.top, width: el.style.width, height: el.style.height };
  try { localStorage.setItem(GEO_KEY, JSON.stringify(geo)); } catch {}
}

function barH() {
  return parseInt(getComputedStyle(document.documentElement).getPropertyValue("--bar-h"));
}

function dockTop() {
  const dock = document.getElementById("dock");
  if (dock && dock.offsetHeight) return dock.getBoundingClientRect().top;
  const dockH = parseInt(getComputedStyle(document.documentElement).getPropertyValue("--dock-h")) || 76;
  return window.innerHeight - dockH;
}

function changed() {
  document.dispatchEvent(new CustomEvent("wm:change", { detail: { focused, open: [...wins.keys()] } }));
}

export function isOpen(id) {
  return wins.has(id);
}

export function focus(id) {
  focused = id;
  wins.forEach((w, k) => w.el.classList.toggle("focus", k === id));
  const w = wins.get(id);
  if (w) w.el.style.zIndex = ++z;
  changed();
}

export function launch(id) {
  const app = APPS.find(a => a.id === id);
  if (!app) return;
  if (wins.has(id)) {
    wins.get(id).el.style.display = "flex";
    focus(id);
    return;
  }
  const el = document.createElement("div");
  el.className = "win focus" + (app.plain ? " plain" : "");

  const saved = geo[id];
  if (saved && saved.width) {
    Object.assign(el.style, saved);
    clampToViewport(el, saved);
  } else {
    const w = Math.min(app.w, window.innerWidth - 60);
    const h = Math.min(app.h, dockTop() - barH() - 24);
    const off = (cascade++ % 6) * 28;
    el.style.width = w + "px";
    el.style.height = h + "px";
    el.style.left = Math.max(130, (window.innerWidth - w) / 2 - 60 + off) + "px";
    const top = Math.max(barH() + 12, (window.innerHeight - h) / 2 - 40 + off);
    el.style.top = Math.min(top, Math.max(barH() + 12, dockTop() - h - 8)) + "px";
  }
  el.style.zIndex = ++z;

  el.innerHTML = `
    <div class="bar">
      <div class="lights">
        <button class="l-close" aria-label="Close ${app.title}"></button>
        <button class="l-min" aria-label="Minimize ${app.title}"></button>
        <button class="l-max" aria-label="Maximize ${app.title}"></button>
      </div>
      <span class="title">${app.title}</span>
    </div>
    <div class="body">${app.html}</div>
    <div class="rz" aria-hidden="true"></div>`;

  document.body.appendChild(el);
  wins.set(id, { el, prev: null });
  if (app.init) app.init(el.querySelector(".body"));
  if (!(saved && saved.width) && !app.plain) fitToContent(el, app);
  focus(id);

  el.addEventListener("pointerdown", () => focus(id), true);
  el.querySelector(".l-close").addEventListener("click", e => { e.stopPropagation(); close(id); });
  el.querySelector(".l-min").addEventListener("click", e => {
    e.stopPropagation();
    el.style.display = "none";
    if (focused === id) { focused = null; changed(); }
  });
  el.querySelector(".l-max").addEventListener("click", e => { e.stopPropagation(); toggleMax(id); });
  drag(el, el.querySelector(".bar"), id);
  resize(el, el.querySelector(".rz"), id);
}

function fitToContent(el, app) {
  const dockH = parseInt(getComputedStyle(document.documentElement).getPropertyValue("--dock-h")) || 76;
  const top0 = barH();
  const avail = window.innerHeight - top0 - dockH - 16;
  const bodyEl = el.querySelector(".body");
  const need = bodyEl.scrollHeight + 34 + 10;
  const h = Math.min(Math.max(need, 220), avail);
  el.style.height = h + "px";
  const off = parseFloat(el.style.top) - Math.max(top0 + 12, (window.innerHeight - Math.min(app.h, window.innerHeight - 130)) / 2 - 40);
  el.style.top = Math.max(top0 + 8, top0 + (avail - h) / 2 + off) + "px";
}

function clampToViewport(el, saved) {
  const w = Math.min(parseFloat(saved.width), window.innerWidth - 40);
  const h = Math.min(parseFloat(saved.height), dockTop() - barH() - 16);
  el.style.width = w + "px";
  el.style.height = h + "px";
  el.style.left = Math.min(Math.max(0, parseFloat(saved.left)), window.innerWidth - 80) + "px";
  el.style.top = Math.min(Math.max(barH(), parseFloat(saved.top)), Math.max(barH(), dockTop() - h - 8)) + "px";
}

export function toggleMax(id) {
  const w = wins.get(id), el = w.el;
  if (el.classList.contains("max")) {
    Object.assign(el.style, w.prev);
    el.classList.remove("max");
  } else {
    w.prev = { left: el.style.left, top: el.style.top, width: el.style.width, height: el.style.height };
    el.classList.add("max");
    Object.assign(el.style, { left: "0px", top: "var(--bar-h)", width: "100vw", height: "calc(100vh - var(--bar-h) - var(--dock-h))" });
  }
}

export function close(id) {
  const w = wins.get(id);
  if (!w) return;
  w.el.remove();
  wins.delete(id);
  if (focused === id) {
    const last = [...wins.keys()].pop();
    if (last) { focus(last); return; }
    focused = null;
  }
  changed();
}

export function closeAll() {
  [...wins.keys()].forEach(close);
}

function snapTarget(x, y) {
  const m = 14;
  if (y <= barH() + 4) return "max";
  if (x <= m) return "left";
  if (x >= window.innerWidth - m) return "right";
  return null;
}

function applySnap(el, id, side) {
  const w = wins.get(id);
  w.prev = null;
  el.classList.remove("max");
  el.classList.add("snap");
  const half = Math.floor(window.innerWidth / 2);
  const top = barH();
  const h = window.innerHeight - top - parseInt(getComputedStyle(document.documentElement).getPropertyValue("--dock-h"));
  if (side === "max") { toggleMax(id); el.classList.remove("snap"); return; }
  Object.assign(el.style, {
    top: top + "px",
    height: h + "px",
    width: half + "px",
    left: (side === "left" ? 0 : window.innerWidth - half) + "px"
  });
  persistGeo(id, el);
}

function drag(el, handle, id) {
  let sx, sy, ox, oy, on = false;
  handle.addEventListener("pointerdown", e => {
    if (e.target.closest(".lights")) return;
    if (el.classList.contains("max")) return;
    on = true;
    handle.setPointerCapture(e.pointerId);
    sx = e.clientX; sy = e.clientY;
    ox = parseFloat(el.style.left); oy = parseFloat(el.style.top);
    focus(id);
  });
  handle.addEventListener("pointermove", e => {
    if (!on) return;
    el.classList.remove("snap");
    el.style.left = ox + (e.clientX - sx) + "px";
    el.style.top = Math.max(barH(), oy + (e.clientY - sy)) + "px";
  });
  handle.addEventListener("pointerup", e => {
    if (!on) return;
    on = false;
    handle.releasePointerCapture(e.pointerId);
    const side = snapTarget(e.clientX, e.clientY);
    if (side) applySnap(el, id, side);
    else persistGeo(id, el);
  });
  handle.addEventListener("dblclick", e => {
    if (e.target.closest(".lights")) return;
    toggleMax(id);
  });
}

function resize(el, handle, id) {
  let sx, sy, ow, oh, on = false;
  handle.addEventListener("pointerdown", e => {
    if (el.classList.contains("max")) return;
    on = true;
    handle.setPointerCapture(e.pointerId);
    sx = e.clientX; sy = e.clientY;
    ow = el.offsetWidth; oh = el.offsetHeight;
    focus(id);
    e.preventDefault();
  });
  handle.addEventListener("pointermove", e => {
    if (!on) return;
    el.style.width = Math.max(320, ow + (e.clientX - sx)) + "px";
    const maxH = Math.max(200, dockTop() - parseFloat(el.style.top) - 8);
    el.style.height = Math.min(maxH, Math.max(200, oh + (e.clientY - sy))) + "px";
  });
  handle.addEventListener("pointerup", e => {
    if (!on) return;
    on = false;
    handle.releasePointerCapture(e.pointerId);
    persistGeo(id, el);
  });
}
