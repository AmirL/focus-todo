#!/usr/bin/env node
/**
 * Generates docs/feature-coverage-map.html from coverage data.
 * Derives feature groups from the FSD directory structure automatically.
 *
 * Usage: node scripts/generate-coverage-map.js
 * Reads: coverage/merged/lcov-report/index.html
 * Writes: docs/feature-coverage-map.html
 */

const fs = require('fs');
const path = require('path');

const COVERAGE_REPORT = path.join(__dirname, '..', 'coverage/merged/lcov-report/index.html');
const OUTPUT_FILE = path.join(__dirname, '..', 'docs/feature-coverage-map.html');

// ── Parse coverage HTML ─────────────────────────────────────────────

function parseCoverageReport(htmlPath) {
  const html = fs.readFileSync(htmlPath, 'utf8');
  const entries = [];

  // Split by <tr> and extract directory + lines covered/total from each row
  const rows = html.split('<tr>').slice(2); // skip header row
  for (const row of rows) {
    const dirMatch = row.match(/data-value="([^"]*)"><a[^>]*>([^<]*)<\/a>/);
    if (!dirMatch) continue;
    const dir = dirMatch[2].trim();

    // 4 abs columns: statements, branches, functions, lines — we want the last one
    const absMatches = [...row.matchAll(/<td data-value="(\d+)" class="abs[^"]*">(\d+)\/\1<\/td>/g)];
    if (absMatches.length >= 4) {
      const total = parseInt(absMatches[3][1]);
      const covered = parseInt(absMatches[3][2]);
      entries.push({ dir, covered, total });
    }
  }
  return entries;
}

// ── Human-readable names ────────────────────────────────────────────

const NAME_OVERRIDES = {
  'features/current-initiative': 'Daily Focus',
  'entities/current-initiative': 'Daily Focus',
  'features/tasks/actions': 'Task Actions',
  'features/tasks/add': 'Add Task',
  'features/tasks/edit': 'Edit Task',
  'features/tasks/filter': 'Task Filters',
  'features/tasks/search': 'Task Search',
  'features/tasks/reorder': 'Task Reorder',
  'features/tasks/print': 'Print Tasks',
  'features/tasks/temp-select': 'Task Temp Select',
  'features/timer': 'Timer',
  'features/timeline': 'Timeline',
  'features/goals': 'Goals',
  'features/lists': 'Lists Management',
  'features/api-keys': 'API Keys',
  '_pages/tasks-todo': 'Tasks (Today)',
  '_pages/calendar-day': 'Calendar Day',
  'app/login': 'Login',
  'app/settings': 'Settings',
  'entities/task': 'Task Entity',
  'entities/goal': 'Goal Entity',
  'entities/list': 'List Entity',
  'shared/ui/timeline': 'Timeline UI',
  'shared/ui/task': 'Task Forms',
  'shared/ui/timer': 'Timer UI',
  'shared/ui/charts': 'Charts',
  'shared/api': 'API Hooks',
};

const DESC_MAP = {
  'Tasks (Today)': 'Main task list page with filters, grouping, actions',
  'Login': 'Authentication forms, validation, test user button',
  'Calendar Day': 'Vertical day timeline with editing',
  'Settings': 'Settings page shell',
  'Task Actions': 'Star, snooze, delete, blocker, estimated time, re-add',
  'Add Task': 'Quick add form with metadata',
  'Edit Task': 'Edit dialog with all task fields',
  'Task Filters': 'Filter by list, date, starred, blocker status',
  'Task Search': 'Spotlight search with keyboard navigation',
  'Task Reorder': 'Drag and drop task reordering',
  'Print Tasks': 'Print-friendly task list generation',
  'Task Temp Select': 'Temporary task selection state',
  'Timer': 'Start/stop timer, time editing, active timer bar',
  'Timeline': 'Daily timeline view, gap filling, doughnut chart',
  'Goals': 'Add, edit, delete goals with milestones',
  'Lists Management': 'Create, edit, delete, reorder, archive lists',
  'Daily Focus': 'Balance indicator, focus banner, history, date picker',
  'API Keys': 'Create, list, revoke API keys in settings',
  'External API': 'RESTful API: /api/tasks, goals, lists, initiative, api-keys',
  'Session API': 'Internal routes: create/get/update/delete task, goal, list, timer',
  'Timeline UI': 'DayTimeline, TimelineBar: layout algorithms, overlap detection',
  'Task Forms': 'TaskFormFields, metadata selectors, date picker, duration',
  'Timer UI': 'TimerBar, TimeSpentBadge, StartTimerButton',
  'Charts': 'DoughnutChart for time distribution',
  'Generic UI': 'Radix wrappers: dialog, button, select, popover, sidebar',
  'API Hooks': 'React Query hooks for all API endpoints',
  'Utilities': 'dayjs, colors, format-duration, drizzle schema, validation, auth, db',
  'Task Entity': 'Task model, toggleCompleted, Task/TaskBadges/TaskDetails UI',
  'Goal Entity': 'Goal model + Goal UI component',
  'List Entity': 'List model',
  'Initiative Entity': 'CurrentInitiative model',
};

function dirToName(dir) {
  // Try exact match and prefix matches from longest to shortest
  const stripped = dir.replace(/^src\//, '');
  const keys = Object.keys(NAME_OVERRIDES).sort((a, b) => b.length - a.length);
  for (const key of keys) {
    if (stripped === key || stripped.startsWith(key + '/')) {
      return NAME_OVERRIDES[key];
    }
  }
  // Fallback: humanize last segment
  const parts = stripped.split('/');
  const last = parts[parts.length - 1];
  return last.replace(/[-_]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

// ── Grouping logic ──────────────────────────────────────────────────

const EXTERNAL_API_DIRS = ['tasks', 'goals', 'lists', 'initiative', 'api-keys'];
const SESSION_API_PREFIXES = [
  'create-', 'get-', 'update-', 'delete-', 'reorder-',
  'start-timer', 'stop-timer', 'current-initiative',
];

function classifyDir(dir) {
  const d = dir.replace(/^src\//, '');

  // Pages
  if (d.startsWith('_pages/')) return 'Pages';
  if (d === 'app/login' || d === 'app/settings') return 'Pages';

  // Features
  if (d.startsWith('features/')) return 'Features';

  // entities/current-initiative -> Features (Daily Focus)
  if (d.startsWith('entities/current-initiative')) return 'Features';

  // Shared UI
  if (d.startsWith('shared/ui')) return 'Shared Components';

  // Backend API
  if (d.startsWith('app/api/')) return 'Backend API';

  // Entities & Shared Lib
  if (d.startsWith('entities/')) return 'Entities & Shared Lib';
  if (d.startsWith('shared/')) return 'Entities & Shared Lib';

  // Skip top-level src and app entries
  if (d === 'src' || d === 'app') return null;

  return null;
}

function featureKey(dir) {
  const d = dir.replace(/^src\//, '');

  // Pages: group by page
  if (d.startsWith('_pages/')) {
    const page = d.split('/').slice(0, 2).join('/');
    return page;
  }
  if (d === 'app/login' || d === 'app/settings') return d;

  // Features: group by feature (2nd level under features/, or 3rd for tasks/)
  if (d.startsWith('features/tasks/')) {
    const parts = d.split('/');
    return parts.slice(0, 3).join('/');
  }
  if (d.startsWith('features/')) {
    const parts = d.split('/');
    return parts.slice(0, 2).join('/');
  }

  // entities/current-initiative -> Daily Focus (same as features/current-initiative)
  if (d.startsWith('entities/current-initiative')) return 'features/current-initiative';

  // Shared UI sub-groups
  if (d.startsWith('shared/ui/timeline')) return 'shared/ui/timeline';
  if (d.startsWith('shared/ui/task')) return 'shared/ui/task';
  if (d.startsWith('shared/ui/timer')) return 'shared/ui/timer';
  if (d.startsWith('shared/ui/charts')) return 'shared/ui/charts';
  if (d.startsWith('shared/ui')) return 'shared/ui'; // Generic UI

  // Backend API
  if (d.startsWith('app/api/')) {
    const apiDir = d.replace('app/api/', '').split('/')[0];
    if (EXTERNAL_API_DIRS.includes(apiDir)) return 'api/external';
    if (SESSION_API_PREFIXES.some(p => apiDir.startsWith(p) || apiDir === p)) return 'api/session';
    // Auth, coverage-data, etc. -> Session API by default
    return 'api/session';
  }

  // Entities
  if (d.startsWith('entities/')) {
    const entity = d.split('/').slice(0, 2).join('/');
    return entity;
  }

  // Shared lib
  if (d === 'shared/api' || d.startsWith('shared/api/')) return 'shared/api';
  if (d.startsWith('shared/lib') || d.startsWith('shared/hooks') || d.startsWith('shared/types')) return 'shared/utilities';

  return d;
}

function apiFeatureName(key) {
  if (key === 'api/external') return 'External API';
  if (key === 'api/session') return 'Session API';
  return key;
}

function sharedUiName(key) {
  if (key === 'shared/ui') return 'Generic UI';
  return dirToName('src/' + key);
}

function entitySharedName(key) {
  if (key === 'shared/api') return 'API Hooks';
  if (key === 'shared/utilities') return 'Utilities';
  return dirToName('src/' + key);
}

// ── Build tree ──────────────────────────────────────────────────────

function buildData(entries) {
  // Accumulate coverage per feature key, grouped by category
  const groups = {
    'Pages': {},
    'Features': {},
    'Shared Components': {},
    'Backend API': {},
    'Entities & Shared Lib': {},
  };

  for (const { dir, covered, total } of entries) {
    const category = classifyDir(dir);
    if (!category) continue;
    const key = featureKey(dir);

    if (!groups[category][key]) {
      groups[category][key] = { covered: 0, total: 0 };
    }
    groups[category][key].covered += covered;
    groups[category][key].total += total;
  }

  // Build tree
  function buildGroup(groupName, featureMap, nameFn) {
    const children = Object.entries(featureMap)
      .map(([key, { covered, total }]) => {
        const name = nameFn ? nameFn(key) : dirToName('src/' + key);
        return {
          name,
          lines: total,
          covered,
          desc: DESC_MAP[name] || '',
        };
      })
      .sort((a, b) => b.lines - a.lines);

    return { name: groupName, children };
  }

  return {
    name: 'Doable',
    children: [
      buildGroup('Pages', groups['Pages']),
      buildGroup('Features', groups['Features']),
      buildGroup('Shared Components', groups['Shared Components'], sharedUiName),
      buildGroup('Backend API', groups['Backend API'], apiFeatureName),
      buildGroup('Entities & Shared Lib', groups['Entities & Shared Lib'], entitySharedName),
    ].filter(g => g.children.length > 0),
  };
}

// ── HTML template ───────────────────────────────────────────────────

function generateHtml(data) {
  const dataJson = JSON.stringify(data, null, 2);
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Doable - Feature Coverage Map</title>
<script src="https://cdn.jsdelivr.net/npm/d3@7"></script>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif; background: #0f0f0f; color: #e0e0e0; }

  .header { padding: 20px 32px; display: flex; align-items: baseline; gap: 16px; }
  .header h1 { font-size: 20px; font-weight: 600; }
  .header .overall { font-size: 14px; color: #888; }
  .header .legend { margin-left: auto; display: flex; gap: 12px; font-size: 12px; color: #888; align-items: center; }
  .legend-bar { display: flex; height: 12px; width: 200px; border-radius: 3px; overflow: hidden; }
  .legend-bar span { flex: 1; }

  .controls { padding: 0 32px 12px; display: flex; gap: 12px; align-items: center; }
  .breadcrumb { font-size: 13px; color: #666; }
  .breadcrumb span { cursor: pointer; color: #888; }
  .breadcrumb span:hover { color: #bbb; }

  #chart { width: 100%; height: calc(100vh - 80px); }

  .tooltip {
    position: fixed; pointer-events: none; background: #1a1a1a; border: 1px solid #333;
    border-radius: 8px; padding: 12px 16px; font-size: 13px; line-height: 1.6;
    box-shadow: 0 8px 32px rgba(0,0,0,0.5); z-index: 100; max-width: 320px;
  }
  .tooltip .name { font-weight: 600; font-size: 14px; margin-bottom: 4px; }
  .tooltip .pct { font-size: 22px; font-weight: 700; margin-bottom: 6px; }
  .tooltip .detail { color: #888; }
  .tooltip .bar { height: 6px; background: #2a2a2a; border-radius: 3px; margin-top: 8px; overflow: hidden; }
  .tooltip .bar-fill { height: 100%; border-radius: 3px; }
</style>
</head>
<body>

<div class="header">
  <h1>Feature Coverage Map</h1>
  <span class="overall" id="overall"></span>
  <div class="legend">
    <span>0%</span>
    <div class="legend-bar">
      <span style="background:#c0392b"></span>
      <span style="background:#d35400"></span>
      <span style="background:#f39c12"></span>
      <span style="background:#27ae60"></span>
      <span style="background:#2ecc71"></span>
    </div>
    <span>100%</span>
  </div>
</div>

<div class="controls">
  <div class="breadcrumb" id="breadcrumb"></div>
</div>

<div id="chart"></div>
<div class="tooltip" id="tooltip" style="display:none"></div>

<script>
// ============================================================
// DATA: Auto-generated by scripts/generate-coverage-map.js
// Each leaf node needs: name, lines (total), covered, desc.
// Group nodes need: name, children[].
// Aggregates (pct, gap) are computed automatically.
// ============================================================
const data = ${dataJson};
// ============================================================

// Compute aggregates
function computeNode(node) {
  if (node.children) {
    node.children.forEach(computeNode);
    node.lines = node.children.reduce((s, c) => s + c.lines, 0);
    node.covered = node.children.reduce((s, c) => s + c.covered, 0);
  }
  node.pct = node.lines > 0 ? (node.covered / node.lines * 100) : 0;
  node.gap = node.lines - node.covered;
  node.value = node.lines;
}
computeNode(data);

document.getElementById('overall').textContent =
  \`\${data.pct.toFixed(1)}% lines (\${data.covered}/\${data.lines})\`;

function coverageColor(pct) {
  if (pct >= 90) return '#2ecc71';
  if (pct >= 80) return '#27ae60';
  if (pct >= 70) return '#f39c12';
  if (pct >= 55) return '#d35400';
  return '#c0392b';
}

function coverageColorDark(pct) {
  if (pct >= 90) return '#1a7a3a';
  if (pct >= 80) return '#1a6030';
  if (pct >= 70) return '#8a5a10';
  if (pct >= 55) return '#7a3000';
  return '#7a2020';
}

const tooltip = d3.select('#tooltip');
const chart = d3.select('#chart');
let currentRoot = data;

function showTooltip(event, d) {
  const node = d.data || d;
  const pct = node.pct.toFixed(1);
  const color = coverageColor(node.pct);
  tooltip.style('display', 'block')
    .html(\`
      <div class="name">\${node.name}</div>
      <div class="pct" style="color:\${color}">\${pct}%</div>
      <div class="detail">\${node.covered}/\${node.lines} lines covered</div>
      <div class="detail">\${node.gap} lines uncovered</div>
      \${node.desc ? \`<div class="detail" style="margin-top:4px;color:#aaa">\${node.desc}</div>\` : ''}
      <div class="bar"><div class="bar-fill" style="width:\${pct}%;background:\${color}"></div></div>
    \`);
}

function moveTooltip(event) {
  const x = event.clientX + 16;
  const y = event.clientY + 16;
  const rect = tooltip.node().getBoundingClientRect();
  const adjustedX = x + rect.width > window.innerWidth ? event.clientX - rect.width - 16 : x;
  const adjustedY = y + rect.height > window.innerHeight ? event.clientY - rect.height - 16 : y;
  tooltip.style('left', adjustedX + 'px').style('top', adjustedY + 'px');
}

function hideTooltip() {
  tooltip.style('display', 'none');
}

function renderTreemap(root) {
  chart.selectAll('*').remove();
  const { width, height } = chart.node().getBoundingClientRect();

  const hierarchy = d3.hierarchy(root)
    .sum(d => d.children ? 0 : d.lines)
    .sort((a, b) => b.value - a.value);

  d3.treemap()
    .size([width, height])
    .paddingOuter(4)
    .paddingTop(26)
    .paddingInner(2)
    .round(true)(hierarchy);

  const svg = chart.append('svg').attr('width', width).attr('height', height);

  const nodes = svg.selectAll('g')
    .data(hierarchy.descendants())
    .join('g')
    .attr('transform', d => \`translate(\${d.x0},\${d.y0})\`);

  // Group headers
  nodes.filter(d => d.children && d.depth > 0)
    .append('rect')
    .attr('width', d => d.x1 - d.x0)
    .attr('height', d => d.y1 - d.y0)
    .attr('rx', 4)
    .attr('fill', d => coverageColorDark(d.data.pct) + '30')
    .attr('stroke', '#333')
    .attr('stroke-width', 1);

  nodes.filter(d => d.children && d.depth > 0)
    .append('text')
    .attr('x', 6)
    .attr('y', 16)
    .text(d => {
      const w = d.x1 - d.x0;
      if (w < 80) return '';
      return \`\${d.data.name} (\${d.data.pct.toFixed(0)}%)\`;
    })
    .attr('fill', '#999')
    .attr('font-size', '11px')
    .attr('font-weight', '600');

  // Leaf nodes
  const leaves = nodes.filter(d => !d.children);

  leaves.append('rect')
    .attr('width', d => Math.max(0, d.x1 - d.x0))
    .attr('height', d => Math.max(0, d.y1 - d.y0))
    .attr('rx', 3)
    .attr('fill', d => coverageColor(d.data.pct))
    .attr('opacity', d => 0.15 + (d.data.gap / 150) * 0.7)
    .attr('stroke', d => coverageColor(d.data.pct))
    .attr('stroke-opacity', 0.4)
    .attr('stroke-width', 1)
    .style('cursor', 'pointer');

  leaves.append('text')
    .attr('x', 6)
    .attr('y', 16)
    .text(d => {
      const w = d.x1 - d.x0;
      if (w < 60) return '';
      return d.data.name;
    })
    .attr('fill', '#e0e0e0')
    .attr('font-size', d => (d.x1 - d.x0) < 100 ? '10px' : '12px')
    .attr('font-weight', '500');

  leaves.append('text')
    .attr('x', 6)
    .attr('y', 32)
    .text(d => {
      const w = d.x1 - d.x0;
      const h = d.y1 - d.y0;
      if (w < 60 || h < 40) return '';
      return \`\${d.data.pct.toFixed(0)}% (\${d.data.gap} uncovered)\`;
    })
    .attr('fill', d => coverageColor(d.data.pct))
    .attr('font-size', '11px')
    .attr('opacity', 0.9);

  leaves.on('mouseover', showTooltip)
    .on('mousemove', moveTooltip)
    .on('mouseout', hideTooltip)
    .on('click', (event, d) => {
      if (d.parent && d.parent.data.children) {
        currentRoot = d.parent.data;
        render();
        updateBreadcrumb();
      }
    });

  // Group labels clickable to zoom
  nodes.filter(d => d.children && d.depth > 0)
    .style('cursor', 'pointer')
    .on('click', (event, d) => {
      currentRoot = d.data;
      render();
      updateBreadcrumb();
    })
    .on('mouseover', showTooltip)
    .on('mousemove', moveTooltip)
    .on('mouseout', hideTooltip);
}

function updateBreadcrumb() {
  const bc = d3.select('#breadcrumb');
  const path = [];
  let node = currentRoot;
  path.unshift(node);
  function findParent(root, target) {
    if (root === target) return null;
    if (root.children) {
      for (const child of root.children) {
        if (child === target) return root;
        const found = findParent(child, target);
        if (found) return found;
      }
    }
    return null;
  }
  let parent = findParent(data, currentRoot);
  while (parent) {
    path.unshift(parent);
    parent = findParent(data, parent);
  }

  bc.html(path.map((p, i) =>
    i < path.length - 1
      ? \`<span onclick="navigateTo(this)" data-idx="\${i}">\${p.name}</span> / \`
      : \`<strong>\${p.name}</strong>\`
  ).join(''));

  window._bcPath = path;
}

window.navigateTo = function(el) {
  const idx = parseInt(el.dataset.idx);
  currentRoot = window._bcPath[idx];
  render();
  updateBreadcrumb();
};

function render() { renderTreemap(currentRoot); }

window.addEventListener('resize', () => render());
render();
updateBreadcrumb();
</script>
</body>
</html>`;
}

// ── Main ────────────────────────────────────────────────────────────

function main() {
  if (!fs.existsSync(COVERAGE_REPORT)) {
    console.error('Coverage report not found at:', COVERAGE_REPORT);
    console.error('Run "pnpm run coverage" first to generate it.');
    process.exit(1);
  }

  const entries = parseCoverageReport(COVERAGE_REPORT);
  console.log(`Parsed ${entries.length} directories from coverage report`);

  const data = buildData(entries);

  // Log summary
  for (const group of data.children) {
    const total = group.children.reduce((s, c) => s + c.lines, 0);
    const covered = group.children.reduce((s, c) => s + c.covered, 0);
    const pct = total > 0 ? (covered / total * 100).toFixed(1) : '0.0';
    console.log(`  ${group.name}: ${covered}/${total} lines (${pct}%)`);
    for (const child of group.children) {
      const cpct = child.lines > 0 ? (child.covered / child.lines * 100).toFixed(1) : '0.0';
      console.log(`    ${child.name}: ${child.covered}/${child.lines} (${cpct}%)`);
    }
  }

  const html = generateHtml(data);
  fs.writeFileSync(OUTPUT_FILE, html);
  console.log(`\nWritten to ${OUTPUT_FILE}`);
}

main();
