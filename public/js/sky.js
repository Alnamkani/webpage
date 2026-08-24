import { ME } from "./content.js";

const SKIES = {
  night: { s1: "#03101A", s2: "#08222F", s3: "#0D3243", glow: "#1D5F72", gold: "#9FB8C4", sun: { top: "14%", left: "76%", op: .32 } },
  dawn:  { s1: "#132239", s2: "#3B4668", s3: "#8A6E7E", glow: "#C98A72", gold: "#E8C07A", sun: { top: "66%", left: "18%", op: .55 } },
  day:   { s1: "#0B3D55", s2: "#10617B", s3: "#2E93A5", glow: "#67C2CC", gold: "#EBD9A8", sun: { top: "12%", left: "22%", op: .42 } },
  dusk:  { s1: "#0E1E33", s2: "#38416E", s3: "#8A5A6B", glow: "#C4794E", gold: "#E8B06B", sun: { top: "70%", left: "80%", op: .6 } }
};
const ORDER = ["dawn", "day", "dusk", "night"];
let override = null;

function phaseFor(h) {
  if (h >= 5 && h < 8) return "dawn";
  if (h >= 8 && h < 16) return "day";
  if (h >= 16 && h < 20) return "dusk";
  return "night";
}

function localHour() {
  const s = new Intl.DateTimeFormat("en-GB", { hour: "numeric", hour12: false, timeZone: ME.tz }).format(new Date());
  return parseInt(s, 10);
}

export function setSky() {
  const p = override || phaseFor(localHour());
  const t = SKIES[p], r = document.documentElement.style;
  r.setProperty("--sky-1", t.s1); r.setProperty("--sky-2", t.s2); r.setProperty("--sky-3", t.s3);
  r.setProperty("--glow", t.glow); r.setProperty("--gold", t.gold);
  document.getElementById("sky").style.background =
    `linear-gradient(178deg, ${t.s1} 0%, ${t.s2} 46%, ${t.s3} 100%)`;
  const sun = document.getElementById("sun");
  sun.style.top = t.sun.top; sun.style.left = t.sun.left; sun.style.opacity = t.sun.op;
}

export function cycleSky() {
  const cur = override || phaseFor(localHour());
  override = ORDER[(ORDER.indexOf(cur) + 1) % ORDER.length];
  setSky();
}

export function startClock() {
  const tick = () => {
    document.getElementById("clock").textContent =
      new Intl.DateTimeFormat("en-GB", { weekday: "short", hour: "2-digit", minute: "2-digit", hour12: false, timeZone: ME.tz })
        .format(new Date());
    if (!override) setSky();
  };
  setSky();
  tick();
  setInterval(tick, 20000);
}
