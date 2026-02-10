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
