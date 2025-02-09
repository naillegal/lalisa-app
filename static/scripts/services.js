function handleFileUpload(event) {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function (e) {
      const previewImage = document.getElementById("previewImage");
      previewImage.src = e.target.result;
      document.getElementById("uploadIcon").style.display = "none";
      document.getElementById("uploadedImage").style.display = "block";
    };
    reader.readAsDataURL(file);
  }
}

function updateSelectLabel(selectElement) {
  const selectedOption = selectElement.options[selectElement.selectedIndex];
  if (selectedOption) {
    selectElement.style.color = "#333";
  }
}

document.addEventListener("DOMContentLoaded", function () {
  const priceInput = document.getElementById("price-input");
  priceInput.addEventListener("input", function (event) {
    const input = event.target;
    if (input.value < 0) {
      input.value = "";
    }
  });

  const overlay = document.getElementById("overlay");

  const categoryPopup = document.querySelector(".category-popup");
  const servicePopup = document.querySelector(".service-popup");
  const insideCategoryServicesPopup = document.querySelector(
    ".inside-category-services-popup"
  );
  const categoryDeleteWarningPopup = document.querySelector(
    ".category-delete-warning-popup"
  );
  const serviceDeleteWarningPopup = document.querySelector(
    ".service-delete-warning-popup"
  );

  const addCategoryBtn = document.querySelector(".add-category");
  const addServiceBtn = document.querySelector(".add-service");

  const categoryBoxes = document.querySelectorAll(".categories-box");

  const categoryDeleteIcons = document.querySelectorAll(
    ".category-delete-toggle"
  );

  const categoryPopupCloseIcon = document.querySelector(
    ".close-category-popup-btn i"
  );
  const servicePopupCloseIcon = document.querySelector(
    ".close-service-popup-btn i"
  );
  const insideCategoryServicesCloseIcon = document.querySelector(
    ".close-inside-category-services-popup-btn i"
  );
  const categoryDeleteWarningCloseIcon = document.querySelector(
    ".close-category-delete-warning-popup-btn i"
  );
  const serviceDeleteWarningCloseIcon = document.querySelector(
    ".close-service-delete-warning-popup-btn i"
  );

  const categoryPopupExitBtn = document.querySelector(".category-popup-close");
  const servicePopupExitBtn = document.querySelector(".service-popup-close");
  const insideCategoryServicesExitBtn = document.querySelector(
    ".inside-category-service-popup-close"
  );
  const categoryDeleteWarningExitBtn = document.querySelector(
    ".category-delete-warning-popup-close"
  );
  const serviceDeleteWarningExitBtn = document.querySelector(
    ".service-delete-warning-popup-close"
  );

  const servicePopupTitle = document.querySelector(
    ".close-service-popup-btn h5"
  );
  const serviceNameInput = document.querySelector(".service-name input");
  const serviceCategorySelect = document.querySelector("#service-category");
  const serviceTimeInput = document.querySelector("#service-time");
  const servicePriceInput = document.querySelector("#price-input");

  const categoryPopupConfirmBtn = document.querySelector(
    ".category-popup-confirm"
  );
  const servicePopupConfirmBtn = document.querySelector(
    ".service-popup-confirm"
  );
  const categoryDeleteConfirmBtn = document.querySelector(
    ".category-delete-warning-popup-confirm"
  );
  const serviceDeleteConfirmBtn = document.querySelector(
    ".service-delete-warning-popup-confirm"
  );

  const insideCategoryTitle = document.querySelector(".inside-category-title");
  const insideCategoryServiceList = document.querySelector(
    ".inside-category-service-list"
  );

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

  function closeAllPopups() {
    categoryPopup.style.display = "none";
    servicePopup.style.display = "none";
    insideCategoryServicesPopup.style.display = "none";
    categoryDeleteWarningPopup.style.display = "none";
    serviceDeleteWarningPopup.style.display = "none";
    overlay.style.display = "none";
    insideCategoryServicesPopup.style.zIndex = "300";
  }

  addCategoryBtn.addEventListener("click", () => {
    openPopup(categoryPopup);
  });

  addServiceBtn.addEventListener("click", () => {
    servicePopupTitle.textContent = "Xidmət əlavə et";
    serviceNameInput.value = "";
    serviceCategorySelect.value = "";
    serviceCategorySelect.style.color = "";
    serviceTimeInput.value = "";
    servicePriceInput.value = "";
    servicePopup.removeAttribute("data-service-id");

    openPopup(servicePopup);
  });

  categoryBoxes.forEach((box) => {
    box.addEventListener("click", function (e) {
      if (e.target.classList.contains("category-delete-toggle")) {
        return;
      }
      const catId = this.getAttribute("data-category-id");
      if (!catId) return;

      fetch(`/api/categories/${catId}/`)
        .then((response) => {
          if (!response.ok) throw new Error("Kateqoriya məlumatı tapılmadı!");
          return response.json();
        })
        .then((data) => {
          insideCategoryTitle.textContent = data.name;
          return fetch(`/api/services/?category=${catId}`);
        })
        .then((response) => {
          if (!response.ok) throw new Error("Xidmətlər tapılmadı!");
          return response.json();
        })
        .then((serviceList) => {
          insideCategoryServiceList.innerHTML = "";
          serviceList.forEach((service) => {
            const serviceDiv = document.createElement("div");
            serviceDiv.classList.add("inside-category-service-content");

            serviceDiv.innerHTML = `
              <div class="d-flex align-items-center gap-2">
                <img src="${STATIC_URL}images/rounded-lalisa-icon.png" alt="${service.name}" />
                <p class="inside-category-service-title">${service.name}</p>
                <p class="inside-category-service-price">${service.price} AZN</p>
              </div>
              <div class="d-flex gap-2 justify-content-end">
                <div>
                  <i class="service-edit-toggle fa-regular fa-pen-to-square" data-service-id="${service.id}"></i>
                </div>
                <div>
                  <i class="service-delete-toggle fa-solid fa-trash" data-service-id="${service.id}"></i>
                </div>
              </div>
            `;

            const editIcon = serviceDiv.querySelector(".service-edit-toggle");
            editIcon.addEventListener("click", (evt) => {
              evt.stopPropagation();
              const serviceId = editIcon.getAttribute("data-service-id");
              if (serviceId) {
                fetch(`/api/services/${serviceId}/`)
                  .then((response) => response.json())
                  .then((data) => {
                    servicePopupTitle.textContent = "Xidmətdə düzəliş et";
                    serviceNameInput.value = data.name || "";
                    // Burada artıq data.category ID-dir:
                    serviceCategorySelect.value = data.category || "";
                    serviceCategorySelect.style.color = "#333";
                    serviceTimeInput.value = data.procedure_duration || "";
                    servicePriceInput.value = data.price || "";
                    servicePopup.setAttribute("data-service-id", serviceId);
                    openPopup(servicePopup);
                    insideCategoryServicesPopup.style.zIndex = "100";
                  })
                  .catch((error) => {
                    console.error("Xidməti əldə etmək alınmadı:", error);
                    alert("Xidməti əldə etmək alınmadı!");
                  });
              }
            });

            const deleteIcon = serviceDiv.querySelector(
              ".service-delete-toggle"
            );
            deleteIcon.addEventListener("click", (evt) => {
              evt.stopPropagation();
              const serviceId = deleteIcon.getAttribute("data-service-id");
              if (serviceId) {
                serviceDeleteWarningPopup.setAttribute(
                  "data-service-id",
                  serviceId
                );
                openPopup(serviceDeleteWarningPopup);
                insideCategoryServicesPopup.style.zIndex = "100";
              }
            });

            insideCategoryServiceList.appendChild(serviceDiv);
          });

          openPopup(insideCategoryServicesPopup);
          insideCategoryServicesPopup.style.zIndex = "300";
        })
        .catch((err) => {
          console.error(err);
          alert("Kateqoriya və ya xidmət məlumatlarını əldə etmək alınmadı!");
        });
    });
  });

  categoryDeleteIcons.forEach((icon) => {
    icon.addEventListener("click", () => {
      const categoryId = icon.getAttribute("data-category-id");
      if (categoryId) {
        categoryDeleteWarningPopup.setAttribute("data-category-id", categoryId);
        openPopup(categoryDeleteWarningPopup);
      }
    });
  });

  categoryPopupCloseIcon.addEventListener("click", () =>
    closePopup(categoryPopup)
  );
  servicePopupCloseIcon.addEventListener("click", () => {
    closePopup(servicePopup);
    insideCategoryServicesPopup.style.zIndex = "300";
    closePopup(insideCategoryServicesPopup);
  });
  insideCategoryServicesCloseIcon.addEventListener("click", () =>
    closePopup(insideCategoryServicesPopup)
  );
  categoryDeleteWarningCloseIcon.addEventListener("click", () =>
    closePopup(categoryDeleteWarningPopup)
  );
  serviceDeleteWarningCloseIcon.addEventListener("click", () => {
    closePopup(serviceDeleteWarningPopup);
    insideCategoryServicesPopup.style.zIndex = "300";
    closePopup(insideCategoryServicesPopup);
  });

  categoryPopupExitBtn.addEventListener("click", () =>
    closePopup(categoryPopup)
  );
  servicePopupExitBtn.addEventListener("click", () => {
    closePopup(servicePopup);
    insideCategoryServicesPopup.style.zIndex = "300";
    closePopup(insideCategoryServicesPopup);
  });
  insideCategoryServicesExitBtn.addEventListener("click", () =>
    closePopup(insideCategoryServicesPopup)
  );
  categoryDeleteWarningExitBtn.addEventListener("click", () =>
    closePopup(categoryDeleteWarningPopup)
  );
  serviceDeleteWarningExitBtn.addEventListener("click", () => {
    closePopup(serviceDeleteWarningPopup);
    insideCategoryServicesPopup.style.zIndex = "300";
    closePopup(insideCategoryServicesPopup);
  });

  overlay.addEventListener("click", closeAllPopups);

  categoryPopupConfirmBtn.addEventListener("click", (e) => {
    e.preventDefault();
    const categoryName = document
      .querySelector(".category-name input")
      .value.trim();
    const fileInput = document.getElementById("fileInput");
    const file = fileInput.files[0];

    if (!categoryName) {
      alert("Kateqoriya adını daxil edin!");
      return;
    }

    const formData = new FormData();
    formData.append("name", categoryName);
    if (file) {
      formData.append("image", file);
    }

    fetch("/api/categories/", {
      method: "POST",
      headers: {
        "X-CSRFToken": getCookie("csrftoken"),
      },
      body: formData,
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.id) {
          location.reload();
        } else {
          console.error("Kateqoriya yaratmaq alınmadı:", data);
          alert("Kateqoriya yaratmaq alınmadı!");
        }
      })
      .catch((error) => {
        console.error("Error creating category:", error);
        alert("Kateqoriya yaratmaq alınmadı!");
      });
  });

  servicePopupConfirmBtn.addEventListener("click", (e) => {
    e.preventDefault();
    const serviceName = serviceNameInput.value.trim();
    const serviceCategory = serviceCategorySelect.value;
    const serviceTime = serviceTimeInput.value.trim();
    const servicePrice = servicePriceInput.value.trim();

    if (!serviceName || !serviceCategory || !serviceTime || !servicePrice) {
      alert("Bütün sahələri doldurun!");
      return;
    }

    const payload = {
      name: serviceName,
      category: parseInt(serviceCategory, 10), 
      procedure_duration: serviceTime,
      price: parseFloat(servicePrice),
    };

    const serviceId = servicePopup.getAttribute("data-service-id");
    let url = "/api/services/";
    let method = "POST";

    if (serviceId) {
      url = `/api/services/${serviceId}/`;
      method = "PATCH";
    }

    fetch(url, {
      method: method,
      headers: {
        "Content-Type": "application/json",
        "X-CSRFToken": getCookie("csrftoken"),
      },
      body: JSON.stringify(payload),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.id) {
          location.reload();
        } else {
          console.error("Xidmət əlavə/yeniləmə alınmadı:", data);
          alert("Xidmət əlavə/yeniləmə alınmadı!");
        }
      })
      .catch((error) => {
        console.error("Xidmət əlavə/yeniləmə alınmadı:", error);
        alert("Xidmət əlavə/yeniləmə alınmadı!");
      });
  });

  categoryDeleteConfirmBtn.addEventListener("click", () => {
    const categoryId =
      categoryDeleteWarningPopup.getAttribute("data-category-id");
    if (categoryId) {
      fetch(`/api/categories/${categoryId}/`, {
        method: "DELETE",
        headers: {
          "X-CSRFToken": getCookie("csrftoken"),
        },
      })
        .then((response) => {
          if (response.status === 204) {
            location.reload();
          } else {
            return response.json().then((data) => {
              console.error("Kateqoriyanı silmək alınmadı:", data);
              alert("Kateqoriyanı silmək alınmadı!");
            });
          }
        })
        .catch((error) => {
          console.error("Kateqoriyanı silmək alınmadı:", error);
          alert("Kateqoriyanı silmək alınmadı!");
        });
    }
  });

  serviceDeleteConfirmBtn.addEventListener("click", () => {
    const serviceId = serviceDeleteWarningPopup.getAttribute("data-service-id");
    if (serviceId) {
      fetch(`/api/services/${serviceId}/`, {
        method: "DELETE",
        headers: {
          "X-CSRFToken": getCookie("csrftoken"),
        },
      })
        .then((response) => {
          if (response.status === 204) {
            location.reload();
          } else {
            return response.json().then((data) => {
              console.error("Xidməti silmək alınmadı:", data);
              alert("Xidməti silmək alınmadı!");
            });
          }
        })
        .catch((error) => {
          console.error("Xidməti silmək alınmadı:", error);
          alert("Xidməti silmək alınmadı!");
        });
    }
  });

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
