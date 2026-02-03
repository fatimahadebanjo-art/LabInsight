(function(){
  window.LabInsight = window.LabInsight || {};

  async function exportPdf(){
    const resultCanvas = document.getElementById('resultChart');
    if (!resultCanvas) { alert('Please run Analyze first to generate the result doughnut chart.'); return; }
    const logoEl = document.querySelector('.nav-left img') || document.querySelector('.footer-logo');
    const logoUrl = logoEl ? logoEl.getAttribute('src') : null;
    const loadImageDataUrl = async (url) => { if (!url) return null; return new Promise((resolve)=>{ const img = new Image(); img.crossOrigin='anonymous'; img.onload = function(){ const c = document.createElement('canvas'); c.width = img.width; c.height = img.height; const ctx = c.getContext('2d'); ctx.drawImage(img,0,0); resolve(c.toDataURL('image/png')); }; img.onerror = function(){ resolve(null); }; img.src = url; }); };
    if (!window.LabInsight.trendChartInstance) window.LabInsight.renderMonthlyChart();
    const trendCanvas = document.getElementById('trendChart');
    const resultImg = resultCanvas.toDataURL('image/png',1.0);
    const trendImg = trendCanvas ? trendCanvas.toDataURL('image/png',1.0) : null;
    const logoData = await loadImageDataUrl(logoUrl);
    const counts = window.lastCounts || { normal:0, borderline:0, abnormal:0 };
    const docQuestions = (window.lastDoctorQuestions || []).concat(window.customQuestions || []);
    const patientName = document.getElementById('patientName')?.value || '';
    const patientDOB = document.getElementById('patientDOB')?.value || '';
    const patientID = document.getElementById('patientID')?.value || '';

    try {
      const { jsPDF } = window.jspdf;
      const pdf = new jsPDF({ unit: 'mm', format: 'a4' });
      const pageWidth = pdf.internal.pageSize.getWidth();
      if (logoData) pdf.addImage(logoData, 'PNG', 15, 10, 30, 30);
      pdf.setFontSize(16); pdf.text('LabInsight Pro', pageWidth/2, 18, { align:'center' });
      pdf.setFontSize(10); pdf.text(`Report generated: ${new Date().toLocaleString()}`, pageWidth/2, 24, { align:'center' });
      const rightX = pageWidth - 15 - 70;
      pdf.setFontSize(9); pdf.text(`PatientName: ${patientName}`, rightX, 21); pdf.text(`DOB: ${patientDOB}`, rightX, 26); pdf.text(`Patient ID: ${patientID}`, rightX, 31);
      pdf.setLineWidth(0.5); pdf.line(15,45,pageWidth-15,45);
      let y = 50; pdf.setFontSize(12); pdf.text('Current Analysis', 15, y);
      const imgW = 70, imgH = 70; pdf.addImage(resultImg, 'PNG', 15, y+5, imgW, imgH);
      let sx = 15 + imgW + 10; let sy = y + 10; pdf.setFontSize(11); pdf.text('Summary:', sx, sy); sy += 6; pdf.setFontSize(10);
      pdf.text(`Abnormal: ${counts.abnormal}`, sx, sy); sy += 6; pdf.text(`Borderline: ${counts.borderline}`, sx, sy); sy += 6; pdf.text(`Normal: ${counts.normal}`, sx, sy); sy += 8;
      pdf.text('Questions to Ask Your Doctor:', sx, sy); sy += 6;
      if (docQuestions.length === 0) { pdf.text('- None provided', sx, sy); sy += 6; } else { docQuestions.forEach(q => { pdf.text(`- ${q}`, sx, sy); sy += 6; if (sy > 270) { pdf.addPage(); sy = 20; } }); }

      // Insert saved results summary (last up to 50 entries) with classification counts
      try {
        const stored = (typeof window.LabInsight.getStored === 'function') ? window.LabInsight.getStored() : [];
        if (stored && stored.length > 0) {
          pdf.addPage(); pdf.setFontSize(12); pdf.text('Saved Results', 15, 20);
          let y2 = 28; pdf.setFontSize(10);
          const maxEntries = 50;
          const entries = stored.slice(-maxEntries).reverse();
          entries.forEach(en => {
            const d = en.date || (en.timestamp && en.timestamp.split('T')[0]) || '';
            const c = en.counts || {};
            const line = `${d} — Abnormal: ${c.abnormal||0}, Borderline: ${c.borderline||0}, Normal: ${c.normal||0}`;
            pdf.text(line, 15, y2); y2 += 6;
            // list all tests filled by the user (prefer testRules order when available)
            try {
              const ruleKeys = (window.LabInsight && window.LabInsight.testRules) ? Object.keys(window.LabInsight.testRules) : Object.keys(en).sort();
              const testsToShow = ruleKeys.filter(k => en[k] !== undefined && k !== 'timestamp' && k !== 'date' && k !== 'counts');
              if (testsToShow.length > 0) {
                let testLine = '';
                testsToShow.forEach((tk, idx) => {
                  const val = en[tk];
                  const label = (window.LabInsight && window.LabInsight.testRules && window.LabInsight.testRules[tk]) ? (window.LabInsight.testRules[tk].name || tk) : tk;
                  // wrap long lines to avoid overflowing the page width
                  if (testLine.length + label.length + String(val).length + 4 > 160) { pdf.text(testLine, 18, y2); y2 += 6; testLine = ''; }
                  testLine += `${label}: ${val}${idx < testsToShow.length-1 ? '  ' : ''}`;
                });
                if (testLine) { pdf.text(testLine, 18, y2); y2 += 6; }
              }
            } catch(e) { /* ignore */ }
            if (y2 > 270) { pdf.addPage(); y2 = 20; }
          });
        }
      } catch (e) { console.warn('Failed to include saved results in PDF', e); }

      pdf.addPage(); pdf.setFontSize(12); pdf.text('Monthly Trend', 15, 20);
      if (trendImg) { const usableWidth = pageWidth - 30; const trendHeight = pdf.internal.pageSize.getHeight() - 40; pdf.addImage(trendImg, 'PNG', 15, 30, usableWidth, trendHeight); } else { pdf.text('No trend chart available.', 15, 40); }
      pdf.setFontSize(9); pdf.text('Generated by LabInsight Pro • For educational purposes only. Not a medical diagnosis.', 15, pdf.internal.pageSize.getHeight() - 10);
      pdf.save(`LabInsight_Report_${new Date().toISOString().slice(0,10)}.pdf`);
    } catch (err) { console.error('Error generating PDF', err); alert('Failed to generate PDF. Check console for details.'); }
  }

  window.LabInsight.exportPdf = exportPdf;
})();