document.addEventListener("DOMContentLoaded", function () {
  const manualBtn = document.getElementById("manualAnalyzeBtn");
  const output = document.getElementById("output");

  // Custom patient questions (added by user through question input)
  let customQuestions = [];


  if (manualBtn) {
    manualBtn.addEventListener("click", function () {
      const inputs = document.querySelectorAll(".test-input");
      let message = "";
      let abnormalCount = 0;
      let doctorQuestions = [];

      // --- Patient-friendly rules with dynamic questions ---
      const testRules = {
        hb: { name: "Hemoglobin (g/dL)", ranges: [
          { max: 12, msg: "LOW — may suggest anemia, which can cause tiredness, weakness or shortness of breath.",
            questions: ["Could this be anemia?", "Do I need iron supplements or further tests?"] },
          { max: 16, msg: "NORMAL — hemoglobin is within the healthy range, suggesting healthy oxygen transport in the blood." },
          { max: Infinity, msg: "HIGH — may be due to dehydration or other factors.",
            questions: ["Could dehydration be causing this?", "Do I need further tests for blood disorders?"] }
        ]},
        wbc: { name: "White Blood Cells (x10⁹/L)", ranges: [
          { max: 4, msg: "LOW — your immune system may be weakened.",
            questions: ["Is my immune system suppressed?", "Do I need more tests for infections?"] },
          { max: 11, msg: "NORMAL — white blood cell count is healthy." },
          { max: Infinity, msg: "HIGH — may indicate infection, inflammation or stress.",
            questions: ["Could this mean I have an infection?", "Do I need antibiotics or further tests?"] }
        ]},
        platelets: { name: "Platelets (x10⁹/L)", ranges: [
          { max: 150, msg: "LOW — risk of bleeding or easy bruising. It may also reduce your ability to fight infections",
            questions: ["Am I at risk of bleeding?", "Do I need treatment for low platelets?"] },
          { max: 450, msg: "NORMAL — platelet count is healthy. This suggests a healthy immune response." },
          { max: Infinity, msg: "HIGH — may be linked to inflammation or bone marrow changes. It may also increase the risk of clotting in some cases",
            questions: ["What could cause high platelets?", "Do I need further blood tests?"] }
        ]},
        sugar: { name: "Blood Sugar (mg/dL)", ranges: [
          { max: 70, msg: "LOW — may cause dizziness or shakiness (hypoglycemia).",
            questions: ["Could my diet or medications be causing low sugar?", "How can I prevent hypoglycemia episodes?"] },
          { max: 99, msg: "NORMAL — fasting blood sugar is healthy." },
          { max: 125, msg: "BORDERLINE — in the prediabetes range, lifestyle changes may help.",
            questions: ["Am I at risk of developing diabetes?", "What lifestyle changes should I make now?"] },
          { max: Infinity, msg: "HIGH — may indicate diabetes risk.",
            questions: ["Do I need further tests for diabetes?", "Should I start medication or change my diet?"] }
        ]},
        cholesterol: { name: "Total Cholesterol (mg/dL)", ranges: [
          { max: 200, msg: "Desirable — cholesterol is in a healthy range." },
          { max: 239, msg: "Borderline high — keep an eye on diet and exercise.",
            questions: ["Should I change my diet to lower cholesterol?", "Do I need medication at this stage?"] },
          { max: Infinity, msg: "High — increases risk of heart disease.",
            questions: ["What is my risk of heart disease?", "What treatments or lifestyle changes can help lower cholesterol?"] }
        ]},
        triglycerides: { name: "Triglycerides (mg/dL)", ranges: [
          { max: 150, msg: "Desirable — triglycerides are healthy." },
          { max: 199, msg: "Borderline high — may need lifestyle changes.",
            questions: ["Should I change my diet to lower triglycerides?", "Do I need medication?"] },
          { max: 499, msg: "High — raises risk of heart disease.",
            questions: ["What is my risk of heart disease?", "What treatments can help lower triglycerides?"] },
          { max: Infinity, msg: "Very high — risk of pancreatitis.",
            questions: ["Am I at risk of pancreatitis?", "Do I need urgent treatment?"] }
        ]},
        hdl: { name: "HDL Cholesterol (mg/dL)", ranges: [
          { max: 40, msg: "LOW — less protective against heart disease.",
            questions: ["How can I raise my HDL?", "Do I need lifestyle changes?"] },
          { max: 59, msg: "NORMAL — HDL is healthy." },
          { max: Infinity, msg: "HIGH — protective for heart health." }
        ]},
        ldl: { name: "LDL Cholesterol (mg/dL)", ranges: [
          { max: 100, msg: "Optimal — LDL is healthy." },
          { max: 129, msg: "Near optimal — acceptable range." },
          { max: 159, msg: "Borderline high — may need lifestyle changes.",
            questions: ["Should I change my diet to lower LDL?", "Do I need medication?"] },
          { max: 189, msg: "High — increases risk of heart disease.",
            questions: ["What is my risk of heart disease?", "Do I need cholesterol-lowering medication?"] },
          { max: Infinity, msg: "Very high — serious heart disease risk.",
            questions: ["Do I need urgent treatment?", "What lifestyle changes are most important?"] }
        ]},
        bun: { name: "Urea / BUN (mg/dL)", ranges: [
          { max: 7, msg: "LOW — may suggest liver issues or poor nutrition.",
            questions: ["Could this mean liver problems?", "Do I need nutrition support?"] },
          { max: 20, msg: "NORMAL — kidney function looks healthy." },
          { max: Infinity, msg: "HIGH — may indicate kidney problems or dehydration.",
            questions: ["Could dehydration be causing this?", "Do I need kidney function tests?"] }
        ]},
        sodium: { name: "Sodium (mmol/L)", ranges: [
          { max: 135, msg: "LOW — can cause headaches, nausea, or confusion (hyponatremia).",
            questions: ["What could cause low sodium?", "Do I need fluid or salt adjustments?"] },
          { max: 145, msg: "NORMAL — sodium levels are healthy." },
          { max: Infinity, msg: "HIGH — can cause thirst, weakness, or restlessness (hypernatremia).",
            questions: ["What could cause high sodium?", "Do I need to change my fluid intake?"] }
        ]},
        potassium: { name: "Potassium (mmol/L)", ranges: [
          { max: 3.5, msg: "LOW — may cause muscle weakness or cramps (hypokalemia).",
            questions: ["Could medications be lowering my potassium?", "Do I need supplements?"] },
          { max: 5.0, msg: "NORMAL — potassium levels are healthy." },
          { max: Infinity, msg: "HIGH — may cause irregular heartbeat or weakness (hyperkalemia).",
            questions: ["Is my heart at risk?", "Do I need urgent treatment?"] }
        ]},
        chloride: { name: "Chloride (mmol/L)", ranges: [
          { max: 98, msg: "LOW — blood may be more alkaline than usual, which can cause cramps or confusion.",
            questions: ["What could cause low chloride?", "Do I need further tests for acid-base balance?"] },
          { max: 106, msg: "NORMAL — chloride levels are healthy." },
          { max: Infinity, msg: "HIGH — blood may be more acidic than usual, which can cause fatigue or rapid breathing.",
            questions: ["What could cause high chloride?", "Do I need further tests for acid-base balance?"] }
        ]},
        creatinine: { name: "Creatinine (mg/dL)", ranges: [
          { max: 0.6, msg: "LOW — may reflect low muscle mass.",
            questions: ["Does this mean I have low muscle mass?", "Do I need further kidney tests?"] },
          { max: 1.3, msg: "NORMAL — kidney function looks healthy." },
          { max: Infinity, msg: "HIGH — may indicate kidney problems.",
            questions: ["Do I need further kidney tests?", "Should I see a kidney specialist?"] }
        ]},
        alt: { name: "ALT (U/L)", ranges: [
          { max: 40, msg: "NORMAL — ALT is healthy." },
          { max: Infinity, msg: "HIGH — may suggest liver stress or injury.",
            questions: ["Could this mean liver damage?", "Do I need further liver tests?"] }
        ]},
        ast: { name: "AST (U/L)", ranges: [
          { max: 40, msg: "NORMAL — AST is healthy." },
          { max: Infinity, msg: "HIGH — may suggest liver or muscle stress.",
            questions: ["Could this mean liver or muscle damage?", "Do I need further tests?"] }
        ]}
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

          if (r.msg.includes("LOW") || r.msg.includes("HIGH")) {
            cssClass = "result-abnormal";
            abnormalCount++;
            if (r.questions) doctorQuestions.push(...r.questions);
          } else if (r.msg.includes("BORDERLINE")) {
            cssClass = "result-borderline";
            abnormalCount++;
            if (r.questions) doctorQuestions.push(...r.questions);
          }

          message += `<p><strong>${rules.name}:</strong> <span class="${cssClass}">${r.msg}</span></p>`;
          break;
        }
      }
    } else {
      message += `<p><strong>${input.id}:</strong> No rules defined yet.</p>`;
    }
  }
});


      // --- Add summary + dynamic questions + custom patient questions ---
      if (message) {
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
        output.innerHTML = message || "Please enter at least one test value.";
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

  buttons.forEach(btn => {
    btn.addEventListener("click", function () {
      this.classList.toggle("active");
      const panel = this.nextElementSibling;
      if (!panel) return;
      panel.style.display = (panel.style.display === "block") ? "none" : "block";
    });
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
document.addEventListener("DOMContentLoaded", function() {
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
    signupBtn.addEventListener("click", function() {
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
console.log("Hash is:", window.location.hash);
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
  

