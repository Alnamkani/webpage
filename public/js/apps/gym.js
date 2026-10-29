// Boulder Gym — an app for the alnamkani.com desktop.
// Every gym is one Cloudflare Durable Object. Open two windows and climb together.

const API = (typeof window !== "undefined" && window.GYM_API) || ""; // e.g. "https://gym.alnamkani.com"
const SVGNS = "http://www.w3.org/2000/svg";

// One gym for everyone: one Durable Object, addressed by this name.
const GYM = "boulder-gym";
const TYPES = [
  { id: "jug",    label: "Jug" },
  { id: "crimp",  label: "Crimp" },
  { id: "sloper", label: "Sloper" },
  { id: "pinch",  label: "Pinch" },
  { id: "pocket", label: "Pocket" },
];
const COLORS = {
  teal:   { fill: "#1B8A9E", hi: "#6FD0DE", lo: "#0C4E5B" },
  gold:   { fill: "#D6AE2E", hi: "#F6DE8A", lo: "#7E6313" },
  coral:  { fill: "#E1584C", hi: "#F7A096", lo: "#8A2A22" },
  green:  { fill: "#4CAD52", hi: "#9BDC9E", lo: "#24632A" },
  violet: { fill: "#7B5EA7", hi: "#BCA6E0", lo: "#413061" },
  ink:    { fill: "#2B2D33", hi: "#6E727C", lo: "#0F1013" },
};
const GRADES = ["VB", "V0", "V1", "V2", "V3", "V4", "V5", "V6", "V7", "V8", "V9", "V10"];

// Shapes are drawn around (0,0) in wall units (wall is 1000 × 600).
const SHAPES = {
  jug:    `<path class="h-body" d="M-17 3C-17-9-7-15 1-15C10-15 17-8 17 2C17 10 9 13 0 12C-9 13-17 11-17 3Z"/>
           <path class="h-incut" d="M-12-4C-7-11 7-11 12-4C7-7.5-7-7.5-12-4Z"/>`,
  crimp:  `<path class="h-body" d="M-18-2Q-18-5.5-13.5-5.5L13.5-5.5Q18-5.5 18-1.5L17 3Q16 5.5 12.5 5.5L-13.5 5.5Q-18 5.5-18 1.5Z"/>
           <path class="h-lip" d="M-13 2.6L13 2.6"/>`,
  sloper: `<ellipse class="h-body" rx="22" ry="15"/>`,
  pinch:  `<path class="h-body" d="M-6.5-17Q0-20.5 6.5-16Q10.5 0 6.5 16Q0 20 -6.5 16Q-10.5 0-6.5-17Z"/>
           <path class="h-lip" d="M-2.5-12Q-4.5 0-2.5 12"/>`,
  pocket: `<circle class="h-body" r="13.5"/>
           <ellipse class="h-hole" cx="1" cy="1.5" rx="5.8" ry="4.6"/>`,
};
const BOLT = { jug: [-5, 5], crimp: [0, -1], sloper: [-3, -3], pinch: [0, -6], pocket: null };

// Wall facets (front view). Shades sell the angles: slab, vertical, overhang, roof, arête.
const FACETS = [
  { id: "slab",  fill: "url(#gym-ply-a)", pts: "40,525 300,525 320,96 54,140" },
  { id: "vert",  fill: "url(#gym-ply-b)", pts: "300,525 560,525 560,70 320,96" },
  { id: "over",  fill: "url(#gym-ply-c)", pts: "560,525 792,525 806,300 560,300" },
  { id: "roof",  fill: "url(#gym-ply-d)", pts: "560,300 806,300 846,54 560,70" },
  { id: "arete", fill: "url(#gym-ply-a)", pts: "792,525 962,525 980,128 846,54 806,300" },
];
const POLYS = FACETS.map(f => f.pts.split(" ").map(p => p.split(",").map(Number)));

function onWall(x, y) {
  return POLYS.some(poly => {
    let inside = false;
    for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
      const [xi, yi] = poly[i], [xj, yj] = poly[j];
      if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
    }
    return inside;
  });
}

const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const ago = ms => {
  const s = Math.max(0, Math.round(ms / 1000));
  if (s < 60) return s + "s";
  if (s < 3600) return Math.floor(s / 60) + "m " + (s % 60) + "s";
  if (s < 86400) return Math.floor(s / 3600) + "h " + Math.floor((s % 3600) / 60) + "m";
  return Math.floor(s / 86400) + "d " + Math.floor((s % 86400) / 3600) + "h";
};
const NAMES = ["Crimpy", "Chalky", "Dyno", "Heelhook", "Beta", "Sloper", "Pinchy", "Flash", "Mantle", "Gaston"];
const ANIMALS = ["Falcon", "Oryx", "Gecko", "Ibex", "Lynx", "Camel", "Heron", "Fox", "Owl", "Sandcat"];
const randomName = () => NAMES[Math.random() * NAMES.length | 0] + " " + ANIMALS[Math.random() * ANIMALS.length | 0];

function store(k, v) {
  try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch {}
  return null;
}

// ---------------------------------------------------------------------------

function sceneSVG() {
  const nuts = [];
  for (let y = 80; y < 520; y += 26) for (let x = 50; x < 980; x += 26) {
    const ox = (y / 26) % 2 ? 13 : 0;
    nuts.push(`<circle cx="${x + ox}" cy="${y}" r="1.6"/>`);
  }
  const seams = [];
  for (let y = 110; y < 525; y += 104) seams.push(`<line x1="0" y1="${y}" x2="1000" y2="${y}"/>`);
  for (let x = 170; x < 1000; x += 130) seams.push(`<line x1="${x}" y1="0" x2="${x}" y2="600"/>`);

  return `
  <svg class="gym-svg" viewBox="0 -55 1000 655" preserveAspectRatio="xMidYMid meet" role="img" aria-label="Climbing wall">
    <defs>
      <linearGradient id="gym-back" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#04121C"/><stop offset=".7" stop-color="#0A2A3D"/><stop offset="1" stop-color="#123F52"/>
      </linearGradient>
      <linearGradient id="gym-ply-a" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#EFE8DA"/><stop offset="1" stop-color="#DDD3C1"/></linearGradient>
      <linearGradient id="gym-ply-b" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#E4DBCA"/><stop offset="1" stop-color="#D2C7B3"/></linearGradient>
      <linearGradient id="gym-ply-c" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#C2B59D"/><stop offset="1" stop-color="#D0C4AE"/></linearGradient>
      <linearGradient id="gym-ply-d" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#A89A80"/><stop offset="1" stop-color="#B9AB92"/></linearGradient>
      <linearGradient id="gym-mat" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#174657"/><stop offset="1" stop-color="#0B2734"/></linearGradient>
      <radialGradient id="gym-vignette" cx=".5" cy=".45" r=".75"><stop offset=".55" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".45"/></radialGradient>
      ${Object.entries(COLORS).map(([k, c]) => `
      <radialGradient id="gym-h-${k}" cx=".32" cy=".28" r=".85">
        <stop offset="0" stop-color="${c.hi}"/><stop offset=".45" stop-color="${c.fill}"/><stop offset="1" stop-color="${c.lo}"/>
      </radialGradient>`).join("")}
      <filter id="gym-shadow" x="-50%" y="-50%" width="200%" height="200%">
        <feDropShadow dx="2.2" dy="3.4" stdDeviation="2" flood-color="#2A2016" flood-opacity=".42"/>
      </filter>
      <filter id="gym-chalk"><feGaussianBlur stdDeviation="6"/></filter>
      <clipPath id="gym-wallclip">${FACETS.map(f => `<polygon points="${f.pts}"/>`).join("")}</clipPath>
    </defs>

    <rect y="-90" width="1000" height="690" fill="url(#gym-back)"/>
    <g class="gym-beams" opacity=".55">
      <rect x="0" y="-90" width="1000" height="124" fill="#061722"/>
      ${[80, 330, 590, 860].map(x => `<rect x="${x}" y="-90" width="10" height="150" fill="#0B2230"/>`).join("")}
    </g>

    <g class="gym-wall">
      ${FACETS.map(f => `<polygon class="facet" points="${f.pts}" fill="${f.fill}"/>`).join("")}
      <g clip-path="url(#gym-wallclip)">
        <g class="seams" stroke="#5A4A30" stroke-opacity=".12" stroke-width="1.2">${seams.join("")}</g>
        <g class="tnuts" fill="#3A3226" fill-opacity=".28">${nuts.join("")}</g>
        <g class="chalk" fill="#FFFFFF" fill-opacity=".22" filter="url(#gym-chalk)">
          <ellipse cx="210" cy="330" rx="26" ry="14"/><ellipse cx="440" cy="250" rx="30" ry="12"/>
          <ellipse cx="660" cy="190" rx="24" ry="16"/><ellipse cx="880" cy="320" rx="22" ry="12"/>
        </g>
      </g>
      ${FACETS.map(f => `<polygon points="${f.pts}" fill="none" stroke="#1A140C" stroke-opacity=".28" stroke-width="1.5" stroke-linejoin="round"/>`).join("")}
      <line x1="560" y1="300" x2="806" y2="300" stroke="#FFF" stroke-opacity=".35" stroke-width="1.5"/>
    </g>

    <g class="gym-holds" filter="url(#gym-shadow)"></g>
    <g class="gym-fx"></g>

    <g class="gym-floor">
      <rect x="0" y="525" width="1000" height="75" fill="url(#gym-mat)"/>
      <rect x="0" y="525" width="1000" height="3" fill="#C9A227" opacity=".55"/>
      ${[180, 360, 540, 720, 880].map(x => `<line x1="${x}" y1="528" x2="${x - 14}" y2="600" stroke="#04121C" stroke-opacity=".55" stroke-width="2"/>`).join("")}
      <ellipse cx="300" cy="562" rx="80" ry="10" fill="#FFF" opacity=".05" filter="url(#gym-chalk)"/>
      <ellipse cx="720" cy="570" rx="110" ry="12" fill="#FFF" opacity=".05" filter="url(#gym-chalk)"/>
    </g>

    <rect class="gym-dark" y="-90" width="1000" height="690" fill="#02080D"/>
    <rect y="-90" width="1000" height="690" fill="url(#gym-vignette)" pointer-events="none"/>

    <g class="gym-ghost" opacity="0" pointer-events="none"></g>
    <g class="gym-cursors" pointer-events="none"></g>
  </svg>`;
}

function holdMarkup(type, color, extraClass = "") {
  const bolt = BOLT[type];
  return `<g class="hold-shape ${extraClass}" fill="url(#gym-h-${color})" style="--c:${COLORS[color].fill}">
    ${SHAPES[type]}
    ${bolt ? `<circle class="h-bolt" cx="${bolt[0]}" cy="${bolt[1]}" r="1.9"/>` : ""}
  </g>`;
}

function iconSVG(type, color = "ink") {
  return `<svg viewBox="-24 -22 48 44" aria-hidden="true">${holdMarkup(type, color)}</svg>`;
}
const ERASER = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M8.5 20 4 15.5a2 2 0 0 1 0-2.8L12.7 4a2 2 0 0 1 2.8 0l4.5 4.5a2 2 0 0 1 0 2.8L11 20z"/><path d="M8.5 20H20M9 9l6 6"/></svg>`;

// ---------------------------------------------------------------------------

function init(body) {
  const root = body.querySelector(".gym");
  root.innerHTML = layoutHTML();
  const $ = s => root.querySelector(s);
  // Inside the phone sim: pannable wall, tap-to-place, tap a hold for actions.
  const phone = !!body.closest(".p-screen");
  root.classList.toggle("phone", phone);
  const HOOD_KEY = phone ? "gym:hood:phone" : "gym:hood";

  const svg = $(".gym-svg");
  const pan = $(".gym-pan");
  const gHolds = $(".gym-holds"), gFx = $(".gym-fx"), gCursors = $(".gym-cursors"), gGhost = $(".gym-ghost");

  const st = {
    gym: GYM,
    name: store("gym:climber") || randomName(),
    type: "jug",
    color: "teal",
    erase: false,
    focus: null,
    ws: null,
    you: null,
    meta: null,
    holds: new Map(),
    routes: new Map(),
    climbers: new Map(),
    tries: 0,
    paused: false,
    seq: 0,
    pending: new Map(),
    connectedAt: 0,
  };
  store("gym:climber", st.name);

  // ---------- toolbar ----------
  $(".gym-types").innerHTML = TYPES.map(t =>
    `<button class="gym-type" data-type="${t.id}" title="${t.label}"><span class="ico"></span><span class="lbl">${t.label}</span></button>`).join("");
  $(".gym-colors").innerHTML = Object.entries(COLORS).map(([k, c]) =>
    `<button class="gym-swatch" data-color="${k}" title="${k[0].toUpperCase() + k.slice(1)}" aria-label="${k}"><i style="--c:${c.fill}"></i></button>`).join("");
  $(".gym-erase").innerHTML = ERASER;
  // The palette lives over the wall on desktop, docked under it on the phone.
  if (phone) root.appendChild($(".gym-island"));

  function syncTools() {
    // Hold icons take the selected route color, so the palette previews what you'll place.
    root.querySelectorAll(".gym-type").forEach(b => {
      if (b.dataset.c !== st.color) { b.querySelector(".ico").innerHTML = iconSVG(b.dataset.type, st.color); b.dataset.c = st.color; }
    });
    root.querySelectorAll(".gym-type").forEach(b => b.classList.toggle("on", !st.erase && b.dataset.type === st.type));
    root.querySelectorAll(".gym-swatch").forEach(b => b.classList.toggle("on", b.dataset.color === st.color));
    $(".gym-erase").classList.toggle("on", st.erase);
    root.classList.toggle("erasing", st.erase);
    gGhost.innerHTML = st.erase ? "" : holdMarkup(st.type, st.color);
  }
  $(".gym-types").addEventListener("click", e => {
    const b = e.target.closest(".gym-type"); if (!b) return;
    st.type = b.dataset.type; st.erase = false; syncTools();
  });
  $(".gym-colors").addEventListener("click", e => {
    const b = e.target.closest(".gym-swatch"); if (!b) return;
    st.color = b.dataset.color; st.erase = false; syncTools();
  });
  $(".gym-erase").addEventListener("click", () => { st.erase = !st.erase; syncTools(); });
  $(".gym-me .me-name").textContent = st.name;
  $(".gym-me").addEventListener("click", () => {
    const n = prompt("Your climber name", st.name);
    if (!n || !n.trim()) return;
    st.name = n.trim().slice(0, 20);
    store("gym:climber", st.name);
    $(".gym-me .me-name").textContent = st.name;
    send({ t: "rename", name: st.name });
  });
  $(".gym-hoodbtn").addEventListener("click", () => {
    hideHoldbar();
    root.classList.toggle("hood-open");
    store(HOOD_KEY, root.classList.contains("hood-open") ? "1" : "0");
  });
  if (phone ? store(HOOD_KEY) === "1" : store(HOOD_KEY) !== "0") root.classList.add("hood-open");

  // ---------- log ----------
  function log(kind, html) {
    const ul = $(".gym-log");
    const li = document.createElement("li");
    li.className = "k-" + kind;
    const t = new Date();
    li.innerHTML = `<time>${t.toTimeString().slice(0, 8)}</time><span>${html}</span>`;
    ul.prepend(li);
    while (ul.children.length > 40) ul.lastChild.remove();
  }

  function toast(text) {
    const el = $(".gym-toast");
    el.textContent = text;
    el.classList.add("show");
    clearTimeout(toast.t);
    toast.t = setTimeout(() => el.classList.remove("show"), 2200);
  }

  // ---------- coordinates ----------
  function toWall(e) {
    const pt = svg.createSVGPoint();
    pt.x = e.clientX; pt.y = e.clientY;
    const m = svg.getScreenCTM();
    if (!m) return { x: 0, y: 0 };
    const p = pt.matrixTransform(m.inverse());
    return { x: p.x, y: p.y };
  }

  // ---------- holds ----------
  function drawHold(h, { pop = false, by } = {}) {
    let g = gHolds.querySelector(`[data-id="${h.id}"]`);
    if (!g) {
      g = document.createElementNS(SVGNS, "g");
      g.classList.add("hold");
      g.dataset.id = h.id;
      gHolds.appendChild(g);
    }
    g.dataset.color = h.color;
    g.innerHTML = `<g class="hold-rot" style="transform:rotate(${h.r}deg)">${holdMarkup(h.type, h.color, pop ? "pop" : "")}</g>
      <title>${esc(h.type)} · set by ${esc(h.by)}</title>`;
    g.style.transform = `translate(${h.x}px, ${h.y}px)`;
    g.classList.toggle("dim", !!st.focus && st.focus !== h.color);
    if (pop && by) ring(h.x, h.y, by);
  }
  function ring(x, y, hue) {
    const c = document.createElementNS(SVGNS, "circle");
    c.setAttribute("class", "fx-ring");
    c.setAttribute("cx", x); c.setAttribute("cy", y); c.setAttribute("r", 14);
    c.style.stroke = `hsl(${hue} 80% 60%)`;
    gFx.appendChild(c);
    setTimeout(() => c.remove(), 700);
  }
  function removeHold(id) {
    const g = gHolds.querySelector(`[data-id="${id}"]`);
    if (!g) return;
    g.classList.add("bye");
    setTimeout(() => g.remove(), 220);
  }
  function redrawAll() {
    gHolds.innerHTML = "";
    for (const h of st.holds.values()) drawHold(h);
  }

  // ---------- routes ----------
  function renderRoutes() {
    const counts = {};
    for (const h of st.holds.values()) counts[h.color] = (counts[h.color] || 0) + 1;
    const colors = Object.keys(COLORS).filter(c => counts[c] || st.routes.has(c));
    const ul = $(".gym-routes ul");
    if (!colors.length) {
      ul.innerHTML = `<li class="empty">No routes yet — pick a hold and click the wall</li>`;
    } else {
      ul.innerHTML = colors.map(c => {
        const r = st.routes.get(c);
        return `<li class="${st.focus === c ? "on" : ""}" data-color="${c}" title="${r ? "set by " + esc(r.setter) : "Click ✎ to name it"}">
          <span class="chip" style="--c:${COLORS[c].fill}"></span>
          <span class="rname">${r ? esc(r.name) : `<em>${c}</em>`}</span>
          ${r ? `<span class="grade">${esc(r.grade)}</span>` : ""}
          <span class="n">${counts[c] || 0}</span>
          <button class="edit" title="Name this route" aria-label="Name ${c} route">✎</button>
        </li>`;
      }).join("");
    }
    $(".gym-count").textContent = `${st.holds.size} hold${st.holds.size === 1 ? "" : "s"}`;
  }
  $(".gym-routes").addEventListener("click", e => {
    const li = e.target.closest("li[data-color]"); if (!li) return;
    const c = li.dataset.color;
    if (e.target.closest(".edit")) {
      const cur = st.routes.get(c);
      const name = prompt(`Name the ${c} route`, cur?.name || "");
      if (!name || !name.trim()) return;
      const grade = (prompt("Grade (VB, V0–V10)", cur?.grade || "V2") || "V0").toUpperCase().trim();
      send({ t: "route", color: c, name: name.trim(), grade: GRADES.includes(grade) ? grade : "V0" });
      return;
    }
    st.focus = st.focus === c ? null : c;
    for (const g of gHolds.children) g.classList.toggle("dim", !!st.focus && st.focus !== g.dataset.color);
    renderRoutes();
  });

  // ---------- climbers ----------
  function renderClimbers() {
    const list = [...st.climbers.values()].filter(c => c.id !== st.you?.id);
    if (st.you) $(".gym-me").style.setProperty("--h", st.climbers.get(st.you.id)?.hue ?? st.you.hue);
    $(".gym-here").innerHTML = list.map(c => `
      <span class="av ${c.id === st.you?.id ? "me" : ""}" style="--h:${c.hue}" title="${esc(c.name)}">${esc(c.name.slice(0, 1).toUpperCase())}</span>`).join("") +
      (list.length ? `<span class="here-n">+ ${list.length} climbing</span>` : `<span class="here-n">just you</span>`);
    hood();
  }
  function drawCursor(id, x, y) {
    const c = st.climbers.get(id); if (!c) return;
    let g = gCursors.querySelector(`[data-id="${id}"]`);
    if (!g) {
      g = document.createElementNS(SVGNS, "g");
      g.classList.add("cur");
      g.dataset.id = id;
      gCursors.appendChild(g);
    }
    const w = Math.max(44, c.name.length * 7.2 + 18);
    g.innerHTML = `
      <circle r="11" class="cur-chalk" style="fill:hsl(${c.hue} 70% 70% / .35)"/>
      <path d="M0 0L0 15L4.2 11L7.2 18L9.8 16.8L7 10L12.5 10Z" fill="hsl(${c.hue} 75% 55%)" stroke="#fff" stroke-width="1.3" stroke-linejoin="round"/>
      <rect x="12" y="14" width="${w}" height="18" rx="9" fill="hsl(${c.hue} 70% 45%)"/>
      <text x="${12 + w / 2}" y="26.5" text-anchor="middle">${esc(c.name)}</text>`;
    g.style.transform = `translate(${x}px, ${y}px)`;
    g.classList.add("live");
    clearTimeout(g._t);
    g._t = setTimeout(() => g.classList.remove("live"), 4000);
  }

  // ---------- under the hood ----------
  function hood() {
    const m = st.meta;
    const open = st.ws?.readyState === 1;
    $(".hd-state").textContent = open ? "connected" : st.ws ? "connecting…" : "offline";
    $(".hd-state").dataset.s = open ? "ok" : "wait";
    if (!m) return;
    $(".hd-name").textContent = `getByName("${m.name}")`;
    $(".hd-id").textContent = m.id.slice(0, 16) + "…" + m.id.slice(-6);
    $(".hd-id").title = m.id;
    $(".hd-sockets").textContent = st.climbers.size;
    $(".hd-rows").textContent = `${st.holds.size} / ${m.maxHolds}`;
    $(".hd-routes").textContent = st.routes.size;
    $(".hd-resets").textContent = m.resets;
  }
  function tick() {
    if (!document.contains(root)) { cleanup(); return; }
    // Minimized window or backgrounded phone screen: leave the gym, come back when visible.
    const visible = root.getClientRects().length > 0;
    if (!visible && st.ws && !st.paused) {
      st.paused = true;
      const ws = st.ws; st.ws = null;
      try { ws.close(1000, "hidden"); } catch {}
      lights(false); hood();
      log("info", `window hidden — left the gym`);
    } else if (visible && st.paused) {
      st.paused = false;
      connect();
    }
    const m = st.meta; if (!m) return;
    $(".hd-awake").textContent = ago(Date.now() - m.wokeAt);
    $(".hd-reset").textContent = m.nextReset ? ago(m.nextReset - Date.now()) : "—";
  }
  const timer = setInterval(tick, 1000);

  // ---------- network ----------
  function send(m) {
    if (st.ws?.readyState === 1) st.ws.send(JSON.stringify(m));
  }

  function lights(on) {
    root.classList.toggle("lights-on", on);
  }

  function connect() {
    const base = API || location.origin;
    const url = new URL(`/api/gym/${encodeURIComponent(st.gym)}/ws`, base);
    url.protocol = url.protocol === "https:" ? "wss:" : "ws:";
    url.searchParams.set("name", st.name);
    const ws = new WebSocket(url);
    st.ws = ws;
    hood();
    log("net", `→ <b>WebSocket</b> /api/gym/${esc(st.gym)}/ws`);

    ws.onmessage = ev => {
      let m; try { m = JSON.parse(ev.data); } catch { return; }
      onMessage(m);
    };
    ws.onclose = () => {
      if (st.ws !== ws) return;
      lights(false);
      st.ws = null;
      hood();
      if (!document.contains(root)) return;
      const delay = Math.min(10000, 600 * 2 ** st.tries++);
      $(".gym-status").textContent = "Lost the gym. Reconnecting…";
      log("warn", `socket closed — retrying in ${(delay / 1000).toFixed(1)}s`);
      setTimeout(() => { if (!st.ws && !st.paused && document.contains(root)) connect(); }, delay);
    };
  }

  function onMessage(m) {
    switch (m.t) {
      case "welcome": {
        st.tries = 0;
        st.you = m.you; st.meta = m.gym;
        st.connectedAt = Date.now();
        st.holds = new Map(m.holds.map(h => [h.id, h]));
        st.routes = new Map(m.routes.map(r => [r.color, r]));
        st.climbers = new Map(m.climbers.map(c => [c.id, c]));
        redrawAll(); renderRoutes(); renderClimbers();
        $(".gym-status").textContent = "";
        if (m.gym.coldStart) {
          root.classList.add("flicker");
          setTimeout(() => root.classList.remove("flicker"), 1200);
          log("wake", `☀ <b>cold start</b> — the gym was asleep. The constructor just ran and loaded <b>${m.holds.length}</b> holds from SQLite.`);
          toast("The gym was asleep — lights on.");
        } else {
          log("info", `gym already awake · ${m.climbers.length - 1} other climber${m.climbers.length === 2 ? "" : "s"} here`);
        }
        setTimeout(() => lights(true), m.gym.coldStart ? 120 : 0);
        hood(); tick();
        return;
      }
      case "join":
        st.climbers.set(m.climber.id, m.climber);
        renderClimbers();
        log("net", `+ <b style="color:hsl(${m.climber.hue} 70% 62%)">${esc(m.climber.name)}</b> walked in`);
        return;
      case "leave": {
        const c = st.climbers.get(m.id);
        st.climbers.delete(m.id);
        gCursors.querySelector(`[data-id="${m.id}"]`)?.remove();
        renderClimbers();
        if (c) log("net", `− ${esc(c.name)} left`);
        return;
      }
      case "renamed": {
        const c = st.climbers.get(m.id); if (c) c.name = m.name;
        renderClimbers();
        return;
      }
      case "cursor":
        drawCursor(m.id, m.x, m.y);
        return;
      case "placed": {
        st.holds.set(m.hold.id, m.hold);
        const pending = st.pending.get(m.ref);
        if (pending && m.from === st.you?.id) { pending.remove(); st.pending.delete(m.ref); }
        const by = st.climbers.get(m.from);
        drawHold(m.hold, { pop: true, by: by?.hue ?? 44 });
        if (m.from === st.you?.id && !store("gym:tip")) {
          store("gym:tip", "1");
          setTimeout(() => toast(phone ? "Tap a hold to turn or remove it" : "Drag to move · scroll to turn · right-click to remove"), 500);
        }
        renderRoutes(); hood();
        logWrite(m, `${m.hold.color} ${m.hold.type} @ ${Math.round(m.hold.x)},${Math.round(m.hold.y)}`);
        return;
      }
      case "moved": {
        const h = st.holds.get(m.id); if (!h || m.x == null) return;
        h.x = m.x; h.y = m.y; drawHold(h);
        if (m.sql) logWrite(m, `moved #${m.id}`);
        return;
      }
      case "rotated": {
        const h = st.holds.get(m.id); if (!h) return;
        h.r = m.r; drawHold(h);
        return;
      }
      case "removed":
        if (barFor === m.id) hideHoldbar();
        st.holds.delete(m.id); removeHold(m.id); renderRoutes(); hood();
        logWrite(m, `removed #${m.id}`);
        return;
      case "route":
        st.routes.set(m.route.color, m.route); renderRoutes(); hood();
        logWrite(m, `route "${esc(m.route.name)}" ${esc(m.route.grade)}`);
        return;
      case "reject": {
        const p = st.pending.get(m.ref);
        if (p) { p.classList.add("bounce"); setTimeout(() => p.remove(), 380); st.pending.delete(m.ref); }
        toast(m.reason);
        log("warn", `✕ rejected: ${esc(m.reason)} <i>(single-threaded: first write wins)</i>`);
        return;
      }
      case "woke":
        st.meta && (st.meta.wokeAt = m.wokeAt);
        log("wake", `☾→☀ the object <b>hibernated</b> and woke up. Sockets stayed open the whole time.`);
        tick();
        return;
      case "reset":
        st.holds.clear(); st.routes.clear(); gHolds.innerHTML = "";
        if (st.meta) { st.meta.nextReset = m.nextReset; st.meta.resets++; }
        renderRoutes(); hood();
        toast(`Reset day — setters stripped ${m.stripped} holds.`);
        log("wake", `⏰ <b>alarm()</b> fired: reset day, ${m.stripped} holds stripped`);
        return;
    }
  }

  function logWrite(m, what) {
    const who = st.climbers.get(m.from)?.name || "someone";
    log("sql", `<code>${esc(m.sql)}</code><br>${esc(who)}: ${what} → broadcast to <b>${m.fanout}</b> socket${m.fanout === 1 ? "" : "s"}`);
  }

  // ---------- pointer ----------
  let drag = null, gesture = null, lastSent = 0;

  svg.addEventListener("pointermove", e => {
    if (gesture) {
      const dx = e.clientX - gesture.x0;
      if (!gesture.panning && Math.abs(dx) > 8) { gesture.panning = true; root.classList.add("panned"); }
      if (gesture.panning) pan.scrollLeft = gesture.s0 - dx;
      return;
    }
    const p = toWall(e);
    const ok = onWall(p.x, p.y) && p.y < 518;
    gGhost.style.transform = `translate(${p.x}px, ${p.y}px)`;
    gGhost.setAttribute("opacity", !phone && !drag && ok && !st.erase && !e.target.closest(".hold") ? ".55" : "0");

    const now = performance.now();
    if (now - lastSent > 40) { lastSent = now; send({ t: "cursor", x: p.x, y: p.y }); }

    if (drag) {
      drag.moved = drag.moved || Math.hypot(p.x - drag.sx, p.y - drag.sy) > 3;
      const h = st.holds.get(drag.id);
      if (h && ok) { h.x = p.x; h.y = p.y; drawHold(h); }
    }
  });
  svg.addEventListener("pointerleave", () => gGhost.setAttribute("opacity", "0"));
  svg.addEventListener("pointercancel", () => { gesture = null; });

  // ---------- phone: hold actions (no scroll wheel or right-click on touch) ----------
  const holdbar = $(".gym-holdbar");
  let barFor = null;
  function showHoldbar(id) {
    const g = gHolds.querySelector(`[data-id="${id}"]`); if (!g) return;
    const r = g.getBoundingClientRect(), sc = $(".gym-scene").getBoundingClientRect();
    barFor = id;
    holdbar.style.left = Math.min(Math.max(70, r.left + r.width / 2 - sc.left), sc.width - 70) + "px";
    const below = r.top - sc.top < 130;
    holdbar.classList.toggle("below", below);
    holdbar.style.top = (below ? r.bottom - sc.top + 10 : r.top - sc.top - 10) + "px";
    holdbar.classList.add("show");
  }
  function hideHoldbar() { barFor = null; holdbar.classList.remove("show"); }
  holdbar.addEventListener("click", e => {
    const b = e.target.closest("button"); if (!b || barFor == null) return;
    const h = st.holds.get(barFor); if (!h) { hideHoldbar(); return; }
    if (b.dataset.act === "remove") { send({ t: "remove", id: h.id }); hideHoldbar(); return; }
    h.r = ((h.r + (b.dataset.act === "cw" ? 30 : -30)) + 540) % 360 - 180;
    drawHold(h);
    clearTimeout(holdbar._rt);
    holdbar._rt = setTimeout(() => send({ t: "rotate", id: h.id, r: h.r }), 150);
  });
  pan.addEventListener("scroll", hideHoldbar, { passive: true });

  svg.addEventListener("pointerdown", e => {
    if (e.button !== 0) return;
    const p = toWall(e);
    const g = e.target.closest(".hold");
    hideHoldbar();
    if (phone && !g) {
      // Wait to see if this is a pan or a tap.
      gesture = { x0: e.clientX, s0: pan.scrollLeft, p, panning: false };
      svg.setPointerCapture(e.pointerId);
      return;
    }
    if (g) {
      const id = Number(g.dataset.id);
      if (st.erase || e.altKey) { send({ t: "remove", id }); return; }
      const h = st.holds.get(id);
      drag = { id, sx: p.x, sy: p.y, ox: h.x, oy: h.y, moved: false };
      svg.setPointerCapture(e.pointerId);
      g.classList.add("lifted");
      return;
    }
    if (st.erase || !st.ws || st.ws.readyState !== 1) return;
    if (!onWall(p.x, p.y) || p.y > 518) { toast("Holds go on the wall, not the mats."); return; }
    placeAt(p.x, p.y);
  });

  svg.addEventListener("pointerup", e => {
    if (gesture) {
      const gs = gesture; gesture = null;
      svg.releasePointerCapture?.(e.pointerId);
      if (gs.panning) return;
      if (st.erase || !st.ws || st.ws.readyState !== 1) return;
      if (!onWall(gs.p.x, gs.p.y) || gs.p.y > 518) { toast("Holds go on the wall, not the mats."); return; }
      placeAt(gs.p.x, gs.p.y);
      return;
    }
    if (!drag) return;
    const d = drag; drag = null;
    svg.releasePointerCapture?.(e.pointerId);
    const h = st.holds.get(d.id);
    gHolds.querySelector(`[data-id="${d.id}"]`)?.classList.remove("lifted");
    if (!h) return;
    if (!d.moved) { if (phone) showHoldbar(d.id); return; }
    if (!onWall(h.x, h.y)) { h.x = d.ox; h.y = d.oy; drawHold(h); return; }
    send({ t: "move", id: d.id, x: h.x, y: h.y, ref: ++st.seq });
  });

  svg.addEventListener("contextmenu", e => {
    const g = e.target.closest(".hold"); if (!g) return;
    e.preventDefault();
    send({ t: "remove", id: Number(g.dataset.id) });
  });

  svg.addEventListener("wheel", e => {
    const g = e.target.closest(".hold"); if (!g) return;
    e.preventDefault();
    const h = st.holds.get(Number(g.dataset.id)); if (!h) return;
    h.r = ((h.r + (e.deltaY > 0 ? 15 : -15)) + 540) % 360 - 180;
    drawHold(h);
    clearTimeout(g._rt);
    g._rt = setTimeout(() => send({ t: "rotate", id: h.id, r: h.r }), 120);
  }, { passive: false });

  function placeAt(x, y) {
    const ref = ++st.seq;
    const r = Math.round((Math.random() * 60 - 30) / 5) * 5;
    // Optimistic ghost until the object confirms (or rejects) it.
    const g = document.createElementNS(SVGNS, "g");
    g.classList.add("hold", "pending");
    g.style.transform = `translate(${x}px, ${y}px)`;
    g.innerHTML = `<g class="hold-rot" style="transform:rotate(${r}deg)">${holdMarkup(st.type, st.color)}</g>`;
    gHolds.appendChild(g);
    st.pending.set(ref, g);
    send({ t: "place", type: st.type, color: st.color, x, y, r, ref });
    log("net", `→ place ${st.color} ${st.type}`);
  }

  root.addEventListener("keydown", e => {
    const i = Number(e.key) - 1;
    if (i >= 0 && i < TYPES.length) { st.type = TYPES[i].id; st.erase = false; syncTools(); }
    if (e.key.toLowerCase() === "e") { st.erase = !st.erase; syncTools(); }
  });

  function cleanup() {
    clearInterval(timer);
    const ws = st.ws; st.ws = null;
    try { ws?.close(1000, "window closed"); } catch {}
  }

  syncTools(); renderRoutes(); renderClimbers();
  if (phone) {
    requestAnimationFrame(() => { pan.scrollLeft = (pan.scrollWidth - pan.clientWidth) * 0.15; });
    if (!store("gym:phonehint")) {
      store("gym:phonehint", "1");
      setTimeout(() => toast("Swipe to look around · tap the wall to place"), 1600);
    }
  }
  log("info", `the gym is one <b>Durable Object</b>. Everyone, anywhere on Earth, reaches the same instance.`);
  setTimeout(connect, 300);
}

function layoutHTML() {
  return `
    <div class="gym-stage" tabindex="0">
      <div class="gym-scene">
        <div class="gym-pan">${sceneSVG()}</div>
        <div class="gym-holdbar" role="toolbar" aria-label="Hold">
          <button data-act="ccw" aria-label="Rotate left">↺</button>
          <button data-act="cw" aria-label="Rotate right">↻</button>
          <button data-act="remove" class="rm" aria-label="Remove hold">✕</button>
        </div>
        <div class="gym-top">
          <div class="gym-sign">◆ BOULDER GYM</div>
          <div class="gym-people">
            <div class="gym-here"></div>
            <button class="gym-me" title="Rename yourself"><i class="me-dot"></i><span class="me-name"></span><span class="me-edit" aria-hidden="true">✎</span></button>
          </div>
          <button class="gym-hoodbtn" title="Under the hood">⌁ Under the hood</button>
        </div>
        <div class="gym-island" role="toolbar" aria-label="Holds">
          <div class="gym-types"></div>
          <span class="gym-div"></span>
          <div class="gym-colors"></div>
          <span class="gym-div"></span>
          <button class="gym-erase" title="Erase — or right-click a hold" aria-label="Erase"></button>
        </div>
        <div class="gym-routes"><span class="gym-count">0 holds</span><ul></ul></div>
        <div class="gym-status"></div>
        <div class="gym-toast" role="status"></div>
      </div>
      <aside class="gym-hood" aria-label="Under the hood">
        <div class="hood-in">
          <h3>Under the hood <span class="hd-state" data-s="wait">offline</span></h3>
          <dl>
            <dt>Address</dt><dd class="hd-name">—</dd>
            <dt>Object ID</dt><dd class="hd-id">—</dd>
            <dt>Awake for</dt><dd class="hd-awake">—</dd>
            <dt>Open sockets</dt><dd class="hd-sockets">0</dd>
            <dt>holds rows</dt><dd class="hd-rows">0</dd>
            <dt>routes rows</dt><dd class="hd-routes">0</dd>
            <dt>Next reset</dt><dd class="hd-reset">—</dd>
            <dt>Resets so far</dt><dd class="hd-resets">0</dd>
          </dl>
          <h4>Event log</h4>
          <ul class="gym-log"></ul>
        </div>
      </aside>
    </div>
`;
}

export const gymIcon = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M4 21 6 4h12l2 17"/><circle cx="9" cy="8.5" r="1.4"/><circle cx="14.5" cy="11" r="1.6"/><circle cx="10" cy="15" r="1.3"/><circle cx="15" cy="17.5" r="1.2"/></svg>`;

export const gymApp = {
  id: "gym", title: "Boulder Gym", icon: "gym", dock: true,
  w: 1040, h: 680, plain: true, init,
  html: `<div class="gym"></div>`,
};
