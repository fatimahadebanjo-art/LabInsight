(function(){
  window.LabInsight = window.LabInsight || {};

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

  async function attachUploadHandler(){
    const fileInput = document.getElementById('labUpload');
    const status = document.getElementById('uploadStatus');
    const uploadBtn = document.getElementById('uploadBtn');
    if (!uploadBtn || !fileInput || !status) return;
    uploadBtn.addEventListener('click', async function(){
      if (fileInput.files.length === 0) { status.textContent = 'Please select a file.'; return; }
      const file = fileInput.files[0];
      const fileName = file.name.toLowerCase();
      if (fileName.endsWith('.pdf') || fileName.endsWith('.docx')) { status.textContent = 'Extraction not yet implemented.'; return; }
      if (fileName.match(/\.(jpg|jpeg|png)$/)){
        status.textContent = 'Processing image with OCR…';
        try {
          const result = await Tesseract.recognize(file, 'eng');
          const fullText = result.data.text;
          console.log('OCR Output:', fullText);
          status.textContent = 'Image text extracted. Auto‑filling inputs…';
          autoFillTests(fullText);
        } catch (err) { console.error('OCR error', err); status.textContent = 'OCR failed.'; }
      }
    });
  }

  window.LabInsight.autoFillTests = autoFillTests;
  window.LabInsight.attachUploadHandler = attachUploadHandler;
})();