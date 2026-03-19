// analyzer-core.js
import app from './firebase-init.js';
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-firestore.js";

const auth = getAuth(app);
const db = getFirestore(app);

(function () {
  window.LabInsight = window.LabInsight || {};

  // --- Utility: dynamically load rules.js if missing ---
  async function ensureRulesLoaded(url = 'js/rules.js') {
    if (window.testRules) return;
    try {
      await new Promise((resolve, reject) => {
        const s = document.createElement('script');
        s.src = url;
        s.onload = () => resolve();
        s.onerror = () => reject(new Error('Failed to load ' + url));
        document.head.appendChild(s);
      });
      if (!window.testRules) {
        throw new Error('rules.js loaded but testRules not defined');
      }
      console.log('ensureRulesLoaded: rules.js loaded and testRules present');
    } catch (err) {
      console.error('ensureRulesLoaded error:', err);
      // Minimal fallback for critical markers so analyzer doesn't completely fail
      window.testRules = window.testRules || {
        hb: { ranges: [{ max: 9999, msg: 'Normal' }] },
        wbc: { ranges: [{ max: 9999, msg: 'Normal' }] },
        platelets: { ranges: [{ max: 9999, msg: 'Normal' }] }
      };
      console.warn('Minimal fallback testRules applied for hb/wbc/platelets.');
    }
  }

  // --- Utility: wait for testRules to be available ---
  function whenTestRulesReady(timeoutMs = 5000) {
    return new Promise((resolve, reject) => {
      if (window.testRules) return resolve(window.testRules);
      const start = Date.now();
      const iv = setInterval(() => {
        if (window.testRules) {
          clearInterval(iv);
          return resolve(window.testRules);
        }
        if (Date.now() - start > timeoutMs) {
          clearInterval(iv);
          return reject(new Error('testRules not available after timeout'));
        }
      }, 50);
    });
  }

  // --- Gather inputs ---
  function gatherInputs() {
    const inputs = document.querySelectorAll(".test-input");
    const map = {};
    inputs.forEach((i) => (map[i.id] = i.value || ""));
    return map;
  }

  // --- Interpretation logic (preserved original behavior) ---
  function interpretValue(testId, value) {
    const rule = window.testRules && window.testRules[testId];
    if (!rule) return "—";
    // If value is empty or not a number, return placeholder
    if (value === null || value === undefined || value === "" || Number.isNaN(Number(value))) {
      return "—";
    }
    for (let r of rule.ranges) {
      // If r.max is undefined treat as match-all
      if (typeof r.max === "undefined" || Number(value) <= Number(r.max)) {
        const msg = (r.msg || "").toLowerCase();
        if (msg.includes("normal")) return "Normal";
        if (msg.includes("borderline")) return "Borderline";
        if (msg.includes("low")) return "Low";
        if (msg.includes("high")) return "High";
        return r.msg;
      }
    }
    return "—";
  }

  // --- Extended analysis (all 15 markers) ---
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

  // --- UI update: populate all 15 result cells, note, highlights ---
  function updateAnalyzerUI(results) {
    try {
      const mapping = {
        hbStatus: "resultHb",
        wbcStatus: "resultWbc",
        plateletsStatus: "resultPlatelets",
        sugarStatus: "resultSugar",
        creatinineStatus: "resultCreatinine",
        bunStatus: "resultBun",
        altStatus: "resultAlt",
        astStatus: "resultAst",
        cholesterolStatus: "resultCholesterol",
        triglyceridesStatus: "resultTriglycerides",
        hdlStatus: "resultHdl",
        ldlStatus: "resultLdl",
        sodiumStatus: "resultSodium",
        potassiumStatus: "resultPotassium",
        chlorideStatus: "resultChloride"
      };

      Object.entries(mapping).forEach(([key, elId]) => {
        const el = document.getElementById(elId);
        if (!el) return;
        el.textContent = results[key] || "—";
      });

      const noteEl = document.getElementById("resultNote");
      if (noteEl) noteEl.textContent = results.note || "—";

      const highlightsEl = document.getElementById("resultHighlights");
      if (highlightsEl) {
        highlightsEl.innerHTML = "";
        if (Array.isArray(results.highlights) && results.highlights.length) {
          results.highlights.forEach(h => {
            const li = document.createElement("li");
            li.textContent = h;
            highlightsEl.appendChild(li);
          });
        } else {
          const li = document.createElement("li");
          li.textContent = "No highlights.";
          highlightsEl.appendChild(li);
        }
      }

      const section = document.getElementById("interpretedResults");
      if (section) section.style.display = "block";

      console.log("updateAnalyzerUI: results applied");
    } catch (err) {
      console.error("updateAnalyzerUI error:", err);
    }
  }

  // --- Main initializer (runs after rules are ready) ---
  async function initAnalyzer() {
    try {
      // Ensure rules.js is loaded (attempt dynamic load if necessary)
      await ensureRulesLoaded();

      // Wait for testRules to be available (short timeout)
      try {
        await whenTestRulesReady(5000);
      } catch (err) {
        console.warn('initAnalyzer: testRules not ready within timeout, continuing with fallback rules.', err);
      }

      // Firebase auth gating
      const auth = getAuth();
      onAuthStateChanged(auth, (user) => {
        if (!user) {
          if (window.location.pathname.includes('analyzer.html')) {
            alert("Please log in to access the analyzer.");
            window.location.href = "account.html?show=login";
          }
          return;
        }

        // Show greeting if element exists
        const welcomeEl = document.getElementById("welcomeUser");
        if (welcomeEl) {
          const hour = new Date().getHours();
          let greeting = "Welcome";
          if (hour < 12) greeting = "Good morning";
          else if (hour < 17) greeting = "Good afternoon";
          else greeting = "Good evening";
          welcomeEl.textContent = `${greeting}, ${user.displayName || user.email}`;
        }
      });

      // Wire up Analyze button
      const manualBtn = document.getElementById("manualAnalyzeBtn");
      if (manualBtn) {
        manualBtn.addEventListener("click", function () {
          const values = gatherInputs();

          // LabInsight evaluation (chart) integration preserved
          try {
            const res = (typeof window.LabInsight.evaluateInputs === "function")
              ? window.LabInsight.evaluateInputs(values)
              : null;
            if (res) {
              const output = document.getElementById("output");
              if (output) {
                output.style.display = "block";
                output.innerHTML =
                  `<div class="chart-wrapper"><canvas id="resultChart" height="180"></canvas></div>` +
                  (res.message || "");
                if (typeof window.LabInsight.renderResultChart === "function") {
                  window.LabInsight.renderResultChart(res.normalCount, res.borderlineCount, res.abnormalCount);
                }
              }
            }
          } catch (err) {
            console.error("Evaluation/render chart error:", err);
          }

          // Extended analysis + save
          try {
            const extendedResults = runExtendedAnalysis(values);
            extendedResults.timestamp = new Date().toISOString();
            try {
              localStorage.setItem("cbcResults", JSON.stringify(extendedResults));
            } catch (e) {
              console.warn("Could not save to localStorage:", e);
            }

            // --- Write compact CBC summary and dispatch event for index.html ---
            try {
              const cbcSummary = {
                hb: values.hb || null,
                wbc: values.wbc || null,
                platelets: values.platelets || null,
                timestamp: new Date().toISOString()
              };
              localStorage.setItem('cbcSummary', JSON.stringify(cbcSummary));

              const html = `
                <div class="cbc-summary">
                  <div>Hb: ${cbcSummary.hb ?? '—'}</div>
                  <div>WBC: ${cbcSummary.wbc ?? '—'}</div>
                  <div>Platelets: ${cbcSummary.platelets ?? '—'}</div>
                  <div class="small">Updated: ${new Date(cbcSummary.timestamp).toLocaleString()}</div>
                </div>`;
              localStorage.setItem('cbcSummaryHtml', html);

              window.dispatchEvent(new CustomEvent('labinsight:cbc', { detail: cbcSummary }));
            } catch (err) {
              console.warn('Could not write cbcSummary to localStorage:', err);
            }

            updateAnalyzerUI(extendedResults);
          } catch (err) {
            console.error("runExtendedAnalysis/updateAnalyzerUI error:", err);
          }
        });
      } else {
        console.warn("manualAnalyzeBtn not found in DOM.");
      }

      // Demo Fill populates all 15 inputs
      const demoBtn = document.getElementById("demoFillBtn");
      if (demoBtn) {
        demoBtn.addEventListener("click", function () {
          const sample = {
            hb: 11.0, wbc: 12.5, platelets: 180,
            sugar: 90, creatinine: 1.0, bun: 15,
            alt: 25, ast: 30,
            cholesterol: 190, triglycerides: 150, hdl: 50, ldl: 120,
            sodium: 140, potassium: 4.0, chloride: 100
          };
          Object.keys(sample).forEach((k) => {
            const el = document.getElementById(k);
            if (el) el.value = sample[k];
          });
          const statusEl = document.getElementById("questionStatus");
          if (statusEl) statusEl.textContent = "Demo values populated.";
        });
      }

      // Save Result button
      const saveBtn = document.getElementById("saveResultBtn");
      if (saveBtn) {
        saveBtn.addEventListener("click", () => {
          const vals = gatherInputs();
          if (typeof window.LabInsight.saveResult === "function") {
            try {
              window.LabInsight.saveResult(vals);
              const statusEl = document.getElementById("questionStatus");
              if (statusEl) statusEl.textContent = "Result saved.";
            } catch (err) {
              console.error("saveResult error:", err);
              const statusEl = document.getElementById("questionStatus");
              if (statusEl) statusEl.textContent = "Save failed.";
            }
          } else {
            const statusEl = document.getElementById("questionStatus");
            if (statusEl) statusEl.textContent = "Save function not available.";
          }
        });
      }

      // Optional upload placeholder
      const uploadBtn = document.getElementById("uploadBtn");
      if (uploadBtn) {
        uploadBtn.addEventListener("click", () => {
          const fileInput = document.getElementById("labUpload");
          const statusEl = document.getElementById("uploadStatus");
          if (!fileInput || !fileInput.files || fileInput.files.length === 0) {
            if (statusEl) statusEl.textContent = "Please choose a file to upload.";
            return;
          }
          if (statusEl) statusEl.textContent = "Upload handling not implemented in this module.";
        });
      }

      console.log('Analyzer initialized (rules ready).');
    } catch (err) {
      console.error('initAnalyzer error:', err);
    }
  }

  // Start initialization on DOMContentLoaded but ensure rules are loaded first
  document.addEventListener("DOMContentLoaded", () => {
    // Attempt to ensure rules are loaded, then initialize analyzer
    ensureRulesLoaded().finally(() => {
      // Even if ensureRulesLoaded used fallback, proceed to init
      initAnalyzer();
    });
  });

  // Expose functions globally
  window.LabInsight.gatherInputs = gatherInputs;
  window.LabInsight.runExtendedAnalysis = runExtendedAnalysis;
  window.LabInsight.updateAnalyzerUI = updateAnalyzerUI;
})();
