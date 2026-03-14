const testRules = {
        hb: { name: "Hemoglobin (g/dL)", ranges: [
          { max: 12, category: "abnormal", msg: "LOW - may suggest anemia, which can cause tiredness, weakness or shortness of breath.",
            questions: ["Could this be anemia?", "Do I need iron supplements or further tests?"] },
          { max: 16, category: "normal", msg: "NORMAL - hemoglobin is within the healthy range, suggesting healthy oxygen transport in the blood." },
          { max: Infinity, category: "abnormal", msg: "HIGH - may be due to dehydration or other factors.",
            questions: ["Could dehydration be causing this?", "Do I need further tests for blood disorders?"] }
        ]},
        wbc: { name: "White Blood Cells (x10⁹/L)", ranges: [
          { max: 4, category: "abnormal", msg: "LOW - your immune system may be weakened.",
            questions: ["Is my immune system suppressed?", "Do I need more tests for infections?"] },
          { max: 11, category: "normal", msg: "NORMAL - white blood cell count is healthy." },
          { max: Infinity, category: "abnormal", msg: "HIGH - may indicate infection, inflammation or stress.",
            questions: ["Could this mean I have an infection?", "Do I need antibiotics or further tests?"] }
        ]},
        platelets: { name: "Platelets (x10⁹/L)", ranges: [
          { max: 150, category: "abnormal", msg: "LOW - risk of bleeding or easy bruising. It may also reduce your ability to fight infections",
            questions: ["Am I at risk of bleeding?", "Do I need treatment for low platelets?"] },
          { max: 450, category: "normal", msg: "NORMAL - platelet count is healthy. This suggests a healthy immune response." },
          { max: Infinity, category: "abnormal", msg: "HIGH - may be linked to inflammation or bone marrow changes. It may also increase the risk of clotting in some cases",
            questions: ["What could cause high platelets?", "Do I need further blood tests?"] }
        ]},
        sugar: { name: "Blood Sugar (mg/dL)", ranges: [
          { max: 70, category: "abnormal", msg: "LOW - may cause dizziness or shakiness (hypoglycemia).",
            questions: ["Could my diet or medications be causing low sugar?", "How can I prevent hypoglycemia episodes?"] },
          { max: 99, category: "normal", msg: "NORMAL - fasting blood sugar is healthy." },
          { max: 125, category: "borderline", msg: "BORDERLINE - in the prediabetes range, lifestyle changes may help.",
            questions: ["Am I at risk of developing diabetes?", "What lifestyle changes should I make now?"] },
          { max: Infinity, category: "abnormal", msg: "HIGH - may indicate diabetes risk.",
            questions: ["Do I need further tests for diabetes?", "Should I start medication or change my diet?"] }
        ]},
        cholesterol: { name: "Total Cholesterol (mg/dL)", ranges: [
          { max: 200, category: "normal", msg: "Desirable - cholesterol is in a healthy range." },
          { max: 239, category: "borderline", msg: "Borderline high - keep an eye on diet and exercise.",
            questions: ["Should I change my diet to lower cholesterol?", "Do I need medication at this stage?"] },
          { max: Infinity, category: "abnormal", msg: "High - increases risk of heart disease.",
            questions: ["What is my risk of heart disease?", "What treatments or lifestyle changes can help lower cholesterol?"] }
        ]},
        triglycerides: { name: "Triglycerides (mg/dL)", ranges: [
          { max: 150, category: "normal", msg: "Desirable - triglycerides are healthy." },
          { max: 199, category: "borderline", msg: "Borderline high - may need lifestyle changes.",
            questions: ["Should I change my diet to lower triglycerides?", "Do I need medication?"] },
          { max: 499, category: "abnormal", msg: "High - raises risk of heart disease.",
            questions: ["What is my risk of heart disease?", "What treatments can help lower triglycerides?"] },
          { max: Infinity, category: "abnormal", msg: "Very high - risk of pancreatitis.",
            questions: ["Am I at risk of pancreatitis?", "Do I need urgent treatment?"] }
        ]},
        hdl: { name: "HDL Cholesterol (mg/dL)", ranges: [
          { max: 40, category: "abnormal", msg: "LOW - less protective against heart disease.",
            questions: ["How can I raise my HDL?", "Do I need lifestyle changes?"] },
          { max: 59, category: "normal", msg: "NORMAL - HDL is healthy." },
          { max: Infinity, category: "normal", msg: "HIGH - protective for heart health." }
        ]},
        ldl: { name: "LDL Cholesterol (mg/dL)", ranges: [
          { max: 100, category: "normal", msg: "Optimal - LDL is healthy." },
          { max: 129, category: "normal", msg: "Near optimal - acceptable range." },
          { max: 159, category: "borderline", msg: "Borderline high - may need lifestyle changes.",
            questions: ["Should I change my diet to lower LDL?", "Do I need medication?"] },
          { max: 189, category: "abnormal", msg: "High - increases risk of heart disease.",
            questions: ["What is my risk of heart disease?", "Do I need cholesterol-lowering medication?"] },
          { max: Infinity, category: "abnormal", msg: "Very high - serious heart disease risk.",
            questions: ["Do I need urgent treatment?", "What lifestyle changes are most important?"] }
        ]},
        bun: { name: "Urea / BUN (mg/dL)", ranges: [
          { max: 7, category: "abnormal", msg: "LOW - may suggest liver issues or poor nutrition.",
            questions: ["Could this mean liver problems?", "Do I need nutrition support?"] },
          { max: 20, category: "normal", msg: "NORMAL - kidney function looks healthy." },
          { max: Infinity, category: "abnormal", msg: "HIGH - may indicate kidney problems or dehydration.",
            questions: ["Could dehydration be causing this?", "Do I need kidney function tests?"] }
        ]},
        sodium: { name: "Sodium (mmol/L)", ranges: [
          { max: 135, category: "abnormal", msg: "LOW - can cause headaches, nausea, or confusion (hyponatremia).",
            questions: ["What could cause low sodium?", "Do I need fluid or salt adjustments?"] },
          { max: 145, category: "normal", msg: "NORMAL - sodium levels are healthy." },
          { max: Infinity, category: "abnormal", msg: "HIGH - can cause thirst, weakness, or restlessness (hypernatremia).",
            questions: ["What could cause high sodium?", "Do I need to change my fluid intake?"] }
        ]},
        potassium: { name: "Potassium (mmol/L)", ranges: [
          { max: 3.5, category: "abnormal", msg: "LOW - may cause muscle weakness or cramps (hypokalemia).",
            questions: ["Could medications be lowering my potassium?", "Do I need supplements?"] },
          { max: 5.0, category: "normal", msg: "NORMAL - potassium levels are healthy." },
          { max: Infinity, category: "abnormal", msg: "HIGH - may cause irregular heartbeat or weakness (hyperkalemia).",
            questions: ["Is my heart at risk?", "Do I need urgent treatment?"] }
        ]},
        chloride: { name: "Chloride (mmol/L)", ranges: [
          { max: 98, category: "abnormal", msg: "LOW - blood may be more alkaline than usual, which can cause cramps or confusion.",
            questions: ["What could cause low chloride?", "Do I need further tests for acid-base balance?"] },
          { max: 106, category: "normal", msg: "NORMAL - chloride levels are healthy." },
          { max: Infinity, category: "abnormal", msg: "HIGH - blood may be more acidic than usual, which can cause fatigue or rapid breathing.",
            questions: ["What could cause high chloride?", "Do I need further tests for acid-base balance?"] }
        ]},
        creatinine: { name: "Creatinine (mg/dL)", ranges: [
          { max: 0.6, category: "abnormal", msg: "LOW - may reflect low muscle mass.",
            questions: ["Does this mean I have low muscle mass?", "Do I need further kidney tests?"] },
          { max: 1.3, category: "normal", msg: "NORMAL - kidney function looks healthy." },
          { max: Infinity, category: "abnormal", msg: "HIGH - may indicate kidney problems.",
            questions: ["Do I need further kidney tests?", "Should I see a kidney specialist?"] }
        ]},
        alt: { name: "ALT (U/L)", ranges: [
          { max: 40, category: "normal", msg: "NORMAL - ALT is healthy." },
          { max: Infinity, category: "abnormal", msg: "HIGH - may suggest liver stress or injury.",
            questions: ["Could this mean liver damage?", "Do I need further liver tests?"] }
        ]},
        ast: { name: "AST (U/L)", ranges: [
          { max: 40, category: "normal", msg: "NORMAL - AST is healthy." },
          { max: Infinity, category: "abnormal", msg: "HIGH - may suggest liver or muscle stress.",
            questions: ["Could this mean liver or muscle damage?", "Do I need further tests?"] }
        ]}
      };

(function(){
  window.LabInsight = window.LabInsight || {};

  function evaluateInputsMap(valuesMap) {
    let rows = [];
    let normalCount = 0, borderlineCount = 0, abnormalCount = 0;
    let doctorQuestions = [];

    for (const id in valuesMap){
      const raw = valuesMap[id];
      if (raw === undefined || raw === null || String(raw).trim() === '') continue;
      const value = Number(raw);
      const rules = testRules[id];
      if (!rules) continue;
      for (let r of rules.ranges){
        if (value <= r.max){
          let cssClass = 'result-normal';
          switch ((r.category||'').toLowerCase().trim()){
            case 'abnormal': cssClass='result-abnormal'; abnormalCount++; if (r.questions) doctorQuestions.push(...r.questions); break;
            case 'borderline': cssClass='result-borderline'; borderlineCount++; if (r.questions) doctorQuestions.push(...r.questions); break;
            case 'normal': cssClass='result-normal'; normalCount++; break;
            default: console.warn(`Unexpected category for ${rules.name}:`, r.category); break;
          }
          rows.push({ name: rules.name, value, status: r.msg, cssClass });
          break;
        }
      }
    }

    let message = '';
    if (rows.length > 0) {
      message = `<div class="result-summary">
        <p><strong>Summary:</strong> ${abnormalCount} test value(s) outside the normal range.</p>
        <p class="disclaimer-text"><strong>Disclaimer:</strong> LabInsight Pro provides educational information only and does not replace professional medical advice.</p>
      </div>`;
      message += `<div class="result-table-wrap"><table class="result-table">
        <thead><tr><th>Test</th><th>Value</th><th>Status</th></tr></thead><tbody>`;
      rows.forEach(r => {
        message += `<tr><td>${r.name}</td><td>${r.value}</td><td><span class="${r.cssClass}">${r.status}</span></td></tr>`;
      });
      message += `</tbody></table></div>`;
      if (doctorQuestions.length > 0) {
        message += `<div class="questions-panel"><h4>Questions to Ask Your Doctor</h4><ul>`;
        doctorQuestions.forEach(q => { message += `<li>${q}</li>`; });
        message += `</ul></div>`;
      }
    }

    return { message, normalCount, borderlineCount, abnormalCount, doctorQuestions };
  }
  window.LabInsight.testRules = testRules;
  window.LabInsight.evaluateInputs = evaluateInputsMap;
})();


// This file is for any additional rules or logic related to interpreting lab results, beyond just the core evaluation function. It can include things like generating doctor questions, providing more detailed explanations, or handling specific edge cases in lab result interpretation.

function calculateMultiRisk() {
  const values = {};
  let hasValues = false;

  // Collect values from all test inputs
  for (let id in testRules) {
    const el = document.getElementById(id);
    if (el && el.value !== "") {
      values[id] = Number(el.value);
      hasValues = true;
    }
  }

  // If no values entered, show a message instead of risks
  const riskPanel = document.getElementById("riskPanel");
  if (!hasValues) {
    if (riskPanel) {
      riskPanel.innerHTML = `
        <p style="color:#666; font-style:italic;">
          Please enter at least one test value before calculating risk.
        </p>`;
    }
    return;
  }

  const risks = [];

  // Cardiovascular
  if (values.cholesterol > 240 || values.ldl > 160 || values.triglycerides > 200 || values.hdl < 40) {
    risks.push({ category: "Heart Risk", level: "High", msg: "Multiple cholesterol markers are abnormal." });
  } else if (values.cholesterol > 200 || values.ldl > 130 || values.triglycerides > 150) {
    risks.push({ category: "Heart Risk", level: "Moderate", msg: "Some cholesterol markers are borderline." });
  } else if (values.cholesterol || values.ldl || values.triglycerides || values.hdl) {
    risks.push({ category: "Heart Risk", level: "Low", msg: "Cholesterol profile is healthy." });
  }

  // Diabetes
  if (values.sugar > 125) {
    risks.push({ category: "Diabetes Risk", level: "High", msg: "Blood sugar is elevated." });
  } else if (values.sugar >= 100) {
    risks.push({ category: "Diabetes Risk", level: "Moderate", msg: "Blood sugar is borderline." });
  } else if (values.sugar) {
    risks.push({ category: "Diabetes Risk", level: "Low", msg: "Blood sugar is healthy." });
  }

  // Kidney
  if (values.creatinine > 1.3 || values.bun > 20) {
    risks.push({ category: "Kidney Risk", level: "High", msg: "Creatinine or BUN is elevated." });
  } else if (values.creatinine || values.bun) {
    risks.push({ category: "Kidney Risk", level: "Low", msg: "Kidney markers are healthy." });
  }

  // Liver
  if (values.alt > 40 || values.ast > 40) {
    risks.push({ category: "Liver Risk", level: "High", msg: "ALT or AST is elevated." });
  } else if (values.alt || values.ast) {
    risks.push({ category: "Liver Risk", level: "Low", msg: "Liver enzymes are healthy." });
  }

  // Electrolytes
  if (values.sodium < 135 || values.sodium > 145 || values.potassium < 3.5 || values.potassium > 5.0 || values.chloride < 98 || values.chloride > 106) {
    risks.push({ category: "Electrolyte Balance", level: "Moderate", msg: "Electrolytes are outside normal ranges." });
  } else if (values.sodium || values.potassium || values.chloride) {
    risks.push({ category: "Electrolyte Balance", level: "Low", msg: "Electrolytes are balanced." });
  }

  // Blood/Immune
  if (values.hb < 12 || values.wbc < 4 || values.platelets < 150) {
    risks.push({ category: "Blood/Immune Risk", level: "High", msg: "Low blood counts suggest anemia or immune suppression." });
  } else if (values.hb || values.wbc || values.platelets) {
    risks.push({ category: "Blood/Immune Risk", level: "Low", msg: "Blood counts are healthy." });
  }

  // Display results
  if (riskPanel) {
    riskPanel.innerHTML = risks.map(r => `
      <div class="risk-badge risk-${r.level.toLowerCase()}">
        <h3>${r.category}: ${r.level}</h3>
        <p>${r.msg}</p>
      </div>
    `).join("");
  }
}


function updateCBCSummary(values) {
  document.getElementById("cbc-hb").textContent = values.hbStatus || "—";
  document.getElementById("cbc-wbc").textContent = values.wbcStatus || "—";
  document.getElementById("cbc-platelets").textContent = values.plateletsStatus || "—";
  document.getElementById("cbc-note").textContent = values.note || "";
}
