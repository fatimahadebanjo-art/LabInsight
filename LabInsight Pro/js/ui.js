(function(){
  window.LabInsight = window.LabInsight || {};

  function renderResults(outputEl, message) {
    if (outputEl) { outputEl.style.display = 'block'; outputEl.innerHTML = message || 'Please enter at least one test value.'; }
  }

  function setupAccordion() {
    const buttons = document.querySelectorAll('.accordion-btn');
    buttons.forEach(btn => {
      if (!btn.getAttribute('type')) btn.setAttribute('type','button');
      btn.addEventListener('click', function () {
        this.classList.toggle('active');
        const panel = this.nextElementSibling;
        if (panel) {
          const isOpen = panel.classList.toggle('open');
          panel.style.display = isOpen ? 'block' : 'none';
          this.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
        }
      });
      const panel = btn.nextElementSibling; if (panel && !panel.id) panel.id = 'panel-'+Math.random().toString(36).slice(2,8);
    });
  }

  function openModal(id) { const modal = document.getElementById(id+'-modal'); if (modal){ modal.setAttribute('aria-hidden','false'); document.body.style.overflow='hidden'; } }
  function closeModal(id) { const modal = document.getElementById(id+'-modal'); if (modal){ modal.setAttribute('aria-hidden','true'); document.body.style.overflow=''; } }

  function setupScrollHeader() { window.addEventListener('scroll', () => { const header = document.querySelector('header'); if (window.scrollY > 50) header.classList.add('scrolled'); else header.classList.remove('scrolled'); }); }

  window.LabInsight.renderResults = renderResults;
  window.LabInsight.initAccordion = setupAccordion;
  window.LabInsight.openModal = openModal;
  window.LabInsight.closeModal = closeModal;
  window.LabInsight.setupScrollHeader = setupScrollHeader;
})();

document.addEventListener("DOMContentLoaded", () => {
  const riskBtn = document.getElementById("riskBtn");
  const inputs = document.querySelectorAll(".test-input");

  if (riskBtn) {
    // Disable button initially
    riskBtn.disabled = true;

    // Watch all inputs
    inputs.forEach(input => {
      input.addEventListener("input", () => {
        // Check if at least one input has a value
        const hasValues = Array.from(inputs).some(i => i.value.trim() !== "");
        riskBtn.disabled = !hasValues;
      });
    });

    // Run risk calculation when clicked
    riskBtn.addEventListener("click", () => {
      calculateMultiRisk(); // function from rules.js
    });
  }
});
