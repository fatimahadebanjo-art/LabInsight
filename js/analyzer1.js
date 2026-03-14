// analyzer.js
import { testRules } from './rules.js';

export function analyzeInputs(inputs, customQuestions = []) {
  let rows = [];
  let abnormalCount = 0;
  let doctorQuestions = [];

  inputs.forEach(input => {
    if (input.value !== "") {
      const value = Number(input.value);
      const rules = testRules[input.id];
      if (rules) {
        for (let r of rules.ranges) {
          if (value <= r.max) {
            let cssClass = "result-normal";
            if (r.msg.includes("LOW") || r.msg.includes("HIGH")) {
              cssClass = "result-abnormal";
              abnormalCount++;
              if (r.questions) doctorQuestions.push(...r.questions);
            } else if (r.msg.includes("BORDERLINE")) {
              cssClass = "result-borderline";
              abnormalCount++;
              if (r.questions) doctorQuestions.push(...r.questions);
            }
            rows.push({ name: rules.name, value, status: r.msg, cssClass });
            break;
          }
        }
      } else {
        rows.push({ name: input.id, value, status: "No rules defined yet.", cssClass: "result-borderline" });
      }
    }
  });

  if (rows.length === 0) return "";

  let html = `<div class="result-summary">
    <p><strong>Summary:</strong> ${abnormalCount} test value(s) outside the normal range. Please review the details below and consult a healthcare professional if needed.</p>
    <p class="disclaimer-text"><strong>Disclaimer:</strong> LabInsight Pro provides educational information only and does not replace professional medical advice.</p>
  </div>`;

  html += `<div class="result-table-wrap"><table class="result-table">
    <thead><tr><th>Test</th><th>Value</th><th>Status</th></tr></thead><tbody>`;
  rows.forEach(r => {
    html += `<tr><td>${r.name}</td><td>${r.value}</td><td><span class="${r.cssClass}">${r.status}</span></td></tr>`;
  });
  html += `</tbody></table></div>`;

  if (doctorQuestions.length > 0 || customQuestions.length > 0) {
    html += `<div class="questions-panel"><h4>Questions to Ask Your Doctor</h4><ul>`;
    doctorQuestions.forEach(q => { html += `<li>${q}</li>`; });
    customQuestions.forEach(q => { html += `<li>${q}</li>`; });
    html += `</ul></div>`;
  }

  return html;
}
