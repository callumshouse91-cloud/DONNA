/* ============================================================
   DONNA · Calibrate panel (full self-service configuration)
   ============================================================ */

const calPanel = document.getElementById("calPanel");
const calBackdrop = document.getElementById("calBackdrop");
const calBody = document.getElementById("calBody");
let calPanelOpen = false;
let calActiveModule = "overview";

const CAL_FIELDS = [
  { path: "workforce.commitmentAmberPct", label: "Commitment amber (%)", min: 95, max: 105, step: 1 },
  { path: "workforce.commitmentRedPct", label: "Commitment red (%)", min: 98, max: 110, step: 1 },
  { path: "workforce.replacementWindowDays", label: "Replacement window (days)", min: 30, max: 90, step: 5 },
  { path: "service.slaTargetPct", label: "SLA target (%)", min: 80, max: 100, step: 1 },
  { path: "service.slaAmberPct", label: "SLA amber (%)", min: 70, max: 99, step: 1 },
  { path: "service.agedItemDays", label: "Aged item threshold (days)", min: 5, max: 40, step: 1 },
  { path: "service.agedWarnCount", label: "Aged items warn count", min: 5, max: 30, step: 1 },
  { path: "hardware.pendingWarnCount", label: "HW pending warn count", min: 1, max: 20, step: 1 },
  { path: "hardware.deviceCharge", label: "Device charge (£)", min: 400, max: 800, step: 10 },
  { path: "software.pendingApprovalWarn", label: "SW pending approval warn", min: 1, max: 5, step: 1 },
  { path: "billing.outTsaWarnPct", label: "Out-of-TSA warn (%)", min: 5, max: 20, step: 0.5 },
];

function setCal(path, value) {
  const parts = path.split(".");
  let obj = CONFIG.CALIBRATION;
  for (let i = 0; i < parts.length - 1; i++) obj = obj[parts[i]];
  obj[parts[parts.length - 1]] = value;
  notifyConfigChange();
}

function moveModule(id, dir) {
  const sorted = [...CONFIG.MODULES].sort((a, b) => a.order - b.order);
  const idx = sorted.findIndex(m => m.id === id);
  const swap = idx + dir;
  if (swap < 0 || swap >= sorted.length) return;
  const a = sorted[idx].order, b = sorted[swap].order;
  sorted[idx].order = b;
  sorted[swap].order = a;
  notifyConfigChange();
}

function moveCard(moduleId, cardId, dir) {
  const cards = [...(CONFIG.CARDS[moduleId] || [])].sort((a, b) => a.order - b.order);
  const idx = cards.findIndex(c => c.id === cardId);
  const swap = idx + dir;
  if (swap < 0 || swap >= cards.length) return;
  const t = cards[idx].order; cards[idx].order = cards[swap].order; cards[swap].order = t;
  notifyConfigChange();
}

function renderCalPanel() {
  const H = CONFIG.CALIBRATE_HELP;
  const sorted = [...CONFIG.MODULES].sort((a, b) => a.order - b.order);
  const modulesHtml = sorted.length ? sorted.map((m, i) => `
    <div class="cal-module" data-id="${m.id}">
      <label><input type="checkbox" data-mod-enable="${m.id}" ${m.enabled ? "checked" : ""}></label>
      <input type="text" class="cal-inline" data-mod-label="${m.id}" value="${m.label.replace(/"/g, "&quot;")}" title="Module name">
      <div class="cal-order">
        <button type="button" data-mod-up="${m.id}" ${i === 0 ? "disabled" : ""}>↑</button>
        <button type="button" data-mod-down="${m.id}" ${i === sorted.length - 1 ? "disabled" : ""}>↓</button>
        ${m.id !== "overview" ? `<button type="button" class="cal-del" data-mod-del="${m.id}" title="Remove">×</button>` : ""}
      </div>
    </div>`).join("") : `<p class="cal-empty">No modules enabled — turn one on below or add a module.</p>`;

  const modOptions = CONFIG.MODULES.map(m => `<option value="${m.id}" ${m.id === calActiveModule ? "selected" : ""}>${m.label}</option>`).join("");
  const cards = [...(CONFIG.CARDS[calActiveModule] || [])].sort((a, b) => a.order - b.order);
  const inputOptions = CONFIG.INPUTS.map(i => `<option value="${i.key}">${i.label} (${i.key})</option>`).join("");
  const cardsHtml = cards.length ? cards.map((c, i) => `
    <div class="cal-card-row">
      <input type="text" class="cal-inline" data-card-label="${c.id}" data-card-mod="${calActiveModule}" value="${c.label.replace(/"/g, "&quot;")}">
      <select data-card-input="${c.id}" data-card-mod="${calActiveModule}">
        <option value="">— builtin —</option>
        ${CONFIG.INPUTS.map(inp => `<option value="${inp.key}" ${c.inputKey === inp.key ? "selected" : ""}>${inp.key}</option>`).join("")}
      </select>
      <select data-card-viz="${c.id}" data-card-mod="${calActiveModule}">
        ${["kpi", "line", "bar", "status"].map(v => `<option value="${v}" ${(c.viz || "kpi") === v ? "selected" : ""}>${v}</option>`).join("")}
      </select>
      <div class="cal-order">
        <button type="button" data-card-up="${c.id}" data-card-mod="${calActiveModule}" ${i === 0 ? "disabled" : ""}>↑</button>
        <button type="button" data-card-down="${c.id}" data-card-mod="${calActiveModule}" ${i === cards.length - 1 ? "disabled" : ""}>↓</button>
        <button type="button" class="cal-del" data-card-del="${c.id}" data-card-mod="${calActiveModule}">×</button>
      </div>
      <input type="text" class="cal-hint" placeholder="Micro-help hint for ⓘ" data-card-hint="${c.id}" data-card-mod="${calActiveModule}" value="${(c.hint || "").replace(/"/g, "&quot;")}">
    </div>`).join("") : `<p class="cal-empty">No cards yet — add one to build this view.</p>`;

  const inputsHtml = CONFIG.INPUTS.map(inp => `
    <tr>
      <td><code>${inp.key}</code></td>
      <td><input type="text" class="cal-inline" data-input-label="${inp.key}" value="${inp.label.replace(/"/g, "&quot;")}"></td>
      <td><input type="text" data-input-excel="${inp.key}" value="${inp.sourceField}"></td>
      <td><input type="text" data-input-ss="${inp.key}" value="${inp.smartsheetField || ""}"></td>
    </tr>`).join("");

  const calHtml = CAL_FIELDS.map(f => {
    const val = getCal(f.path);
    const hint = CONFIG.CALIBRATION_HINTS[f.path] || "";
    return `
    <div class="cal-field" data-cal="${f.path}">
      <label>${f.label}${hint ? `<span class="cal-field-hint">${hint}</span>` : ""}</label>
      <input type="range" data-cal-range="${f.path}" min="${f.min}" max="${f.max}" step="${f.step}" value="${val}">
      <input type="number" data-cal-num="${f.path}" min="${f.min}" max="${f.max}" step="${f.step}" value="${val}">
    </div>`;
  }).join("");

  const conn = CONFIG.CONNECTIONS || {};
  const systems = conn.systems || [];
  const ss = conn.smartsheet || {};
  const connectionsHtml = `
    <p class="cal-section-hint">${conn.help || ""}</p>
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
        <label class="cal-mini">Sheet ID <input type="text" data-conn-sheet value="${ss.sheetId || ""}" placeholder="e.g. 4839201742081924"></label>
        <label class="cal-mini">Sync frequency
          <select data-conn-freq>
            ${["realtime", "hourly", "daily"].map(f => `<option value="${f}" ${ss.syncFrequency === f ? "selected" : ""}>${f}</option>`).join("")}
          </select>
        </label>
        <button type="button" class="cal-btn secondary" id="testConnBtn">Test connection</button>
        ` : ""}
      </div>`;
    }).join("")}`;

  const modHelp = getModule(calActiveModule)?.help || {};
  const helpFieldsHtml = `
    <details class="cal-details"><summary>Edit page help text</summary>
      <label class="cal-mini">What this is<textarea data-help-what rows="2">${modHelp.whatItIs || ""}</textarea></label>
      <label class="cal-mini">Why it's useful<textarea data-help-why rows="2">${modHelp.whyItMatters || ""}</textarea></label>
      <label class="cal-mini">What it's doing<textarea data-help-how rows="2">${modHelp.whatItsDoing || ""}</textarea></label>
      <label class="cal-mini">Data source note<textarea data-help-src rows="2">${modHelp.dataSourceNote || ""}</textarea></label>
      <button type="button" class="cal-btn" id="saveHelpBtn">Save help text</button>
    </details>`;

  calBody.innerHTML = `
    <p class="cal-persist-note">${H.persistence}</p>
    <div class="cal-actions">
      <button type="button" class="cal-btn" id="exportConfigBtn">Export configuration</button>
      <label class="cal-btn secondary" for="importConfigFile">Import configuration<input type="file" id="importConfigFile" accept=".json,application/json" hidden></label>
      <button type="button" class="cal-btn danger" id="resetConfigBtn">Reset to default</button>
    </div>

    <div class="cal-section">
      <div class="cal-section-title">Modules / tabs</div>
      <p class="cal-section-hint">${H.modules}</p>
      ${modulesHtml}
      <button type="button" class="cal-btn" id="addModuleBtn">+ Add module</button>
      <div id="addModuleForm" class="cal-form hidden">
        <input type="text" id="newModLabel" placeholder="Module name">
        <input type="text" id="newModWhat" placeholder="What this is (plain language)">
        <input type="text" id="newModWhy" placeholder="Why it's useful">
        <button type="button" id="confirmAddModule">Create module</button>
        <button type="button" class="cal-link" id="cancelAddModule">Cancel</button>
      </div>
    </div>

    <div class="cal-section">
      <div class="cal-section-title">Cards / metrics</div>
      <p class="cal-section-hint">${H.cards}</p>
      <label class="cal-mini">Module <select id="calModulePick">${modOptions}</select></label>
      ${cardsHtml}
      <button type="button" class="cal-btn" id="addCardBtn">+ Add card</button>
      <div id="addCardForm" class="cal-form hidden">
        <input type="text" id="newCardLabel" placeholder="Card label">
        <select id="newCardInput">${inputOptions}</select>
        <select id="newCardViz"><option value="kpi">KPI number</option><option value="line">Line chart</option><option value="bar">Bar chart</option></select>
        <input type="text" id="newCardHint" placeholder="Hint for ⓘ icon">
        <button type="button" id="confirmAddCard">Add card</button>
        <button type="button" class="cal-link" id="cancelAddCard">Cancel</button>
      </div>
      ${helpFieldsHtml}
    </div>

    <div class="cal-section">
      <div class="cal-section-title">Input mapping</div>
      <p class="cal-section-hint">${H.inputs}</p>
      <table class="cal-table">
        <tr><th>Key</th><th>Label</th><th>Excel field</th><th>Smartsheet field</th></tr>
        ${inputsHtml}
      </table>
      <button type="button" class="cal-btn" id="addInputBtn">+ Add input</button>
      <div id="addInputForm" class="cal-form hidden">
        <input type="text" id="newInputKey" placeholder="internal_key">
        <input type="text" id="newInputLabel" placeholder="Friendly label">
        <input type="text" id="newInputExcel" placeholder="Excel column">
        <input type="text" id="newInputSs" placeholder="Smartsheet column">
        <button type="button" id="confirmAddInput">Add input</button>
        <button type="button" class="cal-link" id="cancelAddInput">Cancel</button>
      </div>
    </div>

    <div class="cal-section">
      <div class="cal-section-title">Calibration</div>
      <p class="cal-section-hint">${H.calibration}</p>
      ${calHtml}
    </div>

    <div class="cal-section">
      <div class="cal-section-title">Connections</div>
      <p class="cal-section-hint">${H.connections}</p>
      ${connectionsHtml}
    </div>`;

  document.getElementById("testConnBtn")?.addEventListener("click", () => {
    showToast("Smartsheet connection test — coming soon. Your layout and cards are already configured.");
  });
}

function openCalPanel() {
  calPanelOpen = true;
  calActiveModule = currentTab || "overview";
  renderCalPanel();
  calPanel.classList.add("open");
  calBackdrop.classList.add("open");
}

function closeCalPanel() {
  calPanelOpen = false;
  calPanel.classList.remove("open");
  if (!document.getElementById("helpPanel")?.classList.contains("open") &&
      !document.getElementById("guidePanel")?.classList.contains("open") &&
      !document.getElementById("connectionsPanel")?.classList.contains("open")) {
    calBackdrop.classList.remove("open");
  }
}

function wireCalibrateUi() {
  document.getElementById("calibrateBtn").addEventListener("click", openCalPanel);
  document.getElementById("calClose").addEventListener("click", closeCalPanel);

  calBody.addEventListener("change", e => {
    const enable = e.target.dataset.modEnable;
    if (enable) {
      const mod = CONFIG.MODULES.find(m => m.id === enable);
      if (mod) mod.enabled = e.target.checked;
      notifyConfigChange();
      return;
    }
    if (e.target.id === "calModulePick") {
      calActiveModule = e.target.value;
      renderCalPanel();
    }
    if (e.target.dataset.cardInput) {
      const c = CONFIG.CARDS[e.target.dataset.cardMod]?.find(x => x.id === e.target.dataset.cardInput);
      if (c) c.inputKey = e.target.value;
      notifyConfigChange();
    }
    if (e.target.dataset.cardViz) {
      const c = CONFIG.CARDS[e.target.dataset.cardMod]?.find(x => x.id === e.target.dataset.cardViz);
      if (c) c.viz = e.target.value;
      notifyConfigChange();
    }
    if (e.target.hasAttribute("data-conn-freq")) {
      if (!CONFIG.CONNECTIONS.smartsheet) CONFIG.CONNECTIONS.smartsheet = {};
      CONFIG.CONNECTIONS.smartsheet.syncFrequency = e.target.value;
      notifyConfigChange();
    }
  });

  calBody.addEventListener("input", e => {
    const path = e.target.dataset.calRange || e.target.dataset.calNum;
    if (path) {
      const val = parseFloat(e.target.value);
      if (!Number.isNaN(val)) {
        setCal(path, val);
        const pair = calBody.querySelector(
          e.target.dataset.calRange ? `[data-cal-num="${path}"]` : `[data-cal-range="${path}"]`
        );
        if (pair) pair.value = val;
      }
      return;
    }
    if (e.target.dataset.modLabel) {
      const mod = CONFIG.MODULES.find(m => m.id === e.target.dataset.modLabel);
      if (mod && e.target.value.trim()) { mod.label = e.target.value.trim(); notifyConfigChange(); }
    }
    if (e.target.dataset.cardLabel) {
      const c = CONFIG.CARDS[e.target.dataset.cardMod]?.find(x => x.id === e.target.dataset.cardLabel);
      if (c) { c.label = e.target.value; notifyConfigChange(); }
    }
    if (e.target.dataset.cardHint) {
      const c = CONFIG.CARDS[e.target.dataset.cardMod]?.find(x => x.id === e.target.dataset.cardHint);
      if (c) { c.hint = e.target.value; notifyConfigChange(); }
    }
    if (e.target.dataset.inputLabel) {
      const inp = CONFIG.INPUTS.find(i => i.key === e.target.dataset.inputLabel);
      if (inp) { inp.label = e.target.value; notifyConfigChange(); }
    }
    if (e.target.dataset.inputExcel) {
      const inp = CONFIG.INPUTS.find(i => i.key === e.target.dataset.inputExcel);
      if (inp) { inp.sourceField = e.target.value; notifyConfigChange(); }
    }
    if (e.target.dataset.inputSs) {
      const inp = CONFIG.INPUTS.find(i => i.key === e.target.dataset.inputSs);
      if (inp) { inp.smartsheetField = e.target.value; notifyConfigChange(); }
    }
    if (e.target.hasAttribute("data-conn-sheet")) {
      if (!CONFIG.CONNECTIONS.smartsheet) CONFIG.CONNECTIONS.smartsheet = {};
      CONFIG.CONNECTIONS.smartsheet.sheetId = e.target.value;
      notifyConfigChange();
    }
  });

  calBody.addEventListener("click", e => {
    if (e.target.dataset.modUp) moveModule(e.target.dataset.modUp, -1);
    if (e.target.dataset.modDown) moveModule(e.target.dataset.modDown, 1);
    if (e.target.dataset.modDel && confirm("Remove this module? Its cards will be deleted.")) {
      removeModule(e.target.dataset.modDel);
      renderCalPanel();
    }
    if (e.target.dataset.cardUp) moveCard(e.target.dataset.cardMod, e.target.dataset.cardUp, -1);
    if (e.target.dataset.cardDown) moveCard(e.target.dataset.cardMod, e.target.dataset.cardDown, 1);
    if (e.target.dataset.cardDel && confirm("Remove this card?")) {
      removeCard(e.target.dataset.cardMod, e.target.dataset.cardDel);
      renderCalPanel();
    }
    if (e.target.id === "addModuleBtn") document.getElementById("addModuleForm").classList.remove("hidden");
    if (e.target.id === "cancelAddModule") document.getElementById("addModuleForm").classList.add("hidden");
    if (e.target.id === "confirmAddModule") {
      const label = document.getElementById("newModLabel").value.trim();
      if (!label) { showToast("Please enter a module name."); return; }
      addModule({
        label,
        whatItIs: document.getElementById("newModWhat").value,
        whyItMatters: document.getElementById("newModWhy").value,
      });
      document.getElementById("addModuleForm").classList.add("hidden");
      renderCalPanel();
    }
    if (e.target.id === "addCardBtn") document.getElementById("addCardForm").classList.remove("hidden");
    if (e.target.id === "cancelAddCard") document.getElementById("addCardForm").classList.add("hidden");
    if (e.target.id === "confirmAddCard") {
      const label = document.getElementById("newCardLabel").value.trim();
      if (!label) { showToast("Please enter a card label."); return; }
      addCard(calActiveModule, {
        label,
        inputKey: document.getElementById("newCardInput").value,
        viz: document.getElementById("newCardViz").value,
        hint: document.getElementById("newCardHint").value,
      });
      document.getElementById("addCardForm").classList.add("hidden");
      renderCalPanel();
    }
    if (e.target.id === "addInputBtn") document.getElementById("addInputForm").classList.remove("hidden");
    if (e.target.id === "cancelAddInput") document.getElementById("addInputForm").classList.add("hidden");
    if (e.target.id === "confirmAddInput") {
      const key = document.getElementById("newInputKey").value.trim();
      if (!key) { showToast("Internal key is required."); return; }
      if (!addInput({
        key,
        label: document.getElementById("newInputLabel").value,
        sourceField: document.getElementById("newInputExcel").value,
        smartsheetField: document.getElementById("newInputSs").value,
      })) showToast("Could not add — duplicate key?");
      else document.getElementById("addInputForm").classList.add("hidden");
      renderCalPanel();
    }
    if (e.target.id === "saveHelpBtn") {
      const mod = getModule(calActiveModule);
      if (mod) {
        mod.help = mod.help || {};
        mod.help.whatItIs = calBody.querySelector("[data-help-what]").value;
        mod.help.whyItMatters = calBody.querySelector("[data-help-why]").value;
        mod.help.whatItsDoing = calBody.querySelector("[data-help-how]").value;
        mod.help.dataSourceNote = calBody.querySelector("[data-help-src]").value;
        notifyConfigChange();
        showToast("Help text saved.");
      }
    }
    if (e.target.id === "exportConfigBtn") exportConfigFile();
    if (e.target.id === "resetConfigBtn" && confirm("Reset everything to the shipped default? Your saved changes in this browser will be cleared.")) {
      resetToDefaultConfig();
      updateIntegrationUI();
      renderCalPanel();
      showToast("Restored default configuration.");
    }
  });

  document.getElementById("importConfigFile").addEventListener("change", e => {
    const file = e.target.files?.[0];
    if (!file) return;
    importConfigFile(file, (ok, err) => {
      showToast(ok ? "Configuration imported." : (err || "Import failed."));
      if (ok) { updateIntegrationUI(); renderCalPanel(); }
      e.target.value = "";
    });
  });
}

onConfigChange(() => {
  if (typeof applyConfig === "function") applyConfig();
});
