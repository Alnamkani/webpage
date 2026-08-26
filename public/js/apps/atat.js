const MODELS = [
  { name: "Haiku", delay: 350, cps: 90 },
  { name: "Sonnet", delay: 900, cps: 55 },
  { name: "Opus", delay: 1800, cps: 35 }
];

const CANNED = [
  "This is the demo brain — a few lines of pattern matching. The real atat pipes your prompt into Claude Code running on your own Mac, no API keys. github.com/Alnamkani/atat",
  "In the real thing, a screenshot of whatever you were looking at rides along with your prompt. Here you get canned wisdom instead.",
  "atat lives in Hammerspoon: it watches for @@, swallows it, and pastes Claude's answer right where your cursor was.",
  "Free advice: type a math expression and I will actually compute it. Everything else, I improvise."
];

function think(prompt) {
  const p = prompt.trim();
  if (/^[\d\s+\-*/().%]+$/.test(p) && /\d/.test(p)) {
    try {
      const val = Function(`"use strict";return (${p})`)();
      if (Number.isFinite(val)) return `${p} = ${Math.round(val * 1e6) / 1e6}`;
    } catch {}
  }
  if (/\b(time|date|today|day)\b/i.test(p)) {
    return new Date().toLocaleString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" });
  }
  if (/\b(who|what)\b.*\b(you|atat|this)\b/i.test(p)) {
    return "atat: type @@ in any text field on your Mac, get a floating prompt, and Claude Code's answer is pasted back where you were. This window is a simulation of it.";
  }
  if (/\b(hi|hello|hey|salam)\b/i.test(p)) {
    return "Hey. Type @@ anywhere in this note to summon me again.";
  }
  return CANNED[Math.floor(Math.random() * CANNED.length)];
}

function init(body) {
  const root = body.querySelector(".atat");
  const note = root.querySelector(".at-note");
  const panel = root.querySelector(".at-panel");
  const promptEl = panel.querySelector("input");
  const modelBtn = panel.querySelector(".at-model");
  const status = panel.querySelector(".at-status");
  let model = 0, atPos = -1, busy = false;

  function openPanel() {
    atPos = note.selectionStart;
    panel.classList.add("show");
    status.textContent = "screenshot captured ✓";
    promptEl.value = "";
    promptEl.focus();
  }

  function closePanel() {
    panel.classList.remove("show");
    note.focus();
  }

  function typeInto(text, done) {
    let i = 0;
    const cps = MODELS[model].cps;
    const tick = () => {
      if (!document.contains(root)) return;
      const n = Math.max(1, Math.round(cps / 30));
      const chunk = text.slice(i, i + n);
      i += n;
      const pos = note.selectionStart;
      note.value = note.value.slice(0, pos) + chunk + note.value.slice(pos);
      note.selectionStart = note.selectionEnd = pos + chunk.length;
      if (i < text.length) setTimeout(tick, 33);
      else done();
    };
    tick();
  }

  function send() {
    if (busy) return;
    const q = promptEl.value.trim();
    if (!q) return;
    busy = true;
    status.textContent = "thinking";
    let dots = 0;
    const anim = setInterval(() => { status.textContent = "thinking" + ".".repeat(++dots % 4); }, 300);
    setTimeout(() => {
      clearInterval(anim);
      closePanel();
      note.selectionStart = note.selectionEnd = Math.min(atPos, note.value.length);
      typeInto(think(q), () => { busy = false; });
    }, MODELS[model].delay);
  }

  note.addEventListener("input", () => {
    const pos = note.selectionStart;
    if (pos >= 2 && note.value.slice(pos - 2, pos) === "@@") {
      note.value = note.value.slice(0, pos - 2) + note.value.slice(pos);
      note.selectionStart = note.selectionEnd = pos - 2;
      openPanel();
    }
  });

  modelBtn.addEventListener("click", () => {
    model = (model + 1) % MODELS.length;
    modelBtn.textContent = MODELS[model].name;
  });

  promptEl.addEventListener("keydown", e => {
    if (e.key === "Enter") { send(); e.preventDefault(); }
    if (e.key === "Escape") { closePanel(); e.stopPropagation(); e.preventDefault(); }
  });
  panel.querySelector(".at-send").addEventListener("click", send);
}

export const atatApp = {
  id: "atat", title: "atat", icon: "at", dock: false,
  w: 560, h: 540, init,
  html: `
    <div class="atat">
      <h1>atat</h1>
      <div class="sub">@@ anywhere → Claude answers in place</div>
      <p>A Mac utility built on Hammerspoon: type <code>@@</code> in any text
      field, a floating prompt appears with a screenshot of what you were
      looking at, and the answer from your own Claude Code login is pasted
      back where your cursor was. No API keys.
      <a href="https://github.com/Alnamkani/atat" target="_blank" rel="noopener">Source on GitHub</a>.</p>
      <div class="at-demo">
        <div class="at-cap">Live simulation — type <code>@@</code> in the note</div>
        <textarea class="at-note" spellcheck="false">Meeting notes
- ship the redesign
- what is 128 * 46? try @@ here
</textarea>
        <div class="at-panel">
          <div class="at-bar">
            <span class="at-status"></span>
            <button class="at-model" title="Cycle model">Haiku</button>
          </div>
          <div class="at-row">
            <input type="text" placeholder="Ask anything…" aria-label="atat prompt">
            <button class="at-send">⏎</button>
          </div>
        </div>
      </div>
    </div>
  `
};
