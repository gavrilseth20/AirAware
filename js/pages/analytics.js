window.initAnalytics = function(app) {
  const el = document.getElementById("page-analytics");
  const cams = app.state.cameras;
  const avg = Math.round(cams.reduce((s,c)=>s+c.pm,0)/cams.length);
  const haz = cams.filter(c=>c.status==="HAZARDOUS").length;
  const good = cams.filter(c=>c.status==="GOOD").length;

  el.innerHTML = `
    <!-- KPI Cards -->
    <div class="analytics-card fade-in">
      <div class="analytics-card-title">City PM2.5 Average</div>
      <div class="analytics-big" style="color:${pmColor(avg)}">${avg}</div>
      <div class="analytics-sub">µg/m³ · Live average across all nodes</div>
      <div class="analytics-delta delta-up">↑ +8% vs yesterday</div>
    </div>
    <div class="analytics-card fade-in fade-in-delay-1">
      <div class="analytics-card-title">Hazardous Zones</div>
      <div class="analytics-big" style="color:var(--red)">${haz}</div>
      <div class="analytics-sub">cameras reporting HAZARDOUS levels</div>
      <div class="analytics-delta delta-up">↑ +2 since 08:00</div>
    </div>
    <div class="analytics-card fade-in fade-in-delay-2">
      <div class="analytics-card-title">Clean Air Zones</div>
      <div class="analytics-big" style="color:var(--teal)">${good}</div>
      <div class="analytics-sub">cameras reporting GOOD levels</div>
      <div class="analytics-delta delta-down">✓ Stable since 06:00</div>
    </div>

    <!-- Hourly trend chart - wide -->
    <div class="analytics-card wide fade-in fade-in-delay-1">
      <div class="analytics-card-title">
        24H Hourly PM2.5 Trend
        <span style="font-size:8px;color:var(--muted)">Chennai Average</span>
      </div>
      <div class="chart-wrap" style="height:140px"><canvas id="chart-hourly"></canvas></div>
    </div>

    <!-- Zone ranking -->
    <div class="analytics-card fade-in fade-in-delay-2">
      <div class="analytics-card-title">Zone Ranking</div>
      ${ANALYTICS.zones.map((z,i) => `
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:10px">
          <span style="font-family:var(--font-mono);font-size:9px;color:var(--muted);width:14px">${i+1}</span>
          <div style="flex:1">
            <div style="font-size:10px;color:var(--silver);margin-bottom:3px">${z.name}</div>
            <div style="height:3px;background:var(--bg0);border-radius:2px;overflow:hidden">
              <div style="height:100%;width:${Math.min(z.avg/350*100,100)}%;background:${pmColor(z.avg)};border-radius:2px;transition:width 1s ease"></div>
            </div>
          </div>
          <span style="font-family:var(--font-mono);font-size:10px;font-weight:700;color:${pmColor(z.avg)};width:28px;text-align:right">${z.avg}</span>
          <span style="font-family:var(--font-mono);font-size:8px;color:${z.trend.startsWith('+')?'var(--red)':'var(--green)'};width:36px">${z.trend}</span>
        </div>`).join('')}
    </div>

    <!-- Weekly bar chart - wide -->
    <div class="analytics-card wide fade-in">
      <div class="analytics-card-title">
        7-Day PM2.5 Pattern
        <span style="font-size:8px;color:var(--muted)">Average vs Peak</span>
      </div>
      <div class="chart-wrap" style="height:130px"><canvas id="chart-weekly"></canvas></div>
    </div>

    <!-- Camera breakdown -->
    <div class="analytics-card fade-in fade-in-delay-1">
      <div class="analytics-card-title">Camera Status Breakdown</div>
      <div id="status-donut" style="height:130px;display:flex;align-items:center;justify-content:center">
        <canvas id="chart-donut"></canvas>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-top:8px">
        ${["HAZARDOUS","UNHEALTHY","MODERATE","GOOD"].map(s => `
          <div style="display:flex;align-items:center;gap:6px;font-family:var(--font-mono);font-size:9px">
            <div style="width:8px;height:8px;border-radius:50%;background:${statusColor[s]}"></div>
            <span style="color:var(--muted)">${s}</span>
            <span style="color:${statusColor[s]};margin-left:auto;font-weight:700">${cams.filter(c=>c.status===s).length}</span>
          </div>`).join('')}
      </div>
    </div>

    <!-- Top polluters -->
    <div class="analytics-card full fade-in fade-in-delay-2">
      <div class="analytics-card-title">Top Polluters · Real-time Camera Ranking</div>
      <div style="display:grid;grid-template-columns:repeat(6,1fr);gap:10px">
        ${cams.sort((a,b)=>b.pm-a.pm).slice(0,6).map((c,i) => `
          <div style="background:var(--bg3);border-radius:8px;padding:10px;text-align:center;border-top:2px solid ${pmColor(c.pm)}">
            <div style="font-family:var(--font-mono);font-size:8px;color:var(--muted);margin-bottom:4px">#${i+1}</div>
            <div style="font-family:var(--font-display);font-weight:800;font-size:22px;color:${pmColor(c.pm)}">${c.pm}</div>
            <div style="font-family:var(--font-mono);font-size:8px;color:var(--muted);margin-top:3px">${c.id}</div>
            <div style="font-size:9px;color:var(--muted);margin-top:1px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${c.loc}</div>
          </div>`).join('')}
      </div>
    </div>`;

  // Hourly chart
  setTimeout(() => {
    const hCtx = document.getElementById("chart-hourly")?.getContext("2d");
    if (hCtx) new Chart(hCtx, {
      type:"line",
      data:{
        labels: ANALYTICS.hourly.map(h=>(h.hour<10?"0":"")+h.hour+":00"),
        datasets:[
          {label:"PM2.5",data:ANALYTICS.hourly.map(h=>h.pm25),borderColor:"#00FFD1",borderWidth:2,fill:true,backgroundColor:"rgba(0,255,209,0.06)",pointRadius:2,pointBackgroundColor:"#00FFD1",tension:0.4},
          {label:"PM10", data:ANALYTICS.hourly.map(h=>h.pm10),borderColor:"#FFB830",borderWidth:1.5,fill:false,pointRadius:0,tension:0.4,borderDash:[3,3]},
        ]
      },
      options:{
        responsive:true, maintainAspectRatio:false,
        plugins:{legend:{labels:{color:"#4A6580",font:{family:"JetBrains Mono",size:9},boxWidth:20}},tooltip:{backgroundColor:"#0F1A2E",borderColor:"#1A2D45",borderWidth:1,titleColor:"#C8D8E8",bodyColor:"#4A6580"}},
        scales:{
          x:{ticks:{color:"#4A6580",font:{family:"JetBrains Mono",size:8},maxRotation:0,maxTicksLimit:8},grid:{color:"rgba(26,45,69,0.5)"}},
          y:{ticks:{color:"#4A6580",font:{family:"JetBrains Mono",size:8}},grid:{color:"rgba(26,45,69,0.5)"}},
        }
      }
    });

    // Weekly
    const wCtx = document.getElementById("chart-weekly")?.getContext("2d");
    if (wCtx) new Chart(wCtx, {
      type:"bar",
      data:{
        labels:ANALYTICS.weekly.map(w=>w.day),
        datasets:[
          {label:"Average",data:ANALYTICS.weekly.map(w=>w.avg),backgroundColor:"rgba(0,255,209,0.3)",borderColor:"#00FFD1",borderWidth:1,borderRadius:4},
          {label:"Peak",data:ANALYTICS.weekly.map(w=>w.peak),backgroundColor:"rgba(255,76,106,0.2)",borderColor:"#FF4C6A",borderWidth:1,borderRadius:4},
        ]
      },
      options:{
        responsive:true, maintainAspectRatio:false,
        plugins:{legend:{labels:{color:"#4A6580",font:{family:"JetBrains Mono",size:9},boxWidth:14}},tooltip:{backgroundColor:"#0F1A2E",borderColor:"#1A2D45",borderWidth:1,titleColor:"#C8D8E8",bodyColor:"#4A6580"}},
        scales:{
          x:{ticks:{color:"#4A6580",font:{family:"JetBrains Mono",size:9}},grid:{display:false}},
          y:{ticks:{color:"#4A6580",font:{family:"JetBrains Mono",size:8}},grid:{color:"rgba(26,45,69,0.5)"}},
        }
      }
    });

    // Donut
    const dCtx = document.getElementById("chart-donut")?.getContext("2d");
    if (dCtx) new Chart(dCtx, {
      type:"doughnut",
      data:{
        labels:["HAZARDOUS","UNHEALTHY","MODERATE","GOOD"],
        datasets:[{data:[haz,cams.filter(c=>c.status==="UNHEALTHY").length,cams.filter(c=>c.status==="MODERATE").length,good],
          backgroundColor:["rgba(255,76,106,0.7)","rgba(255,184,48,0.7)","rgba(61,142,255,0.7)","rgba(0,255,209,0.7)"],
          borderColor:["#FF4C6A","#FFB830","#3D8EFF","#00FFD1"],borderWidth:1}]
      },
      options:{responsive:true, maintainAspectRatio:false, cutout:"72%",
        plugins:{legend:{display:false},tooltip:{backgroundColor:"#0F1A2E",borderColor:"#1A2D45",borderWidth:1,titleColor:"#C8D8E8",bodyColor:"#4A6580"}}}
    });
  }, 100);
};
