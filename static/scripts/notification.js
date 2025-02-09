document.addEventListener("DOMContentLoaded", function () {
  const notificationMain = document.getElementById("notificationMain");
  const notificationSend = document.getElementById("notificationSend");

  const confirmSelectedUsersBtn = document.getElementById("confirmSelectedUsersBtn");
  const sendNotificationBtn = document.getElementById("sendNotificationBtn");
  const notificationMessageTextarea = document.getElementById("notificationMessage");

  const selectAllCheckbox = document.getElementById("selectAllCheckbox");
  const userRowCheckboxes = document.querySelectorAll(".user-row-checkbox");

  let selectedUserIds = [];

  if (selectAllCheckbox) {
    selectAllCheckbox.addEventListener("change", function () {
      const checked = this.checked;
      userRowCheckboxes.forEach((cb) => {
        cb.checked = checked;
      });
    });
  }

  if (confirmSelectedUsersBtn) {
    confirmSelectedUsersBtn.addEventListener("click", function () {
      selectedUserIds = [];
      userRowCheckboxes.forEach((cb) => {
        if (cb.checked) {
          const tr = cb.closest("tr");
          const userId = tr.getAttribute("data-user-id");
          selectedUserIds.push(userId);
        }
      });
      if (selectedUserIds.length === 0) {
        alert("Heç bir istifadəçi seçilməyib!");
        return;
      }
      notificationMain.style.display = "none";
      notificationSend.style.display = "block";
    });
  }

  if (sendNotificationBtn) {
    sendNotificationBtn.addEventListener("click", function () {
      const message = notificationMessageTextarea.value.trim();
      if (!message) {
        alert("Mesaj mətni boş ola bilməz!");
        return;
      }
      const url = "/api/notifications/";
      const payload = {
        user_ids: selectedUserIds,
        message: message,
      };
      fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": getCookie("csrftoken"),
        },
        body: JSON.stringify(payload),
      })
        .then((resp) => {
          if (!resp.ok) {
            throw new Error("Xəta baş verdi");
          }
          return resp.json();
        })
        .then((data) => {
          alert("Bildiriş(lər) göndərildi!");
          notificationSend.style.display = "none";
          notificationMain.style.display = "block";
          notificationMessageTextarea.value = "";
          userRowCheckboxes.forEach((cb) => (cb.checked = false));
          if (selectAllCheckbox) selectAllCheckbox.checked = false;
        })
        .catch((err) => {
          console.error("Error sending notifications:", err);
          alert("Bildiriş göndərilərkən xəta baş verdi!");
        });
    });
  }

  function updateFilters() {
    const gender = document.getElementById("filter-selection").value;
    const startDate = document.getElementById("start-date").value;
    const endDate = document.getElementById("end-date").value;
    const searchQuery = document.getElementById("notificationSearchInput").value.trim();

    const urlParams = new URLSearchParams(window.location.search);

    if (gender && (gender === "male" || gender === "female")) {
      urlParams.set("gender", gender);
    } else {
      urlParams.delete("gender");
    }

    if (startDate) {
      urlParams.set("start_date", startDate);
    } else {
      urlParams.delete("start_date");
    }

    if (endDate) {
      urlParams.set("end_date", endDate);
    } else {
      urlParams.delete("end_date");
    }

    if (searchQuery) {
      urlParams.set("search", searchQuery);
    } else {
      urlParams.delete("search");
    }

    window.location.search = urlParams.toString();
  }

  const filterSelection = document.getElementById("filter-selection");
  const startDateInput = document.getElementById("start-date");
  const endDateInput = document.getElementById("end-date");
  const searchInput = document.getElementById("notificationSearchInput");

  if (filterSelection) {
    filterSelection.addEventListener("change", updateFilters);
  }
  if (startDateInput) {
    startDateInput.addEventListener("change", updateFilters);
  }
  if (endDateInput) {
    endDateInput.addEventListener("change", updateFilters);
  }
  if (searchInput) {
    searchInput.addEventListener("change", updateFilters);
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
});
