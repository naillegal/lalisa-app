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


function updateSelectLabel(selectElement) {
  const selectedOption = selectElement.options[selectElement.selectedIndex];
  if (selectedOption) {
    selectElement.style.color = "#333";
  }
}

const addTreatmentBtn = document.querySelector(".add-treatment");
const treatmentsUpsideDiv = document.querySelector(".treatments-upside");
const treatmentsDiv = document.querySelector(".treatments");
const addTreatmentsDiv = document.querySelector(".add-treatments-container");
const treatmentProcessDiv = document.querySelector(".treatment-process");
const confirmAddTreatmentDiv = document.querySelector(".confirm-add-treatment");
const deleteTreatmentSection = document.querySelector(".delete-treatment");
const deleteTreatmentTitle = document.querySelector(".treatment-show-title h4");
const addTreatmentFormSubmitBtn = document.querySelector(
  ".add-treatments-form-submit-button button"
);


const addTreatmentServiceSelect = document.getElementById("add-treatment-service");
const treatmentNameInput = document.querySelector(".treatment-name input");
const treatmentDescTextarea = document.querySelector(".treatment-description textarea");
const addClockServiceSelect = document.getElementById("add-clock-service");

const popup = document.querySelector(".treatment-content-popup");
const popupTitleInput = document.querySelector(".treatment-content-popup-title-input");
const popupDescInput = document.querySelector(".treatment-content-popup-description-input");
const popupCloseBtn = document.querySelector(".treatment-content-popup-close");
const popupConfirmBtn = document.querySelector(".treatment-content-popup-confirm");
const overlay = document.getElementById("overlay"); 

const deletePopup = document.querySelector(".treatment-delete-warning-popup");
const deletePopupCloseBtn = document.querySelector(
  ".close-treatment-delete-warning-popup-btn i"
);
const deletePopupButtonClose = document.querySelector(
  ".treatment-delete-warning-popup-close"
);
const deletePopupButtonConfirm = document.querySelector(
  ".treatment-delete-warning-popup-confirm"
);

const confirmAddTreatmentBtn = document.querySelector(".confirm-add-treatment-btn");

const finalDeleteBtn = document.querySelector(".delete-treatment-btn");

const elementSequence = [
  ".element-1",
  ".element-2",
  ".element-3",
  ".element-4",
  ".element-5",
  ".element-6",
  ".element-7",
  ".element-8",
  ".element-9",
  ".element-10",
  ".element-11",
  ".element-12",
  ".element-13",
  ".element-14",
  ".element-15",
];
const treatmentBoxes = elementSequence.map((selector) => {
  return document.querySelector(selector);
});

let createdTreatmentsData = [];
let currentIndex = 0; 
let isEditMode = false; 
let currentTreatmentId = null; 


addTreatmentFormSubmitBtn.addEventListener("click", function () {
  const serviceIdValue = addTreatmentServiceSelect.value;
  const serviceText =
    addTreatmentServiceSelect.options[addTreatmentServiceSelect.selectedIndex]?.text;
  const enteredTitle = treatmentNameInput.value.trim();
  const enteredDesc = treatmentDescTextarea.value.trim();
  const selectedTimeValue = addClockServiceSelect.value;

  if (!serviceIdValue || !enteredTitle || !enteredDesc || !selectedTimeValue) {
    alert("Bütün sahələri doldurun!");
    return;
  }

  let finalServiceId = serviceIdValue;
  let finalServiceName = serviceText;
  if (createdTreatmentsData.length > 0) {
    finalServiceId = createdTreatmentsData[0].service_id;
    finalServiceName = createdTreatmentsData[0].service_name;
  } else {
    addTreatmentServiceSelect.disabled = true;
  }

  const newStepData = {
    id: null,
    service_id: Number(finalServiceId),
    service_name: finalServiceName,
    title: enteredTitle,
    description: enteredDesc,
    time: Number(selectedTimeValue),
  };
  createdTreatmentsData.push(newStepData);

  if (currentIndex < elementSequence.length) {
    fillOneElement(treatmentBoxes[currentIndex], newStepData);
    treatmentBoxes[currentIndex].style.visibility = "visible";
    currentIndex++;
  } else {
    alert("Maksimum addım sayına çatdınız! (15)");
  }

  treatmentNameInput.value = "";
  treatmentDescTextarea.value = "";
  addClockServiceSelect.value = "";
});


function fillOneElement(element, stepData) {
  if (!element) return;
  const titleInput = element.querySelector(".title-input");
  const descInput = element.querySelector(".description-input");
  const timeRange = element.querySelector(".selected-time-range");

  if (titleInput) titleInput.value = stepData.title;
  if (descInput) descInput.value = stepData.description;
  if (timeRange) timeRange.textContent = "+" + stepData.time;
}


treatmentBoxes.forEach((box, boxIndex) => {
  box.addEventListener("click", function () {
    if (box.style.visibility === "hidden") return;

    const stepData = createdTreatmentsData[boxIndex];
    if (!stepData) {
      return;
    }

    popupTitleInput.value = stepData.title || "";
    popupDescInput.value = stepData.description || "";

    popup.style.display = "block";
    if (overlay) overlay.style.display = "block";

    popupConfirmBtn.onclick = function () {
      const newTitle = popupTitleInput.value.trim();
      const newDesc = popupDescInput.value.trim();
      if (!newTitle || !newDesc) {
        alert("Başlıq və açıqlama boş ola bilməz!");
        return;
      }
      stepData.title = newTitle;
      stepData.description = newDesc;

      fillOneElement(box, stepData);

      popup.style.display = "none";
      if (overlay) overlay.style.display = "none";

      if (isEditMode && currentTreatmentId) {
        updateTreatmentOnServer();
      }
    };
  });
});


addTreatmentBtn.addEventListener("click", function () {
  isEditMode = false;
  currentTreatmentId = null;
  createdTreatmentsData = [];
  currentIndex = 0;

  elementSequence.forEach((sel) => {
    const el = document.querySelector(sel);
    if (el) {
      el.style.visibility = "hidden";
      const tInput = el.querySelector(".title-input");
      const dInput = el.querySelector(".description-input");
      const timeDiv = el.querySelector(".selected-time-range");
      if (tInput) tInput.value = "";
      if (dInput) dInput.value = "";
      if (timeDiv) timeDiv.textContent = "+0";
    }
  });

  addTreatmentServiceSelect.disabled = false;
  addTreatmentServiceSelect.value = "";
  treatmentNameInput.value = "";
  treatmentDescTextarea.value = "";
  addClockServiceSelect.value = "";

  treatmentsUpsideDiv.style.display = "none";
  treatmentsDiv.style.display = "none";

  addTreatmentsDiv.style.display = "block";
  treatmentProcessDiv.style.display = "block";

  confirmAddTreatmentDiv.style.display = "flex";
  deleteTreatmentSection.style.display = "none"; 
});


confirmAddTreatmentBtn.addEventListener("click", function () {
  if (createdTreatmentsData.length === 0) {
    alert("Heç bir addım əlavə etməmisiniz!");
    return;
  }

  const serviceId = createdTreatmentsData[0].service_id;
  const stepsToSend = createdTreatmentsData.map((step) => {
    return {
      title: step.title,
      description: step.description,
      time_offset: step.time,
    };
  });

  const payload = {
    service: serviceId,
    steps: stepsToSend,
  };

  if (!isEditMode) {
    fetch("/api/treatments/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-CSRFToken": getCookie("csrftoken"),
      },
      body: JSON.stringify(payload),
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error("Server error");
        }
        return res.json();
      })
      .then((data) => {
        console.log("Yaradılan müalicə:", data);
        addTreatmentsDiv.style.display = "none";
        confirmAddTreatmentDiv.style.display = "none";

        deleteTreatmentSection.style.display = "flex";
        finalDeleteBtn.style.display = "inline-block";
        finalDeleteBtn.setAttribute("data-treatment-id", data.id);

        deleteTreatmentTitle.textContent = "Xidmət " + data.service;

        isEditMode = true;
        currentTreatmentId = data.id;
      })
      .catch((err) => {
        console.error(err);
        alert("Müalicə yaradılarkən xəta baş verdi!");
      });
  } else {
    if (!currentTreatmentId) {
      alert("Mövcud müalicə ID tapılmadı!");
      return;
    }
    fetch(`/api/treatments/${currentTreatmentId}/`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "X-CSRFToken": getCookie("csrftoken"),
      },
      body: JSON.stringify(payload),
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error("Server error");
        }
        return res.json();
      })
      .then((data) => {
        console.log("Yenilənən müalicə:", data);
        alert("Müalicə uğurla yeniləndi!");
      })
      .catch((err) => {
        console.error(err);
        alert("Müalicə yenilənərkən xəta baş verdi!");
      });
  }
});


function updateTreatmentOnServer() {
  if (createdTreatmentsData.length === 0 || !currentTreatmentId) {
    console.warn("No data to update or treatment ID is missing.");
    return;
  }

  const stepsToSend = createdTreatmentsData.map((step) => {
    return {
      title: step.title,
      description: step.description,
      time_offset: step.time,
    };
  });

  const payload = {
    service: createdTreatmentsData[0].service_id,
    steps: stepsToSend,
  };

  fetch(`/api/treatments/${currentTreatmentId}/`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "X-CSRFToken": getCookie("csrftoken"),
    },
    body: JSON.stringify(payload),
  })
    .then((res) => {
      if (!res.ok) {
        throw new Error("Server error while updating treatment.");
      }
      return res.json();
    })
    .then((data) => {
      console.log("Treatment successfully updated:", data);
      alert("Addım uğurla yeniləndi və müalicə güncəlləndi!");
    })
    .catch((err) => {
      console.error(err);
      alert("Addımı yeniləyərkən və müalicəni güncəlləyərkən xəta baş verdi!");
    });
}


const existingDeleteIcons = document.querySelectorAll(".treatment-delete-icon");
existingDeleteIcons.forEach((icon) => {
  icon.addEventListener("click", function () {
    const treatmentId = icon.getAttribute("data-treatment-id");
    openDeletePopup(treatmentId);
  });
});


if (finalDeleteBtn) {
  finalDeleteBtn.addEventListener("click", function () {
    const tId = finalDeleteBtn.getAttribute("data-treatment-id");
    if (!tId) return;

    fetch(`/api/treatments/${tId}/`, {
      method: "DELETE",
      headers: {
        "X-CSRFToken": getCookie("csrftoken"),
      },
    })
      .then((res) => {
        if (res.ok) {
          alert("Müalicə silindi!");
          window.location.reload();
        } else {
          alert("Silinərkən xəta baş verdi!");
        }
      })
      .catch((err) => {
        console.error(err);
        alert("Silinərkən xəta baş verdi!");
      });
  });
}


function openDeletePopup(treatmentId) {
  deletePopup.dataset.treatmentId = treatmentId;
  deletePopup.style.display = "block";
  if (overlay) overlay.style.display = "block";
}
function closeDeletePopup() {
  deletePopup.style.display = "none";
  if (overlay) overlay.style.display = "none";
}

deletePopupCloseBtn.addEventListener("click", closeDeletePopup);
deletePopupButtonClose.addEventListener("click", closeDeletePopup);

deletePopupButtonConfirm.addEventListener("click", function () {
  const treatmentId = deletePopup.dataset.treatmentId;
  if (!treatmentId) return;
  fetch(`/api/treatments/${treatmentId}/`, {
    method: "DELETE",
    headers: {
      "X-CSRFToken": getCookie("csrftoken"),
    },
  })
    .then((res) => {
      if (res.ok) {
        const box = document.querySelector(
          `.treatment-delete-icon[data-treatment-id="${treatmentId}"]`
        )?.closest(".col-lg-3.col-md-4.col-6");
        if (box) {
          box.remove();
        }
        alert("Müalicə silindi!");
      } else {
        alert("Silinərkən xəta baş verdi!");
      }
    })
    .catch((err) => {
      console.error(err);
      alert("Silinərkən xəta baş verdi!");
    })
    .finally(() => {
      closeDeletePopup();
    });
});


const treatmentDetailsTriggers = document.querySelectorAll(
  ".treatment-details-trigger"
);
treatmentDetailsTriggers.forEach((trigger) => {
  trigger.addEventListener("click", function () {
    const treatmentId = trigger.getAttribute("data-treatment-id");
    if (!treatmentId) return;

    isEditMode = true;
    currentTreatmentId = treatmentId;
    createdTreatmentsData = [];
    currentIndex = 0;

    treatmentsUpsideDiv.style.display = "none";
    treatmentsDiv.style.display = "none";
    addTreatmentsDiv.style.display = "none";
    confirmAddTreatmentDiv.style.display = "none";

    treatmentProcessDiv.style.display = "block";
    deleteTreatmentSection.style.display = "flex";
    finalDeleteBtn.style.display = "inline-block";

    fetch(`/api/treatments/${treatmentId}/`)
      .then((res) => {
        if (!res.ok) {
          throw new Error("Server error while fetching treatment details.");
        }
        return res.json();
      })
      .then((data) => {
        deleteTreatmentTitle.textContent = "Xidmət " + data.service;
        finalDeleteBtn.setAttribute("data-treatment-id", data.id);

        elementSequence.forEach((sel) => {
          const el = document.querySelector(sel);
          if (el) {
            el.style.visibility = "hidden";
            const tInput = el.querySelector(".title-input");
            const dInput = el.querySelector(".description-input");
            const timeDiv = el.querySelector(".selected-time-range");
            if (tInput) tInput.value = "";
            if (dInput) dInput.value = "";
            if (timeDiv) timeDiv.textContent = "";
          }
        });

        data.steps.forEach((step, i) => {
          if (i < elementSequence.length) {
            const stepObj = {
              id: step.id,
              service_id: data.service,
              service_name: data.service_name || "", 
              title: step.title,
              description: step.description,
              time: step.time_offset,
            };
            createdTreatmentsData.push(stepObj);

            const boxElement = document.querySelector(elementSequence[i]);
            if (boxElement) {
              boxElement.style.visibility = "visible";
              fillOneElement(boxElement, stepObj);
            }
            currentIndex++;
          }
        });
      })
      .catch((err) => {
        console.error(err);
        alert("Müalicə detalları yüklənərkən xəta baş verdi!");
      });
  });
});


if (overlay) {
  overlay.addEventListener("click", () => {
    popup.style.display = "none";
    deletePopup.style.display = "none";
    overlay.style.display = "none";
  });
}
if (popupCloseBtn) {
  popupCloseBtn.addEventListener("click", () => {
    popup.style.display = "none";
    if (overlay) overlay.style.display = "none";
  });
}


function handleStepUpdate(boxIndex, updatedStepData) {
  createdTreatmentsData[boxIndex] = updatedStepData;

  const boxElement = treatmentBoxes[boxIndex];
  if (boxElement) {
    fillOneElement(boxElement, updatedStepData);
  }

  if (isEditMode && currentTreatmentId) {
    updateTreatmentOnServer();
  }
}

function updateTreatmentOnServer() {
  if (createdTreatmentsData.length === 0 || !currentTreatmentId) {
    console.warn("No data to update or treatment ID is missing.");
    return;
  }

  const stepsToSend = createdTreatmentsData.map((step) => {
    return {
      title: step.title,
      description: step.description,
      time_offset: step.time,
    };
  });

  const payload = {
    service: createdTreatmentsData[0].service_id,
    steps: stepsToSend,
  };

  fetch(`/api/treatments/${currentTreatmentId}/`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "X-CSRFToken": getCookie("csrftoken"),
    },
    body: JSON.stringify(payload),
  })
    .then((res) => {
      if (!res.ok) {
        throw new Error("Server error while updating treatment.");
      }
      return res.json();
    })
    .then((data) => {
      console.log("Treatment successfully updated:", data);
      alert("Müalicə güncəlləndi!");
    })
    .catch((err) => {
      console.error(err);
      alert("Müalicəni güncəlləyərkən xəta baş verdi!");
    });
}
