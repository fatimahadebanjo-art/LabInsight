(function(){
  window.LabInsight = window.LabInsight || {};

  function gatherInputs() {
    const inputs = document.querySelectorAll('.test-input');
    const map = {};
    inputs.forEach(i => map[i.id] = i.value || '');
    return map;
  }

  function bindUI() {
    const manualBtn = document.getElementById('manualAnalyzeBtn');
    if (manualBtn) manualBtn.addEventListener('click', function(){
      const values = gatherInputs();
      const res = window.LabInsight.evaluateInputs(values);
      if (res) {
        const output = document.getElementById('output');
        output.style.display = 'block';
        output.innerHTML = `<div class="chart-wrapper"><canvas id="resultChart" height="180"></canvas></div>` + (res.message || '');
        window.lastCounts = { normal: res.normalCount, borderline: res.borderlineCount, abnormal: res.abnormalCount };
        window.lastDoctorQuestions = res.doctorQuestions.slice();
        window.lastSummaryHtml = res.message;
        if (typeof window.LabInsight.renderResultChart === 'function') window.LabInsight.renderResultChart(res.normalCount, res.borderlineCount, res.abnormalCount);
      }
    });

    document.getElementById('addQuestionBtn')?.addEventListener('click', function(){
      const q = document.getElementById('questionInput')?.value?.trim();
      if (q){ window.customQuestions = window.customQuestions || []; window.customQuestions.push(q); window.LabInsight.customQuestions = window.customQuestions; const statusEl = document.getElementById('questionStatus'); if (statusEl) statusEl.textContent = 'Question added.'; document.getElementById('questionInput').value = ''; }
    });

    document.getElementById('saveResultBtn')?.addEventListener('click', ()=>{ const vals = gatherInputs(); window.LabInsight.saveResult(vals); });
    document.getElementById('viewTrendBtn')?.addEventListener('click', ()=>{ if (typeof window.LabInsight.renderMonthlyChart === 'function') window.LabInsight.renderMonthlyChart(); });
    document.getElementById('downloadBtn')?.addEventListener('click', ()=>{ // build CSV from stored
      const stored = window.LabInsight.getStored(); if (!stored || stored.length === 0) { console.warn('No results to download.'); return; }
      // Include classification counts in CSV
      let csv = 'Timestamp,Date,Cholesterol,LDL,HDL,Triglycerides,Normal,Borderline,Abnormal\n';
      stored.forEach(r => { const ts = r.timestamp || ''; const counts = r.counts || {}; csv += `${ts},${r.date || ''},${r.cholesterol || ''},${r.ldl || ''},${r.hdl || ''},${r.triglycerides || ''},${counts.normal||0},${counts.borderline||0},${counts.abnormal||0}\n`; });
      const blob = new Blob([csv], { type: 'text/csv' }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = 'lab_results.csv'; a.click();
    });

    document.getElementById('demoFillBtn')?.addEventListener('click', function(){
      const sample = { hb:11.0, wbc:12.5, platelets:180, sugar:110, creatinine:1.5, bun:18, alt:55, ast:30, cholesterol:220, triglycerides:180, hdl:35, ldl:160, sodium:132, potassium:4.5, chloride:105 };
      Object.keys(sample).forEach(k => { const el = document.getElementById(k); if (el) el.value = sample[k]; });
      const statusEl = document.getElementById('questionStatus'); if (statusEl) statusEl.textContent = 'Demo values populated.';
    });

    document.getElementById('exportPdfBtn')?.addEventListener('click', function(){ if (typeof window.LabInsight.exportPdf === 'function') window.LabInsight.exportPdf(); });

    document.getElementById('backToMonthlyBtn')?.addEventListener('click', function(){ window.LabInsight.renderMonthlyChart(); this.style.display = 'none'; window.LabInsight.currentDrillMonth = null; });
  }

  window.LabInsight.bindUI = bindUI;
})();


const hamburger = document.getElementById("hamburger");
const navLinks = document.getElementById("navLinks");

hamburger.addEventListener("click", () => {
  navLinks.classList.toggle("show");
});




function runAnalysis() {
  // 1. Collect values from inputs
  const hb = Number(document.getElementById("hb")?.value || 0);
  const wbc = Number(document.getElementById("wbc")?.value || 0);
  const platelets = Number(document.getElementById("platelets")?.value || 0);

  // 2. Interpret values using testRules
  const hbStatus = interpretValue("hb", hb);
  const wbcStatus = interpretValue("wbc", wbc);
  const plateletsStatus = interpretValue("platelets", platelets);

  // 3. Generate note
  let note = "";
  if (wbcStatus === "Borderline") {
    note = "Borderline WBC may indicate inflammation — consider retesting if symptoms persist.";
  }

  // 4. Publish results globally
  window.analyzerResults = {
    hbStatus,
    wbcStatus,
    plateletsStatus,
    note
  };

  // 5. Save results to localStorage so homepage can read them
  localStorage.setItem("cbcResults", JSON.stringify(window.analyzerResults));

  // 6. Update analyzer page UI
  updateAnalyzerUI(window.analyzerResults);
}

// Helper: interpret value using testRules
function interpretValue(testId, value) {
  const rule = testRules[testId];
  if (!rule) return "—";

  for (let r of rule.ranges) {
    if (value <= r.max) {
      if (r.msg.toLowerCase().includes("normal")) return "Normal";
      if (r.msg.toLowerCase().includes("borderline")) return "Borderline";
      if (r.msg.toLowerCase().includes("low")) return "Low";
      if (r.msg.toLowerCase().includes("high")) return "High";
      return r.msg;
    }
  }
  return "—";
}

// Update analyzer page UI
function updateAnalyzerUI(results) {
  document.getElementById("resultHb").textContent = results.hbStatus;
  document.getElementById("resultWbc").textContent = results.wbcStatus;
  document.getElementById("resultPlatelets").textContent = results.plateletsStatus;
  document.getElementById("resultNote").textContent = results.note;
}
