(function () {
  window.LabInsight = window.LabInsight || {};

  // --- Helper: Check if user is Pro ---
  function isProUser() {
    if (typeof window.LabInsight?.isPro === "function") {
      return window.LabInsight.isPro();
    }
    const plan = (
      localStorage.getItem("plan") ||
      localStorage.getItem("userPlan") ||
      localStorage.getItem("isPro") ||
      ""
    ).toLowerCase();
    return plan === "pro" || plan === "true";
  }

  // --- Helper: Require Pro ---
  function requirePro(featureName) {
    if (isProUser()) return true;
    alert(`Upgrade to Pro to use ${featureName}.`);
    window.location.href = "pro.html";
    return false;
  }

  // --- Main PDF Export ---
  async function exportPdf() {
    if (!requirePro("Export PDF")) return;

    const resultCanvas = document.getElementById("resultChart");
    if (!resultCanvas) {
      alert("Please run 'Analyze' first to generate the result chart.");
      return;
    }

    // Load logo if available
    const logoEl = document.querySelector(".nav-left img") || document.querySelector(".footer-logo");
    const logoUrl = logoEl?.getAttribute("src") || null;

    const loadImageDataUrl = async (url) => {
      if (!url) return null;
      return new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => {
          const c = document.createElement("canvas");
          c.width = img.width;
          c.height = img.height;
          c.getContext("2d").drawImage(img, 0, 0);
          resolve(c.toDataURL("image/png"));
        };
        img.onerror = () => resolve(null);
        img.src = url;
      });
    };

    const trendCanvas = document.getElementById("trendChart");
    const resultImg = resultCanvas.toDataURL("image/png", 1.0);
    const trendImg = trendCanvas?.toDataURL("image/png", 1.0) || null;
    const logoData = await loadImageDataUrl(logoUrl);

    const counts = window.lastCounts || { normal: 0, borderline: 0, abnormal: 0 };
    const docQuestions = [...(window.lastDoctorQuestions || []), ...(window.customQuestions || [])];

    const patientName = document.getElementById("patientName")?.value || "";
    const patientDOB = document.getElementById("patientDOB")?.value || "";
    const patientID = document.getElementById("patientID")?.value || "";

    try {
      const { jsPDF } = window.jspdf;
      const pdf = new jsPDF({ unit: "mm", format: "a4" });
      const pageWidth = pdf.internal.pageSize.getWidth();

      // --- Header ---
      if (logoData) pdf.addImage(logoData, "PNG", 15, 10, 30, 30);
      pdf.setFontSize(16);
      pdf.text("LabInsight Pro", pageWidth / 2, 18, { align: "center" });
      pdf.setFontSize(10);
      pdf.text(`Report generated: ${new Date().toLocaleString()}`, pageWidth / 2, 24, { align: "center" });

      const rightX = pageWidth - 85;
      pdf.setFontSize(9);
      pdf.text(`Patient Name: ${patientName}`, rightX, 21);
      pdf.text(`DOB: ${patientDOB}`, rightX, 26);
      pdf.text(`Patient ID: ${patientID}`, rightX, 31);

      pdf.setLineWidth(0.5);
      pdf.line(15, 45, pageWidth - 15, 45);

      // --- Current Analysis ---
      let y = 50;
      pdf.setFontSize(12);
      pdf.text("Current Analysis", 15, y);

      const imgW = 70, imgH = 70;
      pdf.addImage(resultImg, "PNG", 15, y + 5, imgW, imgH);

      let sx = 15 + imgW + 10;
      let sy = y + 10;
      pdf.setFontSize(11);
      pdf.text("Summary:", sx, sy);
      sy += 6;
      pdf.setFontSize(10);
      pdf.text(`Abnormal: ${counts.abnormal}`, sx, sy); sy += 6;
      pdf.text(`Borderline: ${counts.borderline}`, sx, sy); sy += 6;
      pdf.text(`Normal: ${counts.normal}`, sx, sy); sy += 8;

      pdf.text("Questions to Ask Your Doctor:", sx, sy); sy += 6;
      if (!docQuestions.length) pdf.text("- None provided", sx, sy);
      else docQuestions.forEach((q) => {
        pdf.text(`- ${q}`, sx, sy);
        sy += 6;
        if (sy > 270) { pdf.addPage(); sy = 20; }
      });

      // --- Saved Results ---
      const stored = typeof window.LabInsight.getStored === "function" ? window.LabInsight.getStored() : [];
      if (stored.length) {
        pdf.addPage();
        pdf.setFontSize(12);
        pdf.text("Saved Results", 15, 20);
        let y2 = 28;
        pdf.setFontSize(10);
        stored.slice(-15).reverse().forEach((en) => {
          const d = en.date || (en.timestamp?.split("T")[0]) || "";
          const c = en.counts || {};
          pdf.text(`${d} — Abnormal: ${c.abnormal || 0}, Borderline: ${c.borderline || 0}, Normal: ${c.normal || 0}`, 15, y2);
          y2 += 6;
          if (y2 > 270) { pdf.addPage(); y2 = 20; }
        });
      }

      // --- Monthly Trend ---
      pdf.addPage();
      pdf.setFontSize(12);
      pdf.text("Monthly Trend", 15, 20);
      if (trendImg) {
        const usableWidth = pageWidth - 30;
        const trendHeight = pdf.internal.pageSize.getHeight() - 40;
        pdf.addImage(trendImg, "PNG", 15, 30, usableWidth, trendHeight);
      } else pdf.text("No trend chart available.", 15, 40);

      // --- Footer ---
      pdf.setFontSize(9);
      pdf.text(
        "Generated by LabInsight Pro • For educational purposes only. Not a medical diagnosis.",
        15,
        pdf.internal.pageSize.getHeight() - 10
      );

      // Save PDF
      pdf.save(`LabInsight_Report_${new Date().toISOString().slice(0, 10)}.pdf`);
    } catch (err) {
      console.error("Error generating PDF", err);
      alert("Failed to generate PDF. Check console for details.");
    }
  }

  // --- Expose function ---
  window.LabInsight.exportPdf = exportPdf;

  // --- Attach handlers to buttons ---
  document.getElementById("exportPdfBtn")?.addEventListener("click", () => {

    if (!window.LabInsight.requirePro("PDF Export")) return;

    exportPdf();

  });
})();