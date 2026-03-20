window.initDashboard = function(app) {
  const el = document.getElementById("page-dashboard");
  el.innerHTML = `
    <div class="dash-left" id="dash-left"></div>
    <div class="dash-map" id="dash-map">
      <div class="map-scanline"></div>
      <div class="map-corner tl"><svg width="20" height="20"><path d="M0 20 L0 0 L20 0" fill="none" stroke="rgba(0,255,209,0.45)" stroke-width="1.5"/></svg></div>
      <div class="map-corner tr"><svg width="20" height="20"><path d="M20 20 L20 0 L0 0" fill="none" stroke="rgba(0,255,209,0.45)" stroke-width="1.5"/></svg></div>
      <div class="map-corner bl"><svg width="20" height="20"><path d="M0 0 L0 20 L20 20" fill="none" stroke="rgba(0,255,209,0.45)" stroke-width="1.5"/></svg></div>
      <div class="map-corner br"><svg width="20" height="20"><path d="M20 0 L20 20 L0 20" fill="none" stroke="rgba(0,255,209,0.45)" stroke-width="1.5"/></svg></div>
      <div id="leaflet-map" style="width:100%;height:100%;"></div>
      <div class="map-bottom-bar" id="map-stats"></div>
    </div>
    <div class="dash-right" id="dash-right"></div>`;

  buildLeftPanel(app);
  buildRightPanel(app);
  initMap(app);
  updateMapStats(app);
};

function buildLeftPanel(app) {
  const el = document.getElementById("dash-left");
  const cams = app.state.cameras;
  const avg = Math.round(cams.reduce((s,c)=>s+c.pm,0)/cams.length);
  const col = pmColor(avg);
  const status = pmStatus(avg);

  el.innerHTML = `
    <div class="panel-section">
      <div class="section-label">City AQI · Live</div>
      <div class="aqi-display">
        <div class="aqi-num" id="dash-aqi" style="color:${col}">${avg}</div>
        <div class="aqi-label">PM2.5 µg/m³ · Chennai Average</div>
        <div class="aqi-status-badge" id="dash-status" style="background:${statusBg[status]};color:${statusColor[status]}">
          ⬤ ${status}
        </div>
      </div>
    </div>

    <div class="panel-section">
      <div class="section-label">Pollutant Overview</div>
      <div id="dash-gauges" class="gauges-row"></div>
    </div>

    <div class="panel-section">
      <div class="section-label">PM2.5 by Camera</div>
      <div id="dash-poll-bars"></div>
    </div>

    <div class="panel-section" style="flex:1;overflow-y:auto;border-bottom:none">
      <div class="section-label">Camera Nodes</div>
      <div class="filter-row" id="dash-filters">
        ${["ALL","HAZARDOUS","UNHEALTHY","MODERATE","GOOD"].map(s=>`
          <button class="filter-btn ${s==='ALL'?'active':''}" data-filter="${s}"
            style="${s==='ALL'?'background:var(--bg4);color:var(--teal);border-color:var(--teal3)':''}"
          >${s==="ALL"?"ALL":s.slice(0,3)}</button>`).join('')}
      </div>
      <div id="dash-cam-list"></div>
    </div>`;

  // Gauges
  const gData = [
    [Math.round(cams.reduce((s,c)=>s+c.pm10,0)/cams.length), 300, "#FFB830","PM10"],
    [Math.round(cams.reduce((s,c)=>s+c.no2,0)/cams.length),  200, "#3D8EFF", "NO₂"],
    [Math.round(cams.reduce((s,c)=>s+c.so2,0)/cams.length),  100, "#9B7FFF", "SO₂"],
  ];
  const gaugeEl = document.getElementById("dash-gauges");
  gData.forEach(([v,m,c,l]) => {
    const d = document.createElement("div");
    d.className = "gauge-wrap";
    createGauge(d, v, m, c, l);
    gaugeEl.appendChild(d);
  });

  // Poll bars
  renderPollBars(cams);

  // Cam list
  renderCamList(app, "ALL");

  // Filter buttons
  document.getElementById("dash-filters").addEventListener("click", e => {
    const btn = e.target.closest(".filter-btn");
    if (!btn) return;
    document.querySelectorAll(".filter-btn").forEach(b => {
      b.classList.remove("active");
      b.style.background=""; b.style.color=""; b.style.borderColor="";
    });
    btn.classList.add("active");
    btn.style.background="var(--bg4)"; btn.style.color="var(--teal)"; btn.style.borderColor="var(--teal3)";
    renderCamList(app, btn.dataset.filter);
  });
}

function renderPollBars(cams) {
  const el = document.getElementById("dash-poll-bars");
  if (!el) return;
  const avg = Math.round(cams.reduce((s,c)=>s+c.pm,0)/cams.length);
  const col = pmColor(avg);
  const bars = [
    ["PM2.5", avg, 400, col],
    ["PM10",  Math.round(cams.reduce((s,c)=>s+c.pm10,0)/cams.length), 300, "#FFB830"],
    ["NO₂",   Math.round(cams.reduce((s,c)=>s+c.no2,0)/cams.length),  200, "#3D8EFF"],
    ["SO₂",   Math.round(cams.reduce((s,c)=>s+c.so2,0)/cams.length),  100, "#9B7FFF"],
  ];
  el.innerHTML = bars.map(([n,v,m,c]) => `
    <div class="poll-row">
      <span class="poll-name">${n}</span>
      <div class="poll-track"><div class="poll-fill" style="width:${Math.min(v/m*100,100)}%;background:${c}"></div></div>
      <span class="poll-val" style="color:${c}">${v}</span>
    </div>`).join('');
}

function renderCamList(app, filter) {
  const el = document.getElementById("dash-cam-list");
  if (!el) return;
  const cams = filter === "ALL" ? app.state.cameras : app.state.cameras.filter(c=>c.status===filter);
  el.innerHTML = cams.map((c,i) => {
    const fi = app.state.cameras.indexOf(c);
    const active = fi === app.state.selectedCam;
    const col = pmColor(c.pm);
    return `
      <div class="cam-item ${active?'selected':''}" data-cam="${fi}" style="${active?'border-color:rgba(0,255,209,0.3)':''}">
        <div class="cam-dot" style="background:${col};${active?`box-shadow:0 0 8px ${col}`:''}"></div>
        <div class="cam-info">
          <div class="cam-id">${c.id}</div>
          <div class="cam-loc">${c.loc}</div>
        </div>
        <div class="cam-pm" style="color:${col}">${c.pm}</div>
      </div>`;
  }).join('');

  el.addEventListener("click", e => {
    const item = e.target.closest(".cam-item");
    if (!item) return;
    app.selectCamera(parseInt(item.dataset.cam));
  });
}

function buildRightPanel(app) {
  const el = document.getElementById("dash-right");
  const cam = app.state.cameras[app.state.selectedCam];
  const col = pmColor(cam.pm);

  el.innerHTML = `
    <div class="sel-header">
      <div class="sel-id">${cam.id}</div>
      <div class="sel-loc">${cam.loc} · ${cam.area}</div>
      <div class="sel-pm" id="sel-pm-val" style="color:${col}">${cam.pm}</div>
      <div class="sel-unit">µg/m³ PM2.5</div>
      <div class="aqi-status-badge" id="sel-status" style="background:${statusBg[cam.status]};color:${statusColor[cam.status]}">
        ⬤ ${cam.status}
      </div>
    </div>

    <div class="tabs-row">
      <button class="tab-btn active" data-tab="overview">OVERVIEW</button>
      <button class="tab-btn" data-tab="halo">HALO</button>
      <button class="tab-btn" data-tab="trend">TREND</button>
      <button class="tab-btn" data-tab="info">INFO</button>
    </div>

    <div id="tab-overview" class="tab-content active panel-section">
      <div class="section-label">Pollutants</div>
      ${[["PM2.5",cam.pm,400,pmColor(cam.pm)],["PM10",cam.pm10,300,"#FFB830"],["NO₂",cam.no2,200,"#3D8EFF"],["SO₂",cam.so2,100,"#9B7FFF"]].map(([n,v,m,c])=>`
        <div class="poll-row">
          <span class="poll-name">${n}</span>
          <div class="poll-track"><div class="poll-fill" style="width:${Math.min(v/m*100,100)}%;background:${c}"></div></div>
          <span class="poll-val" style="color:${c}">${v}</span>
        </div>`).join('')}
      <div class="section-label" style="margin-top:12px">Model Confidence</div>
      ${[["PM2.5",91,"#00FFD1"],["PM10",84,"#FFB830"],["NO₂",77,"#3D8EFF"]].map(([n,v,c])=>`
        <div class="conf-row">
          <span class="conf-label">${n}</span>
          <div class="conf-track"><div class="conf-fill" style="width:${v}%;background:${c}"></div></div>
          <span class="conf-pct" style="color:${c}">${v}%</span>
        </div>`).join('')}
    </div>

    <div id="tab-halo" class="tab-content panel-section">
      <div class="section-label">Scattering Signature</div>
      <div class="halo-compare">
        <div class="halo-item">
          <div id="halo-clean"></div>
          <div class="halo-label" style="color:var(--teal)">CLEAN</div>
        </div>
        <div class="halo-arrow">→</div>
        <div class="halo-item">
          <div id="halo-dirty"></div>
          <div class="halo-label" id="halo-dirty-lbl" style="color:${col}">POLLUTED</div>
        </div>
      </div>
      <div class="halo-desc">Width ∝ PM2.5 · <span>Mie scattering inversion</span></div>
      <div style="margin-top:12px;background:var(--bg3);border-radius:8px;padding:10px;font-family:var(--font-mono);font-size:9px;color:var(--muted);line-height:1.7">
        Particulate matter causes the lamp halo to bloom wider at larger angles. Angular intensity profile decoded via Mie scattering equations → PM₂.₅ concentration estimate.
      </div>
    </div>

    <div id="tab-trend" class="tab-content panel-section">
      <div class="section-label">24H PM2.5 Trend</div>
      <div class="chart-wrap" style="height:80px;margin-bottom:4px">
        <canvas id="trend-canvas"></canvas>
      </div>
      <div style="display:flex;justify-content:space-between;font-family:var(--font-mono);font-size:8px;color:var(--muted);margin-bottom:12px">
        <span>00:00</span><span>12:00</span><span>23:00</span>
      </div>
      <div class="trend-stats">
        <div class="trend-stat"><div class="trend-stat-label">PEAK</div><div class="trend-stat-val" id="ts-peak" style="color:var(--red)">--</div></div>
        <div class="trend-stat"><div class="trend-stat-label">MIN</div><div class="trend-stat-val" id="ts-min" style="color:var(--teal)">--</div></div>
        <div class="trend-stat"><div class="trend-stat-label">CURRENT</div><div class="trend-stat-val" id="ts-now" style="color:${col}">--</div></div>
        <div class="trend-stat"><div class="trend-stat-label">24H AVG</div><div class="trend-stat-val" id="ts-avg" style="color:var(--amber)">--</div></div>
      </div>
    </div>

    <div id="tab-info" class="tab-content panel-section">
      <div class="section-label">Camera Details</div>
      ${[["Camera ID",cam.id],["Location",cam.loc],["Area",cam.area],["Coordinates",`${cam.lat.toFixed(4)}, ${cam.lng.toFixed(4)}`],["Uptime",cam.uptime+"%"],["Last update",cam.updated+"s ago"],["Model","Mie CNN v2.1"],["Framework","PyTorch 2.1"],["Dataset","CPCB + MOSDAC"]].map(([k,v])=>`
        <div style="display:flex;justify-content:space-between;padding:5px 0;border-bottom:1px solid var(--border);font-size:10px">
          <span style="color:var(--muted);font-family:var(--font-mono);font-size:9px">${k}</span>
          <span style="color:var(--silver)">${v}</span>
        </div>`).join('')}
    </div>`;

  // Tabs
  el.querySelectorAll(".tab-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      el.querySelectorAll(".tab-btn").forEach(b=>b.classList.remove("active"));
      el.querySelectorAll(".tab-content").forEach(t=>t.classList.remove("active"));
      btn.classList.add("active");
      document.getElementById(`tab-${btn.dataset.tab}`).classList.add("active");
      if (btn.dataset.tab === "trend") renderTrend(app);
      if (btn.dataset.tab === "halo") renderHalos(app);
    });
  });

  renderHalos(app);
  renderTrend(app);
}

function renderHalos(app) {
  const cam = app.state.cameras[app.state.selectedCam];
  const cleanEl = document.getElementById("halo-clean");
  const dirtyEl = document.getElementById("halo-dirty");
  if (cleanEl) createHalo(cleanEl, cam.pm, pmColor(cam.pm), true);
  if (dirtyEl) createHalo(dirtyEl, cam.pm, pmColor(cam.pm), false);
}

function renderTrend(app) {
  const cam = app.state.cameras[app.state.selectedCam];
  const canvas = document.getElementById("trend-canvas");
  if (!canvas) return;
  const col = pmColor(cam.pm);
  createSparkline(canvas, cam.trend, col, 80);
  const peak = Math.max(...cam.trend), min = Math.min(...cam.trend);
  const avg = Math.round(cam.trend.reduce((a,b)=>a+b)/cam.trend.length);
  const set = (id,v) => { const e=document.getElementById(id); if(e) e.textContent=v; };
  set("ts-peak",peak); set("ts-min",min); set("ts-now",cam.pm); set("ts-avg",avg);
}

function initMap(app) {
  const map = L.map("leaflet-map", {
    center:[13.0827,80.2707], zoom:12, zoomControl:true, attributionControl:false
  });
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",{maxZoom:18}).addTo(map);

  // Pollution halos
  const halos = [
    {lat:13.0604,lng:80.2496,r:900, col:"#FF4C6A",op:0.18},
    {lat:13.1656,lng:80.2589,r:1300,col:"#FF4C6A",op:0.22},
    {lat:13.1148,lng:80.2393,r:700, col:"#FF4C6A",op:0.15},
    {lat:13.1143,lng:80.1548,r:1000,col:"#FFB830",op:0.13},
    {lat:13.0067,lng:80.2206,r:700, col:"#FF4C6A",op:0.14},
    {lat:13.0012,lng:80.2565,r:550, col:"#FFB830",op:0.11},
    {lat:13.0359,lng:80.1574,r:500, col:"#3D8EFF",op:0.10},
  ];
  halos.forEach(h => L.circle([h.lat,h.lng],{radius:h.r,color:h.col,fillColor:h.col,fillOpacity:h.op,weight:0.5,opacity:0.35}).addTo(map));

  // Markers
  app.state.markers = [];
  app.state.cameras.forEach((c,i) => {
    const mk = L.marker([c.lat,c.lng], {icon: makeMarkerIcon(pmColor(c.pm), c.pm, i===app.state.selectedCam)}).addTo(map);
    mk.bindPopup(makePopup(c));
    mk.on("click", () => { app.selectCamera(i); map.flyTo([c.lat,c.lng],14,{duration:0.9}); });
    app.state.markers.push(mk);
  });
  app.state.map = map;
}

function makeMarkerIcon(col, pm, selected=false) {
  const s = pm>200?18:pm>80?14:11;
  const ring = selected ? `<circle cx="${s+10}" cy="${s+10}" r="${s+6}" fill="none" stroke="rgba(255,255,255,0.8)" stroke-width="1.5"/>
    <circle cx="${s+10}" cy="${s+10}" r="${s+11}" fill="none" stroke="rgba(255,255,255,0.25)" stroke-width="0.8"/>` : "";
  const total = (s+10)*2;
  const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="${total}" height="${total}" viewBox="0 0 ${total} ${total}">
    <circle cx="${s+10}" cy="${s+10}" r="${s+3}" fill="${col}" opacity="0.15"/>
    <circle cx="${s+10}" cy="${s+10}" r="${s}" fill="none" stroke="${col}" stroke-width="1.2" opacity="0.6"/>
    <circle cx="${s+10}" cy="${s+10}" r="${s*0.42}" fill="${col}"/>
    ${ring}</svg>`;
  return L.divIcon({html:svg, className:'', iconSize:[total,total], iconAnchor:[s+10,s+10]});
}

function makePopup(c) {
  const col = pmColor(c.pm);
  return `<div style="font-family:var(--font-display);font-weight:700;font-size:13px;color:white">${c.id}</div>
    <div style="font-family:var(--font-mono);font-size:9px;color:var(--muted)">${c.loc}, Chennai</div>
    <div style="font-size:18px;font-weight:800;color:${col};font-family:var(--font-display);margin:4px 0">${c.pm} <span style="font-size:10px;font-weight:400;color:var(--muted)">µg/m³</span></div>
    <div style="font-family:var(--font-mono);font-size:9px;font-weight:700;color:${col}">⬤ ${c.status}</div>`;
}

function updateMapStats(app) {
  const el = document.getElementById("map-stats");
  if (!el) return;
  const cams = app.state.cameras;
  const haz = cams.filter(c=>c.status==="HAZARDOUS").length;
  const good = cams.filter(c=>c.status==="GOOD").length;
  el.innerHTML = [
    ["NODES", `${cams.length}/12`, "#00FFD1"],
    ["COVERAGE", "89.3 km²", "#C8D8E8"],
    ["LATENCY", "1.2s", "#C8D8E8"],
    ["HAZARDOUS", haz, "#FF4C6A"],
    ["MODERATE", cams.filter(c=>c.status==="MODERATE").length, "#3D8EFF"],
    ["GOOD", good, "#00FFD1"],
  ].map(([l,v,c]) => `
    <div class="map-stat">
      <div class="map-stat-label">${l}</div>
      <div class="map-stat-val" style="color:${c}">${v}</div>
    </div>`).join('');
}

window.updateDashboard = function(app) {
  const cams = app.state.cameras;
  const avg = Math.round(cams.reduce((s,c)=>s+c.pm,0)/cams.length);
  const col = pmColor(avg);
  const status = pmStatus(avg);

  // AQI num
  const aqiEl = document.getElementById("dash-aqi");
  if (aqiEl) { animateNumber(aqiEl, parseInt(aqiEl.textContent)||avg, avg, 600, col); }

  // Status badge
  const stEl = document.getElementById("dash-status");
  if (stEl) { stEl.textContent="⬤ "+status; stEl.style.color=statusColor[status]; stEl.style.background=statusBg[status]; }

  // Poll bars
  renderPollBars(cams);

  // Cam list (keep current filter)
  const activeFilt = document.querySelector(".filter-btn.active");
  const filt = activeFilt ? activeFilt.dataset.filter : "ALL";
  renderCamList(app, filt);

  // Gauges
  const gData = [
    [Math.round(cams.reduce((s,c)=>s+c.pm10,0)/cams.length), 300, "#FFB830","PM10"],
    [Math.round(cams.reduce((s,c)=>s+c.no2,0)/cams.length),  200, "#3D8EFF", "NO₂"],
    [Math.round(cams.reduce((s,c)=>s+c.so2,0)/cams.length),  100, "#9B7FFF", "SO₂"],
  ];
  const gaugeEl = document.getElementById("dash-gauges");
  if (gaugeEl) {
    gaugeEl.innerHTML = "";
    gData.forEach(([v,m,c,l]) => { const d=document.createElement("div"); d.className="gauge-wrap"; createGauge(d,v,m,c,l); gaugeEl.appendChild(d); });
  }

  // Markers
  cams.forEach((c,i) => {
    app.state.markers[i]?.setIcon(makeMarkerIcon(pmColor(c.pm), c.pm, i===app.state.selectedCam));
    app.state.markers[i]?.setPopupContent(makePopup(c));
  });

  // Selected cam in right panel
  const cam = cams[app.state.selectedCam];
  const pmEl = document.getElementById("sel-pm-val");
  if (pmEl) animateNumber(pmEl, parseInt(pmEl.textContent)||cam.pm, cam.pm, 600, pmColor(cam.pm));

  updateMapStats(app);
};

window.updateSelectedCamera = function(app) {
  buildRightPanel(app);
  renderCamList(app, document.querySelector(".filter-btn.active")?.dataset.filter || "ALL");
  cams.forEach((c,i) => app.state.markers[i]?.setIcon(makeMarkerIcon(pmColor(c.pm),c.pm,i===app.state.selectedCam)));
  if (app.state.map) app.state.map.flyTo([app.state.cameras[app.state.selectedCam].lat,app.state.cameras[app.state.selectedCam].lng],14,{duration:0.9});
};
