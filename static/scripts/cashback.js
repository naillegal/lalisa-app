// Div-ləri seçirik
const historyVisible = document.querySelector(".history-visible");
const usersVisible = document.querySelector(".users-visible");
const budgetVisible = document.querySelector(".budget-visible");

// Bütün düymələrə event delegation tətbiq edirik
document.addEventListener("click", (event) => {
  // Klik edilən elementi tapırıq
  const target = event.target;

  // Əgər düymə `history-button` sinfinə sahibdirsə
  if (target.classList.contains("history-button")) {
    showDiv("history");
  }

  // Əgər düymə `users-button` sinfinə sahibdirsə
  if (target.classList.contains("users-button")) {
    showDiv("users");
  }

  // Əgər düymə `budget-button` sinfinə sahibdirsə
  if (target.classList.contains("budget-button")) {
    showDiv("budget");
  }
});

// Aktiv sinfi idarə etmək üçün funksiya
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

// Div-ləri idarə etmək üçün funksiya
function hideAllDivs() {
  historyVisible.style.display = "none";
  usersVisible.style.display = "none";
  budgetVisible.style.display = "none";
}

// Div göstərmə funksiyası
function showDiv(type) {
  hideAllDivs(); // Bütün div-ləri gizlədirik
  removeActiveClasses(); // Aktiv sinfləri təmizləyirik

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
