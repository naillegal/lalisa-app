document.addEventListener("DOMContentLoaded", () => {

  function getCSRFToken() {
    const csrfTokenMeta = document.querySelector('meta[name="csrf-token"]');
    if (csrfTokenMeta) {
      return csrfTokenMeta.getAttribute('content');
    } else {
      let cookieValue = null;
      if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
          const cookie = cookies[i].trim();
          if (cookie.substring(0, 10) === ('csrftoken=')) {
            cookieValue = decodeURIComponent(cookie.substring(10));
            break;
          }
        }
      }
      return cookieValue;
    }
  }

  const csrftoken = getCSRFToken();


  const setupCustomDropdown = (customDropdown) => {
    if (!customDropdown) return; 

    const dropdownHeader = customDropdown.querySelector(".dropdown-header");
    const dropdownMenu = customDropdown.querySelector(".dropdown-menu");
    const dropdownSearch = dropdownMenu.querySelector(".dropdown-search input");
    const dropdownItems = dropdownMenu.querySelectorAll(".dropdown-item");
    const selectedOption = dropdownHeader.querySelector("span");

    dropdownHeader.addEventListener("click", (e) => {
      e.stopPropagation(); 
      customDropdown.classList.toggle("open");
      dropdownSearch.value = "";
      dropdownItems.forEach((item) => {
        item.style.display = "block";
      });
      dropdownSearch.focus();
    });

    document.addEventListener("click", (e) => {
      if (!customDropdown.contains(e.target)) {
        customDropdown.classList.remove("open");
      }
    });

    dropdownSearch.addEventListener("input", (e) => {
      const query = e.target.value.toLowerCase();
      dropdownItems.forEach((item) => {
        const text = item.textContent.toLowerCase();
        item.style.display = text.includes(query) ? "block" : "none";
      });
    });

    dropdownItems.forEach((item) => {
      item.addEventListener("click", () => {
        selectedOption.textContent = item.textContent;
        customDropdown.dataset.selectedServiceId = item.dataset.serviceId;
        customDropdown.classList.remove("open");
      });
    });
  };

  const discountServiceDropdown = document.getElementById("discountServiceDropdown");
  const mainServiceDropdown = document.getElementById("mainServiceDropdown");

  setupCustomDropdown(discountServiceDropdown);
  setupCustomDropdown(mainServiceDropdown);


  const uploadIcons = document.querySelectorAll(".upload-category-icon");
  uploadIcons.forEach((uploadIconContainer) => {
    const fileInput = uploadIconContainer.querySelector("input[type='file']");
    const uploadIcon = uploadIconContainer.querySelector(".upload-icon");
    const uploadedImageContainer = uploadIconContainer.querySelector(".uploaded-image");
    const previewImage = uploadIconContainer.querySelector("img[id^='previewImage']");

    if (!fileInput || !uploadIcon || !uploadedImageContainer || !previewImage) return;

    uploadIconContainer.addEventListener("click", () => {
      fileInput.click();
    });

    fileInput.addEventListener("change", (event) => {
      const file = event.target.files[0];
      if (file && file.type === "image/png") {
        const reader = new FileReader();
        reader.onload = function (e) {
          previewImage.src = e.target.result;
          uploadedImageContainer.style.display = "block";
          uploadIcon.style.display = "none";
        };
        reader.readAsDataURL(file);
      } else {
        alert("Zəhmət olmasa PNG formatında bir şəkil seçin.");
      }
    });
  });


  const bannerButtons = document.querySelectorAll(".banners .button button");
  const pagesUpside = document.querySelector(".pages-upside");
  const bannersDiv = document.querySelector(".banners");
  const discountBannerDetail = document.querySelector(".discount-banner-detail");
  const mainBannerDetail = document.querySelector(".main-banner-detail");
  const overlay = document.querySelector("#overlay"); 

  bannerButtons.forEach((button) => {
    button.addEventListener("click", () => {
      if (pagesUpside) pagesUpside.style.display = "none";
      if (bannersDiv) bannersDiv.style.display = "none";
      if (button.classList.contains("open-discount-banner-detail")) {
        if (discountBannerDetail) discountBannerDetail.style.display = "block";
      } else if (button.classList.contains("open-main-banner-detail")) {
        if (mainBannerDetail) mainBannerDetail.style.display = "block";
      }
    });
  });


  const deleteButtons = document.querySelectorAll(".pages-delete-toggle");

  deleteButtons.forEach((button) => {
    button.addEventListener("click", (e) => {
      const row = e.target.closest("tr");
      const bannerId = button.dataset.id;
      const bannerType = button.dataset.type;

      if (!bannerId || !bannerType) {
        alert("Silinəcək banner tapılmadı.");
        return;
      }

      const popup = button.closest(".pages-table").parentElement.querySelector(".pages-delete-popup");
      if (!popup) {
        alert("Silinəcək banner tapılmadı.");
        return;
      }

      const confirmBtn = popup.querySelector(".pages-delete-popup-confirm");
      if (!confirmBtn) return;

      confirmBtn.dataset.id = bannerId;
      confirmBtn.dataset.type = bannerType;

      if (popup) popup.style.display = "block";
      if (overlay) overlay.style.display = "block";
    });
  });

  const closeButtons = document.querySelectorAll(".pages-delete-popup-close");
  closeButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const popups = document.querySelectorAll(".pages-delete-popup");
      popups.forEach((popup) => {
        popup.style.display = "none";
      });
      if (overlay) overlay.style.display = "none";
    });
  });

  const confirmButtons = document.querySelectorAll(".pages-delete-popup-confirm");
  confirmButtons.forEach((btn) => {
    btn.addEventListener("click", async () => {
      const bannerId = btn.dataset.id;
      const bannerType = btn.dataset.type;

      if (!bannerId || !bannerType) {
        alert("Silinəcək banner tapılmadı.");
        return;
      }

      let url = "";
      if (bannerType === "discount") {
        url = `/api/discount-banners/${bannerId}/`;
      } else if (bannerType === "main") {
        url = `/api/main-banners/${bannerId}/`;
      } else {
        alert("Bilinməyən banner tipi.");
        return;
      }

      try {
        const response = await fetch(url, {
          method: "DELETE",
          headers: {
            "X-CSRFToken": csrftoken,
            "X-Requested-With": "XMLHttpRequest",
          },
        });
        if (response.ok) {
          const row = document.querySelector(`.pages-delete-toggle[data-id="${bannerId}"]`).closest("tr");
          if (row) row.remove();

          const popup = btn.closest(".pages-delete-popup");
          if (popup) popup.style.display = "none";
          if (overlay) overlay.style.display = "none";
        } else if (response.status === 404) {
          alert("Silinəcək banner tapılmadı.");
        } else {
          const errData = await response.json();
          if (errData.detail) {
            alert(errData.detail);
          } else {
            alert("Xəta baş verdi. Silmək mümkün olmadı.");
          }
        }
      } catch (error) {
        alert("Xəta baş verdi. Silmək mümkün olmadı.");
        console.error(error);
      }
    });
  });

  if (overlay) {
    overlay.addEventListener("click", () => {
      const popups = document.querySelectorAll(".pages-delete-popup");
      popups.forEach((popup) => {
        popup.style.display = "none";
      });
      overlay.style.display = "none";
    });
  }


  const createDiscountBannerBtn = document.getElementById("createDiscountBannerBtn");
  if (createDiscountBannerBtn) {
    createDiscountBannerBtn.addEventListener("click", async () => {
      const text = document.getElementById("discountText").value.trim();
      const discountPercentInput = document.getElementById("discountPercent");
      const discountPercent = parseFloat(discountPercentInput.value.trim()) || 0;
      const serviceDropdown = document.getElementById("discountServiceDropdown");
      const serviceId = serviceDropdown.dataset.selectedServiceId || "";
      const fileInputDiscount = document.getElementById("fileInputDiscount");
      const file = fileInputDiscount.files[0] || null;

      if (!text || !discountPercent || !serviceId) {
        alert("Zəhmət olmasa bütün sahələri doldurun.");
        return;
      }

      if (discountPercent < 0 || discountPercent > 100) {
        alert("Endirim faizi 0 ilə 100 arasında olmalıdır.");
        return;
      }

      const formData = new FormData();
      formData.append("text", text);
      formData.append("discount_percent", discountPercent);
      formData.append("service", serviceId);
      if (file) {
        formData.append("image", file);
      }

      try {
        const response = await fetch("/api/discount-banners/", {
          method: "POST",
          headers: {
            "X-CSRFToken": csrftoken,
            "X-Requested-With": "XMLHttpRequest",
          },
          body: formData,
        });
        if (response.ok) {
          window.location.reload();
        } else {
          const errData = await response.json();
          if (errData.detail) {
            alert(errData.detail);
          } else {
            alert("Xəta baş verdi. Endirim banneri yaradıla bilmədi.");
          }
        }
      } catch (error) {
        alert("Xəta baş verdi. Endirim banneri yaradıla bilmədi.");
        console.error(error);
      }
    });
  }


  const createMainBannerBtn = document.getElementById("createMainBannerBtn");
  if (createMainBannerBtn) {
    createMainBannerBtn.addEventListener("click", async () => {
      const text = document.getElementById("mainText").value.trim();
      const serviceDropdown = document.getElementById("mainServiceDropdown");
      const serviceId = serviceDropdown.dataset.selectedServiceId || "";
      const fileInputMain = document.getElementById("fileInputMain");
      const file = fileInputMain.files[0] || null;

      if (!text || !serviceId) {
        alert("Zəhmət olmasa bütün sahələri doldurun.");
        return;
      }

      const formData = new FormData();
      formData.append("text", text);
      formData.append("service", serviceId);
      if (file) {
        formData.append("image", file);
      }

      try {
        const response = await fetch("/api/main-banners/", {
          method: "POST",
          headers: {
            "X-CSRFToken": csrftoken,
            "X-Requested-With": "XMLHttpRequest",
          },
          body: formData,
        });
        if (response.ok) {
          window.location.reload();
        } else {
          const errData = await response.json();
          if (errData.detail) {
            alert(errData.detail);
          } else {
            alert("Xəta baş verdi. Əsas banner yaradıla bilmədi.");
          }
        }
      } catch (error) {
        alert("Xəta baş verdi. Əsas banner yaradıla bilmədi.");
        console.error(error);
      }
    });
  }
});
