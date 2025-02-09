function handleCustomSelectClick(e) {
  const selectWrapper = e.currentTarget.closest(".custom-dropdown");
  if (!selectWrapper) return;
  selectWrapper.classList.toggle("open");
}

document
  .querySelectorAll(".custom-dropdown .dropdown-header")
  .forEach((header) => {
    header.addEventListener("click", handleCustomSelectClick);
  });

document.addEventListener("click", (e) => {
  if (!e.target.closest(".custom-dropdown")) {
    document
      .querySelectorAll(".custom-dropdown.open")
      .forEach((cs) => cs.classList.remove("open"));
  }
});

const doctorDropdownList = document.getElementById("doctor-dropdown-list");
if (doctorDropdownList) {
  doctorDropdownList.querySelectorAll(".dropdown-item").forEach((item) => {
    item.addEventListener("click", (e) => {
      e.stopPropagation();
      let doctorId = item.getAttribute("data-doctor-id");
      let text = item.querySelector("span").innerText;
      let dropdown = item.closest(".custom-dropdown");
      let headerText = dropdown.querySelector("#selected-doctor-text");

      headerText.innerText = text;
      headerText.setAttribute("data-doctor-id", doctorId);

      dropdown.classList.remove("open");
    });
  });
}

const doctorSearchInput = document.getElementById("doctor-search-input");
if (doctorSearchInput) {
  doctorSearchInput.addEventListener("input", function () {
    const searchTerm = this.value.toLowerCase();
    const items = doctorDropdownList.querySelectorAll(".dropdown-item");
    items.forEach((item) => {
      const text = item.querySelector("span").innerText.toLowerCase();
      if (text.includes(searchTerm)) {
        item.style.display = "";
      } else {
        item.style.display = "none";
      }
    });
  });
}

const startDateInput = document.getElementById("start-date");
const endDateInput = document.getElementById("end-date");

if (startDateInput && endDateInput) {
  startDateInput.addEventListener("change", handleDateFilterChange);
  endDateInput.addEventListener("change", handleDateFilterChange);
}

function handleDateFilterChange() {
  const startVal = startDateInput.value;
  const endVal = endDateInput.value;

  const url = new URL(window.location.href);

  if (startVal) {
    url.searchParams.set("start_date", startVal);
  } else {
    url.searchParams.delete("start_date");
  }

  if (endVal) {
    url.searchParams.set("end_date", endVal);
  } else {
    url.searchParams.delete("end_date");
  }

  url.searchParams.delete("page");

  window.location.href = url.toString();
}

const laserAddButton = document.querySelector(".laser-add");
const addLaserPopup = document.querySelector(".add-laser-usage-popup");
const deleteLaserPopup = document.querySelector(".laser-delete-popup");
const overlay = document.querySelector("#overlay");

const closeButtons = document.querySelectorAll(
  ".laser-delete-popup-close, .treatment-content-popup-close"
);
const popupXMarks = document.querySelectorAll(
  ".add-laser-usage-popup .fa-xmark"
);

if (laserAddButton) {
  laserAddButton.addEventListener("click", () => {
    addLaserPopup.style.display = "block";
    overlay.style.display = "block";
  });
}

const deleteToggleButtons = document.querySelectorAll(".user-delete-toggle");
let currentDeleteLaserId = null;
deleteToggleButtons.forEach((button) => {
  button.addEventListener("click", (e) => {
    deleteLaserPopup.style.display = "block";
    overlay.style.display = "block";
    currentDeleteLaserId =
      e.currentTarget.parentElement.getAttribute("data-laser-id");
  });
});

closeButtons.forEach((button) => {
  button.addEventListener("click", () => {
    addLaserPopup.style.display = "none";
    deleteLaserPopup.style.display = "none";
    overlay.style.display = "none";
    currentDeleteLaserId = null;
  });
});

popupXMarks.forEach((xMark) => {
  xMark.addEventListener("click", () => {
    addLaserPopup.style.display = "none";
    overlay.style.display = "none";
  });
});

if (overlay) {
  overlay.addEventListener("click", () => {
    addLaserPopup.style.display = "none";
    deleteLaserPopup.style.display = "none";
    overlay.style.display = "none";
    currentDeleteLaserId = null;
  });
}

const saveLaserUsageBtn = document.getElementById("save-laser-usage-btn");
if (saveLaserUsageBtn) {
  saveLaserUsageBtn.addEventListener("click", function (e) {
    e.preventDefault();

    const selectedDoctorText = document.getElementById("selected-doctor-text");
    const doctorId = selectedDoctorText.getAttribute("data-doctor-id"); // seçilmiş həkim id
    const beforeShots = document
      .getElementById("before-shots-input")
      .value.trim();
    const afterShots = document
      .getElementById("after-shots-input")
      .value.trim();
    const areas = document.getElementById("areas-input").value.trim();

    if (!doctorId) {
      alert("Zəhmət olmasa həkim seçin.");
      return;
    }
    if (!beforeShots || !afterShots) {
      alert("Zəhmət olmasa 'Əvvəl' və 'Sonra' atış sayı daxil edin.");
      return;
    }

    const usage = Number(afterShots) - Number(beforeShots);

    const csrftoken = getCookie("csrftoken");
    fetch("/api/laser_usage/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-CSRFToken": csrftoken,
      },
      body: JSON.stringify({
        doctor: doctorId,
        before_shots: beforeShots,
        after_shots: afterShots,
        usage: usage,
        areas: areas,
      }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Xəta baş verdi!");
        }
        return response.json();
      })
      .then((data) => {
        addNewLaserRowToTable(data);

        addLaserPopup.style.display = "none";
        overlay.style.display = "none";

        document.getElementById("before-shots-input").value = "";
        document.getElementById("after-shots-input").value = "";
        document.getElementById("areas-input").value = "";
        selectedDoctorText.innerText = "Həkimi seç";
        selectedDoctorText.removeAttribute("data-doctor-id");
      })
      .catch((error) => {
        console.error(error);
        alert("Xəta baş verdi!");
      });
  });
}

function addNewLaserRowToTable(laserObj) {
  const tbody = document.getElementById("laser-usage-tbody");
  if (!tbody) return;

  const createdDate = new Date(laserObj.created_at);
  const day = String(createdDate.getDate()).padStart(2, "0");
  const month = String(createdDate.getMonth() + 1).padStart(2, "0");
  const year = createdDate.getFullYear();
  const formattedDate = `${day}.${month}.${year}`;

  const rowCount = tbody.querySelectorAll("tr").length;
  const newIndex = rowCount + 1;

  let doctorFullName = laserObj.doctor_name || "Seçilmiş Həkim";

  let doctorImage = laserObj.doctor_image || "/static/images/user-mini-pic.png";
  const tr = document.createElement("tr");
  tr.innerHTML = `
      <td>
        <label class="custom-checkbox">
          <input type="checkbox" />
          <span class="checkmark">
            <i class="fa-solid fa-check"></i>
          </span>
        </label>
        ${newIndex < 10 ? "0" + newIndex : newIndex}
      </td>
      <td>
        <div class="user-info d-flex align-items-center">
          <img src="${doctorImage}" alt="User" />
          <span>${doctorFullName}</span>
        </div>
      </td>
      <td>${laserObj.before_shots}</td>
      <td>${laserObj.after_shots}</td>
      <td>${laserObj.usage}</td>
      <td>${laserObj.areas}</td>
      <td>${formattedDate}</td>
      <td>
        <div data-laser-id="${laserObj.id}">
          <i class="user-delete-toggle fa-solid fa-trash"></i>
        </div>
      </td>
    `;

  tbody.prepend(tr);

  const newDeleteButton = tr.querySelector(".user-delete-toggle");
  newDeleteButton.addEventListener("click", () => {
    deleteLaserPopup.style.display = "block";
    overlay.style.display = "block";
    currentDeleteLaserId = laserObj.id;
  });
}

const confirmDeleteBtn = document.querySelector(".laser-delete-popup-confirm");
if (confirmDeleteBtn) {
  confirmDeleteBtn.addEventListener("click", function () {
    if (!currentDeleteLaserId) {
      alert("Silinəcək laser ID tapılmadı!");
      return;
    }
    const csrftoken = getCookie("csrftoken");
    fetch(`/api/laser_usage/${currentDeleteLaserId}/`, {
      method: "DELETE",
      headers: {
        "X-CSRFToken": csrftoken,
      },
    })
      .then((response) => {
        if (response.status === 204 || response.status === 200) {
          const row = document
            .querySelector(`[data-laser-id="${currentDeleteLaserId}"]`)
            ?.closest("tr");
          if (row) {
            row.remove();
          }
          currentDeleteLaserId = null;
          deleteLaserPopup.style.display = "none";
          overlay.style.display = "none";
        } else {
          throw new Error("Silinmə zamanı xəta baş verdi!");
        }
      })
      .catch((error) => {
        console.error(error);
        alert("Silinmə zamanı xəta baş verdi!");
      });
  });
}

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
