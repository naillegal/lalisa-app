document.addEventListener("DOMContentLoaded", function () {
  function getCSRFToken() {
    const csrfTokenMeta = document.querySelector('meta[name="csrf-token"]');
    if (csrfTokenMeta) {
      return csrfTokenMeta.getAttribute("content");
    } else {
      let cookieValue = null;
      if (document.cookie && document.cookie !== "") {
        const cookies = document.cookie.split(";");
        for (let i = 0; i < cookies.length; i++) {
          const cookie = cookies[i].trim();
          if (cookie.substring(0, 10) === "csrftoken=") {
            cookieValue = decodeURIComponent(cookie.substring(10));
            break;
          }
        }
      }
      return cookieValue;
    }
  }
  const csrftoken = getCSRFToken();

  const overlay = document.getElementById("overlay");
  const addModeratorPopup = document.querySelector(".add-moderator-popup");
  const moderatorStatusPopup = document.querySelector(
    ".moderator-status-popup"
  );

  const addModeratorButton = document.getElementById("addModeratorBtn");
  const editToggles = document.querySelectorAll(".moderator-edit-toggle");

  const activeButtons = document.querySelectorAll(
    ".moderator-table-active-btn"
  );
  const deactiveButtons = document.querySelectorAll(
    ".moderator-table-deactive-btn"
  );

  const closeIcons = document.querySelectorAll(".fa-xmark");
  const closeButtons = document.querySelectorAll(
    ".moderator-status-popup-close, .add-moderator-popup-close"
  );
  const confirmStatusButton = document.querySelector(
    ".moderator-status-popup-confirm"
  );

  const moderatorIdInput = document.getElementById("moderator-id");
  const fullNameInput = document.getElementById("full-name-input");
  const passwordInput = document.getElementById("password-input");
  const passwordAgainInput = document.getElementById("password-again-input");
  const emailInput = document.getElementById("email-input");
  const profileImageInput = document.getElementById("profile-image-input");
  const profilePreview = document.getElementById("profile-preview");

  const roleCheckboxes = [
    "can_view_statistics",
    "can_view_calendar",
    "can_view_users",
    "can_view_services",
    "can_view_notification",
    "can_view_treatment",
    "can_view_cashback",
    "can_view_pages",
    "can_view_discount_code",
    "can_view_doctors",
    "can_view_history",
    "can_view_moderator",
    "can_view_laser",
    "can_view_payment_acceptance",
    "can_view_doctor_payment",
    "can_view_excel",
  ].map((id) => document.getElementById(id));

  const confirmAddEditButton = document.querySelector(
    ".add-moderator-popup-confirm"
  );

  let currentStatusTd = null;
  let currentModeratorIdForStatus = null;

  function openPopup(popup) {
    popup.style.display = "block";
    overlay.style.display = "block";
  }

  function closeAllPopups() {
    addModeratorPopup.style.display = "none";
    moderatorStatusPopup.style.display = "none";
    overlay.style.display = "none";
  }

  if (addModeratorButton) {
    addModeratorButton.addEventListener("click", function () {
      moderatorIdInput.value = "";
      fullNameInput.value = "";
      passwordInput.value = "";
      passwordAgainInput.value = "";
      emailInput.value = "";
      profilePreview.src = STATIC_URL + "images/user-mini-pic.png";

      roleCheckboxes.forEach((checkbox) => {
        checkbox.checked = false;
      });

      openPopup(addModeratorPopup);
    });
  }

  editToggles.forEach(function (icon) {
    icon.addEventListener("click", async function () {
      const moderatorId = icon.getAttribute("data-id");
      if (!moderatorId) return;

      try {
        const response = await fetch(`/api/moderators/${moderatorId}/`);
        if (!response.ok) {
          alert("Moderator məlumatı tapılmadı");
          return;
        }
        const data = await response.json();

        moderatorIdInput.value = data.id || "";
        fullNameInput.value = data.full_name || "";
        emailInput.value = data.email || "";
        passwordInput.value = "";
        passwordAgainInput.value = "";

        if (data.image) {
          profilePreview.src = data.image;
        } else {
          profilePreview.src = STATIC_URL + "images/user-mini-pic.png";
        }

        roleCheckboxes.forEach((checkbox) => {
          checkbox.checked = !!data[checkbox.id];
        });

        openPopup(addModeratorPopup);
      } catch (err) {
        console.error(err);
        alert("Xəta baş verdi.");
      }
    });
  });

  activeButtons.forEach(function (btn) {
    btn.addEventListener("click", function () {
      currentStatusTd = btn.closest("td");
      currentModeratorIdForStatus = findModeratorIdByTd(currentStatusTd);
      openPopup(moderatorStatusPopup);
    });
  });

  deactiveButtons.forEach(function (btn) {
    btn.addEventListener("click", function () {
      currentStatusTd = btn.closest("td");
      currentModeratorIdForStatus = findModeratorIdByTd(currentStatusTd);
      openPopup(moderatorStatusPopup);
    });
  });

  function findModeratorIdByTd(td) {
    const tr = td.closest("tr");
    if (!tr) return null;
    const penIcon = tr.querySelector(".moderator-edit-toggle");
    if (!penIcon) return null;
    return penIcon.getAttribute("data-id");
  }

  if (confirmStatusButton) {
    confirmStatusButton.addEventListener("click", async function () {
      const activeRadio = document.getElementById("moderator-status-active");
      const deactiveRadio = document.getElementById(
        "moderator-status-deactive"
      );
      if (!currentStatusTd || !currentModeratorIdForStatus) return;

      let newStatus = null;
      if (activeRadio.checked) {
        newStatus = "active";
      } else if (deactiveRadio.checked) {
        newStatus = "inactive";
      } else {
        alert("Zəhmət olmasa bir seçim edin.");
        return;
      }

      try {
        const response = await fetch(
          `/api/moderators/${currentModeratorIdForStatus}/`,
          {
            method: "PATCH",
            headers: {
              "X-CSRFToken": csrftoken,
              Accept: "application/json",
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ status: newStatus }),
          }
        );
        if (!response.ok) {
          alert("Status yenilənə bilmədi.");
          return;
        }
        closeAllPopups();
        location.reload();
      } catch (error) {
        console.error(error);
        alert("Status yenilənərkən xəta baş verdi.");
      }
    });
  }

  closeIcons.forEach(function (icon) {
    icon.addEventListener("click", function () {
      closeAllPopups();
    });
  });

  closeButtons.forEach(function (btn) {
    btn.addEventListener("click", function () {
      closeAllPopups();
    });
  });

  if (overlay) {
    overlay.addEventListener("click", function () {
      closeAllPopups();
    });
  }

  const profileSections = document.querySelectorAll(
    ".add-moderator-popup .profile-section"
  );
  profileSections.forEach(function (section) {
    section.addEventListener("click", function () {
      profileImageInput.click();
    });
  });
  profileImageInput.addEventListener("change", function () {
    if (this.files && this.files[0]) {
      const reader = new FileReader();
      reader.onload = function (e) {
        profilePreview.src = e.target.result;
      };
      reader.readAsDataURL(this.files[0]);
    }
  });

  confirmAddEditButton.addEventListener("click", async function () {
    if (passwordInput.value !== passwordAgainInput.value) {
      alert("Parollar uyğun deyil!");
      return;
    }

    const modId = moderatorIdInput.value.trim();
    const isEditMode = !!modId;

    const formData = new FormData();
    formData.append("full_name", fullNameInput.value.trim());
    formData.append("email", emailInput.value.trim());
    if (passwordInput.value.trim()) {
      formData.append("password", passwordInput.value.trim());
    }
    if (profileImageInput.files[0]) {
      formData.append("image", profileImageInput.files[0]);
    }

    roleCheckboxes.forEach((checkbox) => {
      formData.append(checkbox.id, checkbox.checked ? "true" : "false");
    });

    let url = "/api/moderators/";
    let method = "POST";
    if (isEditMode) {
      url = `/api/moderators/${modId}/`;
      method = "PUT";
    }

    try {
      const response = await fetch(url, {
        method: method,
        headers: {
          "X-CSRFToken": csrftoken,
        },
        body: formData,
      });
      if (!response.ok) {
        alert("Məlumat saxlanarkən xəta baş verdi.");
        return;
      }
      closeAllPopups();
      location.reload();
    } catch (error) {
      console.error(error);
      alert("Xəta baş verdi.");
    }
  });
});
