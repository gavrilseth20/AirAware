window.initAboutPage = function() {
  const el = document.getElementById("page-about");
  el.innerHTML = `
    <div class="about-hero">
      <div class="about-title">Air<span>Aware</span></div>
      <div style="font-family:var(--font-mono);font-size:9px;color:var(--teal);letter-spacing:3px;margin-bottom:10px">REAL-TIME AIR QUALITY INTELLIGENCE</div>
      <div class="about-tagline">
        AirAware turns existing city camera networks into a real-time, street-resolution air quality monitoring grid — using 115-year-old Mie scattering physics and a purpose-built machine learning model. No new sensors. No new infrastructure. The data was always there.
      </div>
      <div class="sdg-row" style="margin-top:16px">
        <div class="sdg-badge" style="background:rgba(0,255,209,0.12);color:var(--teal)">SDG 03 — Good Health</div>
        <div class="sdg-badge" style="background:rgba(255,184,48,0.12);color:var(--amber)">SDG 11 — Sustainable Cities</div>
        <div class="sdg-badge" style="background:rgba(61,142,255,0.12);color:var(--blue)">SDG 13 — Climate Action</div>
      </div>
    </div>

    <div class="about-card">
      <div class="about-card-icon">⬡</div>
      <div class="about-card-title">The Problem</div>
      <div class="about-card-text">India has 800 official air quality sensors for 1.4 billion people — 1 sensor per 1.75 million people. Most cities have zero street-level monitoring. Deploying dedicated sensors costs hundreds of crores. We found a better way.</div>
    </div>

    <div class="about-card">
      <div class="about-card-icon">◈</div>
      <div class="about-card-title">The Insight</div>
      <div class="about-card-text">When light passes through polluted air, the halo around a street lamp blooms wider and flatter — in mathematically precise ways described by Mie scattering (1908). Every city already has cameras pointing at street lamps. We built the AI that reads the pollution signature from those frames.</div>
    </div>

    <div class="about-card">
      <div class="about-card-icon">◉</div>
      <div class="about-card-title">How It Works</div>
      <div class="about-card-text">1. Connect to existing CCTV feeds<br>2. Extract radial halo intensity profiles from each lamp<br>3. Physics-informed CNN decodes PM2.5, PM10, NO₂<br>4. Spatiotemporal GNN fuses readings city-wide<br>5. Live dashboard updates every 60 seconds</div>
    </div>

    <div class="about-card">
      <div class="about-card-icon">✦</div>
      <div class="about-card-title">Technology Stack</div>
      <div class="about-card-text">Built on proven open-source infrastructure with real dataset sources.</div>
      <div class="tech-grid" style="margin-top:12px">
        ${["Python","PyTorch","OpenCV","YOLOv8","FastAPI","PostgreSQL","AWS Lambda","CPCB Data","ISRO MOSDAC"].map(t=>`<div class="tech-item">${t}</div>`).join('')}
      </div>
    </div>

    <div class="about-card" style="grid-column:span 2">
      <div class="about-card-title">Impact at Scale</div>
      <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin-top:8px">
        ${[["800","Current sensors in India","#FF4C6A"],["20M+","CCTV cameras available","#00FFD1"],["₹0","New hardware needed","#00FFD1"],["89%","Coverage in pilot area","#FFB830"]].map(([v,l,c])=>`
          <div style="text-align:center">
            <div style="font-family:var(--font-display);font-weight:800;font-size:32px;color:${c}">${v}</div>
            <div style="font-size:10px;color:var(--muted);margin-top:4px;line-height:1.4">${l}</div>
          </div>`).join('')}
      </div>
    </div>`;
};
