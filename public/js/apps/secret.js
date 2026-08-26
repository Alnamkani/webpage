const LOCK_ICON = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>`;
const FILE_ICON = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 3h9l5 5v13H5z"/><path d="M14 3v5h5"/><path d="M8.5 13h7M8.5 16.5h4.5"/></svg>`;

function init(body) {
  const root = body.querySelector(".vault");
  const form = root.querySelector(".v-form");
  const input = form.querySelector("input");
  const msg = root.querySelector(".v-msg");

  form.addEventListener("submit", e => {
    e.preventDefault();
    if (input.value === "password") {
      root.querySelector(".v-lock").hidden = true;
      root.querySelector(".v-files").hidden = false;
    } else {
      msg.textContent = "wrong password";
      root.classList.remove("shake");
      void root.offsetWidth;
      root.classList.add("shake");
      input.select();
    }
  });
}

export const secretApp = {
  id: "secret", title: "Secret", icon: "vault",
  w: 420, h: 400, init,
  html: `
    <div class="vault">
      <div class="v-lock">
        ${LOCK_ICON}
        <p>This folder is protected.</p>
        <form class="v-form">
          <input type="password" placeholder="password" aria-label="Password" autocomplete="off">
          <button type="submit">Unlock</button>
        </form>
        <div class="v-msg" role="status"></div>
      </div>
      <div class="v-files" hidden>
        <button class="v-file" data-launch="caughtme">
          ${FILE_ICON}<span>you_caught_me.txt</span>
        </button>
      </div>
    </div>
  `
};

export const caughtApp = {
  id: "caughtme", title: "you_caught_me.txt", icon: "note", hidden: true,
  w: 460, h: 300,
  html: `
    <pre class="txt">you caught me.

there is nothing else here.
close this window and pretend it never happened.</pre>
  `
};
