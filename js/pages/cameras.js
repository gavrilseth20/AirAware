window.initCamerasPage = function(app) {
  const el = document.getElementById("page-cameras");

  function render(search="", filter="ALL") {
    const cams = app.state.cameras.filter(c => {
      const matchSearch = !search || c.id.toLowerCase().includes(search) || c.loc.toLowerCase().includes(search) || c.area.toLowerCase().includes(search);
      const matchFilter = filter==="ALL" || c.status===filter;
      return matchSearch && matchFilter;
    });

    el.innerHTML = `
      <div class="cameras-header">
        <div>
          <div class="page-title">Camera Network</div>
          <div class="page-subtitle">${cams.length} of ${app.state.cameras.length} nodes · Chennai Metro Region</div>
        </div>
        <div style="display:flex;gap:10px;align-items:center">
          <div class="filter-row" style="margin:0">
            ${["ALL","HAZARDOUS","UNHEALTHY","MODERATE","GOOD"].map(s=>`
              <button class="filter-btn cam-filter-btn ${s===filter?'active':''}" data-f="${s}"
                style="${s===filter?`background:var(--bg4);color:${s==='ALL'?'var(--teal)':statusColor[s]};border-color:${s==='ALL'?'var(--teal3)':statusColor[s]}33`:''}"
              >${s==="ALL"?"ALL":s.slice(0,3)}</button>`).join('')}
          </div>
          <div class="search-bar">
            <span style="color:var(--muted);font-size:12px">⌕</span>
            <input id="cam-search" type="text" placeholder="Search ID, location..." value="${search}"/>
          </div>
        </div>
      </div>
      <div class="cameras-grid">
        ${cams.map(c => {
          const col = pmColor(c.pm);
          return `
            <div class="cam-card" data-cam-id="${c.id}" style="border-top-color:${col}" onclick="window.APP.navigate('dashboard');window.APP.selectCamera(window.APP.state.cameras.findIndex(x=>x.id==='${c.id}'))">
              <div style="position:absolute;top:0;left:0;right:0;height:2px;background:${col}"></div>
              <div class="cam-card-header">
                <div>
                  <div class="cam-card-id">${c.id}</div>
                  <div class="cam-card-loc">${c.loc} · ${c.area}</div>
                </div>
                <div class="cam-card-status" style="background:${statusBg[c.status]};color:${statusColor[c.status]}">${c.status}</div>
              </div>
              <div class="cam-card-pm" style="color:${col}">${c.pm}</div>
              <div class="cam-card-unit">µg/m³ PM2.5</div>
              <div class="cam-card-bars">
                ${[["PM10",c.pm10,300,"#FFB830"],["NO₂",c.no2,200,"#3D8EFF"],["SO₂",c.so2,100,"#9B7FFF"]].map(([n,v,m,bc])=>`
                  <div class="mini-bar-row">
                    <span class="mini-bar-label">${n}</span>
                    <div class="mini-bar-track"><div class="mini-bar-fill" style="width:${Math.min(v/m*100,100)}%;background:${bc}"></div></div>
                    <span class="mini-bar-val" style="color:${bc}">${v}</span>
                  </div>`).join('')}
              </div>
              <div class="cam-card-footer">
                <span class="cam-card-uptime">Uptime: <b style="color:var(--teal)">${c.uptime}%</b></span>
                <span class="cam-card-updated">Updated ${c.updated}s ago</span>
              </div>
            </div>`}).join('')}
      </div>`;

    document.getElementById("cam-search")?.addEventListener("input", e => render(e.target.value.toLowerCase(), filter));
    el.querySelectorAll(".cam-filter-btn").forEach(btn => {
      btn.addEventListener("click", () => render(document.getElementById("cam-search")?.value||"", btn.dataset.f));
    });
  }

  render();
};
