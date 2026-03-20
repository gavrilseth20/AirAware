window.ANALYTICS = {
  hourly: Array.from({length:24}, (_, i) => ({
    hour: i,
    pm25: Math.round(80 + Math.sin(i/3)*60 + Math.random()*40),
    pm10: Math.round(60 + Math.sin(i/3)*40 + Math.random()*30),
    no2:  Math.round(30 + Math.sin(i/4)*20 + Math.random()*15),
  })),
  weekly: ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].map(d => ({
    day: d,
    avg: Math.round(100 + Math.random()*120),
    peak: Math.round(180 + Math.random()*180),
  })),
  zones: [
    { name:"North Industrial", avg:254, trend:"+12%" },
    { name:"Central CBD",      avg:167, trend:"+5%"  },
    { name:"South Coastal",    avg:48,  trend:"-8%"  },
    { name:"West Industrial",  avg:188, trend:"+9%"  },
    { name:"South-East IT",    avg:42,  trend:"-3%"  },
  ],
  alerts: [
    { id:"ALT_001", cam:"CAM_042", loc:"Anna Salai",        type:"HAZARDOUS", pm:312, time:"08:14", duration:"2h 18m", source:"Industrial" },
    { id:"ALT_002", cam:"CAM_156", loc:"Manali Industrial",  type:"HAZARDOUS", pm:298, time:"07:52", duration:"2h 40m", source:"Refinery"    },
    { id:"ALT_003", cam:"CAM_055", loc:"Perambur",           type:"HAZARDOUS", pm:211, time:"09:01", duration:"1h 31m", source:"Traffic"     },
    { id:"ALT_004", cam:"CAM_033", loc:"Ambattur Industrial",type:"UNHEALTHY", pm:187, time:"09:22", duration:"1h 10m", source:"Industrial"  },
    { id:"ALT_005", cam:"CAM_022", loc:"Guindy",             type:"UNHEALTHY", pm:198, time:"09:38", duration:"54m",    source:"Traffic"     },
    { id:"ALT_006", cam:"CAM_089", loc:"Adyar Bridge",       type:"UNHEALTHY", pm:142, time:"10:05", duration:"27m",    source:"Traffic"     },
  ]
};
