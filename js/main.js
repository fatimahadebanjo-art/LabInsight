(function () {
  window.LabInsight = window.LabInsight || {};

  function init() {

    // UI initializers
    if (typeof window.LabInsight.initAccordion === "function")
      window.LabInsight.initAccordion();

    if (typeof window.LabInsight.setupScrollHeader === "function")
      window.LabInsight.setupScrollHeader();

    // OCR upload
    if (typeof window.LabInsight.attachUploadHandler === "function")
      window.LabInsight.attachUploadHandler();

    // Analyzer bindings
    if (typeof window.LabInsight.bindUI === "function")
      window.LabInsight.bindUI();

    console.log("LabInsight (global) initialized");

    const debug = document.getElementById("debugLog");
    if (debug) debug.style.display = "block";

    const inner = document.getElementById("debugLogInner");
    if (inner) {
      const div = document.createElement("div");
      div.textContent = "[info] LabInsight scripts loaded (global)";
      inner.appendChild(div);
    }
  }

  document.addEventListener("DOMContentLoaded", init);
  window.LabInsight.init = init;
})();

document.addEventListener("DOMContentLoaded", () => {

  const toggle = document.getElementById("devProToggle");
  if (!toggle) return;

  // Determine current plan properly
  const plan = localStorage.getItem("plan") ||
               localStorage.getItem("userPlan") ||
               (localStorage.getItem("isPro") === "true" ? "pro" : "free");

  toggle.value = plan === "pro" ? "pro" : "free";

//   toggle.addEventListener("change", (e) => {
//     const val = e.target.value;

//     localStorage.setItem("plan", val);
//     localStorage.setItem("userPlan", val);
//     localStorage.setItem("isPro", val === "pro" ? "true" : "false");

//     console.log(`[Dev Toggle] Plan set to "${val}". Reloading...`);

//     location.reload();
//   });

// });

