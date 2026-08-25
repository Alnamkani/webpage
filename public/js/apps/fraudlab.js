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
      r7: 0.45 + Math.random() * 0.55,
      amount: Math.round(150 + Math.random() * 1850),
      r30: 0.3 + Math.random() * 0.7
    };
  }
  return {
    fraud: false,
    r7: Math.random() * 0.5,
    amount: Math.round(5 + Math.random() * 260),
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
  const pulseLayer = svg.querySelector(".fl-pulses");
  const txEl = root.querySelector(".fl-tx");
  const stats = { seen: 0, caught: 0, missed: 0, falarm: 0 };
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
  });

  function setStats() {
    statEls.seen.textContent = stats.seen;
    statEls.caught.textContent = stats.caught;
    statEls.missed.textContent = stats.missed;
    statEls.falarm.textContent = stats.falarm;
  }

  function lightNode(key, cls) {
    const g = svg.querySelector(`.fl-g-${key}`);
    if (!g) return;
    g.classList.add("lit", cls);
    setTimeout(() => g.classList.remove("lit", cls), 460);
  }

  function pulseEdge(a, b, cls, dur, done) {
    const A = NODES[a], B = NODES[b];
    const len = Math.hypot(B.x - A.x, B.y - A.y);
    const dash = 26;
    const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
    line.setAttribute("x1", A.x); line.setAttribute("y1", A.y);
    line.setAttribute("x2", B.x); line.setAttribute("y2", B.y);
    line.setAttribute("class", `fl-pulse ${cls}`);
    line.setAttribute("stroke-dasharray", `${dash} ${len + dash}`);
    line.setAttribute("stroke-dashoffset", dash);
    pulseLayer.appendChild(line);
    const t0 = performance.now();
    const frame = now => {
      if (!document.contains(root)) { line.remove(); return; }
      const p = Math.min(1, (now - t0) / dur);
      const e = p < .5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
      line.setAttribute("stroke-dashoffset", dash - e * (len + dash));
      if (p < 1) requestAnimationFrame(frame);
      else { line.remove(); done(); }
    };
    requestAnimationFrame(frame);
  }

  function spawn() {
    const tx = makeTx();
    const cls = tx.fraud ? "p-fraud" : "p-ok";
    txEl.innerHTML = `$${tx.amount} · risk7 ${tx.r7.toFixed(2)} · risk30 ${tx.r30.toFixed(2)}` +
      (tx.fraud ? ` <span class="is-fraud">fraud</span>` : ` <span class="is-ok">legit</span>`);
    const [n0, n1, leafKey] = classify(tx, t);
    const flagged = NODES[leafKey].fraud;
    lightNode(n0, cls);
    pulseEdge(n0, n1, cls, 430, () => {
      lightNode(n1, cls);
      pulseEdge(n1, leafKey, cls, 430, () => {
        stats.seen++;
        if (tx.fraud && flagged) stats.caught++;
        if (tx.fraud && !flagged) stats.missed++;
        if (!tx.fraud && flagged) stats.falarm++;
        setStats();
        lightNode(leafKey, cls);
      });
    });
  }

  const feeder = setInterval(() => {
    if (!document.contains(root)) { clearInterval(feeder); return; }
    if (running) spawn();
  }, 1050);
  spawn();
}

function edge(a, b) {
  return `<line x1="${NODES[a].x}" y1="${NODES[a].y}" x2="${NODES[b].x}" y2="${NODES[b].y}" class="fl-edge"/>`;
}

function node(k, sub) {
  const n = NODES[k];
  return `<g class="fl-g-${k}" transform="translate(${n.x},${n.y})">
    <rect x="-78" y="-22" width="156" height="44" rx="8" class="fl-node"/>
    <text y="-4" class="fl-label">${n.label}</text>
    <text y="13" class="fl-th fl-th-${sub.k}">≤ ${sub.v}</text>
  </g>`;
}

function leaf(k, txt) {
  const n = NODES[k];
  return `<g class="fl-g-${k}" transform="translate(${n.x},${n.y})">
    <rect x="-56" y="-20" width="112" height="40" rx="9" class="fl-leaf ${NODES[k].fraud ? "bad" : "good"}"/>
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
        <g class="fl-pulses"></g>
        ${node("root", { k: "r7", v: 0.551 })}
        ${node("amount", { k: "amount", v: "$218.67" })}
        ${node("risk30", { k: "r30", v: 0.662 })}
        ${leaf("l1", "pass")}${leaf("l2", "flag")}
        ${leaf("l3", "flag")}${leaf("l4", "pass")}
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
