// remember me checkbox
const rememberToggle = document.getElementById("remember-toggle");
if (rememberToggle) {
  rememberToggle.addEventListener("click", function () {
    const rememberMeInput = document.getElementById("remember-me-input");
    const isActive = rememberMeInput.value === "1";
    rememberMeInput.value = isActive ? "0" : "1";
    this.classList.toggle("active");
  });
}

// sidebar active
document.querySelectorAll(".route").forEach((route) => {
  route.addEventListener("click", function () {
    document
      .querySelectorAll(".route")
      .forEach((item) => item.classList.remove("active"));
    this.classList.add("active");
  });
});
