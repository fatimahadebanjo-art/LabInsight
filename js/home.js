// home.js
document.addEventListener("DOMContentLoaded", () => {
  const storageKey = "analyzedResults";
  const altSummaryKey = "cbcSummary";
  const altResultsKey = "cbcResults";

  function safeGet(id) {
    return document.getElementById(id) || null;
  }

  function setText(id, value) {
    const el = safeGet(id);
    if (el) el.textContent = value ?? "—";
  }

  function formatTimestamp(ts) {
    try {
      const date = new Date(ts);
      return date.toLocaleString(undefined, {
        weekday: "short",
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (e) {
      return null;
    }
  }

  function renderHighlights(result) {
    const highlightsEl = safeGet("cbc-highlights");
    if (!highlightsEl) return;

    highlightsEl.innerHTML = "";
    const markers = ["hbStatus", "wbcStatus", "plateletsStatus"];
    const hasHighlights = markers.some((key) => {
      const val = (result[key] || "").toString();
      return val.toLowerCase() !== "normal" && val !== "—" && val !== "";
    });

    if (hasHighlights) {
      const ul = document.createElement("ul");
      markers.forEach((key) => {
        const raw = result[key] || "—";
        const val = String(raw);
        const li = document.createElement("li");
        li.textContent = `${key.replace("Status", "").toUpperCase()}: ${val}`;
        const lower = val.toLowerCase();
        if (lower.includes("normal")) li.classList.add("highlight-normal");
        else if (lower.includes("borderline")) li.classList.add("highlight-borderline");
        else if (lower.includes("low") || lower.includes("high")) li.classList.add("highlight-abnormal");
        ul.appendChild(li);
      });
      highlightsEl.appendChild(ul);
    } else {
      highlightsEl.textContent = "No abnormal markers detected.";
    }
  }

  function renderFollowUp(result) {
    const followUpEl = safeGet("followUpBtn");
    if (!followUpEl) return;

    const hb = result.hbStatus;
    const wbc = result.wbcStatus;
    const pl = result.plateletsStatus;

    if (hb === "Normal" && wbc === "Normal" && pl === "Normal") {
      followUpEl.textContent = "Routine check";
      followUpEl.className = "mini-pill normal";
    } else if ([hb, wbc, pl].some((v) => v === "Borderline")) {
      followUpEl.textContent = "Follow up soon";
      followUpEl.className = "mini-pill borderline";
    } else {
      followUpEl.textContent = "Follow up in 2–4 weeks";
      followUpEl.className = "mini-pill abnormal";
    }
  }

  function updateCBCSummary(result) {
    if (!result) return;

    // Update CBC values
    setText("cbc-hb", result.hbStatus || "—");
    setText("cbc-wbc", result.wbcStatus || "—");
    setText("cbc-platelets", result.plateletsStatus || "—");
    setText("cbc-note", result.note || "Awaiting analysis...");

    // Highlights and follow-up
    renderHighlights(result);
    renderFollowUp(result);

    // Timestamp
    const subEl = document.querySelector(".insight-sub");
    if (subEl) {
      const ts = result.timestamp || result.updatedAt || null;
      if (ts) {
        const formatted = formatTimestamp(ts);
        if (formatted) subEl.textContent = `Last updated: ${formatted}`;
      }
    }
  }

  // Try to read structured cbcSummary first, then fallback to analyzedResults array
  function readLatestResultFromStorage() {
    try {
      // Prefer explicit cbcSummary key if present
      const rawSummary = localStorage.getItem(altSummaryKey);
      if (rawSummary) {
        try {
          const parsed = JSON.parse(rawSummary);
          // Normalize keys if needed (allow hbStatus vs hb)
          return parsed;
        } catch (e) {
          // if it's not JSON, ignore
        }
      }

      // Next try cbcResults (extended)
      const rawResults = localStorage.getItem(altResultsKey);
      if (rawResults) {
        try {
          const parsedExt = JSON.parse(rawResults);
          return parsedExt;
        } catch (e) {}
      }

      // Finally, fall back to analyzedResults array
      const allResults = JSON.parse(localStorage.getItem(storageKey) || "[]");
      if (Array.isArray(allResults) && allResults.length > 0) {
        return allResults[allResults.length - 1];
      }
    } catch (err) {
      console.warn("readLatestResultFromStorage error", err);
    }
    return null;
  }

  // Refresh UI from storage
  function refreshFromStorage() {
    const latest = readLatestResultFromStorage();
    if (latest) updateCBCSummary(latest);
    else {
      const noteEl = safeGet("cbc-note");
      if (noteEl) noteEl.textContent = "Awaiting analysis...";
      const highlightsEl = safeGet("cbc-highlights");
      if (highlightsEl) highlightsEl.textContent = "No abnormal markers detected.";
    }
  }

  // Cross-tab storage listener
  window.addEventListener("storage", (ev) => {
    if (!ev.key) return;
    const interesting = [storageKey, altSummaryKey, altResultsKey, "labinsight:cbc:updated", "labinsight:lastCounts"];
    if (interesting.includes(ev.key)) {
      refreshFromStorage();
      // If lastCounts changed, re-dispatch local event to enable export UI if present
      if (ev.key === "labinsight:lastCounts") {
        try {
          const lc = JSON.parse(ev.newValue || "null");
          if (lc && (lc.normal || lc.borderline || lc.abnormal)) {
            window.dispatchEvent(new Event("labinsight:lastCountsSet"));
          }
        } catch (e) {}
      }
    }
  });

  // Same-tab custom events from analyzer
  window.addEventListener("labinsight:cbc", (e) => {
    if (e?.detail) updateCBCSummary(e.detail);
    else refreshFromStorage();
  });

  // Optional: enable export when lastCounts set in same tab
  window.addEventListener("labinsight:lastCountsSet", () => {
    const exportEl = safeGet("exportPdfBtn") || safeGet("exportPdf");
    if (!exportEl) return;
    if (exportEl.tagName.toLowerCase() === "button") exportEl.disabled = false;
    else exportEl.classList.remove("disabled");
  });

  // Initial load
  refreshFromStorage();
});
