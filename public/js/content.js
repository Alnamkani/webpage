export const ME = {
  name: "Mohammed Alnamkani",
  first: "Mohammed",
  role: "Co-founder, SRMED AI",
  place: "Jeddah",
  tz: "Asia/Riyadh",
  email: "malnamka@purdue.edu",
  github: "https://github.com/Alnamkani",
  x: "https://twitter.com/alnamkani",
  linkedin: "https://www.linkedin.com/in/mohammed-alnamkani-394a78183/"
};

export const APPS = [
  {
    id: "about", title: "About.md", icon: "note", dock: true,
    w: 560, h: 470,
    html: `
      <img class="portrait" src="/assets/me.jpg" alt="Mohammed Alnamkani" width="84" height="84">
      <h1>${ME.name}</h1>
      <div class="sub">Co-founder · SRMED AI · ${ME.place}</div>
      <p>Co-founder of SRMED AI, building AI-powered healthcare.</p>
      <p><em>[Edit me — two or three sentences on what you actually work on
      and why, the way you'd say it out loud at a table.]</em></p>
      <h2>Now</h2>
      <ul>
        <li>Building SRMED AI.</li>
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
        <div><b>SRMED AI</b><p>AI-powered healthcare. Co-founder.</p></div>
        <span class="when">2024 —</span>
      </div>
      <div class="row">
        <div><b>Rule-Based Fraud Detection</b>
        <p>Detecting fraudulent transactions with a rule engine.
        <a href="/assets/fraud-detection.pdf" target="_blank" rel="noopener">Open the deck</a>.</p></div>
        <span class="when">slides</span>
      </div>
      <div class="row">
        <div><b>Sudoku</b><p>Playable rebuild coming to this window.</p></div>
        <span class="when">soon</span>
      </div>
    `
  },
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
    w: 520, h: 440,
    html: `
      <h1>Library</h1>
      <div class="sub">Favorite books</div>
      <ul>
        <li><a href="https://g.co/kgs/z4DosK" target="_blank" rel="noopener">Zero to One</a> — Peter Thiel</li>
        <li><a href="https://g.co/kgs/9ZZqpB" target="_blank" rel="noopener">Hackers &amp; Painters</a> — Paul Graham</li>
        <li><a href="https://g.co/kgs/8GTsXY" target="_blank" rel="noopener">Skin in the Game</a> — Nassim Taleb</li>
        <li><a href="https://g.co/kgs/26RYAt" target="_blank" rel="noopener">Range</a> — David Epstein</li>
        <li><a href="https://g.co/kgs/Fp6C2K" target="_blank" rel="noopener">Animal Farm</a> — George Orwell</li>
        <li><a href="https://g.co/kgs/sKbDsC" target="_blank" rel="noopener">Radical Markets</a> — Posner &amp; Weyl</li>
      </ul>
    `
  },
  {
    id: "resume", title: "Resume.pdf", icon: "file", dock: true,
    w: 720, h: 640, plain: true,
    html: `<iframe class="pdf" src="/resume.pdf" title="Resume of ${ME.name}"></iframe>`
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
  folder: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M3 7a2 2 0 0 1 2-2h4l2 2.5h8a2 2 0 0 1 2 2V18a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>`,
  doc: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 8h8M8 12h8M8 16h5"/></svg>`,
  mail: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3.5 7 8.5 6 8.5-6"/></svg>`,
  book: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4.5A2.5 2.5 0 0 1 6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5z"/><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/></svg>`,
  file: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2h9l5 5v15H6z"/><path d="M15 2v5h5"/><path d="M9 13h6M9 17h6"/></svg>`
};
