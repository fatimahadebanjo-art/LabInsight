(function () {
  window.LabInsight = window.LabInsight || {};

  // Collect all inputs into a map
  function gatherInputs() {
    const inputs = document.querySelectorAll(".test-input");
    const map = {};
    inputs.forEach((i) => (map[i.id] = i.value || ""));
    return map;
  }

  // Extended analysis: CBC + metabolic + liver + lipids + electrolytes
  function runExtendedAnalysis(values) {
    const results = {
      hbStatus: interpretValue("hb", Number(values.hb) || 0),
      wbcStatus: interpretValue("wbc", Number(values.wbc) || 0),
      plateletsStatus: interpretValue("platelets", Number(values.platelets) || 0),
      sugarStatus: interpretValue("sugar", Number(values.sugar) || 0),
      creatinineStatus: interpretValue("creatinine", Number(values.creatinine) || 0),
      bunStatus: interpretValue("bun", Number(values.bun) || 0),
      altStatus: interpretValue("alt", Number(values.alt) || 0),
      astStatus: interpretValue("ast", Number(values.ast) || 0),
      cholesterolStatus: interpretValue("cholesterol", Number(values.cholesterol) || 0),
      triglyceridesStatus: interpretValue("triglycerides", Number(values.triglycerides) || 0),
      hdlStatus: interpretValue("hdl", Number(values.hdl) || 0),
      ldlStatus: interpretValue("ldl", Number(values.ldl) || 0),
      sodiumStatus: interpretValue("sodium", Number(values.sodium) || 0),
      potassiumStatus: interpretValue("potassium", Number(values.potassium) || 0),
      chlorideStatus: interpretValue("chloride", Number(values.chloride) || 0),
      note: "",
    };

    if (results.wbcStatus === "Borderline") { results.note = "Borderline WBC may indicate inflammation — consider retesting if symptoms persist."; } else if ( results.hbStatus === "Normal" && results.wbcStatus === "Normal" && results.plateletsStatus === "Normal" ) { results.note = "CBC values are within normal range."; } else { results.note = "Some values are outside the normal range — follow up recommended."; } 
    return results; }

  // Interpret values using testRules
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

  // Update analyzer page UI (CBC only for now)
  function updateAnalyzerUI(results) {
    document.getElementById("resultHb").textContent = results.hbStatus;
    document.getElementById("resultWbc").textContent = results.wbcStatus;
    document.getElementById("resultPlatelets").textContent = results.plateletsStatus;
    document.getElementById("resultNote").textContent = results.note;
  }

  // Bind all UI buttons
  document.addEventListener("DOMContentLoaded", () => {
    const manualBtn = document.getElementById("manualAnalyzeBtn");
    if (manualBtn) {
      manualBtn.addEventListener("click", function () {
        const values = gatherInputs();

        // 1. Run LabInsight evaluation
        const res = window.LabInsight.evaluateInputs(values);
        if (res) {
          const output = document.getElementById("output");
          output.style.display = "block";
          output.innerHTML =
            `<div class="chart-wrapper"><canvas id="resultChart" height="180"></canvas></div>` +
            (res.message || "");
          window.lastCounts = {
            normal: res.normalCount,
            borderline: res.borderlineCount,
            abnormal: res.abnormalCount,
          };
          window.lastDoctorQuestions = res.doctorQuestions.slice();
          window.lastSummaryHtml = res.message;
          if (typeof window.LabInsight.renderResultChart === "function") {
            window.LabInsight.renderResultChart(
              res.normalCount,
              res.borderlineCount,
              res.abnormalCount
            );
          }
        }

        // 2. Run extended analysis and save results
        const extendedResults = runExtendedAnalysis(values);
        localStorage.setItem("cbcResults", JSON.stringify(extendedResults));
        console.log("Saved extended results:", extendedResults);

        // 3. Update analyzer page UI (CBC summary)
        updateAnalyzerUI(extendedResults);
      });
    }

    // Demo Fill button
    document.getElementById("demoFillBtn")?.addEventListener("click", function () {
      const sample = {
        hb: 11.0,
        wbc: 12.5,
        platelets: 180,
        sugar: 110,
        creatinine: 1.5,
        bun: 18,
        alt: 55,
        ast: 30,
        cholesterol: 220,
        triglycerides: 180,
        hdl: 35,
        ldl: 160,
        sodium: 132,
        potassium: 4.5,
        chloride: 105,
      };
      Object.keys(sample).forEach((k) => {
        const el = document.getElementById(k);
        if (el) el.value = sample[k];
      });
      const statusEl = document.getElementById("questionStatus");
      if (statusEl) statusEl.textContent = "Demo values populated.";
    });

    // Save Result button
    document.getElementById("saveResultBtn")?.addEventListener("click", () => {
      const vals = gatherInputs();
      window.LabInsight.saveResult(vals);
      const statusEl = document.getElementById("questionStatus");
      if (statusEl) statusEl.textContent = "Result saved.";
    });

    // Add Question button
    document.getElementById("addQuestionBtn")?.addEventListener("click", function () {
      const q = document.getElementById("questionInput")?.value?.trim();
      if (q) {
        window.customQuestions = window.customQuestions || [];
        window.customQuestions.push(q);
        window.LabInsight.customQuestions = window.customQuestions;
        const statusEl = document.getElementById("questionStatus");
        if (statusEl) statusEl.textContent = "Question added.";
        document.getElementById("questionInput").value = "";
      }
    });

    // Export PDF button
    document.getElementById("exportPdfBtn")?.addEventListener("click", function () {
      if (typeof window.LabInsight.exportPdf === "function") window.LabInsight.exportPdf();
    });
  });

  window.LabInsight.gatherInputs = gatherInputs;
  window.LabInsight.runExtendedAnalysis = runExtendedAnalysis;
})();
