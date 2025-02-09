const historyVisible = document.querySelector(".history-visible");
const usersVisible = document.querySelector(".users-visible");
const budgetVisible = document.querySelector(".budget-visible");
const popup = document.querySelector(".change-total-budget-popup");
const overlay = document.querySelector("#overlay");
const closePopupBtn = document.querySelector(
  ".close-change-total-budget-popup-btn i"
);
const closePopupButton = document.querySelector(
  ".change-total-budget-popup-close"
);

document.addEventListener("DOMContentLoaded", () => {
  const slotSection = document.querySelector("#slot");
  const currentTab = slotSection.getAttribute("data-current-tab") || "history";
  showDiv(currentTab);
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

document.addEventListener("click", (event) => {
  const historyButton = event.target.closest(".history-button");
  const usersButton = event.target.closest(".users-button");
  const budgetButton = event.target.closest(".budget-button");
  const editIcon = event.target.closest(".editicon");
  const isOverlay = event.target === overlay;
  const toggleBtn = event.target.closest(".toggle-status");

  if (historyButton) {
    showDiv("history");
    updateUrlParam("currentTab", "history");
  }

  if (usersButton) {
    showDiv("users");
    updateUrlParam("currentTab", "users");
  }

  if (budgetButton) {
    showDiv("budget");
    updateUrlParam("currentTab", "budget");
  }

  if (editIcon) {
    const userId = editIcon.getAttribute("data-user-id");
    popup.style.display = "block";
    overlay.style.display = "block";
    const applyBtn = document.querySelector(".apply-btn");
    applyBtn.setAttribute("data-user-id", userId);
  }

  if (
    isOverlay ||
    event.target === closePopupBtn ||
    event.target === closePopupButton
  ) {
    popup.style.display = "none";
    overlay.style.display = "none";
  }

  if (toggleBtn) {
    const userId = toggleBtn.getAttribute("data-user-id");
    toggleCashbackStatus(userId);
  }
});

const applyPopupBtn = document.querySelector(".apply-btn");
if (applyPopupBtn) {
  applyPopupBtn.addEventListener("click", async function () {
    const userId = this.getAttribute("data-user-id");
    const inputField = document.querySelector(
      ".change-total-budget-popup input"
    );
    const newBalance = inputField.value.trim();

    if (!newBalance) {
      return;
    }

    try {
      const response = await fetch(`/api/cashback/${userId}/update_balance/`, {
        method: "POST",
        headers: {
          "X-CSRFToken": getCookie("csrftoken"),
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ balance: newBalance }),
      });
      if (!response.ok) {
        console.error("Balance update failed");
        return;
      }
      const data = await response.json();
      if (data.status === "ok") {
        popup.style.display = "none";
        overlay.style.display = "none";
        reloadSameTab();
      }
    } catch (error) {
      console.error(error);
    }
  });
}

async function toggleCashbackStatus(userId) {
  try {
    const response = await fetch(`/api/cashback/${userId}/toggle/`, {
      method: "POST",
      headers: {
        "X-CSRFToken": getCookie("csrftoken"),
      },
    });
    if (!response.ok) {
      console.error("Toggle status failed");
      return;
    }
    const data = await response.json();
    console.log("New is_active status:", data.is_active);
    reloadSameTab();
  } catch (error) {
    console.error(error);
  }
}

function removeActiveClasses() {
  document
    .querySelectorAll(".history-button, .users-button, .budget-button")
    .forEach((button) => {
      button.classList.remove(
        "history-active",
        "users-active",
        "budget-active"
      );
    });
}

function hideAllDivs() {
  historyVisible.style.display = "none";
  usersVisible.style.display = "none";
  budgetVisible.style.display = "none";
}

function showDiv(type) {
  hideAllDivs();
  removeActiveClasses();

  if (type === "history") {
    historyVisible.style.display = "block";
    document
      .querySelectorAll(".history-button")
      .forEach((button) => button.classList.add("history-active"));
  } else if (type === "users") {
    usersVisible.style.display = "block";
    document
      .querySelectorAll(".users-button")
      .forEach((button) => button.classList.add("users-active"));
  } else if (type === "budget") {
    budgetVisible.style.display = "block";
    document
      .querySelectorAll(".budget-button")
      .forEach((button) => button.classList.add("budget-active"));
  }
}

function updateUrlParam(key, value) {
  const url = new URL(window.location);
  url.searchParams.set(key, value);
  window.history.replaceState({}, "", url);
}

function reloadSameTab() {
  const url = new URL(window.location);
  window.location.href = url.toString();
}
