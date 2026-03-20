// cards.js — reusable card helpers
window.makeStatCard = function(label, value, color, delta) {
  return `<div class="analytics-card">
    <div class="analytics-card-title">${label}</div>
    <div class="analytics-big" style="color:${color}">${value}</div>
    ${delta ? `<div class="analytics-delta ${delta.startsWith('+')?'delta-up':'delta-down'}">${delta}</div>` : ''}
  </div>`;
};
