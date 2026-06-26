/* ============================================================
   DONNA · self-documentation, guide & onboarding
   ============================================================ */

function cardHintBtn(hint) {
  if (!hint) return "";
  const esc = hint.replace(/"/g, "&quot;");
  return `<button type="button" class="hint-btn" data-hint="${esc}" aria-label="About this metric">ⓘ</button>`;
}

function renderSourceChips(moduleId) {
  const mod = getModule(moduleId);
  const sources = mod?.sources || [];
  if (!sources.length) return "";
  return `<div class="page-sources">${sources.map(s => {
    const live = effectiveSourceStatus(s) === "live";
    return `<span class="source-chip ${live ? "live" : "planned"}">${s.name}${live ? "" : '<span class="chip-pill">Planned</span>'}</span>`;
  }).join("")}</div>`;
}

function pageHead(moduleId, title, accent, desc) {
  return `
  <div class="page-head">
    <div class="page-head-row">
      <h1 class="page-title">${title} <span class="accent">${accent}</span></h1>
      <button type="button" class="help-btn" data-module-help="${moduleId}" aria-label="About this page">ⓘ About this page</button>
    </div>
    ${renderSourceChips(moduleId)}
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
    return `<li><b>${entry.label}</b> → <code>${field}</code></li>`;
  }).join("") || "<li class='muted'>No input keys listed yet — add them in Calibrate.</li>";

  const sourcesNote = formatModuleSourcesNote(moduleId);

  const body = document.getElementById("helpPanelBody");
  body.innerHTML = `
    <h3 class="help-panel-title">${mod?.label || "Module"}</h3>
    <dl class="help-dl">
      <dt>What this is</dt><dd>${help.whatItIs || "—"}</dd>
      <dt>Why it's useful</dt><dd>${help.whyItMatters || "—"}</dd>
      <dt>What it's doing</dt><dd>${help.whatItsDoing || "—"}</dd>
      <dt>Where the data comes from</dt><dd>${sourcesNote}</dd>
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

function renderConnectionsPanel() {
  const conn = CONFIG.CONNECTIONS || {};
  const systems = conn.systems || INTEGRATION_SYSTEMS;
  const ss = conn.smartsheet || {};
  const liveCount = systems.filter(s => effectiveSourceStatus(s) === "live").length;
  document.getElementById("connectionsPanelBody").innerHTML = `
    <p class="guide-intro">${conn.help || "DONNA reads live from connected systems."}</p>
    <p class="conn-summary"><b>${liveCount}</b> systems connected · live</p>
    ${systems.map(sys => {
      const live = effectiveSourceStatus(sys) === "live";
      const isSs = sys.name === "Smartsheet";
      return `<div class="conn-card ${live ? "" : "conn-planned"}">
        <div class="conn-head">
          <span class="badge ${live ? "green" : "grey"}">${live ? "Connected · live" : "Planned"}</span>
          <b>${sys.name}</b>
        </div>
        <p class="conn-meta">${sys.connector}${sys.eta && !live ? ` · ${sys.eta}` : ""}</p>
        ${isSs ? `
        <label class="cal-mini">Sheet ID <input type="text" id="connSheetId" value="${ss.sheetId || ""}" placeholder="e.g. 4839201742081924" disabled></label>
        <label class="cal-mini">Sync frequency
          <select id="connSyncFreq" disabled>
            ${["realtime", "hourly", "daily"].map(f => `<option value="${f}" ${ss.syncFrequency === f ? "selected" : ""}>${f}</option>`).join("")}
          </select>
        </label>
        <button type="button" class="cal-btn secondary" id="connTestBtn">Test connection</button>
        ` : ""}
      </div>`;
    }).join("")}`;
  document.getElementById("connTestBtn")?.addEventListener("click", () => {
    showToast("Smartsheet connection test — coming soon.");
  });
}

function openConnections() {
  renderConnectionsPanel();
  document.getElementById("connectionsPanel").classList.add("open");
  document.getElementById("helpBackdrop").classList.add("open");
}

function closeConnections() {
  document.getElementById("connectionsPanel").classList.remove("open");
  if (!document.getElementById("helpPanel").classList.contains("open") &&
      !document.getElementById("guidePanel").classList.contains("open")) {
    document.getElementById("helpBackdrop").classList.remove("open");
  }
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
  if (!document.getElementById("helpPanel").classList.contains("open") &&
      !document.getElementById("connectionsPanel")?.classList.contains("open")) {
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
  document.getElementById("connectionsBtn").addEventListener("click", openConnections);
  document.getElementById("guideClose").addEventListener("click", closeGuide);
  document.getElementById("connectionsClose").addEventListener("click", closeConnections);
  document.getElementById("helpClose").addEventListener("click", closeHelpPanel);
  document.getElementById("helpBackdrop").addEventListener("click", () => {
    closeHelpPanel();
    closeGuide();
    closeConnections();
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
