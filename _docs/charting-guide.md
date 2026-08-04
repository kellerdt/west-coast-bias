# Charting Guide — West Coast BIAS

> **Deployment note:** This `_docs/` directory is intentionally excluded from the GitHub Pages
> website. Jekyll (active by default on GitHub Pages) skips all directories whose names begin
> with `_`. If a `.nojekyll` file is ever added to the repo, move this directory or add it to
> `exclude:` in a `_config.yml` to keep it off the public web.

---

## Overview

Charts on this site use two CDN-delivered libraries with no build step required:

| Library | Version | Purpose |
|---------|---------|---------|
| [Chart.js](https://www.chartjs.org/) | 4.x | Rendering — bar, line, scatter, etc. |
| [PapaParse](https://www.papaparse.com/) | 5.x | CSV parsing (JSON is handled natively) |

All shared infrastructure lives in **`wcb-charts.js`** at the repo root. Each page that
uses charts loads the two CDN scripts, then `wcb-charts.js`, then its own inline script.

---

## Script loading order

Always load in this order — each script depends on the one before it:

```html
<!-- 1. Chart.js — must come before wcb-charts.js -->
<script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.7/dist/chart.umd.min.js"></script>

<!-- 2. PapaParse — must come before wcb-charts.js -->
<script src="https://cdn.jsdelivr.net/npm/papaparse@5.4.1/papaparse.min.js"></script>

<!-- 3. Shared infrastructure — must come before the page script -->
<script src="wcb-charts.js"></script>

<!-- 4. Page-specific chart code (inline or external) -->
<script> … </script>
```

Place all four tags just before `</body>`. This keeps chart code out of `<head>` and
ensures the DOM is ready before `DOMContentLoaded` fires.

---

## wcb-charts.js API reference

### Colors

```js
GREEN   // { bg: 'rgba(8,90,23,0.82)',    border: '#085a17' }
PURPLE  // { bg: 'rgba(131,68,150,0.82)', border: '#834496' }
```

Use these for two-dataset charts (champion vs runner-up, winner vs loser, etc.).

```js
TEAM_PALETTE_BG      // array of 12 background colors, alternating green/purple shades
TEAM_PALETTE_BORDER  // array of 12 border colors, same order
```

Index by the team's position in a **sorted** array of team names. Sorting before indexing
ensures the same team always gets the same color across pages and across data reloads.

```js
const teamNames = [...new Set(rows.map(r => r.team))].sort();
// teamNames[i] → TEAM_PALETTE_BORDER[i % TEAM_PALETTE_BORDER.length]
```

### Chart registry

```js
charts          // plain object — { [key]: Chart instance }
destroyChart(key)  // destroys and removes the instance at charts[key]
```

Always call `destroyChart(key)` before creating a new chart on the same canvas.
Chart.js throws if you call `new Chart()` on a canvas that already has an instance.

```js
destroyChart('myChart');
charts.myChart = new Chart(document.getElementById('chart-my'), { … });
```

### Data fetchers

```js
fetchJSON(path)  // → Promise<any>   — fetch + JSON.parse
fetchCSV(path)   // → Promise<Array> — PapaParse with header:true, dynamicTyping:true
```

Both reject on HTTP errors or parse errors. `dynamicTyping: true` means PapaParse
automatically converts `"27.55"` to `27.55` and empty cells to `null`.

### Utilities

```js
winPct(row)  // → number (one decimal place)
             // row must have all_play_wins and all_play_losses fields
             // returns wins / (wins + losses) * 100
```

### Status bar

```js
setStatus(msg, type)
// type: ''  (default) | 'loading' | 'ok' | 'error'
// Requires <span id="status-msg"> on the page
// Safe to call even if the element doesn't exist (no-op)
```

### Legend controls

```js
addLegendControls(chartKey, containerEl)
// Appends "Select All" and "Deselect All" buttons to containerEl.
// chartKey must match the key in the charts registry (e.g. 'avgAge').
// Safe to call before the chart is created — clicks before load are no-ops.
```

---

## Adding a chart to an existing page — step by step

### 1. Add the canvas and an optional controls placeholder to the HTML

Place this wherever the chart should appear in the page:

```html
<div style="background:white;border-radius:16px;padding:1.5rem;box-shadow:0 6px 25px rgba(0,0,0,0.1);margin:2rem 0;">
  <h3 style="font-family:'Bangers',cursive;font-size:1.4rem;color:#085a17;letter-spacing:0.5px;margin-bottom:0.2rem;">Chart Title</h3>
  <p style="font-size:0.82rem;color:#888;margin-bottom:0.85rem;line-height:1.5;">Description of what this chart shows.</p>

  <!-- omit this div if the chart has few datasets and doesn't need legend controls -->
  <div id="my-chart-controls"></div>

  <div style="position:relative;height:350px;">
    <canvas id="chart-my"></canvas>
  </div>
</div>
```

Height guidelines:
- 300–350 px — compact charts (≤ 4 datasets, vertical bar, scatter)
- 380–420 px — multi-team line charts with a right-side legend
- Adjust as needed; the chart fills the container responsively

### 2. Create a data file

JSON (recommended when the structure is nested or the field names are tool-defined):

```json
{
  "report_type": "my-report",
  "generated_at": "2026-01-01T00:00:00Z",
  "seasons": [
    { "year": 2025, "entries": [ { "team_name": "…", "some_value": 42 } ] }
  ]
}
```

CSV (good for flat tabular data):

```csv
year,team,some_value
2025,Table Smashers,42
```

Save in `data/my-report.json` (or `.csv`). Both formats work — the adapter decides
which shape the page script expects.

### 3. Write the adapter

The adapter is a pure function that takes the raw file data and returns a flat array of
plain objects. It lives in the page script, not in `wcb-charts.js`.

```js
// TODO: update once the real reporting tool format is finalized.
// Current POC format: { seasons: [{ year, entries: [{ team_name, some_value }] }] }
function adaptMyReport(raw) {
  return raw.seasons.flatMap(s =>
    s.entries.map(e => ({ year: s.year, team: e.team_name, value: e.some_value }))
  );
}
```

Mark provisional adapters with a `TODO` comment so it's clear the format may change.

### 4. Write the render function

```js
async function renderMyChart() {
  let rows;
  try {
    const raw = await fetchJSON('data/my-report.json');
    rows = adaptMyReport(raw);
  } catch (err) {
    console.error('My chart: failed to load', err);
    return; // fail silently — don't break the rest of the page
  }

  // … transform rows into Chart.js datasets …

  destroyChart('myChart');
  charts.myChart = new Chart(document.getElementById('chart-my'), {
    type: 'bar',   // or 'line', 'scatter', etc.
    data: { … },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      // … see Chart.js docs for full options …
    }
  });
}
```

### 5. Wire up in DOMContentLoaded

```js
document.addEventListener('DOMContentLoaded', () => {
  renderMyChart();

  // only if this chart has many datasets (e.g. one line per team):
  addLegendControls('myChart', document.getElementById('my-chart-controls'));
});
```

---

## Data file conventions

### team-stats (multi-year)

Fields present in both `data/team-stats.json` and `data/team-stats.csv`:

| Field | Type | Description |
|-------|------|-------------|
| `year` | number | Season year |
| `team` | string | Team name |
| `avg_age` | number \| null | Average player age; null if unavailable |
| `all_play_wins` | number | Wins in all-play format |
| `all_play_losses` | number | Losses in all-play format |
| `median_wins` | number | Median weekly head-to-head wins |
| `titles` | number | Championship titles won |

The JSON wraps the array in `{ "teams": [ … ] }`. The CSV has a header row and no wrapper.

### championships

| Field | Type | Description |
|-------|------|-------------|
| `year` | number | Season year |
| `champion` | string | Winning team name |
| `manager` | string | Winning manager |
| `champion_score` | number | Champion's final score |
| `runner_up` | string | Runner-up team name |
| `runner_up_manager` | string | Runner-up manager |
| `runner_up_score` | number | Runner-up's final score |
| `notes` | string | Footnotes (e.g. projected result) |

### average-team-age (POC — format subject to change)

Current provisional format (adapter in `League-History.html` marked TODO):

```json
{
  "report_type": "average-team-age",
  "seasons": [
    { "year": 2025, "entries": [ { "team_name": "…", "average_age": 24.66 } ] }
  ]
}
```

Teams with no age data (e.g. BoltsAnHoes) are omitted from `entries` entirely.
The chart renders only the teams present; `spanGaps: false` ensures no line is drawn
across seasons where a team is absent.

---

## Common Chart.js patterns used on this site

### Horizontal bar chart (ranked)

```js
{
  type: 'bar',
  options: { indexAxis: 'y' }   // this is what makes it horizontal
}
```

### Multi-team line chart with right legend

```js
options: {
  plugins: {
    legend: {
      position: 'right',
      labels: { boxWidth: 12, font: { size: 11 }, padding: 8 }
    }
  }
}
```

### Connecting (or not) across missing seasons

```js
spanGaps: true   // draw a line across null data points (team present entire league)
spanGaps: false  // leave a gap (team joined or left mid-league)
```

### Truncating long labels on bar charts

```js
scales: {
  x: {
    ticks: {
      callback(val) {
        const lbl = this.getLabelForValue(val);
        return lbl.length > 12 ? lbl.slice(0, 11) + '…' : lbl;
      }
    }
  }
}
```

### Graceful degradation on load failure

```js
try {
  const raw = await fetchJSON('data/foo.json');
  rows = adaptFoo(raw);
} catch (err) {
  console.error('Chart failed to load', err);
  return; // page still works, chart just isn't rendered
}
```

---

## Local development

Browsers block `fetch()` calls on `file://` URLs (CORS). You need an HTTP server:

```bash
# Python (built-in)
python -m http.server 8000

# Node (if installed)
npx serve .
```

Then open `http://localhost:8000/charts-test.html`.

**VS Code Live Server** (the Go Live button in the status bar) also works and
auto-reloads on file save.

The `charts-test.html` page is the sandbox for new chart patterns. It is not linked
from the site navigation but is deployed to the server — it's just unreachable unless
someone knows the URL.
