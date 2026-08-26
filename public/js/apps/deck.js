const SLIDES = 5;

function init(body) {
  const root = body.querySelector(".deck");
  const img = root.querySelector("img");
  const count = root.querySelector(".dk-count");
  let cur = 1;

  function show(n) {
    cur = Math.min(SLIDES, Math.max(1, n));
    img.src = `/assets/deck/slide-${cur}.png`;
    count.textContent = `${cur} / ${SLIDES}`;
  }

  root.querySelector(".dk-prev").addEventListener("click", () => show(cur - 1));
  root.querySelector(".dk-next").addEventListener("click", () => show(cur + 1));
  img.addEventListener("click", () => show(cur + 1));
  root.addEventListener("keydown", e => {
    if (e.key === "ArrowRight" || e.key === " ") { show(cur + 1); e.preventDefault(); }
    if (e.key === "ArrowLeft") { show(cur - 1); e.preventDefault(); }
  });
  show(1);
}

export const deckApp = {
  id: "fraud-deck", title: "Rule-Based Fraud Detection", icon: "chart", hidden: true,
  w: 780, h: 560, plain: true, init,
  html: `
    <div class="deck" tabindex="0" aria-label="Slide deck">
      <img src="/assets/deck/slide-1.png" alt="Rule-Based Fraud Detection slide">
      <div class="dk-bar">
        <button class="dk-prev" aria-label="Previous slide">‹</button>
        <span class="dk-count">1 / ${SLIDES}</span>
        <button class="dk-next" aria-label="Next slide">›</button>
        <a class="dk-dl" href="/assets/fraud-detection.pdf" download>PDF ↓</a>
      </div>
    </div>
  `
};
