window.initNavbar = function(app) {
  const pages = [
    { id:"dashboard", icon:"⬡", label:"DASHBOARD" },
    { id:"analytics",  icon:"◈", label:"ANALYTICS"  },
    { id:"cameras",    icon:"◉", label:"CAMERAS"    },
    { id:"alerts",     icon:"⬤", label:"ALERTS"     },
    { id:"about",      icon:"✦", label:"ABOUT"      },
  ];

  document.getElementById("topbar").innerHTML = `
    <div id="scan-flash"></div>
    <div class="topbar-logo">Air<span>Aware</span><sup>BETA</sup></div>
    <nav class="topbar-nav" id="main-nav">
      ${pages.map(p => `
        <button class="nav-btn ${p.id==='dashboard'?'active':''}" data-page="${p.id}">
          <span class="nav-icon">${p.icon}</span>${p.label}
        </button>`).join('')}
    </nav>
    <div class="topbar-right">
      <div class="sys-stat">NODES: <b id="tb-nodes">12</b></div>
      <div class="sys-stat">SCAN: <b id="tb-scan" style="color:var(--teal)">58s</b></div>
      <div id="topbar-clock">--:--:--</div>
      <div class="live-indicator"><div class="live-dot"></div>LIVE</div>
    </div>`;

  // Nav click
  document.getElementById("main-nav").addEventListener("click", e => {
    const btn = e.target.closest(".nav-btn");
    if (!btn) return;
    const pid = btn.dataset.page;
    document.querySelectorAll(".nav-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    app.navigate(pid);
  });

  // Clock
  setInterval(() => {
    document.getElementById("topbar-clock").textContent =
      new Date().toLocaleTimeString("en-IN",{hour12:false});
  }, 1000);
};
