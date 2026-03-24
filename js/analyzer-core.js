// analyzer-core.js
import './firebase-init.js';
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js";
import { ref, get, set, push } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-database.js";
import db from "./realtime-init.js";

(function () {
  window.LabInsight = window.LabInsight || {};
  let analyzedResults = [];


  // Notify other tabs and same-tab listeners after saving cbcSummary
  function notifyCbcSaved() {
    try {
      localStorage.setItem('labinsight:lastCounts', JSON.stringify(window.lastCounts || {}));
      localStorage.setItem('labinsight:cbc:updated', String(Date.now()));
    } catch (e) {
      console.warn('Could not write labinsight keys', e);
    }

    const _labinsight_summary = (() => {
      try { return JSON.parse(localStorage.getItem('cbcSummary') || '{}'); } catch (err) { return {}; }
    })();

    window.dispatchEvent(new CustomEvent('labinsight:cbc', { detail: _labinsight_summary }));
    window.dispatchEvent(new Event('labinsight:lastCountsSet'));
  }

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

  // --- Save result to Realtime Database for the current user ---
  async function saveResultToDB(userId, values, extendedResults) {
    try {
      // Use push to create a unique key under results/{uid}
      const resultsRef = ref(db, `results/${userId}`);
      const newRef = push(resultsRef);
      await set(newRef, {
        values,
        extendedResults,
        timestamp: new Date().toISOString()
      });
      console.log("Results saved to Realtime DB for", userId);
      return { success: true, key: newRef.key };
    } catch (err) {
      console.error("Failed to save results:", err);
      return { success: false, error: err };
    }
  }

  // --- List saved results for current user and render into DOM ---
  async function listSavedResultsForUser(userId) {
    try {
      const snapshot = await get(ref(db, `results/${userId}`));
      const container = document.getElementById("savedResultsList");
      if (!container) {
        console.warn("savedResultsList element not found in DOM.");
      }
      const results = [];
      if (snapshot.exists()) {
        const val = snapshot.val();
        Object.entries(val).forEach(([key, entry]) => {
          results.push({
            id: key,
            timestamp: entry.timestamp || null,
            values: entry.values || {},
            extendedResults: entry.extendedResults || {}
          });
        });
        // Sort by timestamp descending
        results.sort((a, b) => {
          const ta = a.timestamp ? new Date(a.timestamp).getTime() : 0;
          const tb = b.timestamp ? new Date(b.timestamp).getTime() : 0;
          return tb - ta;
        });
      }

      if (container) {
        container.innerHTML = "";
        if (results.length === 0) {
          container.innerHTML = "<div class='empty'>No saved results.</div>";
        } else {
          results.forEach(r => {
            const wrapper = document.createElement("div");
            wrapper.className = "saved-result";
            const timeText = r.timestamp ? new Date(r.timestamp).toLocaleString() : "Unknown time";
            wrapper.innerHTML = `
              <div class="saved-result-header">
                <strong>${timeText}</strong>
                <button class="view-result-btn" data-id="${r.id}">View</button>
              </div>
              <div class="saved-result-body" id="body-${r.id}" style="display:none;">
                <pre class="small">${JSON.stringify(r.values, null, 2)}</pre>
                <pre class="small">${JSON.stringify(r.extendedResults, null, 2)}</pre>
              </div>
            `;
            container.appendChild(wrapper);
          });

          // Attach click handlers for view buttons
          container.querySelectorAll(".view-result-btn").forEach(btn => {
            btn.addEventListener("click", (e) => {
              const id = btn.getAttribute("data-id");
              const body = document.getElementById(`body-${id}`);
              if (!body) return;
              body.style.display = body.style.display === "none" ? "block" : "none";
            });
          });
        }
      }

      return results;
    } catch (err) {
      console.error("Failed to list saved results:", err);
      return [];
    }
  }

  // --- Exposed saveResult used by Save Result button ---
  window.LabInsight.saveResult = async function (vals) {
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) {
      alert("Please log in to save results.");
      return;
    }
    try {
      const extendedResults = runExtendedAnalysis(vals);
      extendedResults.timestamp = new Date().toISOString();

      // Save locally as before
      try {
        localStorage.setItem("cbcResults", JSON.stringify(extendedResults));
      } catch (e) {
        console.warn("Could not save to localStorage:", e);
      }

      // Save compact CBC summary and dispatch event
      try {
        const cbcSummary = {
          hb: vals.hb || null,
          wbc: vals.wbc || null,
          platelets: vals.platelets || null,
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

        // Centralized notification
        notifyCbcSaved();
      } catch (err) {
        console.warn('Could not write cbcSummary to localStorage:', err);
      }

      // --- NEW: keep window.lastCounts in sync when saving results ---
      try {
        if (typeof window.LabInsight.evaluateInputs === "function") {
          const res = window.LabInsight.evaluateInputs(vals);
          if (res) {
            window.lastCounts = {
              normal: res.normalCount,
              borderline: res.borderlineCount,
              abnormal: res.abnormalCount
            };
            window.lastDoctorQuestions = res.doctorQuestions || [];
          }
        }
      } catch (err) {
        console.warn("Could not update window.lastCounts during saveResult:", err);
      }

      // Save to Realtime Database
      const res = await saveResultToDB(user.uid, vals, extendedResults);
      const statusEl = document.getElementById("questionStatus");
      if (res.success) {
        if (statusEl) statusEl.textContent = "Result saved.";
        // Refresh saved results list if present
        await listSavedResultsForUser(user.uid);
      } else {
        if (statusEl) statusEl.textContent = "Save failed.";
      }
    } catch (err) {
      console.error("saveResult wrapper error:", err);
      const statusEl = document.getElementById("questionStatus");
      if (statusEl) statusEl.textContent = "Save failed.";
    }
  };

  // --- Expose listing function so UI can call it on load ---
  window.LabInsight.listSavedResultsForUser = listSavedResultsForUser;

  // --- Main initializer (runs after rules are ready) ---
  async function initAnalyzer() {
    // Skip analyzer UI wiring on pages that are not analyzer.html
    if (!window.location.pathname.includes('analyzer.html')) {
      console.debug('Analyzer UI skipped on this page.');
      return;
    }

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
      onAuthStateChanged(auth, async (user) => {
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

        // If saved results list exists, populate it for this user
        try {
          await listSavedResultsForUser(user.uid);
        } catch (err) {
          console.warn("Could not list saved results on auth state change:", err);
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

                  // 🔑 Save counts for exportPdf
                  window.lastCounts = {
                    normal: res.normalCount,
                    borderline: res.borderlineCount,
                    abnormal: res.abnormalCount
                  };

                  // 🔑 Save doctor questions if provided
                  window.lastDoctorQuestions = res.doctorQuestions || [];
                }
              }
            }
          } catch (err) {
            console.error("Evaluation/render chart error:", err);
          }

          // Extended analysis + save to localStorage + UI update
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

              // Centralized notification
              notifyCbcSaved();
            } catch (err) {
              console.warn('Could not write cbcSummary to localStorage:', err);
            }

            updateAnalyzerUI(extendedResults);

            // 🔑 Save results globally for export
            analyzedResults = extendedResults;

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
              if (statusEl) statusEl.textContent = "Saving...";
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
  window.LabInsight.saveResultToDB = saveResultToDB;
  window.LabInsight.listSavedResultsForUser = listSavedResultsForUser;
})();
