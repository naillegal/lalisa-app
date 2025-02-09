document.addEventListener("DOMContentLoaded", () => {
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

  let usersData = [];
  let doctorsData = [];
  let servicesData = [];
  let reservationsData = [];
  let monthEvents = {};
  let weekEvents = {};
  let dayEvents = {};

  let selectedEvent = null;
  let isRegisteredReservation = true;

  let eventCurrentPage = 1;
  let eventTotalPages = 1;
  const eventsPageSize = 5;

  const overlay = document.getElementById("overlay");
  const calendarAddReservationPopup = document.querySelector(
    ".calendar-add-reservation-popup"
  );
  const calendarReservationMethodPopup = document.querySelector(
    ".calendar-reservation-method-popup"
  );
  const calendarReservationListPopup = document.querySelector(
    ".calendar-reservation-list-popup"
  );
  const calendarReservationUserInfoPopup = document.querySelector(
    ".calendar-reservation-user-info-popup"
  );
  const reservationDeleteWarningPopup = document.querySelector(
    ".reservation-delete-warning-popup"
  );
  const reservationListMiddle = document.getElementById(
    "reservationListMiddle"
  );
  const userInfoCloseIcon =
    calendarReservationUserInfoPopup.querySelector(".fa-x");
  const reservationActionButtons =
    calendarReservationUserInfoPopup.querySelector(
      ".reservation-action-buttons"
    );
  const reservationEditActionBtns =
    calendarReservationUserInfoPopup.querySelector(
      ".reservation-edit-action-btns"
    );
  const reservationHistoryViewBox =
    calendarReservationUserInfoPopup.querySelector(
      ".reservation-history-view-box"
    );
  const reservationContent = calendarReservationUserInfoPopup.querySelector(
    ".reservation-content"
  );

  const dayViewButton = document.getElementById("dayViewButton");
  const weekViewButton = document.getElementById("weekViewButton");
  const monthViewButton = document.getElementById("monthViewButton");
  let currentView = "month";
  let currentDate = new Date();

  async function loadInitialData() {
    try {
      const [
        usersResponse,
        doctorsResponse,
        servicesResponse,
        reservationsResponse,
      ] = await Promise.all([
        fetch(`/api/users/`),
        fetch(`/api/doctors/`),
        fetch(`/api/services/`),
        fetch(`/api/reservations/`),
      ]);

      if (usersResponse.ok) usersData = await usersResponse.json();
      if (doctorsResponse.ok) doctorsData = await doctorsResponse.json();
      if (servicesResponse.ok) servicesData = await servicesResponse.json();
      if (reservationsResponse.ok)
        reservationsData = await reservationsResponse.json();

      fillUserDropdown(usersData);
      fillDoctorDropdown(doctorsData);
      fillServiceDropdown(servicesData);

      renderEventsOnCalendar(reservationsData);
      renderDoctorCards(doctorsData, reservationsData);

      loadEventsPageContent();

      const userSearchInput = document.getElementById("user-search-input");
      if (userSearchInput) {
        userSearchInput.addEventListener("click", (e) => {
          e.stopPropagation();
        });
        userSearchInput.addEventListener("input", () => {
          const searchTerm = userSearchInput.value.toLowerCase().trim();
          fillUserDropdown(usersData, searchTerm);
        });
      }
      const doctorSearchInput = document.getElementById("doctor-search-input");
      if (doctorSearchInput) {
        doctorSearchInput.addEventListener("click", (e) => {
          e.stopPropagation();
        });
        doctorSearchInput.addEventListener("input", () => {
          const searchTerm = doctorSearchInput.value.toLowerCase().trim();
          fillDoctorDropdown(doctorsData, searchTerm);
        });
      }
      const serviceSearchInput = document.getElementById(
        "service-search-input"
      );
      if (serviceSearchInput) {
        serviceSearchInput.addEventListener("click", (e) => {
          e.stopPropagation();
        });
        serviceSearchInput.addEventListener("input", () => {
          const searchTerm = serviceSearchInput.value.toLowerCase().trim();
          fillServiceDropdown(servicesData, searchTerm);
        });
      }

      const popupDoctorSearchInput = document.getElementById(
        "popup-doctor-search-input"
      );
      if (popupDoctorSearchInput) {
        popupDoctorSearchInput.addEventListener("click", (e) => {
          e.stopPropagation();
        });
        popupDoctorSearchInput.addEventListener("input", () => {
          const searchTerm = popupDoctorSearchInput.value.toLowerCase().trim();
          fillDoctorDropdown(doctorsData, searchTerm);
        });
      }
      const popupServiceSearchInput = document.getElementById(
        "popup-service-search-input"
      );
      if (popupServiceSearchInput) {
        popupServiceSearchInput.addEventListener("click", (e) => {
          e.stopPropagation();
        });
        popupServiceSearchInput.addEventListener("input", () => {
          const searchTerm = popupServiceSearchInput.value.toLowerCase().trim();
          fillServiceDropdown(servicesData, searchTerm);
        });
      }
    } catch (error) {
      console.error("loadInitialData error:", error);
    }
  }

  function fillUserDropdown(users, searchTerm = "") {
    const userDropdownList = document.getElementById("user-dropdown-list");
    if (!userDropdownList) return;
    userDropdownList.innerHTML = "";
    const filtered = !searchTerm
      ? users
      : users.filter((u) =>
          (u.first_name + " " + u.last_name).toLowerCase().includes(searchTerm)
        );
    filtered.forEach((user) => {
      const li = document.createElement("li");
      li.classList.add("dropdown-item");
      li.innerHTML = `
        <img src="${STATIC_URL}images/mini-profile-picture.png" alt="İstifadəçi" />
        <span>${user.first_name} ${user.last_name}</span>
      `;
      li.dataset.userId = user.id;
      li.addEventListener("click", (e) => {
        e.stopPropagation();
        const headSpan = document.getElementById("selected-user-option");
        if (headSpan) {
          headSpan.innerText = `${user.first_name} ${user.last_name}`;
        }
        userDropdownList.closest(".custom-dropdown").classList.remove("open");
        headSpan.setAttribute("data-user-id", user.id);
      });
      userDropdownList.appendChild(li);
    });
  }

  function updateServiceDropdownForDoctor(selectedDoctor) {
    if (!selectedDoctor) return;

    const docServiceIds = selectedDoctor.service_ids || [];

    const filteredServices = servicesData.filter((srv) =>
      docServiceIds.includes(srv.id)
    );

    fillServiceDropdown(filteredServices);
  }

  function fillDoctorDropdown(doctors, searchTerm = "") {
    const doctorDropdownList = document.getElementById("doctor-dropdown-list");
    if (doctorDropdownList) {
      doctorDropdownList.innerHTML = "";
      let filtered = !searchTerm
        ? doctors
        : doctors.filter((doc) =>
            (doc.first_name + " " + doc.last_name)
              .toLowerCase()
              .includes(searchTerm)
          );
      filtered.forEach((doc) => {
        const li = document.createElement("li");
        li.classList.add("dropdown-item");
        li.innerHTML = `
            <img src="${STATIC_URL}images/mini-profile-picture.png" alt="Həkim" />
            <span>${doc.first_name} ${doc.last_name}</span>
          `;
        li.dataset.doctorId = doc.id;
        li.addEventListener("click", (e) => {
          e.stopPropagation();
          const headSpan = document.getElementById("selected-doctor-option");
          if (headSpan) {
            headSpan.innerText = `${doc.first_name} ${doc.last_name}`;
          }
          doctorDropdownList
            .closest(".custom-dropdown")
            .classList.remove("open");
          headSpan.setAttribute("data-doctor-id", doc.id);

          const serviceHeader = document.getElementById(
            "selected-service-option"
          );
          if (serviceHeader) {
            serviceHeader.innerText = "Xidmətin adı";
            serviceHeader.removeAttribute("data-service-ids");
          }

          updateServiceDropdownForDoctor(doc);
        });
        doctorDropdownList.appendChild(li);
      });
    }

    const popupDoctorDropdownList = document.getElementById(
      "popupDoctorDropdownList"
    );
    if (popupDoctorDropdownList) {
      popupDoctorDropdownList.innerHTML = "";
      let filtered = !searchTerm
        ? doctors
        : doctors.filter((doc) =>
            (doc.first_name + " " + doc.last_name)
              .toLowerCase()
              .includes(searchTerm)
          );
      filtered.forEach((doc) => {
        const li = document.createElement("li");
        li.classList.add("dropdown-item");
        li.innerHTML = `
            <img src="${STATIC_URL}images/mini-profile-picture.png" alt="Avatar" class="avatar" />
            <span>${doc.first_name} ${doc.last_name}</span>
          `;
        li.dataset.doctorId = doc.id;
        li.addEventListener("click", (e) => {
          e.stopPropagation();
          const docNameSpan = document.getElementById("popupDoctorName");
          docNameSpan.innerText = `${doc.first_name} ${doc.last_name}`;
          popupDoctorDropdownList
            .closest(".custom-select")
            .classList.remove("open");
          docNameSpan.setAttribute("data-doctor-id", doc.id);

          const popupServiceHeader =
            document.getElementById("popupServiceName");
          if (popupServiceHeader) {
            popupServiceHeader.innerText = "Xidmətin adı";
            popupServiceHeader.removeAttribute("data-service-ids");
          }

          updateServiceDropdownForDoctor(doc);
        });

        popupDoctorDropdownList.appendChild(li);
      });
    }
  }

  function fillServiceDropdown(services, searchTerm = "") {
    const serviceDropdownList = document.getElementById(
      "service-dropdown-list"
    );
    if (serviceDropdownList) {
      serviceDropdownList.innerHTML = "";
      let filtered = !searchTerm
        ? services
        : services.filter((srv) => srv.name.toLowerCase().includes(searchTerm));
      filtered.forEach((srv) => {
        const li = document.createElement("li");
        li.classList.add("dropdown-item");
        li.innerHTML = `<label><input type="checkbox" class="dropdown-checkbox" value="${srv.id}"> <span>${srv.name}</span></label>`;
        li.querySelector(".dropdown-checkbox").addEventListener(
          "change",
          refreshSelectedServicesText
        );
        li.addEventListener("click", (e) => {
          if (e.target.tagName !== "INPUT") {
            const checkbox = li.querySelector(".dropdown-checkbox");
            checkbox.checked = !checkbox.checked;
            refreshSelectedServicesText();
          }
        });
        serviceDropdownList.appendChild(li);
      });
    }

    const popupServiceDropdownList = document.getElementById(
      "popupServiceDropdownList"
    );
    if (popupServiceDropdownList) {
      popupServiceDropdownList.innerHTML = "";
      let filtered = !searchTerm
        ? services
        : services.filter((srv) => srv.name.toLowerCase().includes(searchTerm));
      filtered.forEach((srv) => {
        const li = document.createElement("li");
        li.classList.add("dropdown-item");
        li.innerHTML = `<label><input type="checkbox" class="dropdown-checkbox" value="${srv.id}"> <span>${srv.name}</span></label>`;
        li.querySelector(".dropdown-checkbox").addEventListener(
          "change",
          refreshPopupSelectedServicesText
        );
        li.addEventListener("click", (e) => {
          if (e.target.tagName !== "INPUT") {
            const checkbox = li.querySelector(".dropdown-checkbox");
            checkbox.checked = !checkbox.checked;
            refreshPopupSelectedServicesText();
          }
        });
        popupServiceDropdownList.appendChild(li);
      });
    }
  }

  function refreshSelectedServicesText() {
    const serviceDropdownList = document.getElementById(
      "service-dropdown-list"
    );
    const checkboxes =
      serviceDropdownList.querySelectorAll(".dropdown-checkbox");
    const selectedIds = [];
    const selectedNames = [];
    checkboxes.forEach((chk) => {
      if (chk.checked) {
        selectedIds.push(chk.value);
        const name = chk.parentElement.querySelector("span").innerText;
        selectedNames.push(name);
      }
    });
    const headSpan = document.getElementById("selected-service-option");
    if (selectedNames.length === 0) {
      headSpan.innerText = "Xidmətin adı";
      headSpan.removeAttribute("data-service-ids");
    } else {
      headSpan.innerText = selectedNames.join(", ");
      headSpan.setAttribute("data-service-ids", selectedIds.join(","));
    }
  }

  function refreshPopupSelectedServicesText() {
    const popupServiceDropdownList = document.getElementById(
      "popupServiceDropdownList"
    );
    const checkboxes =
      popupServiceDropdownList.querySelectorAll(".dropdown-checkbox");
    const selectedIds = [];
    const selectedNames = [];
    checkboxes.forEach((chk) => {
      if (chk.checked) {
        selectedIds.push(chk.value);
        const name = chk.parentElement.querySelector("span").innerText;
        selectedNames.push(name);
      }
    });
    const serviceSpan = document.getElementById("popupServiceName");
    if (selectedNames.length === 0) {
      serviceSpan.innerText = "Xidmətin adı";
      serviceSpan.removeAttribute("data-service-ids");
    } else {
      serviceSpan.innerText = selectedNames.join(", ");
      serviceSpan.setAttribute("data-service-ids", selectedIds.join(","));
    }
  }

  async function createReservation() {
    try {
      let user = null;
      let fullName = null;
      let phone = null;
      if (isRegisteredReservation) {
        const userOption = document
          .getElementById("selected-user-option")
          .getAttribute("data-user-id");
        if (userOption) {
          user = userOption;
        }
      } else {
        fullName = document.getElementById("unregisteredFullName").value.trim();
        phone = document.getElementById("unregisteredPhone").value.trim();
      }
      const doctorId = document
        .getElementById("selected-doctor-option")
        .getAttribute("data-doctor-id");
      const serviceIdsString = document
        .getElementById("selected-service-option")
        .getAttribute("data-service-ids");
      const dateValue = document.getElementById("reservationDate").value;
      const startTimeValue = document.getElementById(
        "reservationStartTime"
      ).value;
      const endTimeValue = document.getElementById("reservationEndTime").value;
      if (!doctorId || !serviceIdsString || !dateValue || !startTimeValue) {
        alert("Bütün xanaları doldurun!");
        return;
      }
      const serviceIds = serviceIdsString.split(",").map((id) => Number(id));
      const bodyData = {
        user: user ? Number(user) : null,
        full_name: fullName,
        phone: phone,
        doctor: Number(doctorId),
        services: serviceIds,
        date: dateValue,
        start_time: startTimeValue,
        end_time: endTimeValue || null,
      };
      const response = await fetch(`/api/reservations/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": csrftoken || "",
        },
        body: JSON.stringify(bodyData),
      });
      if (response.ok) {
        const newReservation = await response.json();
        reservationsData.push(newReservation);
        renderEventsOnCalendar(reservationsData);
        renderDoctorCards(doctorsData, reservationsData);
        loadEventsPageContent();
        alert("Rezervasiya uğurla yaradıldı!");
      } else {
        const errorData = await response.json();
        console.error("createReservation error:", errorData);
        alert("Rezervasiya yaradılarkən xəta baş verdi!");
      }
    } catch (error) {
      console.error("createReservation:", error);
    }
  }

  async function updateReservation(reservationId) {
    try {
      const popupDoctor = document
        .getElementById("popupDoctorName")
        .getAttribute("data-doctor-id");
      const serviceIdsString = document
        .getElementById("popupServiceName")
        .getAttribute("data-service-ids");
      const popupDate = document.getElementById("popupDate").value;
      const popupStartTime = document.getElementById("popupStartTime").value;
      const popupEndTime = document.getElementById("popupEndTime").value;
      if (!popupDoctor || !serviceIdsString || !popupDate || !popupStartTime) {
        alert("Bütün xanaları doldurun!");
        return;
      }
      const serviceIds = serviceIdsString.split(",").map((id) => Number(id));
      const bodyData = {
        doctor: Number(popupDoctor),
        services: serviceIds,
        date: popupDate,
        start_time: popupStartTime,
        end_time: popupEndTime || null,
      };
      const response = await fetch(`/api/reservations/${reservationId}/`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": csrftoken || "",
        },
        body: JSON.stringify(bodyData),
      });
      if (response.ok) {
        const updated = await response.json();
        const idx = reservationsData.findIndex((r) => r.id === reservationId);
        if (idx !== -1) {
          reservationsData[idx] = updated;
        }
        renderEventsOnCalendar(reservationsData);
        renderDoctorCards(doctorsData, reservationsData);
        alert("Rezervasiya yeniləndi.");
      } else {
        const err = await response.json();
        console.error("updateReservation error:", err);
        alert("Rezervasiyanın yenilənməsində xəta!");
      }
    } catch (error) {
      console.error("updateReservation:", error);
    }
  }

  async function deleteReservation(reservationId) {
    try {
      const response = await fetch(`/api/reservations/${reservationId}/`, {
        method: "DELETE",
        headers: {
          "X-CSRFToken": csrftoken || "",
        },
      });
      if (response.ok || response.status === 204) {
        reservationsData = reservationsData.filter(
          (r) => r.id !== reservationId
        );
        renderEventsOnCalendar(reservationsData);
        renderDoctorCards(doctorsData, reservationsData);
        loadEventsPageContent();
        alert("Rezervasiya silindi!");
      } else {
        alert("Rezervasiyanı silmək mümkün olmadı!");
      }
    } catch (error) {
      console.error("deleteReservation:", error);
    }
  }

  async function showReservationHistory(userId) {
    try {
      const resp = await fetch(`/api/reservations/?user_id=${userId}`);
      if (!resp.ok) {
        console.error("showReservationHistory error");
        return;
      }
      const userReservations = await resp.json();
      const wrapper = document.getElementById("userHistorySwiperWrapper");
      if (!wrapper) return;
      wrapper.innerHTML = "";

      if (userReservations.length === 0) {
        wrapper.innerHTML = `<p style="text-align: center; padding: 20px;">İstifadəçinin rezervasiyası yoxdur</p>`;
      } else {
        userReservations.forEach((item) => {
          const docObj = doctorsData.find((d) => d.id === item.doctor);
          let serviceNames = "";
          if (item.service_names && item.service_names.trim() !== "") {
            serviceNames = item.service_names;
          } else if (
            item.services &&
            Array.isArray(item.services) &&
            item.services.length > 0
          ) {
            serviceNames = item.services.map((s) => s.name).join(", ");
          }
          const slideDiv = document.createElement("div");
          slideDiv.classList.add("swiper-slide");
          slideDiv.innerHTML = `
            <div class="doctor-card">
              <h3 class="doctor-card-title">Həkim</h3>
              <div class="doctor-card-profile">
                <img src="${STATIC_URL}images/mini-profile-picture.png" alt="${
            docObj ? docObj.first_name : ""
          }" class="doctor-card-image" />
                <div class="doctor-card-info">
                  <h4 class="doctor-card-name">${
                    docObj ? docObj.first_name : ""
                  } ${docObj ? docObj.last_name : ""}</h4>
                  <div class="doctor-card-rating">
                    <span class="rating-value">${docObj?.rating || ""}</span>
                  </div>
                  <p class="doctor-card-specialty">${
                    docObj?.specialty || ""
                  }</p>
                </div>
              </div>
              <div class="doctor-card-details">
                <p><strong>Xidmət</strong></p>
                <p>${serviceNames}</p>
              </div>
              <div class="doctor-card-details">
                <p><strong>Rezervasiya tarixi</strong></p>
                <p>${item.date}</p>
              </div>
              <div class="doctor-card-details">
                <p><strong>Prosedur müddəti</strong></p>
                <p>${item.duration_minutes} dəqiqə</p>
              </div>
            </div>
          `;
          wrapper.appendChild(slideDiv);
        });
        mySwiper.update();
      }
    } catch (error) {
      console.error("showReservationHistory:", error);
    }
  }

  function renderEventsOnCalendar(reservations) {
    monthEvents = {};
    weekEvents = {};
    dayEvents = {};
    reservations.forEach((r) => {
      const dateKey = r.date;
      let displayName = r.full_name;
      if (r.user_name) {
        displayName = r.user_name;
      }
      const startTime = r.start_time.substring(0, 5);
      if (!monthEvents[dateKey]) {
        monthEvents[dateKey] = [];
      }
      monthEvents[dateKey].push({
        names: [displayName],
        reservation_id: r.id,
      });
      if (!weekEvents[dateKey]) {
        weekEvents[dateKey] = [];
      }
      weekEvents[dateKey].push({
        time: startTime,
        names: displayName,
        reservation_id: r.id,
      });
      if (!dayEvents[dateKey]) {
        dayEvents[dateKey] = [];
      }
      dayEvents[dateKey].push({
        time: startTime,
        names: displayName,
        reservation_id: r.id,
      });
    });
    renderView();
  }

  function renderDoctorCards(doctors, reservations) {
    const container = document.getElementById("doctorCardsContainer");
    if (!container) return;
    container.innerHTML = "";
    doctors.forEach((doc) => {
      const docRes = reservations.filter((r) => r.doctor === doc.id);
      if (docRes.length === 0) {
        const col = document.createElement("div");
        col.classList.add("col-lg-3", "col-md-4", "col-6");
        col.innerHTML = `
          <div class="card">
            <div class="card-header">
              <img src="${STATIC_URL}images/user-mini-pic.png" alt="Profile" class="profile-img" />
              <h4>${doc.first_name} ${doc.last_name}</h4>
            </div>
            <div class="card-body">
              <p class="date">Bu həkimə aid heç bir rezervasiya yoxdur</p>
            </div>
          </div>
        `;
        container.appendChild(col);
      } else {
        const col = document.createElement("div");
        col.classList.add("col-lg-3", "col-md-4", "col-6");
        col.innerHTML = `
          <div class="card">
            <div class="card-header">
              <img src="${STATIC_URL}images/user-mini-pic.png" alt="Profile" class="profile-img" />
              <h4>${doc.first_name} ${doc.last_name}</h4>
            </div>
          </div>
        `;
        docRes.forEach((res, index) => {
          const body = document.createElement("div");
          body.classList.add("card-body");
          body.innerHTML = `
            <p class="date">${res.date}</p>
            <p class="time">
              ${res.start_time}
              ${res.end_time ? " - " + res.end_time : ""}
            </p>
            <p class="name">${res.user_name || res.full_name}</p>
          `;
          body.addEventListener("click", () => {
            openUserInfoPopup(true, res.id);
          });
          const card = col.querySelector(".card");
          if (index !== 0) {
            card.appendChild(document.createElement("hr"));
          }
          card.appendChild(body);
        });
        container.appendChild(col);
      }
    });
  }

  function fillReservationPopup(reservation) {
    if (!reservation) return;
    const popupUserName = document.getElementById("popupUserName");
    let displayName = reservation.user_name || reservation.full_name;
    if (!displayName) displayName = "Qeydiyyatsız müştəri";
    popupUserName.textContent = displayName;
    const docObj = doctorsData.find((d) => d.id === reservation.doctor);
    const docNameEl = document.getElementById("popupDoctorName");
    if (docObj) {
      docNameEl.innerText = `${docObj.first_name} ${docObj.last_name}`;
      docNameEl.setAttribute("data-doctor-id", docObj.id);
    } else {
      docNameEl.innerText = "Seçilməyib";
      docNameEl.removeAttribute("data-doctor-id");
    }
    const srvNameEl = document.getElementById("popupServiceName");
    if (reservation.service_names && reservation.service_names.trim() !== "") {
      srvNameEl.innerText = reservation.service_names;
      if (reservation.services && reservation.services.length > 0) {
        const ids = reservation.services;
        srvNameEl.setAttribute("data-service-ids", ids.join(","));
        const popupServiceDropdownList = document.getElementById(
          "popupServiceDropdownList"
        );
        if (popupServiceDropdownList) {
          const checkboxes =
            popupServiceDropdownList.querySelectorAll(".dropdown-checkbox");
          checkboxes.forEach((chk) => {
            if (ids.includes(Number(chk.value))) {
              chk.checked = true;
            } else {
              chk.checked = false;
            }
          });
        }
      }
    } else {
      srvNameEl.innerText = "Seçilməyib";
      srvNameEl.removeAttribute("data-service-ids");
      const popupServiceDropdownList = document.getElementById(
        "popupServiceDropdownList"
      );
      if (popupServiceDropdownList) {
        const checkboxes =
          popupServiceDropdownList.querySelectorAll(".dropdown-checkbox");
        checkboxes.forEach((chk) => {
          chk.checked = false;
        });
      }
    }
    document.getElementById("popupDate").value = reservation.date;
    document.getElementById("popupStartTime").value = reservation.start_time;
    document.getElementById("popupEndTime").value = reservation.end_time || "";
  }

  async function fetchReservationById(reservationId) {
    try {
      const response = await fetch(`/api/reservations/${reservationId}/`);
      if (response.ok) {
        return await response.json();
      } else {
        console.error("fetchReservationById error", response.status);
      }
    } catch (err) {
      console.error("fetchReservationById:", err);
    }
    return null;
  }

  const calendarTable = document.getElementById("calendarTable");
  const presentMonth = document.getElementById("presentMonth");
  const todayButton = document.getElementById("todayButton");
  const prevArrow = document.querySelector(".prev-arrow");
  const nextArrow = document.querySelector(".next-arrow");
  const weekView = document.getElementById("weekView");
  const weekViewBody = document.getElementById("weekViewBody");
  const dayView = document.getElementById("dayView");
  const dayViewBody = document.getElementById("dayViewBody");

  const monthNames = [
    "Yanvar",
    "Fevral",
    "Mart",
    "Aprel",
    "May",
    "İyun",
    "İyul",
    "Avqust",
    "Sentyabr",
    "Oktyabr",
    "Noyabr",
    "Dekabr",
  ];
  const weekDayNames = ["B.E", "Ç.A", "Ç", "C.A", "C.", "Ş.", "B."];

  function getStartOfWeek(date) {
    const day = date.getDay();
    const diff = (day + 6) % 7;
    const start = new Date(date);
    start.setDate(date.getDate() - diff);
    start.setHours(0, 0, 0, 0);
    return start;
  }

  function formatWeekRange(startDate) {
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 6);
    const startMonth = monthNames[startDate.getMonth()];
    const endMonth = monthNames[endDate.getMonth()];
    const startDay = startDate.getDate();
    const endDay = endDate.getDate();
    const year = startDate.getFullYear();
    if (startMonth === endMonth) {
      return `${startDay} - ${endDay} ${startMonth} ${year}`;
    } else {
      return `${startDay} ${startMonth} - ${endDay} ${endMonth} ${year}`;
    }
  }

  function formatWeekDayHeader(date) {
    const dayIndex = date.getDay() === 0 ? 6 : date.getDay() - 1;
    const dayName = weekDayNames[dayIndex];
    return `${dayName} ${date.getDate()}/${date.getMonth() + 1}`;
  }

  function renderCalendar() {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();
    presentMonth.textContent = `${monthNames[month]} ${year}`;
    calendarTable.innerHTML = "";
    const table = document.createElement("table");
    const thead = document.createElement("thead");
    const tbody = document.createElement("tbody");
    const weekRow = document.createElement("tr");
    weekDayNames.forEach((day) => {
      const th = document.createElement("th");
      th.textContent = day;
      weekRow.appendChild(th);
    });
    thead.appendChild(weekRow);
    let dayCounter = 1;
    let nextMonthDay = 1;
    let startingDay = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;
    for (let i = 0; i < 6; i++) {
      const row = document.createElement("tr");
      for (let j = 0; j < 7; j++) {
        const cell = document.createElement("td");
        if (i === 0 && j < startingDay) {
          cell.textContent = daysInPrevMonth - (startingDay - j - 1);
          cell.classList.add("prev-month");
        } else if (dayCounter > daysInMonth) {
          cell.textContent = nextMonthDay;
          nextMonthDay++;
          cell.classList.add("next-month");
        } else {
          const fullDate = `${year}-${String(month + 1).padStart(
            2,
            "0"
          )}-${String(dayCounter).padStart(2, "0")}`;
          cell.textContent = dayCounter;
          if (monthEvents[fullDate]) {
            const eventsArray = monthEvents[fullDate];
            const count = eventsArray.length;
            const displayText =
              count === 1
                ? eventsArray[0].names[0].length > 9
                  ? eventsArray[0].names[0].substring(0, 7) + "..."
                  : eventsArray[0].names[0]
                : `${count} rezerv...`;

            const eventBox = document.createElement("div");
            eventBox.classList.add("month-event-box");
            eventBox.innerHTML = `
              <div class="name">${displayText}</div>
              <i class="fa-solid fa-users"></i>
            `;
            eventBox.addEventListener("click", (e) => {
              e.stopPropagation();
              openReservationListPopup();
              fillReservationListByDate(fullDate);
            });
            cell.appendChild(eventBox);
          }
          const today = new Date();
          if (
            dayCounter === today.getDate() &&
            month === today.getMonth() &&
            year === today.getFullYear()
          ) {
            cell.classList.add("today-color");
          }
          cell.addEventListener("click", () => {
            currentDate = new Date(year, month, dayCounter);
            if (currentView === "day") {
              renderDayView();
            } else if (currentView === "week") {
              renderWeekView();
            }
          });
          dayCounter++;
        }
        row.appendChild(cell);
      }
      tbody.appendChild(row);
    }
    table.appendChild(thead);
    table.appendChild(tbody);
    calendarTable.appendChild(table);
    weekView.classList.add("d-none");
    dayView.classList.add("d-none");
    calendarTable.classList.remove("d-none");
    attachEllipsisListeners();
  }

  function renderWeekView() {
    weekView.classList.remove("d-none");
    calendarTable.classList.add("d-none");
    dayView.classList.add("d-none");
    weekViewBody.innerHTML = "";
    const startOfWeekDate = getStartOfWeek(currentDate);
    presentMonth.textContent = formatWeekRange(startOfWeekDate);
    const datesInWeek = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeekDate);
      date.setDate(startOfWeekDate.getDate() + i);
      datesInWeek.push(date);
    }
    const weekViewHeader = weekView.querySelector("thead tr");
    if (weekViewHeader) {
      const headerCells = weekViewHeader.querySelectorAll("th");
      datesInWeek.forEach((date, index) => {
        const headerCell = headerCells[index + 1];
        if (headerCell) {
          headerCell.textContent = formatWeekDayHeader(date);
          const today = new Date();
          if (
            date.getDate() === today.getDate() &&
            date.getMonth() === today.getMonth() &&
            date.getFullYear() === today.getFullYear()
          ) {
            headerCell.classList.add("current-date");
          } else {
            headerCell.classList.remove("current-date");
          }
        }
      });
    }
    const currentHour = new Date().getHours();
    for (let hour = 0; hour < 24; hour++) {
      const row = document.createElement("tr");
      const timeCell = document.createElement("td");
      timeCell.textContent = `${String(hour).padStart(2, "0")}:00`;
      timeCell.classList.add("time-cell");
      if (hour === currentHour) {
        timeCell.classList.add("current-hour");
      }
      row.appendChild(timeCell);
      datesInWeek.forEach((date) => {
        const cell = document.createElement("td");
        const fullDate = `${date.getFullYear()}-${String(
          date.getMonth() + 1
        ).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
        const sameHourEvents = (weekEvents[fullDate] || []).filter((ev) => {
          return parseInt(ev.time.split(":")[0], 10) === hour;
        });
        if (sameHourEvents.length > 0) {
          const eventDiv = document.createElement("div");
          eventDiv.classList.add("event");
          const timeDiv = document.createElement("div");
          timeDiv.classList.add("event-time");
          timeDiv.textContent = `${String(hour).padStart(2, "0")}:00`;
          eventDiv.appendChild(timeDiv);
          const allNames = sameHourEvents.map((e) => e.names).join(", ");
          const nameDiv = document.createElement("div");
          nameDiv.classList.add("event-name");
          nameDiv.textContent = allNames;
          eventDiv.appendChild(nameDiv);
          eventDiv.addEventListener("click", (e) => {
            e.stopPropagation();
            openReservationListPopup();
            fillReservationListByDate(fullDate);
          });
          cell.appendChild(eventDiv);
        }
        row.appendChild(cell);
      });
      weekViewBody.appendChild(row);
    }
    attachEllipsisListeners();
  }

  function renderDayView() {
    dayView.classList.remove("d-none");
    calendarTable.classList.add("d-none");
    weekView.classList.add("d-none");
    dayViewBody.innerHTML = "";
    presentMonth.textContent = `${currentDate.getDate()} ${
      monthNames[currentDate.getMonth()]
    } ${currentDate.getFullYear()}`;
    const now = new Date();
    const currentHour = now.getHours();
    const fullDate = `${currentDate.getFullYear()}-${String(
      currentDate.getMonth() + 1
    ).padStart(2, "0")}-${String(currentDate.getDate()).padStart(2, "0")}`;
    for (let hour = 0; hour < 24; hour++) {
      const row = document.createElement("tr");
      const timeCell = document.createElement("td");
      timeCell.textContent = `${String(hour).padStart(2, "0")}:00`;
      timeCell.classList.add("time-cell");
      if (
        hour === currentHour &&
        currentDate.toDateString() === now.toDateString()
      ) {
        timeCell.classList.add("current-hour");
      }
      row.appendChild(timeCell);
      const eventCell = document.createElement("td");
      eventCell.classList.add("event-cell");
      const sameHourEvents = (dayEvents[fullDate] || []).filter((ev) => {
        return parseInt(ev.time.split(":")[0], 10) === hour;
      });
      if (sameHourEvents.length > 0) {
        const eventDiv = document.createElement("div");
        eventDiv.classList.add("event");
        const timeDiv = document.createElement("div");
        timeDiv.classList.add("event-time");
        timeDiv.textContent = `${String(hour).padStart(2, "0")}:00`;
        eventDiv.appendChild(timeDiv);
        const allNames = sameHourEvents.map((e) => e.names).join(", ");
        const nameElement = document.createElement("div");
        nameElement.classList.add("event-name");
        nameElement.textContent = allNames;
        eventDiv.appendChild(nameElement);
        eventDiv.addEventListener("click", (e) => {
          e.stopPropagation();
          openReservationListPopup();
          fillReservationListByDate(fullDate);
        });
        eventCell.appendChild(eventDiv);
      }
      row.appendChild(eventCell);
      dayViewBody.appendChild(row);
    }
    attachEllipsisListeners();
  }

  function renderView() {
    if (currentView === "month") {
      renderCalendar();
    } else if (currentView === "week") {
      renderWeekView();
    } else if (currentView === "day") {
      renderDayView();
    }
  }

  function changeMonth(offset) {
    currentDate.setMonth(currentDate.getMonth() + offset);
    renderCalendar();
  }
  function changeWeek(offset) {
    currentDate.setDate(currentDate.getDate() + 7 * offset);
    renderWeekView();
  }
  function changeDay(offset) {
    currentDate.setDate(currentDate.getDate() + offset);
    renderDayView();
  }
  function goToToday() {
    currentDate = new Date();
    renderView();
  }

  prevArrow.addEventListener("click", () => {
    if (currentView === "month") changeMonth(-1);
    else if (currentView === "week") changeWeek(-1);
    else if (currentView === "day") changeDay(-1);
  });
  nextArrow.addEventListener("click", () => {
    if (currentView === "month") changeMonth(1);
    else if (currentView === "week") changeWeek(1);
    else if (currentView === "day") changeDay(1);
  });
  todayButton.addEventListener("click", goToToday);

  dayViewButton.addEventListener("click", () => {
    if (currentView !== "day") {
      currentView = "day";
      renderDayView();
      document
        .querySelectorAll(".view-option")
        .forEach((el) => el.classList.remove("active"));
      dayViewButton.classList.add("active");
    }
  });
  weekViewButton.addEventListener("click", () => {
    if (currentView !== "week") {
      currentView = "week";
      renderWeekView();
      document
        .querySelectorAll(".view-option")
        .forEach((el) => el.classList.remove("active"));
      weekViewButton.classList.add("active");
    }
  });
  monthViewButton.addEventListener("click", () => {
    if (currentView !== "month") {
      currentView = "month";
      renderCalendar();
      document
        .querySelectorAll(".view-option")
        .forEach((el) => el.classList.remove("active"));
      monthViewButton.classList.add("active");
    }
  });

  renderCalendar();

  function formatDate(dateStr) {
    const dateObj = new Date(dateStr);
    return `${dateObj.getDate()} ${
      monthNames[dateObj.getMonth()]
    } ${dateObj.getFullYear()}`;
  }

  function loadEventsPageContent() {
    const eventsContainer = document.querySelector(".events");
    if (!eventsContainer) return;
    let eventsList = eventsContainer.querySelector(".events-list");
    if (!eventsList) {
      eventsList = document.createElement("div");
      eventsList.classList.add("events-list");
      eventsContainer.insertBefore(
        eventsList,
        eventsContainer.querySelector(".pagination-events")
      );
    }
    eventsList.innerHTML = "";
    let sortedReservations = reservationsData
      .slice()
      .sort((a, b) => b.id - a.id);
    const total = sortedReservations.length;
    eventTotalPages = Math.ceil(total / eventsPageSize);
    if (eventTotalPages < 1) eventTotalPages = 1;
    if (eventCurrentPage > eventTotalPages) eventCurrentPage = eventTotalPages;
    if (eventCurrentPage < 1) eventCurrentPage = 1;
    const startIndex = (eventCurrentPage - 1) * eventsPageSize;
    const pageEvents = sortedReservations.slice(
      startIndex,
      startIndex + eventsPageSize
    );
    pageEvents.forEach((res) => {
      const eventDiv = document.createElement("div");
      eventDiv.classList.add("event");
      eventDiv.dataset.reservationId = res.id;
      eventDiv.innerHTML = `
        <div class="event-details">
          <div class="d-flex justify-content-between align-items-center">
            <div>
              <p class="date">${formatDate(res.date)}</p>
              <p class="time">
                ${res.start_time.substring(0, 5)}
                ${res.end_time ? " - " + res.end_time.substring(0, 5) : ""}
              </p>
              <p class="name">${
                res.user_name || res.full_name || "Qeydiyyatsız"
              }</p>
            </div>
            <div class="ellipsis-relative">
              <i class="fa-solid fa-ellipsis-vertical"></i>
              <div class="ellipsis-drop-down">
                <button class="d-flex gap-2 view-btn">
                  <i class="fa-solid fa-eye"></i>View
                </button>
                <button class="d-flex gap-2 delete-btn">
                  <i class="fa-regular fa-trash-can"></i>Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      `;
      eventsList.appendChild(eventDiv);
    });
    updateEventsPagination();
    attachEllipsisListeners();
  }

  function updateEventsPagination() {
    const pageNumbersContainer = document.querySelector(
      ".pagination-buttons .page-numbers"
    );
    if (!pageNumbersContainer) return;
    pageNumbersContainer.innerHTML = "";
    let startPage = Math.max(1, eventCurrentPage - 1);
    let endPage = Math.min(eventTotalPages, eventCurrentPage + 1);
    if (eventCurrentPage <= 2) endPage = Math.min(3, eventTotalPages);
    else if (eventCurrentPage >= eventTotalPages - 1)
      startPage = Math.max(eventTotalPages - 2, 1);
    for (let i = startPage; i <= endPage; i++) {
      const pageButton = document.createElement("button");
      pageButton.textContent = i;
      if (i === eventCurrentPage) pageButton.classList.add("active");
      pageButton.addEventListener("click", () => {
        eventCurrentPage = i;
        loadEventsPageContent();
      });
      pageNumbersContainer.appendChild(pageButton);
    }
    const prevButton = document.querySelector(".prev-page");
    const nextButton = document.querySelector(".next-page");
    if (prevButton) prevButton.disabled = eventCurrentPage === 1;
    if (nextButton) nextButton.disabled = eventCurrentPage === eventTotalPages;
  }

  const eventsPrevButton = document.querySelector(".prev-page");
  const eventsNextButton = document.querySelector(".next-page");
  if (eventsPrevButton) {
    eventsPrevButton.addEventListener("click", () => {
      if (eventCurrentPage > 1) {
        eventCurrentPage--;
        loadEventsPageContent();
      }
    });
  }
  if (eventsNextButton) {
    eventsNextButton.addEventListener("click", () => {
      if (eventCurrentPage < eventTotalPages) {
        eventCurrentPage++;
        loadEventsPageContent();
      }
    });
  }

  function fillReservationListByDate(dateString) {
    reservationListMiddle.innerHTML = "";
    const sameDayReservations = reservationsData.filter(
      (r) => r.date === dateString
    );
    if (sameDayReservations.length === 0) {
      reservationListMiddle.innerHTML = `<p>Bu tarixdə rezervasiya yoxdur</p>`;
      return;
    }
    sameDayReservations.forEach((res, idx) => {
      const userName = res.user_name || res.full_name || "Qeydiyyatsız";
      const div = document.createElement("div");
      div.classList.add("reserved-user", "d-flex", "justify-content-between");
      div.innerHTML = `
        <div class="d-flex align-items-center">
          <div class="reserved-user-count">${idx + 1}.</div>
          <div class="reserved-user-img">
            <img src="${STATIC_URL}images/user-mini-pic.png" alt="" />
          </div>
          <div class="reserved-user-title">
            <div class="reserved-user-name">${userName}</div>
            <div class="reserved-user-from">${
              res.user ? "Tətbiq daxilindən" : "Qeydiyyatsız"
            }</div>
          </div>
        </div>
      `;
      div.addEventListener("click", () => {
        openUserInfoPopup(true, res.id);
      });
      reservationListMiddle.appendChild(div);
    });
  }

  function openReservationListPopup() {
    calendarReservationListPopup.style.display = "block";
    if (overlay) overlay.style.display = "block";
  }

  function openCalendarAddReservationPopupRegistered() {
    const unregisteredUserBlock = document.querySelector(".unregistered-user");
    const registeredUserBlock = document.querySelector(
      ".calendar-add-reservation-popup-custom-select-user"
    );
    if (unregisteredUserBlock) unregisteredUserBlock.style.display = "none";
    if (registeredUserBlock) registeredUserBlock.style.display = "block";
    calendarReservationMethodPopup.style.display = "none";
    calendarAddReservationPopup.style.display = "block";
    isRegisteredReservation = true;
  }

  function openCalendarAddReservationPopupUnregistered() {
    const unregisteredUserBlock = document.querySelector(".unregistered-user");
    const registeredUserBlock = document.querySelector(
      ".calendar-add-reservation-popup-custom-select-user"
    );
    if (unregisteredUserBlock) unregisteredUserBlock.style.display = "block";
    if (registeredUserBlock) registeredUserBlock.style.display = "none";
    calendarReservationMethodPopup.style.display = "none";
    calendarAddReservationPopup.style.display = "block";
    isRegisteredReservation = false;
  }

  function closeReservationPopup() {
    calendarAddReservationPopup.style.display = "none";
    if (overlay) overlay.style.display = "none";
    selectedEvent = null;
    const unregisteredUserBlock = document.querySelector(".unregistered-user");
    const registeredUserBlock = document.querySelector(
      ".calendar-add-reservation-popup-custom-select-user"
    );
    if (unregisteredUserBlock) unregisteredUserBlock.style.display = "none";
    if (registeredUserBlock) registeredUserBlock.style.display = "block";
    calendarReservationListPopup.style.display = "none";
  }

  function openUserInfoPopup(isView, reservationId) {
    calendarReservationUserInfoPopup.style.display = "block";
    if (overlay) overlay.style.display = "block";
    setInputsDisabledInUserInfoPopup(true);
    if (isView) {
      reservationActionButtons.style.display = "flex";
      reservationEditActionBtns.style.display = "none";
    } else {
      setInputsDisabledInUserInfoPopup(false);
      reservationActionButtons.style.display = "none";
      reservationEditActionBtns.style.display = "flex";
    }
    reservationDeleteWarningPopup.style.display = "none";
    calendarReservationUserInfoPopup.style.zIndex = "300";
    calendarReservationListPopup.style.display = "none";
    reservationHistoryViewBox.style.display = "none";
    reservationContent.style.display = "block";
    if (reservationId) {
      fetchReservationById(reservationId).then((res) => {
        if (res) {
          selectedEvent = res;
          fillReservationPopup(res);
        }
      });
    }
  }

  function setInputsDisabledInUserInfoPopup(disabled) {
    const inputs = calendarReservationUserInfoPopup.querySelectorAll(
      "input, select, textarea"
    );
    inputs.forEach((inp) => {
      inp.disabled = disabled;
    });
    const customSelects =
      calendarReservationUserInfoPopup.querySelectorAll(".custom-select");
    customSelects.forEach((cs) => {
      if (disabled) cs.classList.add("disabled-custom-select");
      else cs.classList.remove("disabled-custom-select");
    });
  }

  function handleEllipsisToggle(e) {
    e.stopPropagation();
    const dropDown = this.nextElementSibling;
    if (!dropDown) return;
    if (dropDown.style.display === "block") {
      dropDown.style.display = "none";
    } else {
      closeAllDropdowns();
      dropDown.style.display = "block";
    }
  }

  function closeAllDropdowns() {
    const allEllipsisDropdowns = document.querySelectorAll(
      ".ellipsis-drop-down"
    );
    allEllipsisDropdowns.forEach((dd) => {
      dd.style.display = "none";
    });
    const allCustom = document.querySelectorAll(
      ".custom-dropdown.open, .custom-select.open"
    );
    allCustom.forEach((c) => c.classList.remove("open"));
  }

  function attachEllipsisListeners() {
    const ellipsisIcons = document.querySelectorAll(".fa-ellipsis-vertical");
    ellipsisIcons.forEach((icon) => {
      icon.removeEventListener("click", handleEllipsisToggle);
      icon.addEventListener("click", handleEllipsisToggle);
    });
    const viewBtns = document.querySelectorAll(".ellipsis-drop-down .view-btn");
    viewBtns.forEach((btn) => {
      btn.onclick = (e) => {
        e.stopPropagation();
        const parentEvent = btn.closest(".event");
        if (!parentEvent) return;
        const resId = parentEvent.dataset.reservationId;
        if (resId) {
          openUserInfoPopup(true, Number(resId));
        }
        closeAllDropdowns();
      };
    });
    const deleteBtns = document.querySelectorAll(
      ".ellipsis-drop-down .delete-btn"
    );
    deleteBtns.forEach((btn) => {
      btn.onclick = (e) => {
        e.stopPropagation();
        const parentEvent = btn.closest(".event");
        if (!parentEvent) return;
        const resId = parentEvent.dataset.reservationId;
        if (resId) {
          selectedEvent = reservationsData.find((r) => r.id === Number(resId));
          if (selectedEvent) {
            reservationDeleteWarningPopup.style.display = "block";
            calendarReservationUserInfoPopup.style.zIndex = "100";
            if (overlay) overlay.style.display = "block";
          }
        }
        closeAllDropdowns();
      };
    });
  }

  document.addEventListener("click", (e) => {
    if (!e.target.closest(".ellipsis-relative")) {
      closeAllDropdowns();
    }
    if (e.target.closest(".calendar-reservation-list-popup .fa-x")) {
      calendarReservationListPopup.style.display = "none";
      if (overlay) overlay.style.display = "none";
    }
  });

  const mySwiper = new Swiper(".reservation-history-view", {
    slidesPerView: 1,
    spaceBetween: 10,
    pagination: {
      el: ".swiper-pagination",
      clickable: true,
    },
  });

  const calendarReservationMethodPopupCloseBtn =
    calendarReservationMethodPopup.querySelector(
      ".close-calendar-reservation-method-popup-btn i"
    );
  if (calendarReservationMethodPopupCloseBtn) {
    calendarReservationMethodPopupCloseBtn.addEventListener("click", () => {
      calendarReservationMethodPopup.style.display = "none";
      if (overlay) overlay.style.display = "none";
    });
  }
  const addEventButton = document.querySelector(".event-button-box button");
  addEventButton.addEventListener("click", () => {
    calendarReservationMethodPopup.style.display = "block";
    if (overlay) overlay.style.display = "block";
    closeAllDropdowns();
  });
  const calendarReservationMethodPopupRegisteredBtn = document.querySelector(
    ".calendar-reservation-method-popup-registered"
  );
  calendarReservationMethodPopupRegisteredBtn.addEventListener("click", () => {
    if (overlay) overlay.style.display = "block";
    openCalendarAddReservationPopupRegistered();
  });
  const calendarReservationMethodPopupUnregisteredBtn = document.querySelector(
    ".calendar-reservation-method-popup-unregistered"
  );
  calendarReservationMethodPopupUnregisteredBtn.addEventListener(
    "click",
    () => {
      if (overlay) overlay.style.display = "block";
      openCalendarAddReservationPopupUnregistered();
    }
  );
  const popupCloseIcon = calendarAddReservationPopup.querySelector(".fa-xmark");
  const popupCancelButton = calendarAddReservationPopup.querySelector(
    ".treatment-content-popup-close"
  );
  popupCloseIcon.addEventListener("click", closeReservationPopup);
  popupCancelButton.addEventListener("click", closeReservationPopup);
  const popupSaveButton = document.getElementById("reservationConfirmBtn");
  popupSaveButton.addEventListener("click", async () => {
    await createReservation();
    closeReservationPopup();
  });
  if (overlay) {
    overlay.addEventListener("click", (e) => {
      if (reservationDeleteWarningPopup.style.display === "block") {
        reservationDeleteWarningPopup.style.display = "none";
        calendarReservationUserInfoPopup.style.zIndex = "300";
      }
      if (
        calendarReservationUserInfoPopup.style.display === "block" &&
        reservationDeleteWarningPopup.style.display !== "block"
      ) {
        calendarReservationUserInfoPopup.style.display = "none";
        calendarReservationListPopup.style.display = "none";
      }
      if (calendarReservationMethodPopup.style.display === "block") {
        calendarReservationMethodPopup.style.display = "none";
      }
      if (calendarAddReservationPopup.style.display === "block") {
        closeReservationPopup();
      }
      if (calendarReservationListPopup.style.display === "block") {
        calendarReservationListPopup.style.display = "none";
      }
      overlay.style.display = "none";
      closeAllDropdowns();
    });
  }
  userInfoCloseIcon.addEventListener("click", () => {
    calendarReservationUserInfoPopup.style.display = "none";
    calendarReservationListPopup.style.display = "none";
    if (overlay) overlay.style.display = "none";
    reservationDeleteWarningPopup.style.display = "none";
    calendarReservationUserInfoPopup.style.zIndex = "300";
    setInputsDisabledInUserInfoPopup(true);
    reservationActionButtons.style.display = "flex";
    reservationEditActionBtns.style.display = "none";
  });
  const reservationDeleteBtn = calendarReservationUserInfoPopup.querySelector(
    ".reservation-delete"
  );
  reservationDeleteBtn.addEventListener("click", () => {
    reservationDeleteWarningPopup.style.display = "block";
    calendarReservationUserInfoPopup.style.zIndex = "100";
  });
  const reservationDeleteWarningPopupCloseIcon =
    reservationDeleteWarningPopup.querySelector(
      ".close-reservation-delete-warning-popup-btn i"
    );
  reservationDeleteWarningPopupCloseIcon.addEventListener("click", () => {
    reservationDeleteWarningPopup.style.display = "none";
    calendarReservationUserInfoPopup.style.display = "none";
    if (overlay) overlay.style.display = "none";
  });
  const reservationDeleteWarningPopupClose =
    reservationDeleteWarningPopup.querySelector(
      ".reservation-delete-warning-popup-close"
    );
  reservationDeleteWarningPopupClose.addEventListener("click", () => {
    reservationDeleteWarningPopup.style.display = "none";
    calendarReservationUserInfoPopup.style.display = "none";
    if (overlay) overlay.style.display = "none";
  });
  const reservationDeleteWarningPopupConfirm =
    reservationDeleteWarningPopup.querySelector("#popupDeleteConfirmBtn");
  reservationDeleteWarningPopupConfirm.addEventListener("click", () => {
    if (selectedEvent) {
      deleteReservation(selectedEvent.id);
    }
    reservationDeleteWarningPopup.style.display = "none";
    calendarReservationUserInfoPopup.style.display = "none";
    calendarReservationListPopup.style.display = "none";
    if (overlay) overlay.style.display = "none";
  });
  const reservationEditBtn =
    calendarReservationUserInfoPopup.querySelector(".reservation-edit");
  reservationEditBtn.addEventListener("click", () => {
    setInputsDisabledInUserInfoPopup(false);
    reservationActionButtons.style.display = "none";
    reservationEditActionBtns.style.display = "flex";
  });
  const reservationEditCloseBtn =
    calendarReservationUserInfoPopup.querySelector(".reservation-edit-close");
  reservationEditCloseBtn.addEventListener("click", () => {
    setInputsDisabledInUserInfoPopup(true);
    reservationActionButtons.style.display = "flex";
    reservationEditActionBtns.style.display = "none";
    calendarReservationListPopup.style.display = "none";
  });
  const reservationEditSaveBtn =
    calendarReservationUserInfoPopup.querySelector("#popupSaveBtn");
  reservationEditSaveBtn.addEventListener("click", () => {
    if (selectedEvent) {
      updateReservation(selectedEvent.id).then(() => {
        setInputsDisabledInUserInfoPopup(true);
        reservationActionButtons.style.display = "flex";
        reservationEditActionBtns.style.display = "none";
        calendarReservationListPopup.style.display = "none";
      });
    }
  });
  const reservationInfoBtn =
    calendarReservationUserInfoPopup.querySelector(".reservation-info");
  const reservationHistoryBtn = calendarReservationUserInfoPopup.querySelector(
    ".reservation-history"
  );
  reservationHistoryBtn.addEventListener("click", () => {
    reservationHistoryViewBox.style.display = "block";
    reservationContent.style.display = "none";
    if (selectedEvent && selectedEvent.user) {
      showReservationHistory(selectedEvent.user);
    } else {
      const wrapper = document.getElementById("userHistorySwiperWrapper");
      if (wrapper) {
        wrapper.innerHTML = `<p class="no-user-message">Müştəri qeydiyyatsızdır</p>`;
      }
    }
    mySwiper.update();
  });
  reservationInfoBtn.addEventListener("click", () => {
    reservationHistoryViewBox.style.display = "none";
    reservationContent.style.display = "block";
  });
  const calendarViewByDoctorBtn = document.querySelector(
    ".calendar-view-by-doctor"
  );
  const calendarViewByDateBtn = document.querySelector(
    ".calendar-view-by-date"
  );
  const eventContainer = document.querySelector(".event-container");
  const calendarContainer = document.querySelector(".calendar-container");
  const calendarByDoctorContainer = document.querySelector(
    ".calendar-by-doctor-container"
  );
  calendarViewByDoctorBtn.addEventListener("click", () => {
    eventContainer.style.display = "none";
    calendarContainer.style.display = "none";
    calendarByDoctorContainer.style.display = "block";
  });
  calendarViewByDateBtn.addEventListener("click", () => {
    eventContainer.style.display = "block";
    calendarContainer.style.display = "block";
    calendarByDoctorContainer.style.display = "none";
  });
  eventContainer.style.display = "block";
  calendarContainer.style.display = "block";
  calendarByDoctorContainer.style.display = "none";

  function initializeCustomDropdowns() {
    document
      .querySelectorAll(".custom-dropdown .dropdown-header")
      .forEach((header) => {
        header.addEventListener("click", function (e) {
          e.stopPropagation();
          if (this.parentElement.classList.contains("disabled-custom-select"))
            return;
          this.parentElement.classList.toggle("open");
        });
      });
    document
      .querySelectorAll(".custom-select .selected-option")
      .forEach((header) => {
        header.addEventListener("click", function (e) {
          e.stopPropagation();
          if (this.parentElement.classList.contains("disabled-custom-select"))
            return;
          this.parentElement.classList.toggle("open");
        });
      });
    document.querySelectorAll(".dropdown-search input").forEach((input) => {
      input.addEventListener("click", function (e) {
        e.stopPropagation();
      });
    });
  }
  initializeCustomDropdowns();

  loadInitialData();
});
