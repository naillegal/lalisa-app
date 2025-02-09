document.addEventListener("DOMContentLoaded", function () {
  const overlay = document.getElementById("overlay");

  const addDoctorPopup = document.querySelector(".add-doctor-popup");
  const addDoctorActiveOrDeactivePopup = document.querySelector(
    ".add-doctor-active-or-deactive-popup"
  );
  const doctorWorkingScheduleTimePopup = document.querySelector(
    ".doctor-working-schedule-time-popup"
  );
  const dateAndTimePermissionPopup = document.querySelector(
    ".doctor-date-and-time-permission-popup"
  );
  const doctorPerDatePermissionPopup = document.querySelector(
    ".doctor-per-date-permission-popup"
  );
  const doctorPerTimePermissionPopup = document.querySelector(
    ".doctor-per-time-permission-popup"
  );

  const popups = [
    addDoctorPopup,
    addDoctorActiveOrDeactivePopup,
    doctorWorkingScheduleTimePopup,
    dateAndTimePermissionPopup,
    doctorPerDatePermissionPopup,
    doctorPerTimePermissionPopup,
  ];

  let currentDoctorId = null;
  let currentDayOfWeek = null;
  let isActiveSelected = false;

  const tempSchedules = {
    1: { is_active: false, start_time: null, end_time: null },
    2: { is_active: false, start_time: null, end_time: null },
    3: { is_active: false, start_time: null, end_time: null },
    4: { is_active: false, start_time: null, end_time: null },
    5: { is_active: false, start_time: null, end_time: null },
    6: { is_active: false, start_time: null, end_time: null },
    7: { is_active: false, start_time: null, end_time: null },
  };

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

  function csrfSafeMethod(method) {
    return /^(GET|HEAD|OPTIONS|TRACE)$/.test(method);
  }

  function getHeaders(method, isJson = false) {
    const headers = {};
    if (!csrfSafeMethod(method)) {
      headers["X-CSRFToken"] = csrftoken;
    }
    if (isJson) {
      headers["Content-Type"] = "application/json";
    }
    return headers;
  }

  function openPopup(popup) {
    if (popup) {
      popup.style.display = "block";
      overlay.style.display = "block";
    }
  }

  function closePopup(popup) {
    if (popup) {
      popup.style.display = "none";
    }
    if (!anyPopupOpen()) {
      overlay.style.display = "none";
    }
  }

  function closeAllPopups() {
    popups.forEach((p) => {
      if (p) p.style.display = "none";
    });
    overlay.style.display = "none";
  }

  function anyPopupOpen() {
    return popups.some((p) => p && p.style.display === "block");
  }

  popups.forEach((popup) => {
    if (popup) {
      const closeIcon = popup.querySelector(".fa-xmark");
      const closeButton = popup.querySelector(".treatment-content-popup-close");
      if (closeIcon) {
        closeIcon.addEventListener("click", () => {
          closePopup(popup);
        });
      }
      if (closeButton) {
        closeButton.addEventListener("click", () => {
          closePopup(popup);
        });
      }
    }
  });
  if (overlay) {
    overlay.addEventListener("click", closeAllPopups);
  }

  const addDoctorPopupWorkingSchedule =
    addDoctorPopup.querySelector(".working-schedule");

  function setWorkingScheduleVisibility() {
    if (currentDoctorId === null) {
      addDoctorPopupWorkingSchedule.style.display = "none";
    } else {
      addDoctorPopupWorkingSchedule.style.display = "block";
    }
  }

  const addDoctorButton = document.querySelector(".add-doctor");
  if (addDoctorButton) {
    addDoctorButton.addEventListener("click", () => {
      currentDoctorId = null;
      clearDoctorForm();
      resetTempSchedules();
      openPopup(addDoctorPopup);
      setWorkingScheduleVisibility();
    });
  }

  function clearDoctorForm() {
    document.getElementById("doctor-popup-name").innerText = "";
    document.getElementById("doctor-fullname-input").value = "";
    document.getElementById("doctor-specialty-input").value = "";
    document.getElementById("selected-option").innerText = "Xidmətin adı";
    document.getElementById("doctor-rating-input").value = "";
    document.getElementById("doctor-experience-input").value = "";
    document.getElementById("doctor-about-input").value = "";

    const profileImg = addDoctorPopup.querySelector(".profile-section img");
    profileImg.src = STATIC_URL + "images/user-mini-pic.png";

    const profileInput = document.getElementById("profile-image-input");
    if (profileInput) {
      profileInput.value = "";
    }

    const checkboxes = document.querySelectorAll(".dropdown-checkbox");
    checkboxes.forEach((ch) => (ch.checked = false));
  }

  function resetTempSchedules() {
    for (let day = 1; day <= 7; day++) {
      tempSchedules[day] = {
        is_active: false,
        start_time: null,
        end_time: null,
      };
    }
  }

  const doctorEditButtons = document.querySelectorAll(".doctor-edit-btn");
  doctorEditButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const row = btn.closest("tr");
      currentDoctorId = row.getAttribute("data-row-id");
      fetch(`/api/doctors/${currentDoctorId}/`)
        .then((res) => {
          if (!res.ok) throw new Error("Failed to fetch doctor data");
          return res.json();
        })
        .then((data) => {
          fillDoctorFormWithData(data);
          setTempSchedulesFromDoctorData(data);
          openPopup(addDoctorPopup);
          setWorkingScheduleVisibility();
        })
        .catch((err) => console.error(err));
    });
  });

  function fillDoctorFormWithData(doctor) {
    document.getElementById("doctor-popup-name").innerText =
      doctor.first_name + " " + doctor.last_name;
    document.getElementById("doctor-fullname-input").value =
      doctor.first_name + " " + doctor.last_name;
    document.getElementById("doctor-specialty-input").value =
      doctor.specialty || "";
    document.getElementById("doctor-rating-input").value = doctor.rating || "";
    document.getElementById("doctor-experience-input").value =
      doctor.experience || "";
    document.getElementById("doctor-about-input").value = doctor.about || "";

    const profileImg = addDoctorPopup.querySelector(".profile-section img");
    if (doctor.image) {
      profileImg.src = doctor.image;
    } else {
      profileImg.src = STATIC_URL + "images/user-mini-pic.png";
    }

    const checkboxes = document.querySelectorAll(".dropdown-checkbox");
    checkboxes.forEach((ch) => (ch.checked = false));
    if (doctor.services) {
      doctor.services.forEach((serv) => {
        document
          .querySelectorAll("#dropdown-list .dropdown-item")
          .forEach((li) => {
            const span = li.querySelector("span");
            const checkbox = li.querySelector(".dropdown-checkbox");
            if (span.innerText === serv) {
              checkbox.checked = true;
            }
          });
      });
    }
    refreshSelectedServicesText();
  }

  function setTempSchedulesFromDoctorData(doctor) {
    resetTempSchedules();
    if (doctor.schedules && Array.isArray(doctor.schedules)) {
      doctor.schedules.forEach((s) => {
        const d = s.day_of_week;
        tempSchedules[d].is_active = s.is_active;
        tempSchedules[d].start_time = s.start_time || null;
        tempSchedules[d].end_time = s.end_time || null;
      });
    }
  }

  const doctorSaveBtn = document.getElementById("doctor-save-btn");
  if (doctorSaveBtn) {
    doctorSaveBtn.addEventListener("click", () => {
      const fullName = document
        .getElementById("doctor-fullname-input")
        .value.trim();
      let first_name = "";
      let last_name = "";
      if (fullName) {
        const parts = fullName.split(" ");
        first_name = parts[0] || "";
        last_name = parts.slice(1).join(" ");
      }

      const specialty = document
        .getElementById("doctor-specialty-input")
        .value.trim();
      const rating = document
        .getElementById("doctor-rating-input")
        .value.trim();
      const experience = document
        .getElementById("doctor-experience-input")
        .value.trim();
      const about = document.getElementById("doctor-about-input").value.trim();

      const selectedServices = [];
      document.querySelectorAll(".dropdown-item").forEach((item) => {
        const checkbox = item.querySelector(".dropdown-checkbox");
        const span = item.querySelector("span");
        if (checkbox.checked) {
          selectedServices.push(span.innerText);
        }
      });

      // Şəkil
      const profileInput = document.getElementById("profile-image-input");
      const formData = new FormData();
      formData.append("first_name", first_name);
      formData.append("last_name", last_name);
      formData.append("specialty", specialty);
      formData.append("rating", rating);
      formData.append("experience", experience);
      formData.append("about", about);
      formData.append("services", selectedServices.join(","));

      if (profileInput.files && profileInput.files[0]) {
        formData.append("image", profileInput.files[0]);
      }

      if (!currentDoctorId) {
        fetch("/api/doctors/", {
          method: "POST",
          headers: getHeaders("POST"),
          body: formData,
        })
          .then((res) => {
            if (!res.ok) throw new Error("Failed to create doctor");
            return res.json();
          })
          .then((createdDoctor) => {
            alert("Həkim uğurla yaradıldı!");
            updateSchedulesForDoctor(createdDoctor.id)
              .then(() => {
                window.location.reload();
              })
              .catch((err) => {
                console.error("Schedule update error:", err);
                window.location.reload();
              });
          })
          .catch((err) => {
            console.error(err);
            alert("Xəta baş verdi!");
          });
      } else {
        fetch(`/api/doctors/${currentDoctorId}/`, {
          method: "PUT",
          headers: getHeaders("PUT"),
          body: formData,
        })
          .then((res) => {
            if (!res.ok) throw new Error("Failed to update doctor");
            return res.json();
          })
          .then(() => {
            alert("Həkim məlumatları yeniləndi!");
            updateSchedulesForDoctor(currentDoctorId)
              .then(() => {
                window.location.reload();
              })
              .catch((err) => {
                console.error("Schedule update error:", err);
                window.location.reload();
              });
          })
          .catch((err) => {
            console.error(err);
            alert("Xəta baş verdi!");
          });
      }
    });
  }

  function updateSchedulesForDoctor(doctorId) {
    const promises = [];
    for (let day = 1; day <= 7; day++) {
      const scheduleData = tempSchedules[day];
      promises.push(
        fetch(`/api/doctors/${doctorId}/schedules/day/${day}/`, {
          method: "PATCH",
          headers: getHeaders("PATCH", true),
          body: JSON.stringify({
            is_active: scheduleData.is_active,
            start_time: scheduleData.start_time,
            end_time: scheduleData.end_time,
          }),
        })
      );
    }
    return Promise.all(promises);
  }

  const profileSection = addDoctorPopup.querySelector(".profile-section");
  if (profileSection) {
    const profileImage = profileSection.querySelector("img");
    const profileInput = document.getElementById("profile-image-input");
    profileSection.addEventListener("click", () => {
      profileInput.click();
    });
    profileInput.addEventListener("change", function () {
      if (this.files && this.files[0]) {
        const reader = new FileReader();
        reader.onload = function (e) {
          profileImage.src = e.target.result;
        };
        reader.readAsDataURL(this.files[0]);
      }
    });
  }

  const serviceDropdown = addDoctorPopup.querySelector(
    ".add-doctor-popup-custom-select-service .custom-dropdown"
  );
  if (serviceDropdown) {
    const dropdownHeader = serviceDropdown.querySelector(".dropdown-header");
    const searchInput = serviceDropdown.querySelector("#search-input");
    const dropdownItems = serviceDropdown.querySelectorAll(".dropdown-item");

    function toggleDropdown() {
      serviceDropdown.classList.toggle("open");
    }
    function closeDropdown() {
      serviceDropdown.classList.remove("open");
    }
    function filterDropdownItems() {
      const searchText = searchInput.value.toLowerCase();
      dropdownItems.forEach((item) => {
        const itemText = item.querySelector("span").innerText.toLowerCase();
        item.style.display = itemText.includes(searchText) ? "flex" : "none";
      });
    }

    dropdownHeader.addEventListener("click", toggleDropdown);
    searchInput.addEventListener("input", filterDropdownItems);

    dropdownItems.forEach((item) => {
      const checkbox = item.querySelector(".dropdown-checkbox");
      if (checkbox) {
        checkbox.addEventListener("change", refreshSelectedServicesText);
        item.addEventListener("click", (e) => {
          if (!e.target.classList.contains("dropdown-checkbox")) {
            checkbox.checked = !checkbox.checked;
            refreshSelectedServicesText();
          }
        });
      }
    });

    document.addEventListener("click", (e) => {
      if (!e.target.closest(".custom-dropdown")) {
        closeDropdown();
      }
    });
  }

  function refreshSelectedServicesText() {
    const selectedServices = [];
    document.querySelectorAll(".dropdown-item").forEach((item) => {
      const checkbox = item.querySelector(".dropdown-checkbox");
      const span = item.querySelector("span");
      if (checkbox.checked) {
        selectedServices.push(span.innerText);
      }
    });
    if (selectedServices.length === 0) {
      document.getElementById("selected-option").innerText = "Xidmətin adı";
    } else {
      document.getElementById("selected-option").innerText =
        selectedServices.join(", ");
    }
  }

  let currentEditIcon = null;
  const userEditToggles = addDoctorPopup.querySelectorAll(
    ".working-schedule-edit-toggle"
  );
  userEditToggles.forEach((icon) => {
    icon.addEventListener("click", function () {
      currentEditIcon = this;
      currentDayOfWeek = this.closest("div[data-day]").getAttribute("data-day");
      openPopup(addDoctorActiveOrDeactivePopup);
      addDoctorActiveOrDeactivePopup.style.zIndex = "400";
    });
  });

  const addDoctorActiveOrDeactivePopupConfirmButton = document.getElementById(
    "active-or-deactive-confirm"
  );
  if (addDoctorActiveOrDeactivePopupConfirmButton) {
    addDoctorActiveOrDeactivePopupConfirmButton.addEventListener(
      "click",
      () => {
        const activeRadio = document.getElementById("active");
        const deactiveRadio = document.getElementById("deactive");
        if (activeRadio.checked) {
          isActiveSelected = true;
          closePopup(addDoctorActiveOrDeactivePopup);
          openPopup(doctorWorkingScheduleTimePopup);
          doctorWorkingScheduleTimePopup.style.zIndex = "401";
        } else if (deactiveRadio.checked) {
          isActiveSelected = false;
          closePopup(addDoctorActiveOrDeactivePopup);

          if (currentEditIcon) {
            currentEditIcon.innerHTML = `<span style="color: red;"> Deaktiv</span>`;
          }

          if (currentDoctorId) {
            patchScheduleDay(
              currentDoctorId,
              currentDayOfWeek,
              false,
              null,
              null
            );
          } else {
            tempSchedules[currentDayOfWeek].is_active = false;
            tempSchedules[currentDayOfWeek].start_time = null;
            tempSchedules[currentDayOfWeek].end_time = null;
          }
        } else {
          alert("Zəhmət olmasa bir seçim edin.");
        }
      }
    );
  }

  const doctorWorkingScheduleTimePopupConfirmButton = document.getElementById(
    "working-schedule-save-btn"
  );
  if (doctorWorkingScheduleTimePopupConfirmButton) {
    doctorWorkingScheduleTimePopupConfirmButton.addEventListener(
      "click",
      () => {
        const startTime = document.getElementById("schedule-start-time").value;
        const endTime = document.getElementById("schedule-end-time").value;
        if (startTime && endTime) {
          if (currentEditIcon) {
            currentEditIcon.innerHTML = `<span style="color: green;"> ${startTime}-${endTime}</span>`;
          }

          closePopup(doctorWorkingScheduleTimePopup);

          if (currentDoctorId) {
            patchScheduleDay(
              currentDoctorId,
              currentDayOfWeek,
              true,
              startTime,
              endTime
            );
          } else {
            tempSchedules[currentDayOfWeek].is_active = true;
            tempSchedules[currentDayOfWeek].start_time = startTime;
            tempSchedules[currentDayOfWeek].end_time = endTime;
          }
        } else {
          alert("Zəhmət olmasa bütün sahələri doldurun.");
        }
      }
    );
  }

  function patchScheduleDay(doctorId, dayOfWeek, isActive, startTime, endTime) {
    fetch(`/api/doctors/${doctorId}/schedules/day/${dayOfWeek}/`, {
      method: "PATCH",
      headers: getHeaders("PATCH", true),
      body: JSON.stringify({
        is_active: isActive,
        start_time: startTime,
        end_time: endTime,
      }),
    })
      .then((res) => {
        if (!res.ok)
          throw new Error("Failed to patch schedule for day " + dayOfWeek);
        return res.json();
      })
      .then(() => {
        console.log("Schedule updated for day ", dayOfWeek);
      })
      .catch((err) => console.error(err));

    tempSchedules[dayOfWeek].is_active = isActive;
    tempSchedules[dayOfWeek].start_time = startTime;
    tempSchedules[dayOfWeek].end_time = endTime;
  }

  const doctorPermissionButtons = document.querySelectorAll(
    ".doctor-permission-btn"
  );
  doctorPermissionButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const row = btn.closest("tr");
      currentDoctorId = row.getAttribute("data-row-id");
      openPopup(dateAndTimePermissionPopup);
    });
  });

  const dateAndTimePermissionPopupConfirmButton = document.getElementById(
    "choose-permission-type-btn"
  );
  if (dateAndTimePermissionPopupConfirmButton) {
    dateAndTimePermissionPopupConfirmButton.addEventListener("click", () => {
      const selected = document.querySelector(
        ".doctor-date-and-time-permission-popup input[name='permission-type']:checked"
      );
      if (!selected) {
        alert("Zəhmət olmasa bir seçim edin.");
        return;
      }
      if (selected.id === "date-range") {
        closePopup(dateAndTimePermissionPopup);
        openPopup(doctorPerDatePermissionPopup);
      } else if (selected.id === "time-range") {
        closePopup(dateAndTimePermissionPopup);
        openPopup(doctorPerTimePermissionPopup);
      } else if (selected.id === "delete-permission") {
        closePopup(dateAndTimePermissionPopup);
        if (currentDoctorId) {
          fetch(`/api/doctors/${currentDoctorId}/permission/`, {
            method: "PATCH",
            headers: getHeaders("PATCH", true),
            body: JSON.stringify({ permission_type: "none" }),
          })
            .then((res) => {
              if (!res.ok) throw new Error("Failed to delete permission");
              return res.json();
            })
            .then(() => {
              alert("İcazə uğurla ləğv edildi!");
              window.location.reload();
            })
            .catch((err) => console.error(err));
        }
      }
    });
  }

  const doctorPerDatePermissionPopupConfirmButton = document.getElementById(
    "date-range-confirm-btn"
  );
  if (doctorPerDatePermissionPopupConfirmButton) {
    doctorPerDatePermissionPopupConfirmButton.addEventListener("click", () => {
      const startDate = document.getElementById("date-range-start").value;
      const endDate = document.getElementById("date-range-end").value;
      if (startDate && endDate && currentDoctorId) {
        fetch(`/api/doctors/${currentDoctorId}/permission/`, {
          method: "PATCH",
          headers: getHeaders("PATCH", true),
          body: JSON.stringify({
            permission_type: "date_range",
            start_date: startDate,
            end_date: endDate,
            specific_date: null,
            start_time: null,
            end_time: null,
          }),
        })
          .then((res) => {
            if (!res.ok) throw new Error("Failed to set date range permission");
            return res.json();
          })
          .then(() => {
            alert("İcazə tarixi uğurla təyin edildi!");
            closePopup(doctorPerDatePermissionPopup);
            window.location.reload();
          })
          .catch((err) => console.error(err));
      } else {
        alert(
          "Zəhmət olmasa bütün sahələri doldurun və ya doctor ID tapılmadı."
        );
      }
    });
  }

  const doctorPerTimePermissionPopupConfirmButton = document.getElementById(
    "time-range-confirm-btn"
  );
  if (doctorPerTimePermissionPopupConfirmButton) {
    doctorPerTimePermissionPopupConfirmButton.addEventListener("click", () => {
      const dateValue = document.getElementById("time-range-date").value;
      const startTime = document.getElementById("time-range-start").value;
      const endTime = document.getElementById("time-range-end").value;
      if (dateValue && startTime && endTime && currentDoctorId) {
        fetch(`/api/doctors/${currentDoctorId}/permission/`, {
          method: "PATCH",
          headers: getHeaders("PATCH", true),
          body: JSON.stringify({
            permission_type: "time_range",
            specific_date: dateValue,
            start_time: startTime,
            end_time: endTime,
            start_date: null,
            end_date: null,
          }),
        })
          .then((res) => {
            if (!res.ok) throw new Error("Failed to set time range permission");
            return res.json();
          })
          .then(() => {
            alert("İcazə saat aralığı uğurla təyin edildi!");
            closePopup(doctorPerTimePermissionPopup);
            window.location.reload();
          })
          .catch((err) => console.error(err));
      } else {
        alert(
          "Zəhmət olmasa bütün sahələri doldurun və ya doctor ID tapılmadı."
        );
      }
    });
  }
});
