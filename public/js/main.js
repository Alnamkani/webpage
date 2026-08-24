import { APPS } from "./content.js";
import { launch, close, closeAll, focused } from "./wm.js";
import { renderDesktop, renderMobile } from "./render.js";
import { startClock, cycleSky } from "./sky.js";

const isMobile = matchMedia("(max-width:820px), (pointer:coarse)").matches;

startClock();
renderMobile();

if (!isMobile) {
  renderDesktop();

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
