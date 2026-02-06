let currentChartType = "bar"; 
let trendChartInstance = null;

function renderTrendChart() {
  const stored = JSON.parse(localStorage.getItem("labResults") || "[]");
  if (stored.length === 0) {
    alert("No saved results yet.");
    return;
  }

  const ctx = document.getElementById("trendChart");
  if (!ctx) return;

  if (trendChartInstance) {
    trendChartInstance.destroy();
  }

  const labels = stored.map(r => r.date);

  function safeNumber(val) {
  return val === "" || val == null ? null : Number(val);
}

const allDatasets = {
  blood: [
    { label: "Hemoglobin", data: stored.map(r => safeNumber(r.hb)), backgroundColor: "#6a4c93" },
    { label: "WBC", data: stored.map(r => safeNumber(r.wbc)), backgroundColor: "#1982c4" },
    { label: "Platelets", data: stored.map(r => safeNumber(r.platelets)), backgroundColor: "#8ac926" },
    { label: "Blood Sugar", data: stored.map(r => safeNumber(r.sugar)), backgroundColor: "#ff595e" }
  ],
  kidney: [
    { label: "Creatinine", data: stored.map(r => safeNumber(r.creatinine)), backgroundColor: "#ffca3a" },
    { label: "Urea/BUN", data: stored.map(r => safeNumber(r.bun)), backgroundColor: "#2ec4b6" }
  ],
  liver: [
    { label: "ALT", data: stored.map(r => safeNumber(r.alt)), backgroundColor: "#e63946" },
    { label: "AST", data: stored.map(r => safeNumber(r.ast)), backgroundColor: "#3a86ff" }
  ],
  lipids: [
    { label: "Cholesterol", data: stored.map(r => safeNumber(r.cholesterol)), backgroundColor: "#f77f00" },
    { label: "Triglycerides", data: stored.map(r => safeNumber(r.triglycerides)), backgroundColor: "#d62828" },
    { label: "HDL", data: stored.map(r => safeNumber(r.hdl)), backgroundColor: "#06d6a0" },
    { label: "LDL", data: stored.map(r => safeNumber(r.ldl)), backgroundColor: "#118ab2" }
  ],
  electrolytes: [
    { label: "Sodium", data: stored.map(r => safeNumber(r.sodium)), backgroundColor: "#9a031e" },
    { label: "Potassium", data: stored.map(r => safeNumber(r.potassium)), backgroundColor: "#8338ec" },
    { label: "Chloride", data: stored.map(r => safeNumber(r.chloride)), backgroundColor: "#fb5607" }
  ]
};


  const filter = document.getElementById("testFilter")?.value || "all";
  let datasets = filter === "all" ? Object.values(allDatasets).flat() : allDatasets[filter] || [];

  trendChartInstance = new Chart(ctx, {
    type: currentChartType,
    data: { labels, datasets },
    options: {
      responsive: true,
      plugins: {
        legend: { position: "bottom" },
        tooltip: { enabled: true }
      },
      scales: {
        y: { beginAtZero: true, title: { display: true, text: "Value" } },
        x: { title: { display: true, text: "Date" } }
      }
    }
  });

  // Expose chart instance globally for pdf.js
  window.LabInsight = window.LabInsight || {};
  window.LabInsight.trendChartInstance = trendChartInstance;
}

document.addEventListener("DOMContentLoaded", () => {
  const barBtn = document.getElementById("barViewBtn");
  const lineBtn = document.getElementById("lineViewBtn");
  const filterSelect = document.getElementById("testFilter");

  if (barBtn) barBtn.addEventListener("click", () => { currentChartType = "bar"; renderTrendChart(); });
  if (lineBtn) lineBtn.addEventListener("click", () => { currentChartType = "line"; renderTrendChart(); });
  if (filterSelect) filterSelect.addEventListener("change", renderTrendChart);

  renderTrendChart(); // render on page load
});
