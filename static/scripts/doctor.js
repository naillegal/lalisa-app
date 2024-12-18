document.addEventListener("DOMContentLoaded", function () {
  const permissionButtons = document.querySelectorAll(".doctor-permission-btn");
  const editButtons = document.querySelectorAll(".doctor-edit-btn");
  const overlay = document.getElementById("overlay");
  const popup = document.querySelector(".doctor-permission-popup");
  const dateInput = popup.querySelector(
    ".doctor-permission-popup-middle-date input"
  );
  const timeInput = popup.querySelector(
    ".doctor-permission-popup-middle-time input"
  );
  const confirmButton = popup.querySelector(".doctor-permission-popup-confirm");
  const closeButton = popup.querySelector(".doctor-permission-popup-close");
  let currentRow = null;

  permissionButtons.forEach((button) => {
    button.addEventListener("click", function () {
      currentRow = this.closest("tr");
      dateInput.value = "";
      timeInput.value = "";
      popup.style.display = "block";
      overlay.style.display = "block";
    });
  });

  editButtons.forEach((button) => {
    button.addEventListener("click", function () {
      currentRow = this.closest("tr");
      const permissionDate =
        currentRow.querySelector(".doctor-permission-date")?.textContent || "";
      const permissionTime =
        currentRow.querySelector(".doctor-permission-hour")?.textContent || "";
      dateInput.value = permissionDate;
      timeInput.value = permissionTime;
      popup.style.display = "block";
      overlay.style.display = "block";
    });
  });

  confirmButton.addEventListener("click", function () {
    if (currentRow) {
      const date = dateInput.value;
      const time = timeInput.value;
      const permissionCell = currentRow.querySelector(".doctor-permission");
      if (date && time) {
        permissionCell.innerHTML = `<p class="doctor-permission-date">${date}</p><p class="doctor-permission-hour">${time}</p>`;
      }
      popup.style.display = "none";
      overlay.style.display = "none";
    }
  });

  closeButton.addEventListener("click", function () {
    popup.style.display = "none";
    overlay.style.display = "none";
  });

  overlay.addEventListener("click", function () {
    popup.style.display = "none";
    overlay.style.display = "none";
  });
});
