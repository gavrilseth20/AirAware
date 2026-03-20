// charts.js — additional chart helpers (extended from utils.js)
window.createBarChart = function(canvas, labels, datasets, options={}) {
  const existing = Chart.getChart(canvas);
  if (existing) existing.destroy();
  return new Chart(canvas, {
    type:"bar", data:{labels, datasets},
    options:{
      responsive:true, maintainAspectRatio:false,
      plugins:{legend:{display:false}, tooltip:{backgroundColor:"#0F1A2E",borderColor:"#1A2D45",borderWidth:1,titleColor:"#C8D8E8",bodyColor:"#4A6580"}},
      scales:{
        x:{ticks:{color:"#4A6580",font:{family:"JetBrains Mono",size:8}}, grid:{display:false}},
        y:{ticks:{color:"#4A6580",font:{family:"JetBrains Mono",size:8}}, grid:{color:"rgba(26,45,69,0.5)"}},
      },
      ...options
    }
  });
};
