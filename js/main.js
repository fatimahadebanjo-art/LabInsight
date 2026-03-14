(function(){
  window.LabInsight = window.LabInsight || {};

  function init(){
    // UI initializers
    if (typeof window.LabInsight.initAccordion === 'function') window.LabInsight.initAccordion();
    if (typeof window.LabInsight.setupScrollHeader === 'function') window.LabInsight.setupScrollHeader();
    // OCR
    if (typeof window.LabInsight.attachUploadHandler === 'function') window.LabInsight.attachUploadHandler();
    // bind analyzer core
    if (typeof window.LabInsight.bindUI === 'function') window.LabInsight.bindUI();

    console.log('LabInsight (global) initialized');
    const debug = document.getElementById('debugLog'); if (debug) debug.style.display = 'block';
    const inner = document.getElementById('debugLogInner'); if (inner) inner.appendChild(Object.assign(document.createElement('div'), { textContent: '[info] LabInsight scripts loaded (global)' }));
  }

  document.addEventListener('DOMContentLoaded', init);
  window.LabInsight.init = init;
})();
