(function(){
  window.LabInsight = window.LabInsight || {};
  let chartInstance = null;
  let trendChartInstance = null;

  const TREND_SERIES = [
    { key: 'hb', label: 'Hemoglobin', color: '#6a4c93' },
    { key: 'wbc', label: 'WBC', color: '#1982c4' },
    { key: 'platelets', label: 'Platelets', color: '#8ac926' },
    { key: 'sugar', label: 'Blood Sugar', color: '#ff595e' },
    { key: 'creatinine', label: 'Creatinine', color: '#ffca3a' },
    { key: 'bun', label: 'Urea/BUN', color: '#2ec4b6' },
    { key: 'alt', label: 'ALT', color: '#e63946' },
    { key: 'ast', label: 'AST', color: '#3a86ff' },
    { key: 'cholesterol', label: 'Cholesterol', color: '#f77f00' },
    { key: 'triglycerides', label: 'Triglycerides', color: '#d62828' },
    { key: 'hdl', label: 'HDL', color: '#06d6a0' },
    { key: 'ldl', label: 'LDL', color: '#118ab2' },
    { key: 'sodium', label: 'Sodium', color: '#9a031e' },
    { key: 'potassium', label: 'Potassium', color: '#8338ec' },
    { key: 'chloride', label: 'Chloride', color: '#fb5607' }
  ];

  function renderResultChart(normal, borderline, abnormal){
    const ctx = document.getElementById('resultChart'); if(!ctx) return;
    if (chartInstance) chartInstance.destroy();
    chartInstance = new Chart(ctx, {
      type: 'doughnut',
      data: { labels: ['Normal','Borderline','Abnormal'], datasets:[{ data:[normal,borderline,abnormal], backgroundColor:['#2ec4b6','#ffb703','#e63946'] }] },
      options: { responsive:true, plugins:{ legend:{position:'bottom'}, tooltip:{ callbacks:{ label: (c)=> `${c.label}: ${c.raw} test(s)` } } } }
    });
  }

  function renderMonthlyChart(){
    const stored = window.LabInsight.getStored();
    if (!stored || stored.length === 0) { alert('No saved results yet.'); return; }
    const monthly = {};
    stored.forEach(entry => {
      const date = entry.date || (entry.timestamp && entry.timestamp.split('T')[0]);
      const month = date ? date.slice(0,7) : null; if(!month) return;
      if (!monthly[month]) monthly[month] = { sums: {}, counts:{} };
      TREND_SERIES.forEach(s => { const v = entry[s.key]; if (v !== undefined && v !== "") { monthly[month].sums[s.key] = (monthly[month].sums[s.key]||0)+Number(v); monthly[month].counts[s.key] = (monthly[month].counts[s.key]||0)+1; } });
    });
    const months = Object.keys(monthly).sort(); if (months.length===0){ alert('No saved results yet.'); return; }
    const labels = months.map(m => new Date(m+'-01').toLocaleDateString());
    const datasets = TREND_SERIES.map(s => ({ label: s.label, testKey: s.key, data: months.map(m => { const ms = monthly[m]; if (!ms || !ms.counts[s.key]) return null; return Number((ms.sums[s.key]/ms.counts[s.key]).toFixed(2)); }), backgroundColor: s.color }));
    const ctx = document.getElementById('trendChart'); if(!ctx) return; if (trendChartInstance) trendChartInstance.destroy();
    trendChartInstance = new Chart(ctx, { type: 'bar', data: { labels, datasets }, options: { responsive:true, plugins:{ legend:{position:'bottom'}, tooltip:{ callbacks:{ label: function(context){ const ds=context.dataset; const v=context.raw; const monthKey = months[context.dataIndex]; const count = (window.LabInsight.trendCountsMap && window.LabInsight.trendCountsMap[monthKey] && window.LabInsight.trendCountsMap[monthKey][ds.testKey]) || 0; return `${ds.label}: ${v===null?'no data':v} (n=${count})`; } } } }, onClick: function(evt, elements){ if(!elements || elements.length===0) return; const idx = elements[0].index; const month = months[idx]; window.LabInsight.currentDrillMonth = month; document.getElementById('backToMonthlyBtn').style.display='inline-block'; window.LabInsight.renderDailyChart(month); }, scales:{ y:{ beginAtZero:true, title:{display:true, text:'Value'}}, x:{ title:{display:true, text:'Month'} } } } });
    // store counts map for tooltips
    window.LabInsight.trendCountsMap = {};
    months.forEach(m => window.LabInsight.trendCountsMap[m] = monthly[m].counts);
  }

  function renderDailyChart(month){
    const stored = window.LabInsight.getStored();
    const entries = stored.filter(e => ((e.date || (e.timestamp && e.timestamp.split('T')[0]) || '').startsWith(month)));
    if (!entries || entries.length === 0) { alert('No data for selected month.'); return; }
    const daily = {};
    entries.forEach(entry => { const day = (entry.timestamp || entry.date).split('T')[0]; if (!daily[day]) daily[day] = { sums:{}, counts:{} }; TREND_SERIES.forEach(s => { const v = entry[s.key]; if (v !== undefined && v !== "") { daily[day].sums[s.key] = (daily[day].sums[s.key]||0)+Number(v); daily[day].counts[s.key] = (daily[day].counts[s.key]||0)+1; } }); });
    const days = Object.keys(daily).sort(); const labels = days.map(d => new Date(d).toLocaleDateString()); const countsMap = {};
    const datasets = TREND_SERIES.map(s => ({ label:s.label, testKey:s.key, data: days.map(d => { const ds = daily[d]; if (!ds || !ds.counts[s.key]) return null; countsMap[d] = daily[d].counts; return Number((ds.sums[s.key]/ds.counts[s.key]).toFixed(2)); }), backgroundColor: s.color }));
    const ctx = document.getElementById('trendChart'); if(!ctx) return; if (trendChartInstance) trendChartInstance.destroy();
    trendChartInstance = new Chart(ctx, { type:'bar', data:{ labels, datasets }, options:{ responsive:true, plugins:{ legend:{position:'bottom'}, tooltip:{ callbacks:{ label: function(context){ const ds=context.dataset; const v=context.raw; const dayKey = days[context.dataIndex]; const count = (countsMap[dayKey] && countsMap[dayKey][ds.testKey]) || 0; return `${ds.label}: ${v===null?'no data':v} (n=${count})`; } } } }, scales:{ y:{ beginAtZero:true, title:{display:true, text:'Value'}}, x:{ title:{display:true, text:'Date'} } } } });
    window.LabInsight.dailyCountsMap = countsMap;
  }

  window.LabInsight.renderResultChart = renderResultChart;
  window.LabInsight.renderMonthlyChart = renderMonthlyChart;
  window.LabInsight.renderDailyChart = renderDailyChart;
  window.LabInsight.renderTrendChart = function(){ renderMonthlyChart(); };
})();