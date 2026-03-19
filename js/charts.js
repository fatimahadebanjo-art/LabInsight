(function () {
  window.LabInsight = window.LabInsight || {};
  let resultChartInstance = null;

  window.LabInsight.renderResultChart = function (normal, borderline, abnormal) {
    const ctx = document.getElementById("resultChart");
    if (!ctx) return;

    // Destroy previous chart
    if (resultChartInstance) resultChartInstance.destroy();

    resultChartInstance = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Normal', 'Borderline', 'Abnormal'],
        datasets: [{
          data: [normal, borderline, abnormal],
          backgroundColor: ['#4CAF50', '#FFC107', '#F44336']
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { position: 'bottom' },
          tooltip: { enabled: true }
        }
      }
    });
  };
})();