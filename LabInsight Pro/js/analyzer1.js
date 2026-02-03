// analyzer.js
import { testRules } from './rules.js';

export function analyzeInputs(inputs, customQuestions = []) {
  let message = "";
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
            message += `<p><strong>${rules.name}:</strong> <span class="${cssClass}">${r.msg}</span></p>`;
            break;
          }
        }
      } else {
        message += `<p><strong>${input.id}:</strong> No rules defined yet.</p>`;
      }
    }
  });

  if (message) {
    message = `<p><strong>Summary:</strong> ${abnormalCount} test value(s) outside the normal range. 
    Please review the details below and consult a healthcare professional if needed.</p>
    <p><strong>Disclaimer:</strong>⚠️LabInsight Mini provides educational information only and does not replace professional medical advice.</p>` + message;

    if (doctorQuestions.length > 0 || customQuestions.length > 0) {
      message += `<h4>Questions to Ask Your Doctor</h4><ul>`;
      doctorQuestions.forEach(q => { message += `<li>${q}</li>`; });
      customQuestions.forEach(q => { message += `<li>${q}</li>`; });
      message += `</ul>`;
    }
  }

  return message;
}
