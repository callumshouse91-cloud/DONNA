/* ============================================================
   DONNA · self-documentation, guide & onboarding
   ============================================================ */

function cardHintBtn(hint) {
  if (!hint) return "";
  const esc = hint.replace(/"/g, "&quot;");
  return `<button type="button" class="hint-btn" data-hint="${esc}" aria-label="About this metric">ⓘ</button>`;
}

function pageHead(moduleId, title, accent, desc) {
  return `
  <div class="page-head">
    <div class="page-head-row">
      <h1 class="page-title">${title} <span class="accent">${accent}</span></h1>
      <button type="button" class="help-btn" data-module-help="${moduleId}" aria-label="About this page">ⓘ About this page</button>
    </div>
    <p class="page-desc">${desc}</p>
  </div>`;
}

function wireCardHints(root) {
  (root || document).querySelectorAll(".hint-btn").forEach(btn => {
    btn.onclick = e => {
      e.stopPropagation();
      showHintPopover(btn, btn.dataset.hint);
    };
  });
}

function showHintPopover(anchor, text) {
  closePopovers();
  const pop = document.createElement("div");
  pop.className = "help-popover hint-popover";
  pop.innerHTML = `<p>${text}</p>`;
  document.body.appendChild(pop);
  const r = anchor.getBoundingClientRect();
  pop.style.top = `${r.bottom + window.scrollY + 6}px`;
  pop.style.left = `${Math.min(r.left, window.innerWidth - 300)}px`;
  setTimeout(() => document.addEventListener("click", closePopovers, { once: true }), 0);
}

function closePopovers() {
  document.querySelectorAll(".help-popover").forEach(p => p.remove());
}

function showModuleHelp(moduleId) {
  const mod = getModule(moduleId);
  const help = mod?.help || {};
  const inputs = (help.inputKeys || []).map(k => {
    const entry = CONFIG.INPUTS.find(i => i.key === k);
    if (!entry) return `<li><code>${k}</code></li>`;
    const field = getInputFieldName(entry);
    const src = DATA_SOURCE === "smartsheet" ? "Smartsheet" : "Excel";
    return `<li><b>${entry.label}</b> → <code>${field}</code> <span class="muted">(${src})</span></li>`;
  }).join("") || "<li class='muted'>No input keys listed yet — add them in Calibrate.</li>";

  const body = document.getElementById("helpPanelBody");
  body.innerHTML = `
    <h3 class="help-panel-title">${mod?.label || "Module"}</h3>
    <dl class="help-dl">
      <dt>What this is</dt><dd>${help.whatItIs || "—"}</dd>
      <dt>Why it's useful</dt><dd>${help.whyItMatters || "—"}</dd>
      <dt>What it's doing</dt><dd>${help.whatItsDoing || "—"}</dd>
      <dt>Where the data comes from</dt><dd>${help.dataSourceNote || "—"}</dd>
    </dl>
    <div class="help-sub">Input mappings for this page</div>
    <ul class="help-inputs">${inputs}</ul>`;
  openHelpPanel();
}

function openHelpPanel() {
  document.getElementById("helpPanel").classList.add("open");
  document.getElementById("helpBackdrop").classList.add("open");
}

function closeHelpPanel() {
  document.getElementById("helpPanel").classList.remove("open");
  document.getElementById("helpBackdrop").classList.remove("open");
}

function renderGuidePanel() {
  const g = CONFIG.GUIDE;
  document.getElementById("guidePanelBody").innerHTML = `
    <p class="guide-intro">${g.intro}</p>
    ${g.sections.map(s => `
      <div class="guide-block">
        <h4>${s.heading}</h4>
        <p>${s.body}</p>
      </div>`).join("")}
    <div class="guide-block">
      <h4>Try this</h4>
      <ul class="guide-try">${g.tryThis.map(t => `<li>${t}</li>`).join("")}</ul>
    </div>`;
}

function openGuide() {
  renderGuidePanel();
  document.getElementById("guidePanel").classList.add("open");
  document.getElementById("helpBackdrop").classList.add("open");
}

function closeGuide() {
  document.getElementById("guidePanel").classList.remove("open");
  if (!document.getElementById("helpPanel").classList.contains("open")) {
    document.getElementById("helpBackdrop").classList.remove("open");
  }
}

function showWelcomeIfNeeded() {
  if (isOnboardingDismissed()) return;
  document.getElementById("welcomeModal").classList.add("open");
}

function dismissWelcome() {
  dismissOnboarding();
  document.getElementById("welcomeModal").classList.remove("open");
}

function wireHelpUi() {
  document.getElementById("guideBtn").addEventListener("click", openGuide);
  document.getElementById("guideClose").addEventListener("click", closeGuide);
  document.getElementById("helpClose").addEventListener("click", closeHelpPanel);
  document.getElementById("helpBackdrop").addEventListener("click", () => {
    closeHelpPanel();
    closeGuide();
  });
  document.getElementById("welcomeDismiss").addEventListener("click", dismissWelcome);
  document.getElementById("view").addEventListener("click", e => {
    const mod = e.target.closest("[data-module-help]");
    if (mod) showModuleHelp(mod.dataset.moduleHelp);
  });
}

function showToast(msg) {
  const t = document.getElementById("toast");
  t.textContent = msg;
  t.classList.add("show");
  setTimeout(() => t.classList.remove("show"), 3200);
}
