try { console.log('analyzer.js: file loaded'); window.__analyzerLoaded = true; } catch(e){ console.error('analyzer.js startup error', e); }

document.addEventListener("DOMContentLoaded", function () {
  const manualBtn = document.getElementById("manualAnalyzeBtn");
  const output = document.getElementById("output");

  // Custom patient questions (added by user through question input)
  let customQuestions = [];


  if (manualBtn) {
    manualBtn.addEventListener("click", function () {
      const inputs = document.querySelectorAll(".test-input");
      let message = "";
      let normalCount = 0;
      let borderlineCount = 0;
      let abnormalCount = 0;
      let doctorQuestions = [];


      // --- Patient-friendly rules with dynamic questions ---
      const testRules = {
  hb: {
    name: "Hemoglobin (g/dL)", ranges: [
      { max: 12, msg: "LOW — may suggest anemia.", category: "abnormal", questions: ["Could this be anemia?", "Do I need iron supplements or further tests?"] },
      { max: 16, msg: "NORMAL — hemoglobin is within the healthy range.", category: "normal" },
      { max: Infinity, msg: "HIGH — may be due to dehydration or other factors.", category: "abnormal", questions: ["Could dehydration be causing this?", "Do I need further tests for blood disorders?"] }
    ]
  },
  wbc: {
    name: "White Blood Cells (x10⁹/L)", ranges: [
      { max: 4, msg: "LOW — your immune system may be weakened.", category: "abnormal", questions: ["Is my immune system suppressed?", "Do I need more tests for infections?"] },
      { max: 11, msg: "NORMAL — white blood cell count is healthy.", category: "normal" },
      { max: Infinity, msg: "HIGH — may indicate infection, inflammation or stress.", category: "abnormal", questions: ["Could this mean I have an infection?", "Do I need antibiotics or further tests?"] }
    ]
  },
  platelets: {
    name: "Platelets (x10⁹/L)", ranges: [
      { max: 150, msg: "LOW — risk of bleeding or easy bruising.", category: "abnormal", questions: ["Am I at risk of bleeding?", "Do I need treatment for low platelets?"] },
      { max: 450, msg: "NORMAL — platelet count is healthy.", category: "normal" },
      { max: Infinity, msg: "HIGH — may be linked to inflammation or bone marrow changes.", category: "abnormal", questions: ["What could cause high platelets?", "Do I need further blood tests?"] }
    ]
  },
  sugar: {
    name: "Blood Sugar (mg/dL)", ranges: [
      { max: 70, msg: "LOW — may cause dizziness or shakiness.", category: "abnormal", questions: ["Could my diet or medications be causing low sugar?", "How can I prevent hypoglycemia episodes?"] },
      { max: 99, msg: "NORMAL — fasting blood sugar is healthy.", category: "normal" },
      { max: 125, msg: "BORDERLINE — in the prediabetes range.", category: "borderline", questions: ["Am I at risk of developing diabetes?", "What lifestyle changes should I make now?"] },
      { max: Infinity, msg: "HIGH — may indicate diabetes risk.", category: "abnormal", questions: ["Do I need further tests for diabetes?", "Should I start medication or change my diet?"] }
    ]
  },
  cholesterol: {
    name: "Total Cholesterol (mg/dL)", ranges: [
      { max: 200, msg: "NORMAL — cholesterol is in a healthy range.", category: "normal" },
      { max: 239, msg: "BORDERLINE HIGH — keep an eye on diet and exercise.", category: "borderline", questions: ["Should I change my diet to lower cholesterol?", "Do I need medication at this stage?"] },
      { max: Infinity, msg: "HIGH — increases risk of heart disease.", category: "abnormal", questions: ["What is my risk of heart disease?", "What treatments or lifestyle changes can help lower cholesterol?"] }
    ]
  },
  triglycerides: {
    name: "Triglycerides (mg/dL)", ranges: [
      { max: 150, msg: "NORMAL — triglycerides are healthy.", category: "normal" },
      { max: 199, msg: "BORDERLINE HIGH — may need lifestyle changes.", category: "borderline", questions: ["Should I change my diet to lower triglycerides?", "Do I need medication?"] },
      { max: 499, msg: "HIGH — raises risk of heart disease.", category: "abnormal", questions: ["What is my risk of heart disease?", "What treatments can help lower triglycerides?"] },
      { max: Infinity, msg: "VERY HIGH — risk of pancreatitis.", category: "abnormal", questions: ["Am I at risk of pancreatitis?", "Do I need urgent treatment?"] }
    ]
  },
  hdl: {
    name: "HDL Cholesterol (mg/dL)", ranges: [
      { max: 40, msg: "LOW — less protective against heart disease.", category: "abnormal", questions: ["How can I raise my HDL?", "Do I need lifestyle changes?"] },
      { max: 59, msg: "NORMAL — HDL is healthy.", category: "normal" },
      { max: Infinity, msg: "HIGH — protective for heart health.", category: "normal" }
    ]
  },
  ldl: {
    name: "LDL Cholesterol (mg/dL)", ranges: [
      { max: 100, msg: "Optimal — LDL is healthy.", category: "normal" },
      { max: 129, msg: "Near optimal — acceptable range.", category: "normal" },
      { max: 159, msg: "Borderline high — may need lifestyle changes.", category: "borderline", questions: ["Should I change my diet to lower LDL?", "Do I need medication?"] },
      { max: 189, msg: "HIGH — increases risk of heart disease.", category: "abnormal", questions: ["What is my risk of heart disease?", "Do I need cholesterol-lowering medication?"] },
      { max: Infinity, msg: "Very high — serious heart disease risk.", category: "abnormal", questions: ["Do I need urgent treatment?", "What lifestyle changes are most important?"] }
    ]
  },
  bun: {
    name: "Urea / BUN (mg/dL)", ranges: [
      { max: 7, msg: "LOW — may suggest liver issues or poor nutrition.", category: "abnormal", questions: ["Could this mean liver problems?", "Do I need nutrition support?"] },
      { max: 20, msg: "NORMAL — kidney function looks healthy.", category: "normal" },
      { max: Infinity, msg: "HIGH — may indicate kidney problems or dehydration.", category: "abnormal", questions: ["Could dehydration be causing this?", "Do I need kidney function tests?"] }
    ]
  },
  sodium: {
    name: "Sodium (mmol/L)", ranges: [
      { max: 135, msg: "LOW — can cause headaches, nausea, or confusion.", category: "abnormal", questions: ["What could cause low sodium?", "Do I need fluid or salt adjustments?"] },
      { max: 145, msg: "NORMAL — sodium levels are healthy.", category: "normal" },
      { max: Infinity, msg: "HIGH — can cause thirst, weakness, or restlessness.", category: "abnormal", questions: ["What could cause high sodium?", "Do I need to change my fluid intake?"] }
    ]
  },
  potassium: {
    name: "Potassium (mmol/L)", ranges: [
      { max: 3.5, msg: "LOW — may cause muscle weakness or cramps.", category: "abnormal", questions: ["Could medications be lowering my potassium?", "Do I need supplements?"] },
      { max: 5.0, msg: "NORMAL — potassium levels are healthy.", category: "normal" },
      { max: Infinity, msg: "HIGH — may cause irregular heartbeat or weakness.", category: "abnormal", questions: ["Is my heart at risk?", "Do I need urgent treatment?"] }
    ]
  },
  chloride: {
    name: "Chloride (mmol/L)", ranges: [
      { max: 98, msg: "LOW — blood may be more alkaline than usual.", category: "abnormal", questions: ["What could cause low chloride?", "Do I need further tests for acid-base balance?"] },
      { max: 106, msg: "NORMAL — chloride levels are healthy.", category: "normal" },
      { max: Infinity, msg: "HIGH — blood may be more acidic than usual.", category: "abnormal", questions: ["What could cause high chloride?", "Do I need further tests for acid-base balance?"] }
    ]
  },
  creatinine: {
    name: "Creatinine (mg/dL)", ranges: [
      { max: 0.6, msg: "LOW — may reflect low muscle mass.", category: "abnormal", questions: ["Does this mean I have low muscle mass?", "Do I need further kidney tests?"] },
      { max: 1.3, msg: "NORMAL — kidney function looks healthy.", category: "normal" },
      { max: Infinity, msg: "HIGH — may indicate kidney problems.", category: "abnormal", questions: ["Do I need further kidney tests?", "Should I see a kidney specialist?"] }
    ]
  },
    alt: {
    name: "ALT (U/L)", ranges: [
      { max: 40, msg: "NORMAL — ALT is healthy.", category: "normal" },
      { max: Infinity, msg: "HIGH — may suggest liver stress or injury.", category: "abnormal", questions: ["Could this mean liver damage?", "Do I need further liver tests?"] }
    ]
  },
  ast: {
    name: "AST (U/L)", ranges: [
      { max: 40, msg: "NORMAL — AST is healthy.", category: "normal" },
      { max: Infinity, msg: "HIGH — may suggest liver or muscle stress.", category: "abnormal", questions: ["Could this mean liver or muscle damage?", "Do I need further tests?"] }
    ]
  }
};

        // --- Loop through inputs and collect messages + questions ---
        inputs.forEach(input => {
  if (input.value !== "") {
    const value = Number(input.value);
    const rules = testRules[input.id];

    if (rules) {
      for (let r of rules.ranges) {
        if (value <= r.max) {
          let cssClass = "result-normal"; // default

switch ((r.category || "").toLowerCase().trim()) {
  case "abnormal":
    cssClass = "result-abnormal";
    abnormalCount++;
    if (r.questions) doctorQuestions.push(...r.questions);
    break;
  case "borderline":
    cssClass = "result-borderline";
    borderlineCount++;
    if (r.questions) doctorQuestions.push(...r.questions);
    break;
  case "normal":
    cssClass = "result-normal";
    normalCount++;
    break;
  default:
    console.warn(`Unexpected category for ${rules.name}:`, r.category);
    break;
}


console.log(`${rules.name}: value=${value}, checking max=${r.max}, category=${r.category}`);


          message += `
            <p>
              <strong>${rules.name}:</strong>
              <span class="${cssClass}">${r.msg}</span>
            </p>
          `;
          break;
        }
      }
    }
  }
});


        // --- Add summary + dynamic questions + custom patient questions ---
        if(message) {
          message = `<p><strong>Summary:</strong> ${abnormalCount} test value(s) outside the normal range. 
        Please review the details below and consult a healthcare professional if needed.</p> <p><strong>Disclaimer:</strong>⚠️LabInsight Mini provides educational information only and does not replace professional medical advice. Always consult a qualified health provider for diagnosis or treatment.</p>` + message;


          if (doctorQuestions.length > 0 || customQuestions.length > 0) {
            message += `<h4>Questions to Ask Your Doctor</h4><ul>`;
            doctorQuestions.forEach(q => { message += `<li>${q}</li>`; });
            customQuestions.forEach(q => { message += `<li>${q}</li>`; });
            message += `</ul>`;
          }
        }

    // --- Show results ---
    if (output) {
      output.style.display = "block";
      // Ensure the chart canvas is present before rendering the Chart
      output.innerHTML = `<div class="chart-wrapper"><canvas id="resultChart" height="180"></canvas></div>` + (message || "Please enter at least one test value.");
      console.log(`Counts -> Normal: ${normalCount}, Borderline: ${borderlineCount}, Abnormal: ${abnormalCount}`);

      // store last analysis summary/questions so Export PDF can include them
      window.lastCounts = { normal: normalCount, borderline: borderlineCount, abnormal: abnormalCount };
      window.lastDoctorQuestions = doctorQuestions.slice();
      window.lastSummaryHtml = message;

      renderResultChart(normalCount, borderlineCount, abnormalCount);
    }
      });
  }

  // --- Patient question input handling ---
  const addQuestionBtn = document.getElementById("addQuestionBtn");
  const questionInput = document.getElementById("questionInput");

  if (addQuestionBtn && questionInput) {
    addQuestionBtn.addEventListener("click", function () {
      const q = questionInput.value.trim();
      if (q) {
        customQuestions.push(q);
        // expose for PDF export
        window.customQuestions = customQuestions;
        // Feedback without altering layout
        const statusEl = document.getElementById("questionStatus");
        if (statusEl) statusEl.textContent = "Question added.";
        questionInput.value = "";
      }
    });
  }
});

// --- Accordion toggle ---
document.addEventListener("DOMContentLoaded", function () {
  const buttons = document.querySelectorAll(".accordion-btn");
  console.log(`Accordion init: found ${buttons.length} buttons`);

  buttons.forEach((btn, idx) => {
    // Set explicit type and ARIA attributes for accessibility
    if (!btn.getAttribute('type')) btn.setAttribute('type', 'button');

    btn.addEventListener("click", function (e) {
      console.log('Accordion click:', idx, btn.textContent.trim());
      this.classList.toggle("active");
      const panel = this.nextElementSibling;
      if (!panel) { console.warn('Accordion button has no panel sibling', btn); return; }
      const isOpen = panel.classList.toggle("open");
      panel.style.display = isOpen ? "block" : "none";
      this.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });

    // Initialize ARIA state
    const panel = btn.nextElementSibling;
    if (panel) {
      if (!panel.id) panel.id = `panel-${idx}`;
      btn.setAttribute('aria-controls', panel.id);
      btn.setAttribute('aria-expanded', panel.classList.contains('open') ? 'true' : 'false');
    }
  });
});

// --- Upload / OCR ---
document.getElementById("uploadBtn")?.addEventListener("click", async function () {
  const fileInput = document.getElementById("labUpload");
  const status = document.getElementById("uploadStatus");

  if (!fileInput || !status) return;

  if (fileInput.files.length === 0) {
    status.textContent = "Please select a file.";
    return;
  }

  const file = fileInput.files[0];
  const fileName = file.name.toLowerCase();

  if (fileName.endsWith(".pdf")) {
    status.textContent = "PDF upload detected. Extraction not yet implemented.";
  } else if (fileName.endsWith(".docx")) {
    status.textContent = "DOCX upload detected. Extraction not yet implemented.";
  } else if (fileName.endsWith(".jpg") || fileName.endsWith(".jpeg") || fileName.endsWith(".png")) {
    status.textContent = "Processing image with OCR…";
    const result = await Tesseract.recognize(file, "eng");
    const fullText = result.data.text;
    console.log("OCR Output:", fullText);
    status.textContent = "Image text extracted. Auto‑filling inputs…";
    autoFillTests(fullText);
  } else {
    status.textContent = "Unsupported file type. Please upload PDF, DOCX, or image.";
  }
});

// --- Auto-fill tests from OCR text ---
function autoFillTests(extractedText) {
  const patterns = {
    hb: /hemo\s*globin[\s:]*([\d.,]+)/i,
    wbc: /w\s*b\s*c[\s:]*([\d.,]+)/i,
    platelets: /platelets[\s:]*([\d.,]+)/i,
    sugar: /(glucose|blood\s*sugar)[\s:]*([\d.,]+)/i,
    cholesterol: /cholesterol[\s:]*([\d.,]+)/i,
    triglycerides: /triglycerides[\s:]*([\d.,]+)/i,
    hdl: /hdl[\s:]*([\d.,]+)/i,
    ldl: /ldl[\s:]*([\d.,]+)/i,
    creatinine: /creatinine[\s:]*([\d.,]+)/i,
    bun: /(bun|urea)[\s:]*([\d.,]+)/i,
    alt: /alt[\s:]*([\d.,]+)/i,
    ast: /ast[\s:]*([\d.,]+)/i,
    sodium: /sodium[\s:]*([\d.,]+)/i,
    potassium: /potassium[\s:]*([\d.,]+)/i,
    chloride: /chloride[\s:]*([\d.,]+)/i
  };

  for (let id in patterns) {
    const match = extractedText.match(patterns[id]);
    if (match) {
      const valueMatch = match[match.length - 1].replace(",", ".").match(/\d+(\.\d+)?/);
      if (valueMatch) {
        const el = document.getElementById(id);
        if (el) el.value = valueMatch[0];
      }
    }
  }
}

// --- Modal helpers ---
function openModal(id) {
  const modal = document.getElementById(id + '-modal');
  if (modal) {
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }
}

function closeModal(id) {
  const modal = document.getElementById(id + '-modal');
  if (modal) {
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }
}
window.addEventListener('scroll', () => {
  const header = document.querySelector('header');
  if (window.scrollY > 50) {
    header.classList.add('scrolled');
  } else {
    header.classList.remove('scrolled');
  }
});
document.addEventListener("DOMContentLoaded", function () {
  const tabButtons = document.querySelectorAll(".tab-btn");
  const forms = document.querySelectorAll(".form-box");

  // Handle tab button clicks
  tabButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      // Remove active from all buttons and forms
      tabButtons.forEach(b => b.classList.remove("active"));
      forms.forEach(f => f.classList.remove("active"));

      // Add active to clicked button and its target form
      btn.classList.add("active");
      const target = document.getElementById(btn.dataset.target);
      if (target) target.classList.add("active");
    });
  });

  // Handle URL hash (#signup or #login)
  if (window.location.hash === "#signup") {
    document.querySelector(".tab-btn[data-target='signup']").click();
  }
  if (window.location.hash === "#login") {
    document.querySelector(".tab-btn[data-target='login']").click();
  }

  // Password match check for signup
  const signupBtn = document.getElementById("signupBtn");
  if (signupBtn) {
    signupBtn.addEventListener("click", function () {
      const password = document.getElementById("signup-password").value;
      const confirmPassword = document.getElementById("confirm-password").value;

      if (password === confirmPassword && password.length >= 8) {
        window.location.href = "welcome.html";
      } else if (password.length < 8) {
        alert("Password must be at least 8 characters long.");
      } else {
        alert("Passwords do not match. Please try again.");
      }
    });
  }
});

function showCorrectAnswer() {
  const resultElement =
    document.getElementById("quizResult");
  resultElement.innerHTML = "✅ Correct! 9.5 g/dL is typically considered LOW.";
  resultElement.style.color = "green";
}
function showIncorrectAnswer() {
  const resultElement =
    document.getElementById("quizResult")
  resultElement.innerHTML = "❌ Incorrect. 9.5 g/dL is typically considered LOW.";
  resultElement.style.color = "red";
}

// chart instance variable //
let chartInstance = null;
let trendChartInstance = null;

function renderResultChart(normal, borderline, abnormal) {
  const ctx = document.getElementById("resultChart");
  if (!ctx) return;


  chartInstance = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: ["Normal", "Borderline", "Abnormal"],
      datasets: [{
        data: [normal, borderline, abnormal],
        backgroundColor: [
          "#2ec4b6", // green
          "#ffb703", // amber
          "#e63946"  // red
        ],
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: "bottom"
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              return `${context.label}: ${context.raw} test(s)`;
            }
          }
        }
      }
    }
  });
}

// helper: pick visually distinct colors
function pickColor(i) {
  const palette = [
    '#003f5c','#2f4b7c','#665191','#a05195','#d45087','#f95d6a','#ff7c43','#ffa600','#2ec4b6','#ffb703','#e63946','#3a86ff'
  ];
  return palette[i % palette.length];
}

// Store results in localStorage (timestamped entries — allows multiple saves per day)
function saveResult(results) {
  const timestamp = new Date().toISOString();
  const date = timestamp.split("T")[0];
  const entry = { timestamp, date, ...results };
  try {
    const stored = JSON.parse(localStorage.getItem("labResults") || "[]");
    stored.push(entry);
    localStorage.setItem("labResults", JSON.stringify(stored));
    alert("Result saved!");
  } catch (e) {
    console.warn('localStorage unavailable for saving; using in-memory fallback', e);
    const f = JSON.parse(window.__labResultsFallback || '[]');
    f.push(entry);
    window.__labResultsFallback = JSON.stringify(f);
    alert('Result saved to temporary memory (local storage blocked).');
  }
}



// Download results as CSV (includes timestamp when available)
function downloadResults() {
  const stored = getStored();
  if (!stored || stored.length === 0) {
    alert("No results to download.");
    return;
  }

  let csv = "Timestamp,Date,Cholesterol,LDL,HDL,Triglycerides\n";
  stored.forEach(r => {
    const ts = r.timestamp || "";
    csv += `${ts},${r.date || ""},${r.cholesterol || ""},${r.ldl || ""},${r.hdl || ""},${r.triglycerides || ""}\n`;
  });

  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "lab_results.csv";
  a.click();
}

// Button handlers
document.getElementById("saveResultBtn")?.addEventListener("click", () => {
  const inputs = document.querySelectorAll('.test-input');
  const results = {};
  inputs.forEach(i => { results[i.id] = i.value || ""; });
  saveResult(results);
});

document.getElementById("viewTrendBtn")?.addEventListener("click", renderMonthlyChart);
document.getElementById("downloadBtn")?.addEventListener("click", downloadResults);

// Export PDF — captures current doughnut chart, monthly trend, summary counts, and questions
document.getElementById('exportPdfBtn')?.addEventListener('click', async () => {
  // need a result chart (doughnut) to snapshot
  const resultCanvas = document.getElementById('resultChart');
  if (!resultCanvas) { alert('Please run Analyze first to generate the result doughnut chart.'); return; }

  // attempt to load logo from header or footer
  const logoEl = document.querySelector('.nav-left img') || document.querySelector('.footer-logo');
  const logoUrl = logoEl ? logoEl.getAttribute('src') : null;
  const loadImageDataUrl = async (url) => {
    if (!url) return null;
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = function () {
        const c = document.createElement('canvas');
        c.width = img.width;
        c.height = img.height;
        const ctx = c.getContext('2d');
        ctx.drawImage(img, 0, 0);
        resolve(c.toDataURL('image/png'));
      };
      img.onerror = function () { resolve(null); };
      img.src = url;
    });
  };

  // ensure trend chart exists (render monthly if not present)
  if (!trendChartInstance) renderMonthlyChart();
  const trendCanvas = document.getElementById('trendChart');

  const resultImg = resultCanvas.toDataURL('image/png', 1.0);
  const trendImg = trendCanvas ? trendCanvas.toDataURL('image/png', 1.0) : null;
  const logoData = await loadImageDataUrl(logoUrl);

  const counts = window.lastCounts || { normal: 0, borderline: 0, abnormal: 0 };
  const docQuestions = (window.lastDoctorQuestions || []).concat(window.customQuestions || []);

  // patient info
  const patientName = document.getElementById('patientName')?.value || '';
  const patientDOB = document.getElementById('patientDOB')?.value || '';
  const patientID = document.getElementById('patientID')?.value || '';

  try {
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF({ unit: 'mm', format: 'a4' });
    const pageWidth = pdf.internal.pageSize.getWidth();

    // Header: logo left, title centered, patient info right
    if (logoData) pdf.addImage(logoData, 'PNG', 15, 10, 30, 30);
    pdf.setFontSize(16);
    pdf.text('LabInsight Pro', pageWidth / 2, 18, { align: 'center' });
    pdf.setFontSize(10);
    pdf.text(`Report generated: ${new Date().toLocaleString()}`, pageWidth / 2, 24, { align: 'center' });

    const rightX = pageWidth - 15 - 70;
    pdf.setFontSize(10);
    pdf.text('Patient:', rightX, 16);
    pdf.setFontSize(9);
    pdf.text(`Name: ${patientName}`, rightX, 21);
    pdf.text(`DOB: ${patientDOB}`, rightX, 26);
    pdf.text(`Patient ID: ${patientID}`, rightX, 31);

    // separator
    pdf.setLineWidth(0.5);
    pdf.line(15, 45, pageWidth - 15, 45);

    // Content area: doughnut left, summary & questions right
    let y = 50;
    pdf.setFontSize(12);
    pdf.text('Current Analysis', 15, y);
    const imgW = 70;
    const imgH = 70;
    pdf.addImage(resultImg, 'PNG', 15, y + 5, imgW, imgH);

    let sx = 15 + imgW + 10;
    let sy = y + 10;
    pdf.setFontSize(11);
    pdf.text('Summary:', sx, sy);
    sy += 6;
    pdf.setFontSize(10);
    pdf.text(`Abnormal: ${counts.abnormal}`, sx, sy); sy += 6;
    pdf.text(`Borderline: ${counts.borderline}`, sx, sy); sy += 6;
    pdf.text(`Normal: ${counts.normal}`, sx, sy); sy += 8;
    pdf.text('Questions to Ask Your Doctor:', sx, sy); sy += 6;
    if (docQuestions.length === 0) {
      pdf.text('- None provided', sx, sy); sy += 6;
    } else {
      docQuestions.forEach(q => { pdf.text(`- ${q}`, sx, sy); sy += 6; if (sy > 270) { pdf.addPage(); sy = 20; } });
    }

    // Monthly trend on next page
    pdf.addPage();
    pdf.setFontSize(12);
    pdf.text('Monthly Trend', 15, 20);
    if (trendImg) {
      const usableWidth = pageWidth - 30;
      const trendHeight = pdf.internal.pageSize.getHeight() - 40;
      pdf.addImage(trendImg, 'PNG', 15, 30, usableWidth, trendHeight);
    } else {
      pdf.text('No trend chart available.', 15, 40);
    }

    // footer note
    pdf.setFontSize(9);
    pdf.text('Generated by LabInsight Pro • For educational purposes only. Not a medical diagnosis.', 15, pdf.internal.pageSize.getHeight() - 10);

    pdf.save(`LabInsight_Report_${new Date().toISOString().slice(0,10)}.pdf`);
  } catch (err) {
    console.error('Error generating PDF', err);
    alert('Failed to generate PDF. Check console for details.');
  }
});



// Demo fill for testing trend chart
document.getElementById("demoFillBtn")?.addEventListener("click", () => {
  const sample = {
    hb: 11.0,         // LOW — abnormal (anemia)
    wbc: 12.5,        // HIGH — abnormal (infection)
    platelets: 180,   // NORMAL
    sugar: 110,       // BORDERLINE (prediabetes range)
    creatinine: 1.5,  // HIGH — abnormal
    bun: 18,          // NORMAL
    alt: 55,          // HIGH — abnormal
    ast: 30,          // NORMAL
    cholesterol: 220, // BORDERLINE HIGH
    triglycerides: 180, // BORDERLINE HIGH
    hdl: 35,          // LOW — abnormal
    ldl: 160,         // HIGH — abnormal
    sodium: 132,      // LOW — abnormal
    potassium: 4.5,   // NORMAL
    chloride: 105     // NORMAL
  };
  Object.keys(sample).forEach(k => {
    const el = document.getElementById(k);
    if (el) el.value = sample[k];
  });

  // Minimal feedback only — do NOT analyze, save, or render charts
  const statusEl = document.getElementById("questionStatus");
  if (statusEl) statusEl.textContent = "Demo values populated.";
});

// ----- Monthly / Daily aggregation & drill-down -----
const TREND_SERIES = [
  { key: 'hb', label: 'Hemoglobin', color: '#6a4c93' },
  { key: 'wbc', label: 'WBC', color: '#1982c4' },
  { key: 'platelets', label: 'Platelets', color: '#8ac926' },
  { key: 'sugar', label: 'Blood Sugar', color: '#ff595e' },
  { key: 'creatinine', label: 'Creatinine', color: '#ffca3a' },
  { key: 'bun', label: 'Urea/BUN', color: '#2ec4b6' },
  { key: 'alt', label: 'ALT', color: '#e63946' },
  { key: 'ast', label: 'AST', color: '#3a86ff' },
  { key: 'cholesterol', label: 'Cholesterol', color: '#f77f00' },
  { key: 'triglycerides', label: 'Triglycerides', color: '#d62828' },
  { key: 'hdl', label: 'HDL', color: '#06d6a0' },
  { key: 'ldl', label: 'LDL', color: '#118ab2' },
  { key: 'sodium', label: 'Sodium', color: '#9a031e' },
  { key: 'potassium', label: 'Potassium', color: '#8338ec' },
  { key: 'chloride', label: 'Chloride', color: '#fb5607' }
];

function storageAvailable() {
  try { const x = '__ls_test__'; localStorage.setItem(x, x); localStorage.removeItem(x); return true; } catch (e) { return false; }
}

// Memory fallback when browser prevents access to localStorage
window.__labResultsFallback = window.__labResultsFallback || '[]';

function getStored() {
  if (storageAvailable()) {
    try {
      return JSON.parse(localStorage.getItem('labResults') || '[]');
    } catch (e) {
      console.warn('localStorage read failed, using fallback', e);
      return JSON.parse(window.__labResultsFallback || '[]');
    }
  } else {
    console.warn('localStorage unavailable, using in-memory fallback');
    return JSON.parse(window.__labResultsFallback || '[]');
  }
}

let currentDrillMonth = null; // 'YYYY-MM'
let trendCountsMap = {}; // used by tooltip callbacks

// Render monthly aggregated chart; clicking a month drills down into daily view
function renderMonthlyChart() {
  const stored = getStored();
  if (!stored || stored.length === 0) { alert('No saved results yet.'); return; }

  const monthly = {};
  stored.forEach(entry => {
    const date = entry.date || (entry.timestamp && entry.timestamp.split('T')[0]);
    const month = date ? date.slice(0,7) : null;
    if (!month) return;
    if (!monthly[month]) monthly[month] = { sums: {}, counts: {} };
    TREND_SERIES.forEach(s => {
      const v = entry[s.key];
      if (v !== undefined && v !== "") {
        monthly[month].sums[s.key] = (monthly[month].sums[s.key] || 0) + Number(v);
        monthly[month].counts[s.key] = (monthly[month].counts[s.key] || 0) + 1;
      }
    });
  });

  const months = Object.keys(monthly).sort();
  if (months.length === 0) { alert('No saved results yet.'); return; }

  // prepare counts map for tooltips
  trendCountsMap = {};
  months.forEach(m => trendCountsMap[m] = monthly[m].counts);

  const labels = months.map(m => new Date(m + '-01').toLocaleDateString());
  const datasets = TREND_SERIES.map(s => ({
    label: s.label,
    testKey: s.key,
    data: months.map(m => {
      const ms = monthly[m];
      if (!ms || !ms.counts[s.key]) return null;
      return Number((ms.sums[s.key] / ms.counts[s.key]).toFixed(2));
    }),
    backgroundColor: s.color
  }));

  const ctx = document.getElementById('trendChart');
  if (!ctx) return;
  if (trendChartInstance) trendChartInstance.destroy();

  trendChartInstance = new Chart(ctx, {
    type: 'bar',
    data: { labels, datasets },
    options: {
      responsive: true,
      plugins: {
        legend: { position: 'bottom' },
        tooltip: {
          callbacks: {
            label: function(context) {
              const ds = context.dataset;
              const v = context.raw;
              const monthKey = months[context.dataIndex];
              const count = (trendCountsMap[monthKey] && trendCountsMap[monthKey][ds.testKey]) || 0;
              return `${ds.label}: ${v === null ? 'no data' : v} (n=${count})`;
            }
          }
        }
      },
      onClick: function(evt, elements) {
        if (!elements || elements.length === 0) return;
        const idx = elements[0].index;
        const month = months[idx];
        currentDrillMonth = month;
        document.getElementById('backToMonthlyBtn').style.display = 'inline-block';
        renderDailyChart(month);
      },
      scales: {
        y: { beginAtZero: true, title: { display: true, text: 'Value' } },
        x: { title: { display: true, text: 'Month' } }
      }
    }
  });
}

// Render daily averages for a given YYYY-MM month string
function renderDailyChart(month) {
  const stored = getStored();
  const entries = stored.filter(e => ((e.date || (e.timestamp && e.timestamp.split('T')[0]) || '').startsWith(month)));
  if (!entries || entries.length === 0) { alert('No data for selected month.'); return; }

  const daily = {};
  entries.forEach(entry => {
    const day = (entry.timestamp || entry.date).split('T')[0];
    if (!daily[day]) daily[day] = { sums: {}, counts: {} };
    TREND_SERIES.forEach(s => {
      const v = entry[s.key];
      if (v !== undefined && v !== "") {
        daily[day].sums[s.key] = (daily[day].sums[s.key] || 0) + Number(v);
        daily[day].counts[s.key] = (daily[day].counts[s.key] || 0) + 1;
      }
    });
  });

  const days = Object.keys(daily).sort();
  const labels = days.map(d => new Date(d).toLocaleDateString());

  const countsMap = {};
  const datasets = TREND_SERIES.map(s => ({
    label: s.label,
    testKey: s.key,
    data: days.map(d => {
      const ds = daily[d];
      if (!ds || !ds.counts[s.key]) return null;
      countsMap[d] = daily[d].counts;
      return Number((ds.sums[s.key] / ds.counts[s.key]).toFixed(2));
    }),
    backgroundColor: s.color
  }));

  const ctx = document.getElementById('trendChart');
  if (!ctx) return;
  if (trendChartInstance) trendChartInstance.destroy();

  trendChartInstance = new Chart(ctx, {
    type: 'bar',
    data: { labels, datasets },
    options: {
      responsive: true,
      plugins: {
        legend: { position: 'bottom' },
        tooltip: {
          callbacks: {
            label: function(context) {
              const ds = context.dataset;
              const v = context.raw;
              const dayKey = days[context.dataIndex];
              const count = (countsMap[dayKey] && countsMap[dayKey][ds.testKey]) || 0;
              return `${ds.label}: ${v === null ? 'no data' : v} (n=${count})`;
            }
          }
        }
      },
      scales: {
        y: { beginAtZero: true, title: { display: true, text: 'Value' } },
        x: { title: { display: true, text: 'Date' } }
      }
    }
  });
}

// Optional: make existing renderTrendChart call monthly view for backward compatibility
function renderTrendChart() { renderMonthlyChart(); }

// Fallback handlers: delegated accordion toggle and minimal Analyze fallback
(function(){
  // Delegated click handler — keeps accordions & Analyze responsive even if initial handlers failed
  document.addEventListener('click', function(e){
    try {
      const btn = e.target.closest ? e.target.closest('.accordion-btn') : null;
      if (btn) {
        if (!btn.getAttribute('type')) btn.setAttribute('type','button');
        btn.classList.toggle('active');
        const panel = btn.nextElementSibling;
        if (panel) {
          const isOpen = panel.classList.toggle('open');
          panel.style.display = isOpen ? 'block' : 'none';
          btn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
        }
      }

      if (e.target && e.target.id === 'manualAnalyzeBtn') {
        try {
          const inputs = document.querySelectorAll('.test-input');
          let normal = 0, borderline = 0, abnormal = 0;
          inputs.forEach(i => { if (i.value && String(i.value).trim() !== '') normal++; });
          if ((normal + borderline + abnormal) === 0) {
            const s = document.getElementById('questionStatus'); if (s) s.textContent = 'Enter at least one value.';
            return;
          }
          if (typeof renderResultChart === 'function') renderResultChart(normal, borderline, abnormal);
        } catch (err) { console.error('Fallback analyze error', err); }
      }
    } catch (err) { console.error('Fallback handlers error', err); }
  });
})();

// ----- Runtime error capture & debug panel -----
(function(){
  function showDebug(msg, level='info'){
    try{
      const debug = document.getElementById('debugLog');
      const inner = document.getElementById('debugLogInner');
      if (debug && inner) {
        debug.style.display = 'block';
        const p = document.createElement('div');
        p.textContent = `[${level}] ${msg}`;
        p.style.marginBottom = '6px';
        p.style.wordBreak = 'break-word';
        if (level === 'error') p.style.color = 'crimson';
        inner.appendChild(p);
      } else {
        console[level === 'error' ? 'error' : 'log']('[debug] '+msg);
      }
    } catch (err){ console.error('showDebug error', err); }
  }

  window.addEventListener('error', function(e){
    showDebug(`Error: ${e.message} @ ${e.filename}:${e.lineno}`, 'error');
    console.error(e.error || e.message);
  });
  window.addEventListener('unhandledrejection', function(e){
    const reason = e.reason && (e.reason.message || e.reason) || String(e.reason || e);
    showDebug(`Promise rejection: ${reason}`, 'error');
    console.error(e.reason || e);
  });

  document.addEventListener('DOMContentLoaded', function(){
    showDebug('Sanity: DOMContentLoaded', 'info');

    const ids = ['manualAnalyzeBtn','saveResultBtn','viewTrendBtn','downloadBtn','demoFillBtn','exportPdfBtn','addQuestionBtn'];
    ids.forEach(id => {
      const el = document.getElementById(id);
      showDebug(`${id} present=${!!el}`, 'info');
      if (el) el.addEventListener('click', () => showDebug(`${id} clicked`, 'info'));
    });

    const accBtns = Array.from(document.querySelectorAll('.accordion-btn'));
    showDebug(`Accordion buttons: ${accBtns.length}`, 'info');
    accBtns.forEach((b, i) => {
      if (!b.getAttribute('type')) b.setAttribute('type','button');
      b.addEventListener('click', function(){ showDebug('Accordion clicked: '+(b.textContent||'').trim(), 'info'); });
    });

    const clear = document.getElementById('clearDebugLog');
    if (clear) clear.addEventListener('click', function(){ const inner = document.getElementById('debugLogInner'); if (inner) inner.innerHTML = ''; });
  });
})();

function renderTrendChart() {
  // load stored results
  const stored = getStored();
  if (!stored || stored.length === 0) {
    alert("No saved results yet.");
    return;
  }

  // Group entries by calendar date and keep the latest (by timestamp) for each day
  const grouped = stored.reduce((acc, entry) => {
    const date = entry.date || (entry.timestamp ? entry.timestamp.split('T')[0] : null);
    if (!date) return acc;
    if (!acc[date] || (entry.timestamp && (!acc[date].timestamp || entry.timestamp > acc[date].timestamp))) {
      acc[date] = entry;
    }
    return acc;
  }, {});

  const dates = Object.keys(grouped).sort((a, b) => a.localeCompare(b));
  if (dates.length === 0) {
    alert("No saved results yet.");
    return;
  }

  const ctx = document.getElementById("trendChart");
  if (!ctx) return;

  // Labels are the calendar dates 
  const labels = dates.map(d => new Date(d).toLocaleDateString());

  // Dataset mapping for each test
  const series = [
    { key: 'hb', label: 'Hemoglobin', color: '#6a4c93' },
    { key: 'wbc', label: 'WBC', color: '#1982c4' },
    { key: 'platelets', label: 'Platelets', color: '#8ac926' },
    { key: 'sugar', label: 'Blood Sugar', color: '#ff595e' },
    { key: 'creatinine', label: 'Creatinine', color: '#ffca3a' },
    { key: 'bun', label: 'Urea/BUN', color: '#2ec4b6' },
    { key: 'alt', label: 'ALT', color: '#e63946' },
    { key: 'ast', label: 'AST', color: '#3a86ff' },
    { key: 'cholesterol', label: 'Cholesterol', color: '#f77f00' },
    { key: 'triglycerides', label: 'Triglycerides', color: '#d62828' },
    { key: 'hdl', label: 'HDL', color: '#06d6a0' },
    { key: 'ldl', label: 'LDL', color: '#118ab2' },
    { key: 'sodium', label: 'Sodium', color: '#9a031e' },
    { key: 'potassium', label: 'Potassium', color: '#8338ec' },
    { key: 'chloride', label: 'Chloride', color: '#fb5607' }
  ];

  const datasets = series.map((s, idx) => ({
    label: s.label,
    data: dates.map(d => {
      const v = grouped[d][s.key];
      return (v !== undefined && v !== "") ? Number(v) : null;
    }),
    backgroundColor: s.color
  }));

  // If a previous chart exists, destroy it first to avoid overlays
  if (trendChartInstance) trendChartInstance.destroy();

  trendChartInstance = new Chart(ctx, {
    type: 'bar',
    data: { labels, datasets },
    options: {
      responsive: true,
      plugins: {
        legend: { position: 'bottom' },
        tooltip: { enabled: true }
      },
      scales: {
        y: { beginAtZero: true, title: { display: true, text: 'Value' } },
        x: { title: { display: true, text: 'Date' } }
      }
    }
  });
}



