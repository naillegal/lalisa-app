document.addEventListener("DOMContentLoaded", function () {
  const newUsersCountEl = document.getElementById("newUsersCount");
  const reservationCountEl = document.getElementById("reservationCount");
  const totalCashbackEl = document.getElementById("totalCashback");
  const totalSalesEl = document.getElementById("totalSales");
  const totalUsersCountEl = document.getElementById("totalUsersCount");
  const totalDoctorsCountEl = document.getElementById("totalDoctorsCount");

  const startDateInput = document.getElementById("start-date");
  const endDateInput = document.getElementById("end-date");

  const incomeCtx = document
    .getElementById("incomeGrowthChart")
    .getContext("2d");
  let incomeGrowthChart;
  const incomeGrowthSumEl = document.getElementById("incomeGrowthSum");
  const incomeReportLabel = document.getElementById("incomeReportLabel");

  const paymentCtx = document
    .getElementById("paymentMethodsChart")
    .getContext("2d");
  let paymentMethodsChart;

  const earningsCtx = document.getElementById("earningsChart").getContext("2d");
  let doctorEarningsChart;

  const doctorDropdown = document.getElementById("doctorDropdown");
  const doctorDropdownHeader = document.getElementById("doctorDropdownHeader");
  const doctorDropdownList = document.getElementById("doctorDropdownList");
  const doctorSearchInput = document.getElementById("doctorSearchInput");
  const selectedDoctorSpan = document.getElementById("selected-doctor");

  function loadOverallStatistics(params = {}) {
    let url = "/api/statistics/";
    const query = new URLSearchParams(params).toString();
    if (query) {
      url += "?" + query;
    }
    fetch(url)
      .then((resp) => resp.json())
      .then((data) => {
        newUsersCountEl.textContent = data.new_users;
        reservationCountEl.textContent = data.reservation_count;
        totalCashbackEl.textContent = data.total_cashback;
        totalSalesEl.textContent = data.total_sales;
        totalUsersCountEl.textContent = data.total_users;
        totalDoctorsCountEl.textContent = data.total_doctors;
      })
      .catch((err) => console.error("Error loading overall statistics:", err));
  }

  loadOverallStatistics({ days: 31 });

  [startDateInput, endDateInput].forEach((input) => {
    input.addEventListener("change", function () {
      const startDate = startDateInput.value;
      const endDate = endDateInput.value;
      if (!startDate && !endDate) {
        loadOverallStatistics({ days: 31 });
        fetchGraphData(currentGraphRange);
      } else if (startDate && endDate) {
        loadOverallStatistics({ start_date: startDate, end_date: endDate });
        fetchGraphData(currentGraphRange);
      }
    });
  });

  let currentGraphRange = "ay";

  const viewOptionsMiddle1 = document.querySelectorAll(
    ".view-options-middle-1 .view-option-middle-1"
  );
  viewOptionsMiddle1.forEach((option) => {
    option.addEventListener("click", () => {
      viewOptionsMiddle1.forEach((btn) => btn.classList.remove("active"));
      option.classList.add("active");
      currentGraphRange = option.getAttribute("data-type");
      if (currentGraphRange === "gun") {
        incomeReportLabel.textContent = "Günlük Hesabat";
      } else if (currentGraphRange === "hefte") {
        incomeReportLabel.textContent = "Həftəlik Hesabat";
      } else {
        incomeReportLabel.textContent = "Aylıq Hesabat";
      }
      fetchGraphData(currentGraphRange);
    });
  });

  const viewOptionsMiddle2 = document.querySelectorAll(
    ".view-options-middle-2 .view-option-middle-2"
  );
  viewOptionsMiddle2.forEach((option) => {
    option.addEventListener("click", () => {
      viewOptionsMiddle2.forEach((btn) => btn.classList.remove("active"));
      option.classList.add("active");
      const range = option.getAttribute("data-type");
      fetchGraphData(range, true);
    });
  });

  function fetchGraphData(range, updatePaymentOnly = false) {
    let url = `/api/statistics/graphs/?range=${range}`;
    fetch(url)
      .then((resp) => resp.json())
      .then((data) => {
        if (!updatePaymentOnly) {
          updateIncomeChart(data.incomeLabels, data.incomeData, data.incomeSum);
        }
        updatePaymentChart(data.paymentMethods);
      })
      .catch((err) => console.error("Error fetching graph data:", err));
  }

  function updateIncomeChart(labels, dataArray, sum) {
    incomeGrowthSumEl.textContent = `₼${sum}`;
    if (!incomeGrowthChart) {
      incomeGrowthChart = new Chart(incomeCtx, {
        type: "line",
        data: {
          labels: labels,
          datasets: [
            {
              label: "Gəlir",
              data: dataArray,
              borderColor: "rgba(69, 179, 105, 1)",
              backgroundColor: "rgba(69, 179, 105, 0.1)",
              tension: 0.4,
              fill: true,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: { beginAtZero: true },
            x: { grid: { display: false } },
          },
          plugins: { legend: { display: false } },
        },
      });
    } else {
      incomeGrowthChart.data.labels = labels;
      incomeGrowthChart.data.datasets[0].data = dataArray;
      incomeGrowthChart.update();
    }
  }

  function updatePaymentChart(paymentMethods) {
    if (!paymentMethodsChart) {
      paymentMethodsChart = new Chart(paymentCtx, {
        type: "doughnut",
        data: {
          labels: ["Kart", "Nağd", "Cashback"],
          datasets: [
            {
              data: [
                paymentMethods.card,
                paymentMethods.cash,
                paymentMethods.cashback,
              ],
              backgroundColor: [
                "rgba(69, 179, 105, 1)",
                "rgba(255, 159, 41, 1)",
                "rgba(72, 127, 255, 1)",
              ],
              borderWidth: 0,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          cutout: "60%",
          plugins: { legend: { display: false } },
        },
      });
    } else {
      paymentMethodsChart.data.datasets[0].data = [
        paymentMethods.card,
        paymentMethods.cash,
        paymentMethods.cashback,
      ];
      paymentMethodsChart.update();
    }
  }

  fetchGraphData(currentGraphRange);

  function loadDoctorEarnings(doctorId) {
    if (!doctorId) return;
    fetch(`/api/statistics/doctor-earnings/?doctor_id=${doctorId}`)
      .then((resp) => resp.json())
      .then((data) => {
        updateDoctorEarningsChart(data.labels, data.earnings);
      })
      .catch((err) => console.error("Error loading doctor earnings:", err));
  }

  function updateDoctorEarningsChart(labels, earnings) {
    if (!doctorEarningsChart) {
      doctorEarningsChart = new Chart(earningsCtx, {
        type: "bar",
        data: {
          labels: labels,
          datasets: [
            {
              label: "Qazanc",
              data: earnings,
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
              grid: { borderDash: [5] },
            },
            x: { grid: { display: false } },
          },
          plugins: { legend: { display: false } },
        },
      });
    } else {
      doctorEarningsChart.data.labels = labels;
      doctorEarningsChart.data.datasets[0].data = earnings;
      doctorEarningsChart.update();
    }
  }

  doctorDropdownHeader.addEventListener("click", () => {
    doctorDropdown.classList.toggle("active");
  });

  doctorSearchInput.addEventListener("input", function (e) {
    const val = e.target.value.toLowerCase();
    const items = doctorDropdownList.querySelectorAll(".dropdown-item");
    items.forEach((li) => {
      const name = li.querySelector("span").textContent.toLowerCase();
      li.style.display = name.includes(val) ? "flex" : "none";
    });
  });

  doctorDropdownList.addEventListener("click", function (e) {
    const li = e.target.closest(".dropdown-item");
    if (!li) return;
    const doctorId = li.getAttribute("data-doctor-id");
    const docName = li.querySelector("span").textContent;
    selectedDoctorSpan.textContent = docName;
    doctorDropdown.classList.remove("active");

    loadDoctorEarnings(doctorId);
  });

  function loadDoctorDropdown() {
    fetch("/api/doctor-search/")
      .then((resp) => resp.json())
      .then((doctors) => {
        doctorDropdownList.innerHTML = "";
        if (!doctors.length) {
          const li = document.createElement("li");
          li.textContent = "Həkim tapılmadı";
          doctorDropdownList.appendChild(li);
          return;
        }
        let firstDoctorId = doctors[0].id;
        let firstDoctorName = doctors[0].name;

        doctors.forEach((doc) => {
          const li = document.createElement("li");
          li.classList.add("dropdown-item");
          li.setAttribute("data-doctor-id", doc.id);
          li.innerHTML = `
            <img style="border-radius: 50%; margin-right: 10px; width: 30px; height: 30px;"
            src="${doc.image}" alt="Həkim" onerror="this.src='/static/images/user-default.jpg'" />
            <span>${doc.name}</span>
          `;
          doctorDropdownList.appendChild(li);
        });

        selectedDoctorSpan.textContent = firstDoctorName;
        loadDoctorEarnings(firstDoctorId);
      })
      .catch((err) =>
        console.error("Error loading doctors for dropdown:", err)
      );
  }

  loadDoctorDropdown();
});
