(function(){
  // Storage helpers with in-memory fallback
  function storageAvailable() {
    try { const x = '__ls_test__'; localStorage.setItem(x, x); localStorage.removeItem(x); return true; } catch (e) { return false; }
  }

  window.LabInsight = window.LabInsight || {};

  window.LabInsight.getStored = function(){
    if (storageAvailable()) {
      try { return JSON.parse(localStorage.getItem('labResults') || '[]'); } catch (e) { console.warn('localStorage read failed, using fallback', e); return JSON.parse(window.__labResultsFallback || '[]'); }
    } else { console.warn('localStorage unavailable, using in-memory fallback'); return JSON.parse(window.__labResultsFallback || '[]'); }
  };

  window.LabInsight.saveResult = function(results){
    const timestamp = new Date().toISOString();
    const date = timestamp.split('T')[0];
    // derive classification counts: prefer current lastCounts, otherwise evaluate now
    let counts = window.lastCounts;
    if (!counts) {
      const evalRes = (typeof window.LabInsight.evaluateInputs === 'function') ? window.LabInsight.evaluateInputs(results) : null;
      counts = evalRes ? { normal: evalRes.normalCount, borderline: evalRes.borderlineCount, abnormal: evalRes.abnormalCount } : { normal:0, borderline:0, abnormal:0 };
    }
    const entry = Object.assign({timestamp,date,counts}, results);
    try {
      const stored = JSON.parse(localStorage.getItem('labResults') || '[]');
      stored.push(entry);
      localStorage.setItem('labResults', JSON.stringify(stored));
      alert('Result saved!');
    } catch (e) {
      console.warn('localStorage unavailable for saving; using in-memory fallback', e);
      const f = JSON.parse(window.__labResultsFallback || '[]');
      f.push(entry);
      window.__labResultsFallback = JSON.stringify(f);
      alert('Result saved to temporary memory (local storage blocked).');
    }
  }; 
})();