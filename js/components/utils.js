// Animated number counter
window.animateNumber = function(el, from, to, duration=600, color) {
  const start = performance.now();
  function step(now) {
    const p = Math.min((now - start) / duration, 1);
    const ease = 1 - Math.pow(1 - p, 3);
    el.textContent = Math.round(from + (to - from) * ease);
    if (color) el.style.color = color;
    if (p < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
};

// Toast notifications
window.showToast = function(title, msg, type="info") {
  const icons = { info:"◉", warning:"⬡", critical:"◈", success:"✦" };
  const colors = { info:"var(--blue)", warning:"var(--amber)", critical:"var(--red)", success:"var(--green)" };
  const container = document.getElementById("toast-container");
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.style.borderLeftColor = colors[type];
  toast.innerHTML = `
    <div class="toast-icon" style="color:${colors[type]}">${icons[type]}</div>
    <div>
      <div class="toast-title">${title}</div>
      <div class="toast-msg">${msg}</div>
    </div>`;
  container.appendChild(toast);
  setTimeout(() => { toast.style.animation = "toastIn 0.3s ease reverse"; setTimeout(()=>toast.remove(), 300); }, 3500);
};

// Sparkline chart
window.createSparkline = function(canvas, data, color, height=40) {
  const existing = Chart.getChart(canvas);
  if (existing) existing.destroy();
  return new Chart(canvas, {
    type: "line",
    data: {
      labels: data.map((_,i)=>i),
      datasets: [{ data, borderColor: color, borderWidth: 1.5,
        fill: true, backgroundColor: color + "18",
        pointRadius: 0, tension: 0.45 }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend:{display:false}, tooltip:{enabled:false} },
      scales: { x:{display:false}, y:{display:false, min:0} },
      animation: { duration: 500 }
    }
  });
};

// SVG gauge
window.createGauge = function(container, value, max, color, label) {
  const r=36, cx=44, cy=44, sw=7;
  const circ = 2*Math.PI*r;
  const pct = Math.min(value/max,1);
  const dashArr = circ*0.75;
  const dashOff = dashArr*(1-pct) + circ*0.125;
  container.innerHTML = `
    <svg width="88" height="66" viewBox="0 0 88 66">
      <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="var(--bg0)" stroke-width="${sw}"
        stroke-dasharray="${circ*0.75} ${circ*0.25}" stroke-dashoffset="${circ*0.125}"
        stroke-linecap="round" transform="rotate(-225 ${cx} ${cy})"/>
      <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${color}" stroke-width="${sw}"
        stroke-dasharray="${dashArr} ${circ*0.25}" stroke-dashoffset="${dashOff}"
        stroke-linecap="round" transform="rotate(-225 ${cx} ${cy})"
        style="transition:stroke-dashoffset 1s cubic-bezier(0.4,0,0.2,1)"/>
      <text x="${cx}" y="${cy-3}" text-anchor="middle" fill="${color}"
        style="font-family:var(--font-display);font-weight:800;font-size:14px">${value}</text>
      <text x="${cx}" y="${cy+11}" text-anchor="middle" fill="var(--muted)"
        style="font-family:var(--font-mono);font-size:7px;letter-spacing:1px">${label}</text>
    </svg>`;
};

// Halo SVG
window.createHalo = function(container, pm, color, clean=false) {
  const scale = clean ? 0.5 : Math.min(pm/160, 1.55);
  const col = clean ? "#FFB830" : color;
  const R = [26,19,12,4.5].map((r,i) => i<3 ? r*scale : r);
  const opF = [0.08,0.18,0.32,0.65];
  const opS = [0.18,0.35,0.6,0.95];
  const circles = R.map((r,i) =>
    `<circle cx="34" cy="28" r="${r.toFixed(1)}"
      fill="rgba(${hexRgb(col)},${opF[i]})"
      stroke="${col}" stroke-width="${i===3?1:0.5}" stroke-opacity="${opS[i]}"/>`
  ).join('');
  container.innerHTML = `
    <svg width="68" height="58" viewBox="0 0 68 58">
      ${circles}
      <line x1="34" y1="${28+R[0]+3}" x2="34" y2="58" stroke="var(--muted2)" stroke-width="1.5"/>
    </svg>`;
};

function hexRgb(hex) {
  const r=parseInt(hex.slice(1,3),16), g=parseInt(hex.slice(3,5),16), b=parseInt(hex.slice(5,7),16);
  return `${r},${g},${b}`;
}
