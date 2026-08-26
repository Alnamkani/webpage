import { sudokuApp } from "./apps/sudoku.js";
import { deckApp } from "./apps/deck.js";
import { atatApp } from "./apps/atat.js";
import { fraudApp } from "./apps/fraudlab.js";
import { studioApp } from "./apps/studio.js";
import { wallApp } from "./apps/wall.js";

export const ME = {
  name: "Mohammed Alnamkani",
  first: "Mohammed",
  role: "CTO & Founder, Srmed AI",
  place: "Jeddah",
  tz: "Asia/Riyadh",
  email: "mohammed.alnamkani@gmail.com",
  github: "https://github.com/Alnamkani",
  x: "https://twitter.com/alnamkani",
  linkedin: "https://www.linkedin.com/in/mohammed-alnamkani-394a78183/"
};

export const APPS = [
  {
    id: "about", title: "About.md", icon: "user", dock: true,
    w: 560, h: 470,
    html: `
      <img class="portrait" src="/assets/me.jpg" alt="Mohammed Alnamkani" width="84" height="84">
      <h1>${ME.name}</h1>
      <div class="sub">CTO &amp; Founder · Srmed AI · ${ME.place}</div>
      <p>CTO and founder of <a href="https://srmed.ai" target="_blank" rel="noopener">Srmed AI</a> —
      an AI-operated bilingual newsroom. LLM agents collect and rank a
      thousand headlines a day, publish articles in Arabic and English with
      their context, and produce a daily two-host AI podcast, end to end.</p>
      <p><em>[Edit me — two or three sentences on what you actually work on
      and why, the way you'd say it out loud at a table.]</em></p>
      <h2>Now</h2>
      <ul>
        <li>Building Srmed AI.</li>
        <li><em>[Something else you're spending time on.]</em></li>
      </ul>
    `
  },
  {
    id: "projects", title: "Projects", icon: "folder", dock: true,
    w: 640, h: 500,
    html: `
      <h1>Projects</h1>
      <div class="sub">Selected</div>
      <div class="row">
        <div><b>Srmed AI</b><p>An AI-operated bilingual newsroom — daily news
        with context and an AI podcast. CTO &amp; founder.
        <a href="https://srmed.ai" target="_blank" rel="noopener">srmed.ai</a>.</p></div>
        <span class="when">2026 —</span>
      </div>
      <div class="row">
        <div><b>atat</b>
        <p>Type <code>@@</code> in any Mac text field and Claude answers in
        place, screenshot attached — Hammerspoon + Claude Code, no API keys.
        <a href="#atat" data-launch="atat">Try the simulation</a> ·
        <a href="${ME.github}/atat" target="_blank" rel="noopener">GitHub</a>.</p></div>
        <span class="when">2026</span>
      </div>
      <div class="row">
        <div><b>Rule-Based Fraud Detection</b>
        <p>An interpretable fraud classifier over millions of transactions.
        <a href="#fraud-lab" data-launch="fraud-lab">Watch it classify live</a>.</p></div>
        <span class="when">interactive</span>
      </div>
      <div class="row">
        <div><b>Sudoku Solver</b>
        <p>Backtracking solver you can watch think.
        <a href="#sudoku" data-launch="sudoku">Generate and solve</a>.</p></div>
        <span class="when">animated</span>
      </div>
    `
  },
  sudokuApp,
  deckApp,
  atatApp,
  fraudApp,
  studioApp,
  wallApp,
  {
    id: "writing", title: "Writing", icon: "doc", dock: true,
    w: 560, h: 400,
    html: `
      <h1>Writing</h1>
      <div class="sub">Essays and notes</div>
      <div class="row">
        <div><b><a href="#nft" data-launch="nft">Art and NFT</a></b>
        <p>Digital art, provenance, and why NFTs exist.</p></div>
        <span class="when">Mar 2021</span>
      </div>
    `
  },
  {
    id: "nft", title: "Art and NFT", icon: "doc", hidden: true,
    w: 620, h: 540,
    html: `
      <h1>Art and NFT</h1>
      <div class="sub">March 2021</div>
      <p>Art is concerned with imaginative or technical skill stemming from human agency. This includes a wide variety of visual and auditory art.</p>
      <p>In the 21st century where we use computers for most of our times; we also use computers to create art. Digital art is art created using computer software. We can think of memes, and gifs as digital art, but there is more to it.</p>
      <p>“The creation” by pak is a recreation of “The Creation of Adam” by Michelangelo. Some think of Michelangelo’s work as a question of whether god created man, or did man create god? What pak did was break the work of Michelangelo’s to a bunch of tiles, and then they started an auction with the painting at first being all black, and if someone bought a tile it would appear on the black painting. And by doing so the question now is did pak create the art, or did the collectors create the art?</p>
      <p>Portraits are one of the oldest and most popular genres of art. Portraits are still very popular with digital art. CryptoPunks are cool 10,000 character (Portraits) that are so popular the cheapest one sells for around ~ $26,500.</p>
      <p>How do digital artists create a record of their artwork? They use NFT’s.</p>
      <p>NFT’s are basically cryptocurrency that are unique. Owning an NFT is like owning a painting it has a certain value (it can go up/down with time) and its unique. In the other hand, owning a bitcoin is like owning a dollar it has a value but it’s not unique. This uniqueness of NFT’s led to people trading NFT’s using Ethereum.</p>
      <p>In the case of cryptoPunks, once you buy a punk you own the NFT of that punk and you can check the record of that punk on their website. And the same applies to the tiles of the creation.</p>
      <p>Services such as Verisart are digital certification services where they will create a certificate for your artwork and verify it using blockchain. Then you can post your art on giphy which is a marketplace for gifs.</p>
      <p>How big is the marketplace for digital art going to be? Beeple is a digital artist who just set a record in digital art by selling one of his art works for $69M. However, digital art is not reserved for the elitists of the society. NFT’s are traded daily on market such as openSea for a wide range of prices.</p>
      <p>I think that the marketplace for digital art and NFT has a lot to offer and perhaps the next tech giant will be the one who figures out how to allow people to showcase their NFT’s in a cool, trendy, hype way.</p>
      <h2>Notes</h2>
      <p>[1] Do we consider music or paintings created by AI art? It depends on our definition of art. For example, if we want AI to make a new music, we feed it with a lot of songs, and then it spits a new song that is just a mix of features it noticed in the input data.</p>
    `
  },
  {
    id: "library", title: "Library", icon: "book", dock: true,
    w: 840, h: 420,
    html: `
      <h1>Library</h1>
      <div class="sub">Favorite books</div>
      <div class="shelfcase">
        <div class="shelf">
          <a class="book" href="https://g.co/kgs/z4DosK" target="_blank" rel="noopener">
            <img src="/assets/books/zero-to-one.jpg" alt="Zero to One" loading="lazy">
            <span class="book-tip">Zero to One — Peter Thiel</span></a>
          <a class="book" href="https://g.co/kgs/9ZZqpB" target="_blank" rel="noopener">
            <img src="/assets/books/hackers-painters.jpg" alt="Hackers and Painters" loading="lazy">
            <span class="book-tip">Hackers &amp; Painters — Paul Graham</span></a>
          <a class="book" href="https://g.co/kgs/8GTsXY" target="_blank" rel="noopener">
            <img src="/assets/books/skin-in-the-game.jpg" alt="Skin in the Game" loading="lazy">
            <span class="book-tip">Skin in the Game — Nassim Taleb</span></a>
          <a class="book" href="https://g.co/kgs/26RYAt" target="_blank" rel="noopener">
            <img src="/assets/books/range.jpg" alt="Range" loading="lazy">
            <span class="book-tip">Range — David Epstein</span></a>
          <a class="book" href="https://g.co/kgs/Fp6C2K" target="_blank" rel="noopener">
            <img src="/assets/books/animal-farm.jpg" alt="Animal Farm" loading="lazy">
            <span class="book-tip">Animal Farm — George Orwell</span></a>
          <a class="book" href="https://g.co/kgs/sKbDsC" target="_blank" rel="noopener">
            <img src="/assets/books/radical-markets.jpg" alt="Radical Markets" loading="lazy">
            <span class="book-tip">Radical Markets — Posner &amp; Weyl</span></a>
        </div>
      </div>
    `
  },
  {
    id: "resume", title: "Resume", icon: "file", dock: true,
    w: 700, h: 660,
    html: `
      <div class="cv">
        <div class="cv-head">
          <h1>${ME.name}</h1>
          <div class="cv-links">
            <a href="mailto:${ME.email}">${ME.email}</a> ·
            <a href="https://alnamkani.com">alnamkani.com</a> ·
            <a href="${ME.github}" target="_blank" rel="noopener">github.com/Alnamkani</a> ·
            <a href="/resume.pdf" download>PDF ↓</a>
          </div>
        </div>

        <h2>Experience</h2>
        <div class="row">
          <div><b>Srmed AI</b><i>CTO &amp; Founder · Saudi Arabia</i>
          <p>Built and shipped an AI-operated bilingual (English/Arabic) newsroom end to end: 1,000+ headlines collected and ranked by LLM agents daily, ~2,000 articles published, and a daily two-host AI podcast with fully automated audio production, served via a Next.js web app and iOS/Android apps. Agentic pipelines with structured tool calls and a self-correcting validation layer; prompts treated as versioned infrastructure with immutable pins and CI promotion; full production deployment on Cloudflare Workers, durable Workflows and Containers with Postgres, edge caching, and cost tracing of every LLM call.</p></div>
          <span class="when">Jan 2026 —</span>
        </div>
        <div class="row">
          <div><b>Sarj AI</b><i>AI Engineer · Riyadh</i>
          <p>Built a real-time voice-AI platform letting restaurants take phone calls and orders through conversational agents. Led the team that demonstrated an ambient-AI solution to a hospital, converting the prototype into a continuing engagement; contributed to an AI assistant for a newly launched Saudi digital bank.</p></div>
          <span class="when">May – Sep 2025</span>
        </div>
        <div class="row">
          <div><b>Goldman Sachs</b><i>AI Engineer (Analyst → Associate) · New York</i>
          <p>Developed the firm's generative AI platform — LLM access and agent execution orchestration supporting 30+ enterprise use cases. Integrated an external financial institution's research AI agent into advisor workflows for agentic Q&amp;A over counterpart research and SEC filings. Engineered a natural-language interface for Asset &amp; Wealth Management dashboards and designed the internal LLM Python SDK. Collaborated with a leading AI lab to fine-tune an LLM on a proprietary programming language; enhanced an OCR pipeline processing 10k+ documents daily with Metaflow.</p></div>
          <span class="when">Jan 2023 – Jan 2025</span>
        </div>

        <h2>Projects</h2>
        <div class="row">
          <div><b>at-at</b>
          <p>Open-source macOS utility built with Hammerspoon (Lua): type <code>@@</code> in any text field to summon a floating prompt that captures the focused window, queries the Claude Code CLI, and pastes the answer back in place. <a href="${ME.github}/atat" target="_blank" rel="noopener">github.com/Alnamkani/atat</a></p></div>
        </div>

        <h2>Education</h2>
        <div class="row">
          <div><b>King Abdullah University of Science and Technology</b><i>M.S. in Computer Science</i>
          <p>GPA 3.5/4.0 · KGSP scholarship recipient (KAUST Gifted Student Program).</p></div>
          <span class="when">Aug 2024 – Dec 2025</span>
        </div>
        <div class="row">
          <div><b>Purdue University</b><i>B.S. in Computer Science, minor in Economics and Mathematics</i>
          <p>GPA 3.86/4.0 · Dean's List and Semester Honors, all semesters.</p></div>
          <span class="when">2019 – 2022</span>
        </div>

        <h2>Skills</h2>
        <div class="row">
          <div><b>Programming</b><p>Python, TypeScript/JavaScript, SQL, Bash</p></div>
        </div>
        <div class="row">
          <div><b>AI / LLM</b><p>OpenAI &amp; Gemini APIs, agent orchestration &amp; tool use, evals, prompt versioning, fine-tuning, ElevenLabs, LLM observability</p></div>
        </div>
        <div class="row">
          <div><b>Systems</b><p>FastAPI, Next.js/React, React Native (Expo), PostgreSQL, Cloudflare Workers/Workflows, Terraform, GitHub Actions, Docker, Git</p></div>
        </div>
      </div>
    `
  },
  {
    id: "srmed", title: "SRMED", img: "/assets/srmed.svg",
    href: "https://srmed.ai",
    html: `
      <h1>Srmed</h1>
      <div class="sub">AI-operated bilingual newsroom</div>
      <p>Daily business and tech news with context, plus a daily AI podcast —
      in Arabic and English. <a href="https://srmed.ai" target="_blank" rel="noopener">srmed.ai</a></p>
    `
  },
  {
    id: "contact", title: "Contact", icon: "mail", dock: true,
    w: 460, h: 360,
    html: `
      <h1>Get in touch</h1>
      <div class="sub">Open to interesting problems</div>
      <div class="row"><div><b>Email</b></div><span class="when"><a href="mailto:${ME.email}">${ME.email}</a></span></div>
      <div class="row"><div><b>GitHub</b></div><span class="when"><a href="${ME.github}" target="_blank" rel="noopener">@Alnamkani</a></span></div>
      <div class="row"><div><b>X</b></div><span class="when"><a href="${ME.x}" target="_blank" rel="noopener">@alnamkani</a></span></div>
      <div class="row"><div><b>LinkedIn</b></div><span class="when"><a href="${ME.linkedin}" target="_blank" rel="noopener">Mohammed Alnamkani</a></span></div>
    `
  }
];

export const ICONS = {
  note: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 3h9l5 5v13H5z"/><path d="M14 3v5h5"/><path d="M8.5 13h7M8.5 16.5h4.5"/></svg>`,
  user: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4.5 21c.6-4 3.7-6.5 7.5-6.5s6.9 2.5 7.5 6.5"/></svg>`,
  folder: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M3 7a2 2 0 0 1 2-2h4l2 2.5h8a2 2 0 0 1 2 2V18a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>`,
  doc: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 8h8M8 12h8M8 16h5"/></svg>`,
  mail: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3.5 7 8.5 6 8.5-6"/></svg>`,
  book: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4.5A2.5 2.5 0 0 1 6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5z"/><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/></svg>`,
  file: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2h9l5 5v15H6z"/><path d="M15 2v5h5"/><path d="M9 13h6M9 17h6"/></svg>`,
  game: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 3v18M15 3v18M3 9h18M3 15h18"/></svg>`,
  at: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M16 8v5a3 3 0 0 0 6-1 10 10 0 1 0-4 8"/></svg>`,
  brush: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M14 3l7 7-8.5 8.5a3.5 3.5 0 0 1-5-5z"/><path d="M7 14l3 3M3 21c1.5 0 3-.5 3-2"/></svg>`,
  wall: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="8" height="8" rx="1"/><rect x="13" y="3" width="8" height="8" rx="1"/><rect x="3" y="13" width="8" height="8" rx="1"/><rect x="13" y="13" width="8" height="8" rx="1"/></svg>`,
  chart: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M7 15v-3M12 15V8M17 15v-5"/></svg>`
};
