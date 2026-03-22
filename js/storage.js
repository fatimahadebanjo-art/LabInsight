// storage.js
const Storage = {
  saveResult(result) {
    const allResults = JSON.parse(localStorage.getItem("allResults") || "[]");
    result.timestamp = new Date().toISOString();
    allResults.push(result);
    localStorage.setItem("allResults", JSON.stringify(allResults));
    // Also save latest CBC for homepage
    if (result.cbc) {
      localStorage.setItem("cbcResults", JSON.stringify(result.cbc));
    }
  },

  getAllResults() {
    return JSON.parse(localStorage.getItem("allResults") || "[]");
  },

  getLatestCBC() {
    return JSON.parse(localStorage.getItem("cbcResults") || "{}");
  }
};