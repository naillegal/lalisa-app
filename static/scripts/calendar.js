document.addEventListener("DOMContentLoaded", () => {
  let currentView = "month";
  let currentDate = new Date();
  let popupMode = ""; // "add", "edit", "view"

  const API_BASE_URL = "/api/events/";

  const calendarTable = document.getElementById("calendarTable");
  const presentMonth = document.getElementById("presentMonth");
  const todayButton = document.getElementById("todayButton");
  const prevArrow = document.querySelector(".prev-arrow");
  const nextArrow = document.querySelector(".next-arrow");

  const weekView = document.getElementById("weekView");
  const weekViewBody = document.getElementById("weekViewBody");

  const dayView = document.getElementById("dayView");
  const dayViewBody = document.getElementById("dayViewBody");

  const dayViewButton = document.getElementById("dayViewButton");
  const weekViewButton = document.getElementById("weekViewButton");
  const monthViewButton = document.getElementById("monthViewButton");

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

  let allEvents = [];

  // Popup Elements
  const calendarEventPopup = document.querySelector(".calendar-event-popup");
  const popupHeader = calendarEventPopup.querySelector("h4");
  const popupCloseIcon = calendarEventPopup.querySelector(".fa-xmark");
  const popupCancelButton = calendarEventPopup.querySelector(
    ".treatment-content-popup-close"
  );
  const popupSaveButton = calendarEventPopup.querySelector(
    ".treatment-content-popup-confirm"
  );
  const overlay = document.getElementById("overlay");

  // Function to get CSRF token
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

  // Helper function to truncate text
  function truncateText(text, maxLength = 7) {
    if (text.length > maxLength) {
      return text.substring(0, maxLength) + "...";
    }
    return text;
  }

  // Fetch all events from the API
  async function fetchEvents() {
    try {
      const response = await fetch(API_BASE_URL);
      if (response.ok) {
        const data = await response.json();
        allEvents = data;
        renderEventsList();
        renderView();
      } else {
        console.error("Failed to fetch events");
      }
    } catch (error) {
      console.error("Error fetching events:", error);
    }
  }

  // Render Events List in the left side .events container
  function renderEventsList() {
    const eventsContainer = document.querySelector(".events");
    eventsContainer.innerHTML = "";
    allEvents.forEach((event) => {
      const eventElement = document.createElement("div");
      eventElement.classList.add("event");
      eventElement.setAttribute("data-id", event.id);

      let themeClass = "blue";
      if (event.theme === "green") themeClass = "green";
      else if (event.theme === "orange") themeClass = "orange";
      else if (event.theme === "purple") themeClass = "purple";
      else if (event.theme === "red") themeClass = "red";
      else themeClass = "blue";

      // Format times and dates as needed
      const dateText =
        event.start_date === event.end_date
          ? `${event.start_date}`
          : `${event.start_date} - ${event.end_date}`;
      const timeText = `${event.start_time} - ${event.end_time}`;

      // Truncate participants to 7 characters with ellipsis
      const truncatedParticipants = truncateText(event.participants);

      eventElement.innerHTML = `
        <div class="status-indicator ${themeClass}"></div>
        <div class="event-details">
          <div class="d-flex justify-content-between align-items-center">
            <div>
              <p class="date">${dateText}</p>
              <p class="time">${timeText}</p>
              <p class="name">${truncatedParticipants}</p>
            </div>
            <div class="ellipsis-relative">
              <i class="fa-solid fa-ellipsis-vertical"></i>
              <div class="ellipsis-drop-down">
                <button class="d-flex gap-2 view-button"><i class="fa-solid fa-eye"></i>View</button>
                <button class="d-flex gap-2 edit-button"><i class="fa-regular fa-pen-to-square"></i>Edit</button>
                <button class="d-flex gap-2 delete-button"><i class="fa-regular fa-trash-can"></i>Delete</button>
              </div>
              <div class="ellipsis-delete-popup" style="display:none;">
                <div class="ellipsis-popup-img">
                  <i class="fa-regular fa-trash-can"></i>
                </div>
                <div class="ellipsis-popup-middle">
                  <h5>Are you sure you want to delete this event?</h5>
                </div>
                <div class="ellipsis-popup-btns d-flex justify-content-center gap-5">
                  <button class="ellipsis-popup-close">Çıxış</button>
                  <button class="ellipsis-popup-confirm">Təsdiq et</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      `;
      eventsContainer.appendChild(eventElement);
    });

    attachEllipsisListeners();
  }

  // Open popup
  function openPopup(mode, eventData = null) {
    popupMode = mode;
    popupHeader.textContent =
      mode === "add"
        ? "Add New Event"
        : mode === "edit"
        ? "Edit Event"
        : "View Event";

    const inputs = calendarEventPopup.querySelectorAll("input, textarea");
    inputs.forEach((input) => {
      input.disabled = mode === "view";
    });

    // Toggle Save button visibility
    if (mode === "view") {
      popupSaveButton.style.display = "none";
    } else {
      popupSaveButton.style.display = "inline-block";
    }

    if ((mode === "edit" || mode === "view") && eventData) {
      calendarEventPopup.querySelector('input[name="participants"]').value =
        eventData.participants || "";
      calendarEventPopup.querySelector('input[name="start_date"]').value =
        eventData.start_date || "";
      calendarEventPopup.querySelector('input[name="end_date"]').value =
        eventData.end_date || "";
      calendarEventPopup.querySelector('input[name="start_time"]').value =
        eventData.start_time || "";
      calendarEventPopup.querySelector('input[name="end_time"]').value =
        eventData.end_time || "";
      calendarEventPopup.querySelector('textarea[name="description"]').value =
        eventData.description || "";

      // Uncheck all themes first
      const themeCheckboxes = calendarEventPopup.querySelectorAll(
        'input[name="theme"]'
      );
      themeCheckboxes.forEach((ch) => (ch.checked = false));
      // Check the one that matches eventData.theme
      if (eventData.theme) {
        const matchCheckbox = calendarEventPopup.querySelector(
          `input[name="theme"][value="${eventData.theme}"]`
        );
        if (matchCheckbox) matchCheckbox.checked = true;
      }

      if (mode === "edit") {
        calendarEventPopup.setAttribute("data-event-id", eventData.id);
      } else {
        calendarEventPopup.removeAttribute("data-event-id");
      }
    } else {
      // Clear form for "add" mode
      calendarEventPopup
        .querySelectorAll("input, textarea")
        .forEach((input) => {
          if (input.type !== "checkbox") {
            input.value = "";
          }
          if (input.type === "checkbox") {
            input.checked = false;
          }
        });
      calendarEventPopup.removeAttribute("data-event-id");
    }

    calendarEventPopup.style.display = "block";
    overlay.style.display = "block";
  }

  // Close popup
  function closePopup() {
    calendarEventPopup.style.display = "none";
    overlay.style.display = "none";
    popupMode = "";
  }

  // Open delete popup
  function openDeletePopup(eventId, deletePopup) {
    deletePopup.setAttribute("data-event-id", eventId);
    deletePopup.style.display = "block";
    overlay.style.display = "block";
  }

  // Close delete popup
  function closeDeletePopup(deletePopup) {
    deletePopup.style.display = "none";
    overlay.style.display = "none";
    deletePopup.removeAttribute("data-event-id");
  }

  // Close all dropdowns
  function closeAllDropdowns() {
    const allDropdowns = document.querySelectorAll(".ellipsis-drop-down");
    allDropdowns.forEach((dropdown) => {
      dropdown.style.display = "none";
    });
  }

  // Ellipsis toggle
  function handleEllipsisToggle(event) {
    event.stopPropagation();
    const dropdown = this.nextElementSibling;
    if (dropdown.style.display === "block") {
      dropdown.style.display = "none";
    } else {
      closeAllDropdowns();
      dropdown.style.display = "block";
    }
  }

  // Attach ellipsis listeners
  function attachEllipsisListeners() {
    const ellipsisIcons = document.querySelectorAll(".fa-ellipsis-vertical");
    ellipsisIcons.forEach((icon) => {
      icon.removeEventListener("click", handleEllipsisToggle);
      icon.addEventListener("click", handleEllipsisToggle);
    });

    // Attach click listeners to calendar events for view popup
    const calendarEvents = document.querySelectorAll(
      ".month-event-box, .event-cell .event"
    );
    calendarEvents.forEach((eventEl) => {
      eventEl.addEventListener("click", (e) => {
        e.stopPropagation(); // Prevent cell click
        const eventId = eventEl.getAttribute("data-id");
        fetch(`${API_BASE_URL}${eventId}/`)
          .then((response) => response.json())
          .then((eventData) => {
            openPopup("view", eventData);
          })
          .catch((error) => console.error("Error fetching event:", error));
      });
    });
  }

  // Add Event button
  const addEventButton = document.querySelector(".event-button-box button");
  addEventButton.addEventListener("click", () => {
    openPopup("add");
    closeAllDropdowns();
  });

  // Overlay click
  overlay.addEventListener("click", () => {
    closePopup();
    closeAllDropdowns();
    // Close delete popups if any
    document
      .querySelectorAll('.ellipsis-delete-popup[style*="display: block"]')
      .forEach((popup) => {
        closeDeletePopup(popup);
      });
  });

  // Popup close
  popupCloseIcon.addEventListener("click", closePopup);
  popupCancelButton.addEventListener("click", closePopup);

  // Delegate event listener for view, edit, delete in .events
  document.addEventListener("click", async (event) => {
    const viewBtn = event.target.closest(".view-button");
    const editBtn = event.target.closest(".edit-button");
    const deleteBtn = event.target.closest(".delete-button");
    const deletePopupCloseBtn = event.target.closest(".ellipsis-popup-close");
    const deletePopupConfirmBtn = event.target.closest(
      ".ellipsis-popup-confirm"
    );

    // View event
    if (viewBtn) {
      const eventElement = viewBtn.closest(".event");
      const eventId = eventElement.getAttribute("data-id");
      closeAllDropdowns();
      try {
        const response = await fetch(`${API_BASE_URL}${eventId}/`);
        const eventData = await response.json();
        openPopup("view", eventData);
      } catch (error) {
        console.error("Error fetching event:", error);
      }
    }

    // Edit event
    if (editBtn) {
      const eventElement = editBtn.closest(".event");
      const eventId = eventElement.getAttribute("data-id");
      closeAllDropdowns();
      try {
        const response = await fetch(`${API_BASE_URL}${eventId}/`);
        const eventData = await response.json();
        openPopup("edit", eventData);
      } catch (error) {
        console.error("Error fetching event:", error);
      }
    }

    // Delete event (open delete popup)
    if (deleteBtn) {
      const eventElement = deleteBtn.closest(".event");
      const eventId = eventElement.getAttribute("data-id");
      closeAllDropdowns();
      const deletePopup = deleteBtn
        .closest(".ellipsis-relative")
        .querySelector(".ellipsis-delete-popup");
      openDeletePopup(eventId, deletePopup);
    }

    // Delete popup close
    if (deletePopupCloseBtn) {
      const deletePopup = deletePopupCloseBtn.closest(".ellipsis-delete-popup");
      closeDeletePopup(deletePopup);
    }

    // Confirm delete
    if (deletePopupConfirmBtn) {
      const deletePopup = deletePopupConfirmBtn.closest(
        ".ellipsis-delete-popup"
      );
      const eventId = deletePopup.getAttribute("data-event-id");
      try {
        const response = await fetch(`${API_BASE_URL}${eventId}/`, {
          method: "DELETE",
          headers: {
            "X-CSRFToken": csrftoken,
          },
        });
        if (response.status === 204) {
          await fetchEvents();
          closeDeletePopup(deletePopup);
        } else {
          const errorData = await response.json();
          alert("Failed to delete event: " + JSON.stringify(errorData));
          console.error("Failed to delete event", response);
        }
      } catch (error) {
        console.error("Error deleting event:", error);
      }
    }
  });

  // Save event (Add/Edit)
  popupSaveButton.addEventListener("click", async () => {
    const participants = calendarEventPopup.querySelector(
      'input[name="participants"]'
    ).value;
    const start_date = calendarEventPopup.querySelector(
      'input[name="start_date"]'
    ).value;
    const end_date = calendarEventPopup.querySelector(
      'input[name="end_date"]'
    ).value;
    const start_time = calendarEventPopup.querySelector(
      'input[name="start_time"]'
    ).value;
    const end_time = calendarEventPopup.querySelector(
      'input[name="end_time"]'
    ).value;
    const description = calendarEventPopup.querySelector(
      'textarea[name="description"]'
    ).value;

    // Handle theme
    const themeCheckboxes = calendarEventPopup.querySelectorAll(
      'input[name="theme"]'
    );
    let theme = "";
    themeCheckboxes.forEach((checkbox) => {
      if (checkbox.checked) {
        theme = checkbox.value;
      }
    });

    const eventData = {
      participants,
      start_date,
      end_date,
      start_time,
      end_time,
      theme,
      description,
    };

    try {
      let response;
      if (popupMode === "add") {
        response = await fetch(API_BASE_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": csrftoken,
          },
          body: JSON.stringify(eventData),
        });
      } else if (popupMode === "edit") {
        const eventId = calendarEventPopup.getAttribute("data-event-id");
        response = await fetch(`${API_BASE_URL}${eventId}/`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": csrftoken,
          },
          body: JSON.stringify(eventData),
        });
      }

      if (response.ok) {
        await fetchEvents();
        closePopup();
      } else {
        const errorData = await response.json();
        alert("Failed to save event: " + JSON.stringify(errorData));
        console.error("Failed to save event", response);
      }
    } catch (error) {
      console.error("Error saving event:", error);
    }
  });

  // Utility Functions
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
    const dateStr = `${dayName} ${date.getDate()}/${date.getMonth() + 1}`;
    return dateStr;
  }

  // Render Calendar (Month View)
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

          const eventsForDay = allEvents.filter((event) => {
            const eventStart = new Date(event.start_date);
            const eventEnd = new Date(event.end_date);
            const current = new Date(fullDate);
            // Normalize times to midnight to compare dates only
            eventStart.setHours(0, 0, 0, 0);
            eventEnd.setHours(0, 0, 0, 0);
            current.setHours(0, 0, 0, 0);
            return eventStart <= current && eventEnd >= current;
          });

          if (eventsForDay.length > 0) {
            eventsForDay.forEach((event) => {
              const eventBox = document.createElement("div");
              eventBox.classList.add("month-event-box");
              eventBox.setAttribute("data-id", event.id);

              // Split participants and truncate the first participant's name
              const namesArray = event.participants
                .split(",")
                .map((name) => name.trim());
              let displayName = namesArray[0];
              if (namesArray.length > 1) {
                const firstName = namesArray[0].split(" ")[0];
                displayName = truncateText(firstName);
              } else {
                displayName = truncateText(displayName);
              }

              eventBox.innerHTML = `<div class="name">${displayName}</div><i class="fa-solid fa-users"></i>`;
              cell.appendChild(eventBox);

              // Attach click listener to calendar event
              eventBox.addEventListener("click", (e) => {
                e.stopPropagation(); // Prevent cell click
                const eventId = eventBox.getAttribute("data-id");
                fetch(`${API_BASE_URL}${eventId}/`)
                  .then((response) => response.json())
                  .then((eventData) => {
                    openPopup("view", eventData);
                  })
                  .catch((error) =>
                    console.error("Error fetching event:", error)
                  );
              });
            });
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
  }

  // Render Week View
  function renderWeekView() {
    weekView.classList.remove("d-none");
    calendarTable.classList.add("d-none");
    dayView.classList.add("d-none");

    weekViewBody.innerHTML = "";

    const startOfWeek = getStartOfWeek(currentDate);
    presentMonth.textContent = formatWeekRange(startOfWeek);

    const datesInWeek = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      datesInWeek.push(date);
    }

    const weekViewHeader = weekView.querySelector("thead tr");
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

        const eventsForDate = allEvents.filter((event) => {
          const eventStart = new Date(event.start_date);
          const eventEnd = new Date(event.end_date);
          const current = new Date(fullDate);
          // Normalize times to midnight to compare dates only
          eventStart.setHours(0, 0, 0, 0);
          eventEnd.setHours(0, 0, 0, 0);
          current.setHours(0, 0, 0, 0);
          return eventStart <= current && eventEnd >= current;
        });

        eventsForDate.forEach((event) => {
          const eventStartTime = new Date(
            `${event.start_date}T${event.start_time}`
          );
          const eventHour = eventStartTime.getHours();
          if (eventHour === hour) {
            const eventDiv = document.createElement("div");
            eventDiv.classList.add("event");
            eventDiv.setAttribute("data-id", event.id);

            const timeDiv = document.createElement("div");
            timeDiv.classList.add("event-time");
            timeDiv.textContent = event.start_time;
            eventDiv.appendChild(timeDiv);

            // Truncate participants to 7 characters with ellipsis
            const truncatedParticipants = truncateText(event.participants);
            const nameDiv = document.createElement("div");
            nameDiv.classList.add("event-name");
            nameDiv.textContent = truncatedParticipants;
            eventDiv.appendChild(nameDiv);

            // Attach click listener to calendar event
            eventDiv.addEventListener("click", (e) => {
              e.stopPropagation(); // Prevent cell click
              const eventId = eventDiv.getAttribute("data-id");
              fetch(`${API_BASE_URL}${eventId}/`)
                .then((response) => response.json())
                .then((eventData) => {
                  openPopup("view", eventData);
                })
                .catch((error) =>
                  console.error("Error fetching event:", error)
                );
            });

            cell.appendChild(eventDiv);
          }
        });

        row.appendChild(cell);
      });

      weekViewBody.appendChild(row);
    }
  }

  // Render Day View
  function renderDayView() {
    dayViewBody.innerHTML = "";

    presentMonth.textContent = `${currentDate.getDate()} ${
      monthNames[currentDate.getMonth()]
    } ${currentDate.getFullYear()}`;

    const now = new Date();
    const currentHour = now.getHours();

    const fullDate = `${currentDate.getFullYear()}-${String(
      currentDate.getMonth() + 1
    ).padStart(2, "0")}-${String(currentDate.getDate()).padStart(2, "0")}`;
    const eventsForDay = allEvents.filter((event) => {
      const eventStart = new Date(event.start_date);
      const eventEnd = new Date(event.end_date);
      const current = new Date(fullDate);
      // Normalize times to midnight to compare dates only
      eventStart.setHours(0, 0, 0, 0);
      eventEnd.setHours(0, 0, 0, 0);
      current.setHours(0, 0, 0, 0);
      return eventStart <= current && eventEnd >= current;
    });

    for (let hour = 0; hour < 24; hour++) {
      const row = document.createElement("tr");

      const timeCell = document.createElement("td");
      timeCell.textContent = `${String(hour).padStart(2, "0")}:00`;
      timeCell.classList.add("time-cell");
      if (hour === currentHour) {
        timeCell.classList.add("current-hour");
      }
      row.appendChild(timeCell);

      const eventCell = document.createElement("td");
      eventCell.classList.add("event-cell");

      eventsForDay.forEach((event) => {
        const eventStartTime = new Date(
          `${event.start_date}T${event.start_time}`
        );
        const eventHour = eventStartTime.getHours();
        if (eventHour === hour) {
          const eventDiv = document.createElement("div");
          eventDiv.classList.add("event");
          eventDiv.setAttribute("data-id", event.id);

          const timeDiv = document.createElement("div");
          timeDiv.classList.add("event-time");
          timeDiv.textContent = event.start_time;
          eventDiv.appendChild(timeDiv);

          const nameElement = document.createElement("div");
          nameElement.classList.add("event-name");
          nameElement.textContent = event.participants;
          eventDiv.appendChild(nameElement);

          // Attach click listener to calendar event
          eventDiv.addEventListener("click", (e) => {
            e.stopPropagation(); // Prevent cell click
            const eventId = eventDiv.getAttribute("data-id");
            fetch(`${API_BASE_URL}${eventId}/`)
              .then((response) => response.json())
              .then((eventData) => {
                openPopup("view", eventData);
              })
              .catch((error) => console.error("Error fetching event:", error));
          });

          eventCell.appendChild(eventDiv);
        }
      });

      row.appendChild(eventCell);
      dayViewBody.appendChild(row);
    }
  }

  // Change Month/Week/Day
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

  // Go to Today
  function goToToday() {
    currentDate = new Date();
    renderView();
  }

  // Render Current View
  function renderView() {
    if (currentView === "month") {
      renderCalendar();
    } else if (currentView === "week") {
      renderWeekView();
    } else if (currentView === "day") {
      renderDayView();
    }
  }

  // Navigation
  prevArrow.addEventListener("click", () => {
    if (currentView === "month") {
      changeMonth(-1);
    } else if (currentView === "week") {
      changeWeek(-1);
    } else if (currentView === "day") {
      changeDay(-1);
    }
  });

  nextArrow.addEventListener("click", () => {
    if (currentView === "month") {
      changeMonth(1);
    } else if (currentView === "week") {
      changeWeek(1);
    } else if (currentView === "day") {
      changeDay(1);
    }
  });

  todayButton.addEventListener("click", () => {
    goToToday();
  });

  dayViewButton.addEventListener("click", () => {
    if (currentView !== "day") {
      currentView = "day";
      renderDayView();
      document
        .querySelectorAll(".view-option")
        .forEach((el) => el.classList.remove("active"));
      dayViewButton.classList.add("active");
      weekView.classList.add("d-none");
      calendarTable.classList.add("d-none");
      dayView.classList.remove("d-none");
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
      calendarTable.classList.add("d-none");
      dayView.classList.add("d-none");
      weekView.classList.remove("d-none");
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
      weekView.classList.add("d-none");
      dayView.classList.add("d-none");
      calendarTable.classList.remove("d-none");
    }
  });

  // Initial fetch of events on load
  fetchEvents();
});
