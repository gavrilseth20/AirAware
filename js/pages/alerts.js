window.initAlertsPage = function(app) {
  const el = document.getElementById("page-alerts");
  const alerts = ANALYTICS.alerts;
  const cams = app.state.cameras;

  el.innerHTML = `
    <div style="margin-bottom:1.5rem">
      <div class="page-title">Alert Center</div>
      <div class="page-subtitle">Real-time pollution alerts · Chennai Air Quality Network</div>
    </div>

    <div class="alerts-stats-row">
      <div class="alert-stat-card" style="border-top:2px solid var(--red)">
        <div class="alert-stat-num" style="color:var(--red)">${cams.filter(c=>c.status==="HAZARDOUS").length}</div>
        <div class="alert-stat-label">Hazardous</div>
      </div>
      <div class="alert-stat-card" style="border-top:2px solid var(--amber)">
        <div class="alert-stat-num" style="color:var(--amber)">${cams.filter(c=>c.status==="UNHEALTHY").length}</div>
        <div class="alert-stat-label">Unhealthy</div>
      </div>
      <div class="alert-stat-card" style="border-top:2px solid var(--blue)">
        <div class="alert-stat-num" style="color:var(--blue)">${cams.filter(c=>c.status==="MODERATE").length}</div>
        <div class="alert-stat-label">Moderate</div>
      </div>
      <div class="alert-stat-card" style="border-top:2px solid var(--teal)">
        <div class="alert-stat-num" style="color:var(--teal)">${cams.filter(c=>c.status==="GOOD").length}</div>
        <div class="alert-stat-label">Good</div>
      </div>
    </div>

    <!-- Active alerts -->
    <div style="margin-bottom:1.5rem">
      <div style="font-family:var(--font-mono);font-size:9px;color:var(--muted);letter-spacing:3px;text-transform:uppercase;margin-bottom:10px">ACTIVE ALERTS</div>
      ${cams.filter(c=>["HAZARDOUS","UNHEALTHY"].includes(c.status)).map(c=>`
        <div class="alert-item ${c.status==='HAZARDOUS'?'critical':'warning'}" onclick="window.APP.navigate('dashboard');window.APP.selectCamera(window.APP.state.cameras.findIndex(x=>x.id==='${c.id}'))">
          <div style="display:flex;align-items:flex-start;justify-content:space-between">
            <div>
              <div class="alert-title">${c.loc} — ${c.id}</div>
              <div class="alert-body">PM2.5 reading ${c.pm} µg/m³ — ${c.status.toLowerCase()} air quality detected. Source: ${c.area} area emissions.</div>
            </div>
            <div class="alert-badge" style="background:${statusBg[c.status]};color:${statusColor[c.status]};margin-left:10px;flex-shrink:0">${c.status}</div>
          </div>
          <div class="alert-meta">
            <span class="alert-time">Since ${c.updated < 10 ? 'just now' : c.updated+'s ago'}</span>
            <span style="font-family:var(--font-mono);font-size:8px;color:var(--muted)">Click to view on map →</span>
          </div>
        </div>`).join('')}
    </div>

    <!-- Alert log table -->
    <div style="font-family:var(--font-mono);font-size:9px;color:var(--muted);letter-spacing:3px;text-transform:uppercase;margin-bottom:10px">ALERT LOG · TODAY</div>
    <div class="alerts-table">
      <div class="alerts-table-header">
        <span>ALERT ID</span><span>LOCATION</span><span>TYPE</span><span>PM2.5</span><span>TIME</span><span>DURATION</span>
      </div>
      ${alerts.map(a=>`
        <div class="alerts-table-row" onclick="window.APP.navigate('dashboard');window.APP.selectCamera(window.APP.state.cameras.findIndex(x=>x.id==='${a.cam}'))">
          <span style="font-family:var(--font-mono);font-size:10px;color:var(--muted)">${a.id}</span>
          <span style="font-size:11px">${a.loc}</span>
          <span><div class="tag" style="background:${statusBg[a.type]};color:${statusColor[a.type]}">${a.type}</div></span>
          <span style="font-family:var(--font-mono);font-weight:700;color:${pmColor(a.pm)}">${a.pm}</span>
          <span style="font-family:var(--font-mono);font-size:10px;color:var(--muted)">${a.time}</span>
          <span style="font-family:var(--font-mono);font-size:10px;color:var(--muted)">${a.duration}</span>
        </div>`).join('')}
    </div>`;
};
