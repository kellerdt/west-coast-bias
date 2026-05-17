// wcb-charts.js — shared Chart.js infrastructure for West Coast BIAS
// Load this after Chart.js and PapaParse, before any page-level chart scripts.

// ─────────────────────────────────────────────
//  Chart.js global defaults (site font + color)
// ─────────────────────────────────────────────
Chart.defaults.font.family = "'Roboto', sans-serif";
Chart.defaults.font.size   = 12;
Chart.defaults.color       = '#444';

// ─────────────────────────────────────────────
//  Site color palette
// ─────────────────────────────────────────────
const GREEN  = { bg: 'rgba(8,90,23,0.82)',    border: '#085a17' };
const PURPLE = { bg: 'rgba(131,68,150,0.82)', border: '#834496' };

// 12-color palette spread across the full hue wheel.
// Ordered so that alphabetically adjacent teams get maximally different hues —
// index by position in a sorted team name array for consistent cross-page assignment.
const TEAM_PALETTE_BG = [
  'rgba(8,90,23,0.80)',     // dark green   (brand primary)
  'rgba(198,40,40,0.80)',   // dark red
  'rgba(21,101,192,0.80)',  // blue
  'rgba(230,81,0,0.80)',    // deep orange
  'rgba(131,68,150,0.80)',  // purple       (brand accent)
  'rgba(0,131,143,0.80)',   // teal
  'rgba(173,20,87,0.80)',   // crimson pink
  'rgba(39,174,96,0.80)',   // emerald
  'rgba(249,168,37,0.80)',  // amber
  'rgba(69,39,160,0.80)',   // deep indigo
  'rgba(121,85,72,0.80)',   // brown
  'rgba(84,110,122,0.80)',  // slate blue
];
const TEAM_PALETTE_BORDER = [
  '#085a17',  // dark green   (brand primary)
  '#C62828',  // dark red
  '#1565C0',  // blue
  '#E65100',  // deep orange
  '#834496',  // purple       (brand accent)
  '#00838F',  // teal
  '#AD1457',  // crimson pink
  '#27AE60',  // emerald
  '#F9A825',  // amber
  '#4527A0',  // deep indigo
  '#795548',  // brown
  '#546E7A',  // slate blue
];

// ─────────────────────────────────────────────
//  Chart registry
//  Keeps one Chart instance per canvas ID.
//  Always call destroyChart(id) before creating a new chart on the same canvas
//  to avoid Chart.js "canvas already in use" errors and memory leaks.
// ─────────────────────────────────────────────
const charts = {};

function destroyChart(id) {
  if (charts[id]) { charts[id].destroy(); delete charts[id]; }
}

// ─────────────────────────────────────────────
//  Data fetchers
//  Both return a Promise resolving to a plain JS array/object —
//  callers are responsible for any further normalization.
// ─────────────────────────────────────────────
function fetchJSON(path) {
  return fetch(path).then(r => {
    if (!r.ok) throw new Error(`HTTP ${r.status} — ${path}`);
    return r.json();
  });
}

function fetchCSV(path) {
  return new Promise((resolve, reject) => {
    Papa.parse(path, {
      download:       true,
      header:         true,
      dynamicTyping:  true,  // "27.55" → 27.55,  "" → null
      skipEmptyLines: true,
      complete: ({ data, errors }) => {
        if (errors.length) { reject(errors[0]); return; }
        resolve(data);
      },
      error: reject
    });
  });
}

// ─────────────────────────────────────────────
//  Pure utilities
// ─────────────────────────────────────────────

// All-play win percentage for a team row that has all_play_wins / all_play_losses fields.
function winPct(t) {
  return +(t.all_play_wins / (t.all_play_wins + t.all_play_losses) * 100).toFixed(1);
}

// ─────────────────────────────────────────────
//  Status bar helper
//  Requires a <span id="status-msg"> element on the page.
//  type: '' | 'loading' | 'ok' | 'error'
// ─────────────────────────────────────────────
function setStatus(msg, type = '') {
  const el = document.getElementById('status-msg');
  if (!el) return;
  el.textContent = msg;
  el.className   = type;
}

// ─────────────────────────────────────────────
//  Legend controls
//  Appends "Select All" and "Deselect All" buttons to containerEl.
//  chartKey must match the key used when assigning to the charts registry
//  (e.g. charts.avgAge → chartKey is 'avgAge').
//
//  Usage:
//    HTML  → <div id="my-controls"></div>  (place where buttons should appear)
//    JS    → addLegendControls('avgAge', document.getElementById('my-controls'));
// ─────────────────────────────────────────────
function addLegendControls(chartKey, containerEl) {
  if (!containerEl) return;

  const row = document.createElement('div');
  row.style.cssText = 'display:flex;gap:0.5rem;margin-bottom:1rem;';

  function makeBtn(label, visible) {
    const btn = document.createElement('button');
    btn.textContent = label;
    btn.style.cssText = 'padding:0.3rem 0.8rem;font-size:0.78rem;font-family:\'Roboto\',sans-serif;font-weight:600;border-radius:6px;cursor:pointer;border:1.5px solid #085a17;color:#085a17;background:transparent;';
    btn.addEventListener('click', () => {
      const chart = charts[chartKey];
      if (!chart) return;
      chart.data.datasets.forEach((_, i) => chart.setDatasetVisibility(i, visible));
      chart.update();
    });
    return btn;
  }

  row.appendChild(makeBtn('Select All',   true));
  row.appendChild(makeBtn('Deselect All', false));
  containerEl.appendChild(row);
}
