document.addEventListener("DOMContentLoaded", function () {
  // Chart.js initialization
  const ctx = document.getElementById("earningsChart").getContext("2d");
  const earningsChart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ],
      datasets: [
        {
          label: "Qazanc",
          data: [
            100000, 80000, 60000, 50000, 70000, 60000, 60000, 50000, 70000,
            90000, 40000, 50000,
          ],
          backgroundColor: "rgba(72, 127, 255, 1)",
          borderRadius: 4,
          barThickness: 20,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: function (value) {
              return value / 1000 + "k";
            },
          },
          grid: {
            borderDash: [5],
          },
        },
        x: {
          grid: {
            display: false,
          },
        },
      },
      plugins: {
        legend: {
          display: false,
        },
      },
    },
  });
});
