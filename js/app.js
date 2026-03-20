// ── MAIN APP ──────────────────────────────────────────────
const APP = {
  state: {
    cameras: window.CAMERAS.map(c=>({...c})),
    selectedCam: 0,
    currentPage: "dashboard",
    map: null,
    markers: [],
    countdown: 58,
    elapsed: 0,
    initialized: {},
  },

  init() {
    window.APP = this;

    // Build shell
    document.getElementById("app").innerHTML = `
      <div id="boot-screen">
        <div class="boot-logo">Air<span>Aware</span></div>
        <div class="boot-bar"><div class="boot-fill"></div></div>
        <div class="boot-text" id="boot-msg">INITIALISING SENSOR NETWORK...</div>
      </div>
      <div id="app-container">
        <div id="topbar"></div>
        <div id="pages">
          <div class="page active" id="page-dashboard"></div>
          <div class="page" id="page-analytics"></div>
          <div class="page" id="page-cameras"></div>
          <div class="page" id="page-alerts"></div>
          <div class="page" id="page-about"></div>
        </div>
        <div id="statusbar">
          <span>NODES: <b>12 ACTIVE</b></span>
          <span>COVERAGE: <b>89.3 km²</b></span>
          <span>MODEL: <b>Mie CNN v2.1</b></span>
          <span>STACK: <b>Python · PyTorch · OpenCV · YOLOv8</b></span>
          <span>DATA: <b>CPCB Open Data + ISRO MOSDAC</b></span>
          <span class="statusbar-right">SDG 03 · SDG 11 · SDG 13</span>
        </div>
      </div>
      <div id="toast-container"></div>`;

    // Boot sequence
    const msgs = ["LOADING CAMERA FEEDS...","CALIBRATING MIE MODEL...","CONNECTING TO CPCB API...","LOADING CHENNAI MAP...","READY."];
    let mi = 0;
    const bootInterval = setInterval(() => {
      mi++;
      const msgEl = document.getElementById("boot-msg");
      if (msgEl && msgs[mi]) msgEl.textContent = msgs[mi];
      if (mi >= msgs.length-1) clearInterval(bootInterval);
    }, 380);

    // Init after boot
    setTimeout(() => {
      initNavbar(this);
      initDashboard(this);
      initAboutPage();
      this.startLiveSim();
      this.startToasts();
    }, 2200);
  },

  navigate(page) {
    this.state.currentPage = page;
    document.querySelectorAll(".page").forEach(p=>p.classList.remove("active"));
    document.getElementById(`page-${page}`).classList.add("active");

    // Lazy init pages
    if (!this.state.initialized[page]) {
      this.state.initialized[page] = true;
      if (page === "analytics") initAnalytics(this);
      if (page === "cameras")   initCamerasPage(this);
      if (page === "alerts")    initAlertsPage(this);
    }

    // Update nav
    document.querySelectorAll(".nav-btn").forEach(b => {
      b.classList.toggle("active", b.dataset.page === page);
    });

    // Invalidate map on dashboard navigate back
    if (page === "dashboard" && this.state.map) {
      setTimeout(() => this.state.map.invalidateSize(), 100);
    }
  },

  selectCamera(idx) {
    this.state.selectedCam = idx;

    // Rebuild right panel
    if (this.state.currentPage === "dashboard") {
      const cam = this.state.cameras[idx];
      buildRightPanel(this);
      // Fly map
      if (this.state.map) this.state.map.flyTo([cam.lat, cam.lng], 14, {duration:0.9});
      // Update markers
      this.state.cameras.forEach((c,i) => {
        this.state.markers[i]?.setIcon(window.makeMarkerIconPublic(pmColor(c.pm), c.pm, i===idx));
      });
      // Update cam list
      const filt = document.querySelector(".filter-btn.active")?.dataset.filter || "ALL";
      renderCamList(this, filt);
    }
  },

  startLiveSim() {
    setInterval(() => {
      this.state.countdown--;
      this.state.elapsed++;

      // Update scan countdown in topbar
      const scanEl = document.getElementById("tb-scan");
      if (scanEl) {
        scanEl.textContent = this.state.countdown + "s";
        scanEl.style.color = this.state.countdown < 10 ? "#FF4C6A" : "#00FFD1";
      }

      if (this.state.countdown <= 0) {
        this.state.countdown = 58;
        this.state.elapsed = 0;

        // Flash topbar
        const flash = document.getElementById("scan-flash");
        if (flash) { flash.style.opacity="1"; setTimeout(()=>flash.style.opacity="0", 300); }

        // Update camera values
        this.state.cameras.forEach(c => {
          c.pm   = Math.max(4, c.pm + Math.round((Math.random()-0.46)*16));
          c.pm10 = Math.round(c.pm * 0.65);
          c.no2  = Math.round(c.pm * 0.28);
          c.so2  = Math.round(c.pm * 0.14);
          c.status = pmStatus(c.pm);
          c.trend  = makeTrend(c.pm);
          c.updated = 0;
        });

        // Update dashboard if active
        if (this.state.currentPage === "dashboard") {
          updateDashboard(this);
        }

        // Re-init other pages if they were cached
        if (this.state.initialized["analytics"]) { delete this.state.initialized["analytics"]; }
        if (this.state.initialized["cameras"])   { delete this.state.initialized["cameras"]; }
        if (this.state.initialized["alerts"])    { delete this.state.initialized["alerts"]; }

      } else {
        // Tick updated counters
        this.state.cameras.forEach(c => c.updated = (c.updated||0) + 1);
      }
    }, 1000);
  },

  startToasts() {
    // First toast after 4s
    setTimeout(() => {
      showToast("Hazardous Alert", "Anna Salai PM2.5 spike: 312 µg/m³", "critical");
    }, 4000);
    setTimeout(() => {
      showToast("Model Update", "Mie inversion model recalibrated", "success");
    }, 8000);
    setTimeout(() => {
      showToast("Manali Industrial", "Persistent HAZARDOUS reading — refinery upwind", "warning");
    }, 14000);

    // Random alerts every 25-45s
    setInterval(() => {
      const haz = this.state.cameras.filter(c=>c.status==="HAZARDOUS");
      if (haz.length > 0) {
        const c = haz[Math.floor(Math.random()*haz.length)];
        showToast(`${c.loc}`, `PM2.5: ${c.pm} µg/m³ — ${c.status}`, "critical");
      }
    }, 30000 + Math.random()*15000);
  }
};

// Make marker icon function accessible for dashboard.js
window.makeMarkerIconPublic = function(col, pm, selected=false) {
  const s = pm>200?18:pm>80?14:11;
  const ring = selected ? `<circle cx="${s+10}" cy="${s+10}" r="${s+6}" fill="none" stroke="rgba(255,255,255,0.8)" stroke-width="1.5"/>` : "";
  const total=(s+10)*2;
  const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="${total}" height="${total}" viewBox="0 0 ${total} ${total}">
    <circle cx="${s+10}" cy="${s+10}" r="${s+3}" fill="${col}" opacity="0.15"/>
    <circle cx="${s+10}" cy="${s+10}" r="${s}" fill="none" stroke="${col}" stroke-width="1.2" opacity="0.6"/>
    <circle cx="${s+10}" cy="${s+10}" r="${s*0.42}" fill="${col}"/>
    ${ring}</svg>`;
  return L.divIcon({html:svg, className:'', iconSize:[total,total], iconAnchor:[s+10,s+10]});
};

// Start
APP.init();
