const W = 640, H = 300;
const NODES = {
  root: { x: 320, y: 34, label: "terminal risk (7d)" },
  amount: { x: 160, y: 130, label: "amount" },
  risk30: { x: 480, y: 130, label: "terminal risk (30d)" },
  l1: { x: 80, y: 240, fraud: false },
  l2: { x: 240, y: 240, fraud: true },
  l3: { x: 400, y: 240, fraud: true },
  l4: { x: 560, y: 240, fraud: false }
};

function makeTx() {
  const isFraud = Math.random() < 0.25;
  if (isFraud) {
    return {
      fraud: true,
      r7: 0.35 + Math.random() * 0.65,
      amount: Math.round(150 + Math.random() * 1850),
      r30: 0.45 + Math.random() * 0.55
    };
  }
  return {
    fraud: false,
    r7: Math.random() * 0.6,
    amount: Math.round(5 + Math.random() * 400),
    r30: Math.random() * 0.55
  };
}

function classify(tx, t) {
  if (tx.r7 <= t.r7) return tx.amount <= t.amount ? ["root", "amount", "l1"] : ["root", "amount", "l2"];
  return tx.r30 <= t.r30 ? ["root", "risk30", "l3"] : ["root", "risk30", "l4"];
}

function init(body) {
  const root = body.querySelector(".flab");
  const svg = root.querySelector("svg");
  const dot = svg.querySelector(".fl-dot");
  const txEl = root.querySelector(".fl-tx");
  const stats = { seen: 0, flagged: 0, caught: 0, missed: 0, falarm: 0 };
  const t = { r7: 0.551, amount: 218.67, r30: 0.662 };
  let running = true;

  const statEls = {
    seen: root.querySelector(".fs-seen"),
    caught: root.querySelector(".fs-caught"),
    missed: root.querySelector(".fs-missed"),
    falarm: root.querySelector(".fs-falarm")
  };

  root.querySelectorAll(".fl-slider input").forEach(inp => {
    inp.addEventListener("input", () => {
      t[inp.dataset.k] = Number(inp.value);
      inp.closest(".fl-slider").querySelector("b").textContent =
        inp.dataset.k === "amount" ? "$" + inp.value : inp.value;
      svg.querySelector(`.fl-th-${inp.dataset.k}`).textContent =
        inp.dataset.k === "amount" ? `≤ $${inp.value}` : `≤ ${inp.value}`;
    });
  });

  const pauseBtn = root.querySelector(".fl-pause");
  pauseBtn.addEventListener("click", () => {
    running = !running;
    pauseBtn.textContent = running ? "Pause" : "Resume";
    if (running) loop();
  });

  function setStats() {
    statEls.seen.textContent = stats.seen;
    statEls.caught.textContent = stats.caught;
    statEls.missed.textContent = stats.missed;
    statEls.falarm.textContent = stats.falarm;
  }

  function animate(path, tx, cb) {
    const pts = path.map(k => NODES[k]);
    const segT = 520;
    const startT = performance.now();
    const total = segT * (pts.length - 1);
    dot.setAttribute("cx", pts[0].x);
    dot.setAttribute("cy", pts[0].y);
    dot.style.opacity = 1;
    dot.classList.toggle("fraud", tx.fraud);
    const frame = now => {
      if (!document.contains(root)) return;
      const el = Math.min(total, now - startT);
      const seg = Math.min(pts.length - 2, Math.floor(el / segT));
      const f = el / segT - seg;
      const e = f * f * (3 - 2 * f);
      const x = pts[seg].x + (pts[seg + 1].x - pts[seg].x) * e;
      const y = pts[seg].y + (pts[seg + 1].y - pts[seg].y) * e;
      dot.setAttribute("cx", x);
      dot.setAttribute("cy", y);
      if (el < total) requestAnimationFrame(frame);
      else cb();
    };
    requestAnimationFrame(frame);
  }

  function loop() {
    if (!running || !document.contains(root)) return;
    const tx = makeTx();
    txEl.innerHTML = `$${tx.amount} · risk7 ${tx.r7.toFixed(2)} · risk30 ${tx.r30.toFixed(2)}` +
      (tx.fraud ? ` <span class="is-fraud">fraud</span>` : ` <span class="is-ok">legit</span>`);
    const path = classify(tx, t);
    const leafKey = path[2];
    const flagged = NODES[leafKey].fraud;
    animate(path, tx, () => {
      stats.seen++;
      if (flagged) stats.flagged++;
      if (tx.fraud && flagged) stats.caught++;
      if (tx.fraud && !flagged) stats.missed++;
      if (!tx.fraud && flagged) stats.falarm++;
      setStats();
      const leaf = svg.querySelector(`.fl-leaf-${leafKey}`);
      leaf.classList.add("hit");
      setTimeout(() => leaf.classList.remove("hit"), 380);
      dot.style.opacity = 0;
      setTimeout(loop, 320);
    });
  }

  loop();
}

function edge(a, b) {
  return `<line x1="${NODES[a].x}" y1="${NODES[a].y}" x2="${NODES[b].x}" y2="${NODES[b].y}" class="fl-edge"/>`;
}

function node(k, sub) {
  const n = NODES[k];
  return `<g transform="translate(${n.x},${n.y})">
    <rect x="-78" y="-22" width="156" height="44" rx="8" class="fl-node"/>
    <text y="-4" class="fl-label">${n.label}</text>
    <text y="13" class="fl-th fl-th-${sub.k}">≤ ${sub.v}</text>
  </g>`;
}

function leaf(k, txt) {
  const n = NODES[k];
  return `<g transform="translate(${n.x},${n.y})">
    <rect x="-56" y="-20" width="112" height="40" rx="9" class="fl-leaf fl-leaf-${k} ${NODES[k].fraud ? "bad" : "good"}"/>
    <text y="5" class="fl-leaftext">${txt}</text>
  </g>`;
}

export const fraudApp = {
  id: "fraud-lab", title: "Fraud Lab", icon: "chart", hidden: true,
  w: 740, h: 660, init,
  html: `
    <div class="flab">
      <h1>Rule-Based Fraud Detection</h1>
      <div class="sub">The actual decision tree, live</div>
      <p>Built at Goldman Sachs to rank fraudulent events with an
      interpretable model — 6.3M transactions, 0.12% fraud. Below is the
      tree from the synthetic-data run, classifying a live stream. Drag the
      thresholds and watch the misses.
      <a href="#fraud-deck" data-launch="fraud-deck">Slides</a>.</p>
      <div class="fl-tx"></div>
      <svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Decision tree classifying transactions">
        ${edge("root", "amount")}${edge("root", "risk30")}
        ${edge("amount", "l1")}${edge("amount", "l2")}
        ${edge("risk30", "l3")}${edge("risk30", "l4")}
        ${node("root", { k: "r7", v: 0.551 })}
        ${node("amount", { k: "amount", v: "$218.67" })}
        ${node("risk30", { k: "r30", v: 0.662 })}
        ${leaf("l1", "pass")}${leaf("l2", "flag")}
        ${leaf("l3", "flag")}${leaf("l4", "pass")}
        <circle class="fl-dot" r="7" cx="${NODES.root.x}" cy="${NODES.root.y}" opacity="0"/>
      </svg>
      <div class="fl-stats">
        <div><span class="fs-seen">0</span><i>seen</i></div>
        <div class="ok"><span class="fs-caught">0</span><i>caught</i></div>
        <div class="bad"><span class="fs-missed">0</span><i>missed</i></div>
        <div><span class="fs-falarm">0</span><i>false alarms</i></div>
        <button class="fl-pause">Pause</button>
      </div>
      <div class="fl-sliders">
        <label class="fl-slider">risk 7d <b>0.551</b>
          <input type="range" data-k="r7" min="0" max="1" step="0.001" value="0.551"></label>
        <label class="fl-slider">amount <b>$218.67</b>
          <input type="range" data-k="amount" min="0" max="2000" step="1" value="218.67"></label>
        <label class="fl-slider">risk 30d <b>0.662</b>
          <input type="range" data-k="r30" min="0" max="1" step="0.001" value="0.662"></label>
      </div>
    </div>
  `
};
