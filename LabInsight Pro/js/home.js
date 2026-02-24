// home.js

document.addEventListener("DOMContentLoaded", () => {
  // Function to update homepage CBC Summary
  function updateCBCSummary(values) {
    document.getElementById("cbc-hb").textContent = values.hbStatus || "—";
    document.getElementById("cbc-wbc").textContent = values.wbcStatus || "—";
    document.getElementById("cbc-platelets").textContent = values.plateletsStatus || "—";
    document.getElementById("cbc-note").textContent = values.note || "Awaiting analysis...";
  }

  // 1. Read saved results from localStorage
  const savedResults = localStorage.getItem("cbcResults");

  if (savedResults) {
    const results = JSON.parse(savedResults);
    updateCBCSummary(results);
  } else {
    // No results yet
    document.getElementById("cbc-note").textContent = "Awaiting analysis...";
  }

  // 2. Export PDF button
  document.getElementById("exportPdf")?.addEventListener("click", () => {
    alert("Exporting PDF report...");
  });

  // 3. Follow-up button
  document.getElementById("followUpBtn")?.addEventListener("click", () => {
    alert("Reminder set: Follow up in 2–4 weeks.");
  });

  // 4. Doctor Mode toggle
  document.getElementById("doctorModeToggle")?.addEventListener("change", function () {
    document.body.classList.toggle("doctor-mode", this.checked);
  });
});


  // Search feature (context-aware)
  const searchBtn = document.getElementById("searchBtn");
  const searchInput = document.getElementById("searchQuery");
  const searchResults = document.getElementById("searchResults");

  if (searchBtn) {
    searchBtn.addEventListener("click", () => {
      const query = searchInput.value.trim().toLowerCase();
      if (!query) {
        searchResults.innerHTML = "<p>Please enter a search term.</p>";
        return;
      }

      let matchedRule = null;
      for (let id in testRules) {
        const ruleName = testRules[id].name.toLowerCase();
        if (ruleName.includes(query) || id.toLowerCase() === query) {
          matchedRule = testRules[id];
          break;
        }
      }

      if (matchedRule) {
        let ruleInfo = `<h3>${matchedRule.name}</h3><ul>`;
        matchedRule.ranges.forEach(r => {
          ruleInfo += `<li>${r.msg}</li>`;
        });
        ruleInfo += "</ul>";
        searchResults.innerHTML = ruleInfo;
      } else {
        searchResults.innerHTML = `<p>No match found. Searching online for: <strong>${query}</strong>...</p>`;
      }
    });
  }

