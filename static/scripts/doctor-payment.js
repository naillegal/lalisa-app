document.addEventListener("DOMContentLoaded", function () {
  function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== "") {
      const cookies = document.cookie.split(";");
      for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i].trim();
        if (cookie.substring(0, name.length + 1) === name + "=") {
          cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
          break;
        }
      }
    }
    return cookieValue;
  }
  const csrftoken = getCookie("csrftoken");

  let overlay = document.getElementById("overlay");
  let doctorChangeTrigger = document.querySelector(
    ".payment-calculate-change-doctor"
  );
  let doctorChangePopup = document.querySelector(
    ".doctor-payment-change-doctor-popup"
  );
  let doctorPaymentTrigger = document.querySelector(".calculate-btn button");
  let doctorPaymentPopup = document.querySelector(
    ".doctor-payment-calculate-popup"
  );
  let percentageTrigger = document.querySelector(".percentage-degree");
  let percentagePopup = document.querySelector(".percentage-degree-popup");
  let costTrigger = document.querySelector(".constantly-cost");
  let costPopup = document.querySelector(".constantly-cost-popup");

  const avansInput = document.getElementById("avans-input");
  const calculatedAmountSpan = document.getElementById("calculated-amount");
  const doctorSearchInput = document.getElementById("doctor-search");
  const doctorListContainer = document.getElementById("doctor-list-container");
  const constantCostInput = document.getElementById("constant-cost-input");
  const constantCostApplyBtn = document.getElementById(
    "constant-cost-apply-btn"
  );

  let currentDoctorElem = document.querySelector("input[name='doctor_id']");
  let currentDoctorId = currentDoctorElem ? currentDoctorElem.value : null;

  function openPopup(popup) {
    if (!popup) return;
    popup.style.display = "block";
    overlay.style.display = "block";
  }
  function closePopup(popup) {
    if (!popup) return;
    popup.style.display = "none";
    overlay.style.display = "none";
  }

  doctorChangeTrigger.addEventListener("click", function () {
    openPopup(doctorChangePopup);
    fetchDoctors("");
  });
  document
    .querySelector(".close-doctor-payment-change-doctor-popup-btn i")
    .addEventListener("click", function () {
      closePopup(doctorChangePopup);
    });

  percentageTrigger.addEventListener("click", function () {
    openPopup(percentagePopup);
    if (currentDoctorId) {
      loadDoctorServicesAndCommissions(currentDoctorId);
    }
  });
  document
    .querySelector(".close-percentage-degree-popup-btn i")
    .addEventListener("click", function () {
      closePopup(percentagePopup);
    });
  document
    .querySelector(".percentage-degree-popup-close")
    .addEventListener("click", function () {
      closePopup(percentagePopup);
    });
  document
    .querySelector(".percentage-degree-popup-confirm")
    .addEventListener("click", function () {
      const rows = document.querySelectorAll(
        "#percentage-degree-list .commission-row"
      );
      let payload = [];
      rows.forEach((row) => {
        const dsId = row.dataset.doctorServiceId;
        const valInput = row.querySelector("input");
        let val = valInput.value.trim() || "0";
        payload.push({
          id: dsId,
          commission_percentage: val,
        });
      });
      fetch("/api/doctor-service/bulk_update/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": csrftoken,
        },
        body: JSON.stringify(payload),
      })
        .then((res) => res.json())
        .then((data) => {
          closePopup(percentagePopup);
        })
        .catch((err) => console.log(err));
    });

  costTrigger.addEventListener("click", function () {
    openPopup(costPopup);
    if (currentDoctorId) {
      fetch(`/api/doctor-payment/${currentDoctorId}/constant_cost/`)
        .then((res) => res.json())
        .then((data) => {
          if (data.constant_cost) {
            constantCostInput.value = data.constant_cost;
          } else {
            constantCostInput.value = "";
          }
        })
        .catch((err) => console.log(err));
    }
  });
  document
    .querySelector(".close-constantly-cost-popup-btn i")
    .addEventListener("click", function () {
      closePopup(costPopup);
    });
  document
    .querySelector(".constantly-cost-popup-close")
    .addEventListener("click", function () {
      closePopup(costPopup);
    });
  constantCostApplyBtn.addEventListener("click", function () {
    let val = constantCostInput.value.trim() || "0";
    if (!currentDoctorId) return;
    fetch(`/api/doctor-payment/${currentDoctorId}/constant_cost/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-CSRFToken": csrftoken,
      },
      body: JSON.stringify({ constant_cost: val }),
    })
      .then((res) => res.json())
      .then((data) => {
        console.log("constant cost updated:", data);
      })
      .catch((err) => console.log(err));
  });

  doctorPaymentTrigger.addEventListener("click", function (e) {
    e.preventDefault();
    if (!currentDoctorId) return;
    const startDate = document.getElementById("start-date").value;
    const endDate = document.getElementById("end-date").value;
    const avans = avansInput.value ? avansInput.value : "0";
    const url = `/api/doctor-payment/${currentDoctorId}/calculate/?start_date=${startDate}&end_date=${endDate}&avans=${avans}`;
    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        let total = data.total_payment || 0;
        calculatedAmountSpan.textContent = total;
        openPopup(doctorPaymentPopup);
      })
      .catch((err) => console.log(err));
  });
  document
    .querySelector(".close-doctor-payment-calculate-popup-btn i")
    .addEventListener("click", function () {
      closePopup(doctorPaymentPopup);
    });
  document
    .querySelector(".doctor-payment-calculate-popup-close")
    .addEventListener("click", function () {
      closePopup(doctorPaymentPopup);
    });

  document
    .querySelector(".doctor-payment-calculate-popup-confirm")
    .addEventListener("click", function () {
      let calculatedAmount = parseFloat(
        document.getElementById("calculated-amount").textContent
      ) || 0;
      if (!currentDoctorId) return;
      fetch(`/api/doctor-payment/${currentDoctorId}/update_total_earning/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": csrftoken,
        },
        body: JSON.stringify({ total_doctor_earning: calculatedAmount }),
      })
        .then((res) => res.json())
        .then((data) => {
          console.log("Doctor total earning updated:", data);
          closePopup(doctorPaymentPopup);
        })
        .catch((err) => console.log(err));
    });

  overlay.addEventListener("click", function () {
    closePopup(doctorChangePopup);
    closePopup(doctorPaymentPopup);
    closePopup(percentagePopup);
    closePopup(costPopup);
  });

  doctorSearchInput.addEventListener("input", function () {
    let val = doctorSearchInput.value.trim();
    fetchDoctors(val);
  });
  function fetchDoctors(searchVal) {
    fetch(`/api/doctor-payment/search/?q=${searchVal}`)
      .then((res) => res.json())
      .then((data) => {
        doctorListContainer.innerHTML = "";
        data.forEach((doc) => {
          let div = document.createElement("div");
          div.classList.add(
            "user-info",
            "doctor-info",
            "d-flex",
            "align-items-center"
          );
          div.innerHTML = `
            <img src="${doc.image}" alt="Doctor" />
            <span>${doc.name}</span>
          `;
          div.addEventListener("click", () => {
            window.location.href = `/doctor-payment/${doc.id}/`;
          });
          doctorListContainer.appendChild(div);
        });
      })
      .catch((err) => console.log(err));
  }

  function loadDoctorServicesAndCommissions(doctorId) {
    fetch(`/api/doctor-service/?doctor_id=${doctorId}`)
      .then((res) => res.json())
      .then((data) => {
        const container = document.getElementById("percentage-degree-list");
        container.innerHTML = "";
        data.forEach((item) => {
          let div = document.createElement("div");
          div.classList.add(
            "d-flex",
            "align-items-center",
            "mb-2",
            "commission-row"
          );
          div.dataset.doctorServiceId = item.id;
          let p = document.createElement("p");
          p.classList.add("mb-0");
          p.textContent = item.service_name;
          let wrapper = document.createElement("div");
          wrapper.classList.add(
            "input-wrapper",
            "d-flex",
            "align-items-center",
            "justify-content-end"
          );
          let i = document.createElement("i");
          i.classList.add("fa-solid", "fa-percent", "me-1");
          let input = document.createElement("input");
          input.type = "text";
          input.placeholder = "Daxil edin";
          input.value = item.commission_percentage;
          wrapper.appendChild(i);
          wrapper.appendChild(input);
          div.appendChild(p);
          div.appendChild(wrapper);
          container.appendChild(div);
        });
      })
      .catch((err) => console.log(err));
  }

  let startDateElem = document.getElementById("start-date");
  let endDateElem = document.getElementById("end-date");
  let dateFilterForm = document.getElementById("date-filter-form");
  if (startDateElem && endDateElem && dateFilterForm) {
    startDateElem.addEventListener("change", () => dateFilterForm.submit());
    endDateElem.addEventListener("change", () => dateFilterForm.submit());
  }
});
