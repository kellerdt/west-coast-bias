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

// 12-slot alternating green/purple palette — index by sorted team name position
// so the same team always gets the same color across pages and reloads.
const TEAM_PALETTE_BG = [
  'rgba(8,90,23,0.80)',    'rgba(131,68,150,0.80)',
  'rgba(15,107,31,0.80)',  'rgba(157,90,181,0.80)',
  'rgba(26,138,46,0.80)',  'rgba(100,40,120,0.80)',
  'rgba(45,170,70,0.80)',  'rgba(180,100,200,0.80)',
  'rgba(3,60,10,0.80)',    'rgba(70,20,90,0.80)',
  'rgba(60,200,90,0.80)',  'rgba(200,130,220,0.80)',
];
const TEAM_PALETTE_BORDER = [
  '#085a17', '#834496', '#0f6b1f', '#9d5ab5',
  '#1a8a2e', '#641478', '#2daa46', '#b464c8',
  '#03200a', '#46145a', '#3cc85a', '#c882dc',
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
