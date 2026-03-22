import { showProNotification } from './notifications.js';
document.addEventListener("DOMContentLoaded", () => {
  // Collect all feature buttons
  const downloadBtn = document.getElementById("downloadBtn");       // CSV Export
  const exportPdfBtn = document.getElementById("exportPdfBtn");     // PDF Export
  const riskBtn = document.getElementById("multiRiskBtn");          // Multi-Risk Analysis
  const timelineBtn = document.getElementById("timelineExportBtn"); // Timeline Export
  const doctorBtn = document.getElementById("doctorQuestionsBtn");  // Doctor Questions

  // Utility: check if user is Pro
  function isProUser() {
    const plan = (localStorage.getItem("plan") || "").toLowerCase();
    return plan === "pro";
  }

  // Show upgrade modal
  function showProNotification(message) {
    const modal = document.createElement("div");
    modal.className = "pro-modal";
    modal.innerHTML = `
      <div class="pro-modal-content">
        <p>${message}</p>
        <a href="pro.html" class="btn btn-primary">Upgrade Now</a>
      </div>`;
    document.body.appendChild(modal);
    setTimeout(() => modal.remove(), 6000);
  }

  // --- Feature handlers ---
  if (downloadBtn) {
    downloadBtn.addEventListener("click", () => {
      if (!isProUser()) return showProNotification("Pro Feature: CSV export is locked");
      const results = JSON.parse(localStorage.getItem("analyzedResults") || "[]");
      if (!results.length) return showProNotification("No analyzed results to export");

      const markers = Object.keys(results[0].tests || {});
      const header = ["Timestamp", "Patient Name", ...markers];
      const csvRows = [header.join(",")];
      results.forEach(r => {
        const row = [
          new Date(r.timestamp).toLocaleString(),
          r.patientName || "",
          ...markers.map(m => r.tests[m]?.value || "")
        ];
        csvRows.push(row.join(","));
      });
      const blob = new Blob([csvRows.join("\n")], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = "lab_results.csv";
      link.click();
    });
  }

  if (exportPdfBtn) {
    exportPdfBtn.addEventListener("click", () => {
      if (!isProUser()) return showProNotification("Pro Feature: PDF export is locked");
      const results = JSON.parse(localStorage.getItem("analyzedResults") || "[]");
      if (!results.length) return showProNotification("No analyzed results to export");

      if (window.jspdf) {
        const doc = new jsPDF();
        results.forEach((r, i) => {
          doc.setFontSize(12);
          doc.text(`Patient: ${r.patientName || "N/A"}`, 10, 10 + i * 60);
          doc.text(`Timestamp: ${new Date(r.timestamp).toLocaleString()}`, 10, 16 + i * 60);
          Object.entries(r.tests).forEach(([marker, val], idx) => {
            doc.text(`${marker}: ${val.value}`, 10, 22 + idx * 6 + i * 60);
          });
          if (i < results.length - 1) doc.addPage();
        });
        doc.save("lab_results.pdf");
      } else {
        showProNotification("PDF export unavailable: jsPDF not loaded");
      }
    });
  }

  if (riskBtn) {
    riskBtn.addEventListener("click", () => {
      if (!isProUser()) return showProNotification("Pro Feature: Multi‑Risk Analysis is locked");
      calculateMultiRisk();
    });
  }

  if (timelineBtn) {
    timelineBtn.addEventListener("click", () => {
      if (!isProUser()) return showProNotification("Pro Feature: Timeline export is locked");
      exportTimeline(); // implement your timeline export function
    });
  }

  if (doctorBtn) {
    doctorBtn.addEventListener("click", () => {
      if (!isProUser()) return showProNotification("Pro Feature: Doctor Questions are locked");
      showDoctorQuestions(); // implement your doctor questions function
    });
  }

  // --- Visual cues ---
  const proButtons = [downloadBtn, exportPdfBtn, riskBtn, timelineBtn, doctorBtn].filter(Boolean);
  proButtons.forEach(btn => {
    if (!isProUser()) {
      btn.classList.add("locked");
      btn.title = "Upgrade to Pro to unlock";
    } else {
      btn.classList.add("active");
      btn.title = "";
    }
  });
});
