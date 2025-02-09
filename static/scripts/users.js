let doctorsData = [];

fetch("/api/doctors/")
  .then((response) => {
    if (!response.ok) {
      throw new Error("Doktor məlumatları yüklənmədi");
    }
    return response.json();
  })
  .then((data) => {
    doctorsData = data;
    console.log("Doktor məlumatları yükləndi:", doctorsData);
  })
  .catch((error) => console.error("Failed to fetch doctors data:", error));

document.addEventListener("DOMContentLoaded", function () {
  const headerCheckbox = document.querySelector(
    'th .custom-checkbox input[type="checkbox"]'
  );
  const rowCheckboxes = document.querySelectorAll(
    'td .custom-checkbox input[type="checkbox"]'
  );

  headerCheckbox.addEventListener("change", function () {
    const isChecked = this.checked;
    rowCheckboxes.forEach((checkbox) => {
      checkbox.checked = isChecked;
      const checkmark = checkbox.nextElementSibling;
      if (isChecked) {
        checkmark.classList.add("checked");
      } else {
        checkmark.classList.remove("checked");
      }
    });
  });

  const togglePassword = document.querySelector(".toggle-password");
  const passwordInput = document.getElementById("password");

  togglePassword.addEventListener("click", function () {
    const isPasswordVisible = passwordInput.type === "text";
    passwordInput.type = isPasswordVisible ? "password" : "text";
    this.classList.toggle("fa-eye-slash", isPasswordVisible);
    this.classList.toggle("fa-eye", !isPasswordVisible);
  });

  const overlay = document.getElementById("overlay");

  function openPopup(popup) {
    if (popup) {
      popup.style.display = "block";
      overlay.style.display = "block";
    }
  }

  function closePopup(popup) {
    if (popup) {
      popup.style.display = "none";
      overlay.style.display = "none";
    }
  }

  overlay.addEventListener("click", function () {
    const popups = document.querySelectorAll(
      ".users-delete-popup, .users-activate-popup, .users-deactivate-popup, .users-add-or-edit-popup, .user-reservation-info-popup"
    );
    popups.forEach(function (popup) {
      popup.style.display = "none";
    });
    overlay.style.display = "none";
    currentDeleteUserId = null;
    selectedUserId = null;
  });

  const addUserButton = document.querySelector(".add-user button");
  const addEditPopup = document.querySelector(".users-add-or-edit-popup");
  let selectedUserId = null;

  addUserButton.addEventListener("click", function () {
    clearAddEditFormFields();
    selectedUserId = null;
    openPopup(addEditPopup);
  });

  const editIcons = document.querySelectorAll(".user-edit-toggle");
  editIcons.forEach(function (icon) {
    icon.addEventListener("click", function () {
      clearAddEditFormFields();
      selectedUserId = this.getAttribute("data-user-id");

      fetch(`/api/users/${selectedUserId}/`)
        .then((response) => {
          if (!response.ok) {
            throw new Error("İstifadəçi məlumatlarını əldə etmək alınmadı!");
          }
          return response.json();
        })
        .then((data) => {
          document.getElementById("first_name").value = data.first_name || "";
          document.getElementById("last_name").value = data.last_name || "";
          document.getElementById("email").value = data.email || "";
          document.getElementById("date_of_birth").value =
            data.date_of_birth || "";
          document.getElementById("gender").value = data.gender || "male";
          document.getElementById("phone").value = data.phone || "";
          document.getElementById("password").value = data.password || "";
          openPopup(addEditPopup);
        })
        .catch((error) => {
          console.error("İstifadəçi məlumatlarını əldə etməkdə xəta:", error);
          alert("İstifadəçi məlumatlarını əldə etmək alınmadı!");
        });
    });
  });

  const deleteIcons = document.querySelectorAll(".user-delete-toggle");
  const deletePopup = document.querySelector(".users-delete-popup");
  let currentDeleteUserId = null;

  deleteIcons.forEach(function (icon) {
    icon.addEventListener("click", function () {
      currentDeleteUserId = this.getAttribute("data-user-id");
      openPopup(deletePopup);
    });
  });

  const closeDeleteXMark = document.querySelector(
    ".close-users-delete-popup-btn i"
  );
  const closeDeleteButton = document.querySelector(".users-delete-popup-close");
  const confirmDeleteButton = document.querySelector(
    ".users-delete-popup-confirm"
  );

  if (closeDeleteXMark && deletePopup) {
    closeDeleteXMark.addEventListener("click", function () {
      closePopup(deletePopup);
      currentDeleteUserId = null;
    });
  }
  if (closeDeleteButton && deletePopup) {
    closeDeleteButton.addEventListener("click", function () {
      closePopup(deletePopup);
      currentDeleteUserId = null;
    });
  }
  if (confirmDeleteButton && deletePopup) {
    confirmDeleteButton.addEventListener("click", function () {
      if (currentDeleteUserId) {
        const csrfToken = getCookie("csrftoken");

        fetch(`/api/users/${currentDeleteUserId}/`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": csrfToken,
          },
        })
          .then((response) => {
            if (response.status === 204) {
              console.log(`İstifadəçi ID: ${currentDeleteUserId} silindi.`);
              const row = document
                .querySelector(
                  `.user-delete-toggle[data-user-id="${currentDeleteUserId}"]`
                )
                .closest("tr");
              if (row) {
                row.remove();
              }
              closePopup(deletePopup);
              currentDeleteUserId = null;
            } else {
              return response.json().then((data) => {
                console.error("Silmə xətası:", data);
                alert("İstifadəçi silinmədi! Xəta: " + JSON.stringify(data));
              });
            }
          })
          .catch((error) => {
            console.error("Server və ya şəbəkə xətası:", error);
            alert("İstifadəçi silmək alınmadı! Xəta: " + error);
          });
      }
    });
  }

  const statusSelect = document.getElementById("status-selection");
  const activatePopup = document.querySelector(".users-activate-popup");
  const deactivatePopup = document.querySelector(".users-deactivate-popup");

  statusSelect.addEventListener("change", function () {
    const selectedValue = this.value;
    if (selectedValue === "active") {
      openPopup(activatePopup);
    } else if (selectedValue === "inactive") {
      openPopup(deactivatePopup);
    }
    this.value = "";
  });

  const closeActivateXMark = document.querySelector(
    ".close-users-activate-popup-btn i"
  );
  const closeActivateButton = document.querySelector(
    ".users-activate-popup-close"
  );
  if (closeActivateXMark && activatePopup) {
    closeActivateXMark.addEventListener("click", function () {
      closePopup(activatePopup);
    });
  }
  if (closeActivateButton && activatePopup) {
    closeActivateButton.addEventListener("click", function () {
      closePopup(activatePopup);
    });
  }

  const closeDeactivateXMark = document.querySelector(
    ".close-users-deactivate-popup-btn i"
  );
  const closeDeactivateButton = document.querySelector(
    ".users-deactivate-popup-close"
  );
  if (closeDeactivateXMark && deactivatePopup) {
    closeDeactivateXMark.addEventListener("click", function () {
      closePopup(deactivatePopup);
    });
  }
  if (closeDeactivateButton && deactivatePopup) {
    closeDeactivateButton.addEventListener("click", function () {
      closePopup(deactivatePopup);
    });
  }

  const confirmActivateButton = document.querySelector(
    ".users-activate-popup-confirm"
  );
  if (confirmActivateButton && activatePopup) {
    confirmActivateButton.addEventListener("click", function () {
      const selectedIds = getSelectedUserIds();
      if (selectedIds.length === 0) {
        alert("Heç bir istifadəçi seçilməyib!");
        closePopup(activatePopup);
        return;
      }

      const csrfToken = getCookie("csrftoken");

      const requests = selectedIds.map((userId) => {
        return fetch(`/api/users/${userId}/`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": csrfToken,
          },
          body: JSON.stringify({ status: "active" }),
        });
      });

      Promise.all(requests)
        .then((responses) => {
          let allOk = true;
          let firstError = null;
          return Promise.all(
            responses.map((r) => {
              if (!r.ok) {
                allOk = false;
                return r.json().then((err) => {
                  if (!firstError) firstError = err;
                });
              }
              return r.json();
            })
          ).then(() => {
            if (allOk) {
              closePopup(activatePopup);
              location.reload();
            } else {
              console.error("Xəta:", firstError);
              alert(
                "Bəzi istifadəçiləri aktiv etmək mümkün olmadı: " +
                  JSON.stringify(firstError)
              );
            }
          });
        })
        .catch((err) => {
          console.error("Network xətası:", err);
        });
    });
  }

  const confirmDeactivateButton = document.querySelector(
    ".users-deactivate-popup-confirm"
  );
  if (confirmDeactivateButton && deactivatePopup) {
    confirmDeactivateButton.addEventListener("click", function () {
      const selectedIds = getSelectedUserIds();
      if (selectedIds.length === 0) {
        alert("Heç bir istifadəçi seçilməyib!");
        closePopup(deactivatePopup);
        return;
      }

      const csrfToken = getCookie("csrftoken");
      const requests = selectedIds.map((userId) => {
        return fetch(`/api/users/${userId}/`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": csrfToken,
          },
          body: JSON.stringify({ status: "inactive" }),
        });
      });

      Promise.all(requests)
        .then((responses) => {
          let allOk = true;
          let firstError = null;
          return Promise.all(
            responses.map((r) => {
              if (!r.ok) {
                allOk = false;
                return r.json().then((err) => {
                  if (!firstError) firstError = err;
                });
              }
              return r.json();
            })
          ).then(() => {
            if (allOk) {
              closePopup(deactivatePopup);
              location.reload();
            } else {
              console.error("Xəta:", firstError);
              alert(
                "Bəzi istifadəçiləri deaktiv etmək mümkün olmadı: " +
                  JSON.stringify(firstError)
              );
            }
          });
        })
        .catch((err) => {
          console.error("Network xətası:", err);
        });
    });
  }

  const closeAddEditXMark = document.querySelector(
    ".users-add-or-edit-popup .fa-xmark"
  );
  const closeAddEditButton = document.querySelector(
    ".users-add-or-edit-popup .treatment-content-popup-close"
  );
  if (closeAddEditXMark && addEditPopup) {
    closeAddEditXMark.addEventListener("click", function () {
      closePopup(addEditPopup);
      selectedUserId = null;
    });
  }
  if (closeAddEditButton && addEditPopup) {
    closeAddEditButton.addEventListener("click", function () {
      closePopup(addEditPopup);
      selectedUserId = null;
    });
  }

  const userInfoNames = document.querySelectorAll(".user-info-name");
  const reservationInfoPopup = document.querySelector(
    ".user-reservation-info-popup"
  );
  const reservationNameElement = document.getElementById("reservationUserName");
  const reservationImageElement = document.getElementById(
    "reservationUserImage"
  );

  userInfoNames.forEach(function (nameElement) {
    nameElement.addEventListener("click", function () {
      const userName = this.textContent.trim();
      reservationNameElement.textContent = userName;

      const userInfoDiv = this.closest(".user-info");
      if (userInfoDiv) {
        const userImage = userInfoDiv.querySelector("img");
        if (userImage && userImage.src) {
          reservationImageElement.src = userImage.src;
        } else {
          reservationImageElement.src = "/static/images/user-default.jpg";
        }
      } else {
        reservationImageElement.src = "/static/images/user-default.jpg";
      }

      openPopup(reservationInfoPopup);
      const userId = this.closest("tr")
        .querySelector("input.row-checkbox")
        .getAttribute("data-user-id");
      showReservationHistory(userId);
    });
  });

  const closeReservationXMark = document.querySelector(
    "#reservationPopupClose"
  );
  const closeReservationButton = document.querySelector(
    ".user-reservation-info-popup .user-reservation-close"
  );
  if (closeReservationXMark && reservationInfoPopup) {
    closeReservationXMark.addEventListener("click", function () {
      closePopup(reservationInfoPopup);
    });
  }
  if (closeReservationButton && reservationInfoPopup) {
    closeReservationButton.addEventListener("click", function () {
      closePopup(reservationInfoPopup);
    });
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
        wrapper.innerHTML = `<h6 style="text-align: center; padding: 20px;">İstifadəçinin rezervasiyası yoxdur</h6>`;
      } else {
        userReservations.forEach((item) => {
          const docObj = doctorsData.find((d) => d.id === item.doctor);
          const serviceNames = item.service_names || "";
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

  const mySwiper = new Swiper(".reservation-history-view", {
    slidesPerView: 1,
    spaceBetween: 10,
    pagination: {
      el: ".swiper-pagination",
      clickable: true,
    },
  });

  const saveButton = document.querySelector(".treatment-content-popup-confirm");
  if (saveButton) {
    saveButton.addEventListener("click", function () {
      const first_name = document.getElementById("first_name").value.trim();
      const last_name = document.getElementById("last_name").value.trim();
      const email = document.getElementById("email").value.trim();
      const date_of_birth = document.getElementById("date_of_birth").value;
      const gender = document.getElementById("gender").value;
      const phone = document.getElementById("phone").value.trim();
      const password = document.getElementById("password").value;

      const csrfToken = getCookie("csrftoken");

      if (!selectedUserId) {
        fetch("/api/users/", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": csrfToken,
          },
          body: JSON.stringify({
            first_name: first_name,
            last_name: last_name,
            email: email,
            date_of_birth: date_of_birth,
            gender: gender,
            phone: phone,
            password: password,
          }),
        })
          .then((response) => {
            if (!response.ok) {
              return response.json().then((data) => {
                console.error("Xəta baş verdi:", data);
                alert(
                  "İstifadəçi yaratmaq alınmadı! Xəta: " + JSON.stringify(data)
                );
              });
            }
            return response.json();
          })
          .then((data) => {
            if (data) {
              console.log("Yeni istifadəçi yaradıldı:", data);
              closePopup(addEditPopup);
              location.reload();
            }
          })
          .catch((error) => {
            console.error("Server və ya şəbəkə xətası:", error);
          });
      } else {
        fetch(`/api/users/${selectedUserId}/`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": csrfToken,
          },
          body: JSON.stringify({
            first_name: first_name,
            last_name: last_name,
            email: email,
            date_of_birth: date_of_birth,
            gender: gender,
            phone: phone,
            password: password,
          }),
        })
          .then((response) => {
            if (!response.ok) {
              return response.json().then((data) => {
                console.error("Update xətası:", data);
                alert("İstifadəçi yenilənmədi! Xəta: " + JSON.stringify(data));
              });
            }
            return response.json();
          })
          .then((data) => {
            if (data) {
              console.log("İstifadəçi yeniləndi:", data);
              closePopup(addEditPopup);
              location.reload();
            }
          })
          .catch((error) => {
            console.error("Server və ya şəbəkə xətası:", error);
          });
      }
    });
  }

  function getSelectedUserIds() {
    const selectedIds = [];
    document
      .querySelectorAll('td .custom-checkbox input[type="checkbox"]')
      .forEach((checkbox) => {
        if (checkbox.checked) {
          const userId = checkbox.getAttribute("data-user-id");
          if (userId) {
            selectedIds.push(userId);
          }
        }
      });
    return selectedIds;
  }

  function clearAddEditFormFields() {
    document.getElementById("first_name").value = "";
    document.getElementById("last_name").value = "";
    document.getElementById("email").value = "";
    document.getElementById("date_of_birth").value = "";
    document.getElementById("gender").value = "male";
    document.getElementById("phone").value = "";
    document.getElementById("password").value = "";
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
