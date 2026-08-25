import { ME, APPS, ICONS } from "./content.js";
import { launch, isOpen } from "./wm.js";

export function renderDesktop() {
  const iconWrap = document.getElementById("icons");
  const dockWrap = document.getElementById("dock");

  APPS.filter(a => !a.hidden).forEach(app => {
    const b = document.createElement("button");
    b.className = "icon";
    const glyph = app.img ? `<img src="${app.img}" alt="" width="36" height="36">` : ICONS[app.icon];
    b.innerHTML = `${glyph}<span>${app.title}</span>`;
    const open = () => app.href ? window.open(app.href, "_blank", "noopener") : launch(app.id);
    b.addEventListener("dblclick", open);
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
