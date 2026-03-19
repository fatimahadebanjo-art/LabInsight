// home.js
document.addEventListener("DOMContentLoaded", () => {
  const storageKey = "analyzedResults";

  function updateCBCSummary(result) {
    if (!result) return;

    // Update CBC values
    document.getElementById("cbc-hb").textContent = result.hbStatus || "—";
    document.getElementById("cbc-wbc").textContent = result.wbcStatus || "—";
    document.getElementById("cbc-platelets").textContent = result.plateletsStatus || "—";
    document.getElementById("cbc-note").textContent = result.note || "";

    // Highlights
    const highlightsEl = document.getElementById("cbc-highlights");
    if (highlightsEl) {
      highlightsEl.innerHTML = "";
      const markers = ["hbStatus", "wbcStatus", "plateletsStatus"];
      const hasHighlights = markers.some(key => {
        const val = result[key] || "";
        return val.toLowerCase() !== "normal";
      });

      if (hasHighlights) {
        const ul = document.createElement("ul");
        markers.forEach(key => {
          const val = result[key] || "—";
          const li = document.createElement("li");
          li.textContent = `${key.replace("Status", "").toUpperCase()}: ${val}`;
          if (val.toLowerCase().includes("normal")) li.classList.add("highlight-normal");
          else if (val.toLowerCase().includes("borderline")) li.classList.add("highlight-borderline");
          else if (val.toLowerCase().includes("low") || val.toLowerCase().includes("high")) li.classList.add("highlight-abnormal");
          ul.appendChild(li);
        });
        highlightsEl.appendChild(ul);
      } else {
        highlightsEl.textContent = "No abnormal markers detected.";
      }
    }

    // Follow-up pill
    const followUpEl = document.getElementById("followUpBtn");
    if (followUpEl) {
      if (result.hbStatus === "Normal" && result.wbcStatus === "Normal" && result.plateletsStatus === "Normal") {
        followUpEl.textContent = "Routine check";
        followUpEl.className = "mini-pill normal";
      } else if ([result.hbStatus, result.wbcStatus, result.plateletsStatus].some(v => v === "Borderline")) {
        followUpEl.textContent = "Follow up soon";
        followUpEl.className = "mini-pill borderline";
      } else {
        followUpEl.textContent = "Follow up in 2–4 weeks";
        followUpEl.className = "mini-pill abnormal";
      }
    }

    // Timestamp
    const subEl = document.querySelector(".insight-sub");
    if (subEl && result.timestamp) {
      const date = new Date(result.timestamp);
      const formatted = date.toLocaleString(undefined, {
        weekday: "short",
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
      subEl.textContent = `Last updated: ${formatted}`;
    }
  }

  // Get latest CBC result
  const allResults = JSON.parse(localStorage.getItem(storageKey) || "[]");
  if (allResults.length > 0) {
    const latestResult = allResults[allResults.length - 1]; // last saved result
    if (latestResult.hbStatus || latestResult.wbcStatus || latestResult.plateletsStatus) {
      updateCBCSummary(latestResult);
    } else {
      document.getElementById("cbc-note").textContent = "Awaiting analysis...";
    }
  } else {
    document.getElementById("cbc-note").textContent = "Awaiting analysis...";
  }
});