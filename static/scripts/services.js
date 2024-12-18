// scripts/services.js

document.addEventListener("DOMContentLoaded", () => {
  // Elementləri seçmək
  const addServicesBtn = document.querySelector(".add-services button");
  const servicesPopup = document.querySelector(".services-popup");
  const servicesCategoryPopup = document.querySelector(
    ".services-category-popup"
  );
  const overlay = document.getElementById("overlay");

  // Close düymələri
  const closeServicesPopupBtns = [
    ...document.querySelectorAll(".services-popup .close-services-popup-btn i"),
    ...document.querySelectorAll(".services-popup .services-popup-close"),
  ];

  const closeServicesCategoryPopupBtns = [
    ...document.querySelectorAll(".services-category-popup .fa-xmark"),
    ...document.querySelectorAll(
      ".services-category-popup .services-category-popup-close"
    ),
  ];

  // "Kateqoriya seç" düyməsi
  const selectCategoryBtn = document.querySelector(".services-category button");

  // Popup açma funksiyası
  const openPopup = (popup) => {
    popup.style.display = "block";
    overlay.style.display = "block";
  };

  // Popup bağlama funksiyası
  const closePopup = (popup) => {
    popup.style.display = "none";
    // Overlay-i gizlətmək üçün bütün popupların bağlanmasını yoxlayırıq
    if (
      servicesPopup.style.display === "none" &&
      servicesCategoryPopup.style.display === "none"
    ) {
      overlay.style.display = "none";
    }
  };

  // "Əlavə edin" düyməsinə kliklə popup aç
  addServicesBtn.addEventListener("click", () => {
    openPopup(servicesPopup);
  });

  // "Kateqoriya seç" düyməsinə kliklə services-category-popup aç
  selectCategoryBtn.addEventListener("click", () => {
    openPopup(servicesCategoryPopup);
  });

  // services-popup-un bağlanması üçün bütün close düymələrinə hadisə əlavə et
  closeServicesPopupBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      closePopup(servicesPopup);
    });
  });

  // services-category-popup-un bağlanması üçün bütün close düymələrinə hadisə əlavə et
  closeServicesCategoryPopupBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      closePopup(servicesCategoryPopup);
    });
  });

  // Overlay-ə kliklənmə ilə bütün popupları bağlamaq istəsəniz, əlavə edə bilərsiniz:
  // overlay.addEventListener('click', () => {
  //   closePopup(servicesPopup);
  //   closePopup(servicesCategoryPopup);
  // });
});
