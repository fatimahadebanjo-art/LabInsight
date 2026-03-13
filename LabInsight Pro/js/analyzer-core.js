(function () {
  window.LabInsight = window.LabInsight || {};

  function gatherInputs() {
    const inputs = document.querySelectorAll(".test-input");
    const map = {};
    inputs.forEach((i) => (map[i.id] = i.value || ""));
    return map;
  }

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

  function runExtendedAnalysis(values) {
    const results = {
      hbStatus: interpretValue("hb", Number(values.hb) || 0),
      wbcStatus: interpretValue("wbc", Number(values.wbc) || 0),
      plateletsStatus: interpretValue("platelets", Number(values.platelets) || 0),
      note: "",
      highlights: []
    };

    const issues = [];
    for (const [marker, status] of Object.entries(results)) {
      if (marker.endsWith("Status")) {
        const label = marker.replace("Status", "");
        if (status === "Borderline") {
          issues.push(`${label} borderline`);
          results.highlights.push(`${label}: borderline`);
        } else if (status === "Low") {
          issues.push(`${label} low`);
          results.highlights.push(`${label}: low`);
        } else if (status === "High") {
          issues.push(`${label} high`);
          results.highlights.push(`${label}: high`);
        }
      }
    }

    if (issues.length === 0) {
      results.note = "All values are within normal range.";
    } else {
      results.note = "Attention: " + issues.join(", ") + ".";
    }

    return results;
  }

  function updateAnalyzerUI(results) {
    document.getElementById("resultHb").textContent = results.hbStatus;
    document.getElementById("resultWbc").textContent = results.wbcStatus;
    document.getElementById("resultPlatelets").textContent = results.plateletsStatus;
    document.getElementById("resultNote").textContent = results.note;
  }

  document.addEventListener("DOMContentLoaded", () => {
    const loggedIn = localStorage.getItem("loggedIn");
    if (loggedIn !== "true") {
      alert("Please log in to access the analyzer.");
      window.location.href = "account.html?show=login";
      return;
    }

    // Username 
    const userName = localStorage.getItem("userName");
    if (userName) {
      const welcomeEl = document.getElementById("welcomeUser");
      if (welcomeEl) { welcomeEl.textContent = `Welcome, ${userName}`; }
    }

    const manualBtn = document.getElementById("manualAnalyzeBtn");
    if (manualBtn) {
      manualBtn.addEventListener("click", function () {
        const values = gatherInputs();


        // LabInsight evaluation
        const res = window.LabInsight.evaluateInputs(values);
        if (res) {
          const output = document.getElementById("output");
          output.style.display = "block";
          output.innerHTML =
            `<div class="chart-wrapper"><canvas id="resultChart" height="180"></canvas></div>` +
            (res.message || "");
          if (typeof window.LabInsight.renderResultChart === "function") {
            window.LabInsight.renderResultChart(res.normalCount, res.borderlineCount, res.abnormalCount);
          }
        }

        // Extended analysis + save
        const extendedResults = runExtendedAnalysis(values);
        extendedResults.timestamp = new Date().toISOString();
        localStorage.setItem("cbcResults", JSON.stringify(extendedResults));
        updateAnalyzerUI(extendedResults);
      });
    }

    // Demo Fill
    document.getElementById("demoFillBtn")?.addEventListener("click", function () {
      const sample = { hb: 11.0, wbc: 12.5, platelets: 180 };
      Object.keys(sample).forEach((k) => {
        const el = document.getElementById(k);
        if (el) el.value = sample[k];
      });
      const statusEl = document.getElementById("questionStatus");
      if (statusEl) statusEl.textContent = "Demo values populated.";
    });

    // Save Result
    document.getElementById("saveResultBtn")?.addEventListener("click", () => {
      const vals = gatherInputs();
      window.LabInsight.saveResult(vals);
      const statusEl = document.getElementById("questionStatus");
      if (statusEl) statusEl.textContent = "Result saved.";
    });
  });

  window.LabInsight.gatherInputs = gatherInputs;
  window.LabInsight.runExtendedAnalysis = runExtendedAnalysis;
})();
