document.addEventListener("DOMContentLoaded", () => {
  const treatmentBoxes = document.querySelectorAll(".treatment-box");
  const titleInputs = document.querySelectorAll(".title-input");
  const descriptionInputs = document.querySelectorAll(".description-input");
  const treatmentIcons = document.querySelectorAll(
    ".treatment-icon, .last-element-treatment-icon"
  );
  const treatmentContentPopup = document.querySelector(
    ".treatment-content-popup"
  );
  const treatmentClockPopup = document.querySelector(".treatment-clock-popup");
  const overlay = document.getElementById("overlay");

  const contentPopupCloseBtn = document.querySelector(
    ".treatment-content-popup-close"
  );
  const clockPopupCloseBtn = document.querySelector(
    ".treatment-clock-popup-close"
  );
  const contentPopupConfirmBtn = document.querySelector(
    ".treatment-content-popup-confirm"
  );
  const clockPopupConfirmBtn = document.querySelector(
    ".treatment-clock-popup-confirm"
  );

  const popupTitleInput = document.querySelector(
    ".treatment-content-popup-title-input"
  );
  const popupDescriptionInput = document.querySelector(
    ".treatment-content-popup-description-input"
  );

  let currentTreatmentBox = null;
  let currentElementIndex = 1; // Cari elementin indeksini izləmək üçün

  // treatment-box divlərinə klik edildikdə
  treatmentBoxes.forEach((box) => {
    box.addEventListener("click", () => {
      currentTreatmentBox = box;
      treatmentContentPopup.style.display = "block";
      overlay.style.display = "block";
    });
  });

  // title-input və description-input üçün klik hadisəsini idarə etmək
  titleInputs.forEach((input) => {
    input.addEventListener("click", (event) => {
      event.stopPropagation(); // Valideyn klikini önləmək
      currentTreatmentBox = input.closest(".treatment-box");
      treatmentContentPopup.style.display = "block";
      overlay.style.display = "block";
    });
  });

  descriptionInputs.forEach((textarea) => {
    textarea.addEventListener("click", (event) => {
      event.stopPropagation(); // Valideyn klikini önləmək
      currentTreatmentBox = textarea.closest(".treatment-box");
      treatmentContentPopup.style.display = "block";
      overlay.style.display = "block";
    });
  });

  // Təsdiqlə düyməsinə klik edildikdə (treatment-content-popup)
  contentPopupConfirmBtn.addEventListener("click", () => {
    const title = popupTitleInput.value;
    const description = popupDescriptionInput.value;

    if (currentTreatmentBox) {
      const titleInputBox = currentTreatmentBox.querySelector(".title-input");
      const descriptionInputBox =
        currentTreatmentBox.querySelector(".description-input");

      titleInputBox.value = title;
      descriptionInputBox.value = description;
    }

    // Popup-u bağlamaq
    treatmentContentPopup.style.display = "none";
    overlay.style.display = "none";

    // Inputları təmizləmək
    popupTitleInput.value = "";
    popupDescriptionInput.value = "";
  });

  // Çıxış düyməsinə klik edildikdə (treatment-content-popup)
  contentPopupCloseBtn.addEventListener("click", () => {
    treatmentContentPopup.style.display = "none";
    overlay.style.display = "none";

    // Inputları təmizləmək
    popupTitleInput.value = "";
    popupDescriptionInput.value = "";
  });

  // treatment-icon üzərinə klik edildikdə
  treatmentIcons.forEach((icon) => {
    icon.addEventListener("click", (event) => {
      event.stopPropagation(); // Parent klikini önləmək üçün
      treatmentClockPopup.style.display = "block";
      overlay.style.display = "block";
    });
  });

  // Təsdiqlə düyməsinə klik edildikdə (treatment-clock-popup)
  clockPopupConfirmBtn.addEventListener("click", () => {
    // Popup-u bağlamaq
    treatmentClockPopup.style.display = "none";
    overlay.style.display = "none";

    // Növbəti elementin indeksini artırmaq
    currentElementIndex++;

    // Növbəti elementi görünən etmək, əgər varsa
    if (currentElementIndex <= 6) {
      const nextElementClass = ".element-" + currentElementIndex;
      const nextElement = document.querySelector(nextElementClass);
      if (nextElement) {
        nextElement.style.visibility = "visible";
      }
    }
  });

  // Çıxış düyməsinə klik edildikdə (treatment-clock-popup)
  clockPopupCloseBtn.addEventListener("click", () => {
    treatmentClockPopup.style.display = "none";
    overlay.style.display = "none";
  });
});
