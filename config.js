/* ============================================================
   DONNA · configuration runtime, persistence & API
   ============================================================ */

const STORAGE_KEY = "donna-config-v1";
const CONFIG_VERSION = typeof DEFAULT_CONFIG !== "undefined" ? DEFAULT_CONFIG.configVersion : 2;

let CONFIG = deepClone(DEFAULT_CONFIG);
let _onboardingDismissed = false;
let _onConfigChange = null;
let _configReady = false;

function deepClone(o) {
  return JSON.parse(JSON.stringify(o));
}

function isValidRuntimeConfig(cfg) {
  if (!cfg || typeof cfg !== "object") return false;
  if (!Array.isArray(cfg.MODULES) || cfg.MODULES.length === 0) return false;
  if (!cfg.MODULES.some(m => m && m.enabled !== false && m.id)) return false;
  if (!Array.isArray(cfg.INPUTS) || cfg.INPUTS.length === 0) return false;
  if (!cfg.CALIBRATION || typeof cfg.CALIBRATION !== "object") return false;
  if (!cfg.LAYOUT || typeof cfg.LAYOUT !== "object") return false;
  const layout = cfg.LAYOUT.baseline || cfg.LAYOUT.excel || cfg.LAYOUT.smartsheet;
  if (!layout || !layout.kpi || !Array.isArray(layout.kpi.cards)) return false;
  return true;
}

function resetConfigToDefault(opts = {}) {
  const { persist = true, notify = false, keepOnboarding = false } = opts;
  const keepDismissed = keepOnboarding && _onboardingDismissed;
  CONFIG = deepClone(DEFAULT_CONFIG);
  migrateConfig();
  if (!keepDismissed) _onboardingDismissed = false;
  SMARTSHEET_PREVIEW = false;
  if (persist) savePersistedConfig();
  if (notify && _configReady) notifyConfigChange();
}

function deepMerge(base, patch) {
  if (!patch || typeof patch !== "object") return base;
  const out = Array.isArray(base) ? [...base] : { ...base };
  Object.keys(patch).forEach(k => {
    if (patch[k] && typeof patch[k] === "object" && !Array.isArray(patch[k]) && base[k] && typeof base[k] === "object" && !Array.isArray(base[k])) {
      out[k] = deepMerge(base[k], patch[k]);
    } else if (patch[k] !== undefined) {
      out[k] = patch[k];
    }
  });
  return out;
}

function migrateConfig() {
  if (CONFIG.configVersion !== CONFIG_VERSION) CONFIG.configVersion = CONFIG_VERSION;
  DEFAULT_CONFIG.MODULES.forEach(def => {
    const mod = CONFIG.MODULES.find(m => m.id === def.id);
    if (mod && !mod.sources) mod.sources = deepClone(def.sources);
  });
  if (!CONFIG.LAYOUT.baseline && CONFIG.LAYOUT.excel) {
    CONFIG.LAYOUT.baseline = CONFIG.LAYOUT.excel;
    delete CONFIG.LAYOUT.excel;
  }
  if (!CONFIG.CONNECTIONS?.systems && DEFAULT_CONFIG.CONNECTIONS?.systems) {
    CONFIG.CONNECTIONS = deepMerge(deepClone(DEFAULT_CONFIG.CONNECTIONS), CONFIG.CONNECTIONS || {});
  }
  if (!CONFIG.CARDS?.overview?.length && DEFAULT_CONFIG.CARDS?.overview?.length) {
    CONFIG.CARDS = deepMerge(deepClone(DEFAULT_CONFIG.CARDS), CONFIG.CARDS || {});
  }
}

function ensureValidConfig() {
  if (!isValidRuntimeConfig(CONFIG)) {
    resetConfigToDefault({ persist: true, notify: false, keepOnboarding: true });
    return false;
  }
  return true;
}

function loadPersistedConfig() {
  let saved = null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      resetConfigToDefault({ persist: false, notify: false });
      return;
    }
    saved = JSON.parse(raw);
  } catch (_) {
    resetConfigToDefault({ persist: true, notify: false });
    return;
  }

  const storedVersion = saved.configVersion;
  if (storedVersion !== CONFIG_VERSION) {
    const keepOnboarding = !!saved.onboardingDismissed;
    resetConfigToDefault({ persist: false, notify: false });
    if (keepOnboarding) _onboardingDismissed = true;
    savePersistedConfig();
    return;
  }

  try {
    if (saved.config && typeof saved.config === "object") {
      CONFIG = deepMerge(deepClone(DEFAULT_CONFIG), saved.config);
      migrateConfig();
    } else {
      resetConfigToDefault({ persist: false, notify: false });
    }

    if (!isValidRuntimeConfig(CONFIG)) {
      const keepOnboarding = !!saved.onboardingDismissed;
      resetConfigToDefault({ persist: false, notify: false });
      if (keepOnboarding) _onboardingDismissed = true;
      savePersistedConfig();
      return;
    }

    if (saved.smartsheetPreview === true) SMARTSHEET_PREVIEW = true;
    else if (saved.activeSource === "smartsheet") SMARTSHEET_PREVIEW = true;
    if (saved.onboardingDismissed) _onboardingDismissed = true;
  } catch (_) {
    resetConfigToDefault({ persist: true, notify: false });
  }
}

function savePersistedConfig() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      configVersion: CONFIG_VERSION,
      config: CONFIG,
      smartsheetPreview: SMARTSHEET_PREVIEW,
      onboardingDismissed: _onboardingDismissed,
      savedAt: new Date().toISOString(),
    }));
  } catch (_) { /* quota / private mode — degrade silently */ }
}

function resetToDefaultConfig() {
  _onboardingDismissed = false;
  SMARTSHEET_PREVIEW = false;
  CONFIG = deepClone(DEFAULT_CONFIG);
  migrateConfig();
  try { localStorage.removeItem(STORAGE_KEY); } catch (_) {}
  savePersistedConfig();
  notifyConfigChange();
}

function exportConfigFile() {
  const blob = new Blob([JSON.stringify({
    configVersion: CONFIG_VERSION,
    exportedAt: new Date().toISOString(),
    smartsheetPreview: SMARTSHEET_PREVIEW,
    config: CONFIG,
  }, null, 2)], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "donna-config.json";
  a.click();
  URL.revokeObjectURL(a.href);
}

function validateImportedConfig(data) {
  if (!data || typeof data !== "object") return false;
  const c = data.config || data;
  if (!Array.isArray(c.MODULES) || !Array.isArray(c.INPUTS)) return false;
  if (!c.CALIBRATION || !c.LAYOUT) return false;
  return isValidRuntimeConfig(c);
}

function importConfigFile(file, onDone) {
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const data = JSON.parse(reader.result);
      if (!validateImportedConfig(data)) {
        onDone(false, "Invalid configuration file — missing required sections.");
        return;
      }
      CONFIG = deepMerge(deepClone(DEFAULT_CONFIG), data.config || data);
      migrateConfig();
      if (!isValidRuntimeConfig(CONFIG)) {
        onDone(false, "Invalid configuration file — no enabled modules or missing sections.");
        return;
      }
      if (data.smartsheetPreview === true) SMARTSHEET_PREVIEW = true;
      else if (data.activeSource === "smartsheet") SMARTSHEET_PREVIEW = true;
      else if (data.smartsheetPreview === false) SMARTSHEET_PREVIEW = false;
      savePersistedConfig();
      notifyConfigChange();
      onDone(true);
    } catch (_) {
      onDone(false, "Could not read file — check it is valid JSON.");
    }
  };
  reader.readAsText(file);
}

function getModule(id) {
  return CONFIG.MODULES.find(m => m.id === id);
}

function getModuleHelp(id) {
  return getModule(id)?.help || {};
}

function getModuleCards(moduleId) {
  return (CONFIG.CARDS[moduleId] || []).filter(c => c.enabled !== false).sort((a, b) => (a.order || 0) - (b.order || 0));
}

function getCardsForLayout(section, cardIds) {
  const all = getModuleCards("overview");
  const map = Object.fromEntries(all.map(c => [c.id, c]));
  return cardIds.map(id => map[id]).filter(Boolean);
}

function cardVisibleForSource(card) {
  if (!card.sources || card.sources.includes("both")) return true;
  if (card.sources.includes("smartsheet")) return isSmartsheetPreview();
  return true;
}

function effectiveSourceStatus(source) {
  if (!source) return "live";
  if (source.name === "Smartsheet" && isSmartsheetPreview()) return "live";
  return source.status || "live";
}

function formatModuleSourcesNote(moduleId) {
  const mod = getModule(moduleId);
  const sources = mod?.sources || [];
  if (!sources.length) return "Feeds from all integrated systems connected to DONNA.";
  return sources.map(s => {
    const st = effectiveSourceStatus(s);
    const label = st === "live" ? "connected and live" : "planned — going live in ~3 months";
    return `<b>${s.name}</b> (${label})`;
  }).join("; ") + ".";
}

function slugId(label) {
  const base = (label || "module").toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "") || "module";
  let id = base, n = 1;
  while (CONFIG.MODULES.some(m => m.id === id)) { id = `${base}_${n++}`; }
  return id;
}

function validateModule(mod) {
  if (!mod.label?.trim()) return "Module name is required.";
  if (!mod.id?.trim()) return "Module id is required.";
  if (CONFIG.MODULES.filter(m => m.id === mod.id).length > 1) return "Duplicate module id.";
  return null;
}

function addModule({ label, whatItIs, whyItMatters, whatItsDoing, dataSourceNote }) {
  const id = slugId(label);
  const maxOrder = Math.max(0, ...CONFIG.MODULES.map(m => m.order || 0));
  CONFIG.MODULES.push({
    id, label: label.trim(), enabled: true, order: maxOrder + 1,
    sources: [{ name: "ServiceNow", status: "live" }],
    help: {
      whatItIs: whatItIs || "Describe what this view shows.",
      whyItMatters: whyItMatters || "Explain why this helps your team.",
      whatItsDoing: whatItsDoing || "Describe how the numbers are calculated.",
      dataSourceNote: dataSourceNote || "Link to input mappings in Calibrate.",
      inputKeys: [],
    },
  });
  CONFIG.CARDS[id] = CONFIG.CARDS[id] || [];
  notifyConfigChange();
  return id;
}

function removeModule(id) {
  if (["overview"].includes(id)) return false;
  CONFIG.MODULES = CONFIG.MODULES.filter(m => m.id !== id);
  delete CONFIG.CARDS[id];
  notifyConfigChange();
  return true;
}

function addCard(moduleId, { label, inputKey, viz, hint, section }) {
  const id = slugId(label);
  const cards = CONFIG.CARDS[moduleId] || (CONFIG.CARDS[moduleId] = []);
  const maxOrder = Math.max(-1, ...cards.map(c => c.order || 0));
  const card = {
    id, label: label.trim(), inputKey: inputKey || "", viz: viz || "kpi",
    section: section || "kpi", sources: ["both"], order: maxOrder + 1, enabled: true,
    hint: hint || "What this metric means and what good looks like.",
  };
  cards.push(card);
  const layoutKey = isSmartsheetPreview() ? "smartsheet" : "baseline";
  const layout = CONFIG.LAYOUT[layoutKey];
  if (moduleId === "overview" && layout?.kpi && section === "kpi") {
    layout.kpi.cards.push(id);
  }
  notifyConfigChange();
  return id;
}

function removeCard(moduleId, cardId) {
  const cards = CONFIG.CARDS[moduleId];
  if (!cards) return;
  CONFIG.CARDS[moduleId] = cards.filter(c => c.id !== cardId);
  Object.keys(CONFIG.LAYOUT).forEach(src => {
    ["kpi", "secondary"].forEach(sec => {
      const list = CONFIG.LAYOUT[src]?.[sec]?.cards;
      if (list) CONFIG.LAYOUT[src][sec].cards = list.filter(x => x !== cardId);
    });
  });
  notifyConfigChange();
}

function addInput({ key, label, sourceField, smartsheetField, dataPath }) {
  if (!key?.trim() || CONFIG.INPUTS.some(i => i.key === key)) return false;
  CONFIG.INPUTS.push({
    key: key.trim(), label: label?.trim() || key,
    sourceField: sourceField || key.toUpperCase(),
    smartsheetField: smartsheetField || key.toLowerCase(),
    dataPath: dataPath || key,
  });
  notifyConfigChange();
  return true;
}

function isOnboardingDismissed() { return _onboardingDismissed; }

function dismissOnboarding() {
  _onboardingDismissed = true;
  savePersistedConfig();
}

function resolveInput(key) {
  const entry = CONFIG.INPUTS.find(i => i.key === key);
  if (!entry) return undefined;
  return entry.dataPath.split(".").reduce((o, p) => o?.[p], getData());
}

function getCal(path) {
  return path.split(".").reduce((o, p) => o?.[p], CONFIG.CALIBRATION);
}

function getActiveModules() {
  return CONFIG.MODULES.filter(m => m.enabled).sort((a, b) => a.order - b.order);
}

function getSourceLayout() {
  const key = isSmartsheetPreview() ? "smartsheet" : "baseline";
  return CONFIG.LAYOUT?.[key]
    || CONFIG.LAYOUT?.baseline
    || CONFIG.LAYOUT?.excel
    || DEFAULT_CONFIG.LAYOUT.baseline;
}

function getInputFieldName(entry) {
  return entry.sourceField;
}

function onConfigChange(fn) { _onConfigChange = fn; }

function notifyConfigChange() {
  savePersistedConfig();
  if (typeof _onConfigChange === "function") _onConfigChange();
}

loadPersistedConfig();
ensureValidConfig();
_configReady = true;
