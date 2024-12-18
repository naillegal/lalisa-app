// remember me checkbox
document
  .getElementById("remember-toggle")
  .addEventListener("click", function () {
    const rememberMeInput = document.getElementById("remember-me-input");
    const isActive = rememberMeInput.value === "1";

    rememberMeInput.value = isActive ? "0" : "1";
    this.classList.toggle("active");
  });







