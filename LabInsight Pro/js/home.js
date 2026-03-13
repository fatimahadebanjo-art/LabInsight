// home.js
document.addEventListener("DOMContentLoaded", () => {
  function updateCBCSummary(values) {
    document.getElementById("cbc-hb").textContent = values.hbStatus || "—";
    document.getElementById("cbc-wbc").textContent = values.wbcStatus || "—";
    document.getElementById("cbc-platelets").textContent = values.plateletsStatus || "—";
    document.getElementById("cbc-note").textContent = values.note || "";

    // Highlights
    const highlightsEl = document.getElementById("cbc-highlights");
    if (highlightsEl) {
      highlightsEl.innerHTML = "";
      if (values.highlights && values.highlights.length > 0) {
        const ul = document.createElement("ul");
        values.highlights.forEach((h) => {
          const li = document.createElement("li");
          li.textContent = h;
          if (h.includes("normal")) li.classList.add("highlight-normal");
          else if (h.includes("borderline")) li.classList.add("highlight-borderline");
          else if (h.includes("low") || h.includes("high")) li.classList.add("highlight-abnormal");
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
      if (values.hbStatus === "Normal" && values.wbcStatus === "Normal" && values.plateletsStatus === "Normal") {
        followUpEl.textContent = "Routine check";
        followUpEl.className = "mini-pill normal";
      } else if (values.hbStatus === "Borderline" || values.wbcStatus === "Borderline" || values.plateletsStatus === "Borderline") {
        followUpEl.textContent = "Follow up soon";
        followUpEl.className = "mini-pill borderline";
      } else {
        followUpEl.textContent = "Follow up in 2–4 weeks";
        followUpEl.className = "mini-pill abnormal";
      }
    }

    // Timestamp
    const subEl = document.querySelector(".insight-sub");
    if (subEl && values.timestamp) {
      const date = new Date(values.timestamp);
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

  const savedResults = localStorage.getItem("cbcResults");
  if (savedResults) {
    const results = JSON.parse(savedResults);
    updateCBCSummary(results);
  } else {
    document.getElementById("cbc-note").textContent = "Awaiting analysis...";
  }
});
