import { ME, APPS, ICONS } from "./content.js";
import { launch, isOpen } from "./wm.js";

export function renderDesktop() {
  const iconWrap = document.getElementById("icons");
  const dockWrap = document.getElementById("dock");

  APPS.filter(a => !a.hidden).forEach(app => {
    const b = document.createElement("button");
    b.className = "icon";
    b.innerHTML = `${ICONS[app.icon]}<span>${app.title}</span>`;
    b.addEventListener("dblclick", () => launch(app.id));
    b.addEventListener("keydown", e => { if (e.key === "Enter") launch(app.id); });
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

export function renderMobile() {
  const mob = document.getElementById("mobile");
  mob.innerHTML = `
    <header>
      <h1>${ME.name}</h1>
      <div class="sub">${ME.role} · ${ME.place}</div>
    </header>
    ${APPS.map(a => `
      <section id="m-${a.id}"><div class="cap">${a.title}</div><div class="body">${a.html}</div></section>
    `).join("")}
    <footer>Open on a desktop for the full experience.</footer>`;

  if (matchMedia("(max-width:820px), (pointer:coarse)").matches) {
    APPS.filter(a => a.init).forEach(a => a.init(mob.querySelector(`#m-${a.id} .body`)));
  }
}
