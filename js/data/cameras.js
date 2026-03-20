window.CAMERAS = [
  { id:"CAM_042", loc:"Anna Salai",          area:"Central",    lat:13.0604, lng:80.2496, pm:312, pm10:198, no2:89, so2:44, status:"HAZARDOUS", uptime:99.1, updated:2 },
  { id:"CAM_156", loc:"Manali Industrial",   area:"North",      lat:13.1656, lng:80.2589, pm:298, pm10:187, no2:76, so2:61, status:"HAZARDOUS", uptime:98.7, updated:3 },
  { id:"CAM_055", loc:"Perambur",            area:"North",      lat:13.1148, lng:80.2393, pm:211, pm10:142, no2:68, so2:32, status:"HAZARDOUS", uptime:99.4, updated:1 },
  { id:"CAM_033", loc:"Ambattur Industrial", area:"West",       lat:13.1143, lng:80.1548, pm:187, pm10:128, no2:54, so2:29, status:"UNHEALTHY", uptime:97.8, updated:5 },
  { id:"CAM_089", loc:"Adyar Bridge",        area:"South",      lat:13.0012, lng:80.2565, pm:142, pm10:98,  no2:41, so2:18, status:"UNHEALTHY", uptime:99.9, updated:2 },
  { id:"CAM_022", loc:"Guindy",              area:"South-West", lat:13.0067, lng:80.2206, pm:198, pm10:134, no2:62, so2:27, status:"UNHEALTHY", uptime:99.2, updated:4 },
  { id:"CAM_078", loc:"Porur",               area:"West",       lat:13.0359, lng:80.1574, pm:89,  pm10:61,  no2:28, so2:12, status:"MODERATE",  uptime:98.5, updated:6 },
  { id:"CAM_071", loc:"Velachery",           area:"South",      lat:12.9750, lng:80.2209, pm:67,  pm10:44,  no2:22, so2:9,  status:"MODERATE",  uptime:99.7, updated:3 },
  { id:"CAM_017", loc:"T. Nagar",            area:"Central",    lat:13.0418, lng:80.2341, pm:23,  pm10:16,  no2:8,  so2:3,  status:"GOOD",      uptime:99.8, updated:1 },
  { id:"CAM_003", loc:"Mylapore",            area:"Central",    lat:13.0336, lng:80.2691, pm:18,  pm10:12,  no2:6,  so2:2,  status:"GOOD",      uptime:100,  updated:2 },
  { id:"CAM_114", loc:"OMR Sholinganallur",  area:"South-East", lat:12.9010, lng:80.2279, pm:44,  pm10:28,  no2:14, so2:5,  status:"GOOD",      uptime:99.5, updated:4 },
  { id:"CAM_099", loc:"Besant Nagar",        area:"South-East", lat:12.9991, lng:80.2707, pm:31,  pm10:20,  no2:10, so2:4,  status:"GOOD",      uptime:99.6, updated:3 },
];

window.pmColor = function(pm) {
  if (pm > 200) return "#FF4C6A";
  if (pm > 100) return "#FFB830";
  if (pm > 55)  return "#3D8EFF";
  return "#00FFD1";
};

window.pmStatus = function(pm) {
  if (pm > 200) return "HAZARDOUS";
  if (pm > 100) return "UNHEALTHY";
  if (pm > 55)  return "MODERATE";
  return "GOOD";
};

window.statusColor = {
  HAZARDOUS: "#FF4C6A", UNHEALTHY: "#FFB830", MODERATE: "#3D8EFF", GOOD: "#00FFD1"
};

window.statusBg = {
  HAZARDOUS: "rgba(255,76,106,0.12)", UNHEALTHY: "rgba(255,184,48,0.12)",
  MODERATE: "rgba(61,142,255,0.12)", GOOD: "rgba(0,255,209,0.12)"
};

window.makeTrend = function(base) {
  return Array.from({length:24}, (_, i) =>
    Math.max(4, Math.round(base * (0.38 + Math.sin(i/3.8)*0.32 + Math.random()*0.42))));
};

// Init trends
window.CAMERAS.forEach(c => { c.trend = window.makeTrend(c.pm); });
