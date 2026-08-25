import { APPS } from "./content.js";
import { launch, close, closeAll, focused } from "./wm.js";
import { renderDesktop, renderMobile } from "./render.js";
import { renderWidgets } from "./widgets.js";
import { startClock, cycleSky } from "./sky.js";

const isMobile = matchMedia("(max-width:820px), (pointer:coarse)").matches;

const WX = [
  [0, "☀️"], [1, "🌤️"], [2, "⛅️"], [3, "☁️"], [45, "🌫️"], [48, "🌫️"],
  [51, "🌦️"], [57, "🌧️"], [61, "🌧️"], [67, "🌨️"], [71, "❄️"], [77, "🌨️"],
  [80, "🌦️"], [82, "🌧️"], [85, "❄️"], [86, "❄️"], [95, "⛈️"], [99, "⛈️"]
];

async function loadWeather() {
  try {
    const geo = await (await fetch("/api/geo")).json();
    if (!geo.lat) return;
    const wx = await (await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${geo.lat}&longitude=${geo.lon}&current=temperature_2m,weather_code`
    )).json();
    const c = wx.current;
    let icon = "☀️";
    for (const [code, e] of WX) if (c.weather_code >= code) icon = e;
    document.getElementById("weather").textContent =
      `${geo.city ? geo.city + " " : ""}${icon} ${Math.round(c.temperature_2m)}°`;
  } catch {}
}

startClock();
renderMobile();

if (!isMobile) {
  renderDesktop();
  renderWidgets();

  loadWeather();
  setInterval(loadWeather, 900000);

  document.getElementById("skipSky").addEventListener("click", cycleSky);

  document.addEventListener("wm:change", e => {
    const app = APPS.find(a => a.id === e.detail.focused);
    document.getElementById("activeName").textContent = app ? app.title : "Finder";
    history.replaceState(null, "", e.detail.focused ? "#" + e.detail.focused : location.pathname);
  });

  document.addEventListener("click", e => {
    const t = e.target.closest("[data-launch]");
    if (!t) return;
    e.preventDefault();
    launch(t.dataset.launch);
  });

  addEventListener("keydown", e => {
    if (e.key === "Escape" && focused) close(focused);
    if (e.shiftKey && e.key.toLowerCase() === "w" && focused) { e.preventDefault(); close(focused); }
    if (e.shiftKey && e.key.toLowerCase() === "x") { e.preventDefault(); closeAll(); }
  });

  addEventListener("hashchange", () => {
    const id = location.hash.slice(1);
    if (APPS.some(a => a.id === id)) launch(id);
  });

  const initial = location.hash.slice(1);
  if (initial && APPS.some(a => a.id === initial)) launch(initial);
  else launch("about");
}
