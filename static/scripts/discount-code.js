function createDiscountCode() {
  const code = document.getElementById("discount-code").value;
  const percent = document.getElementById("discount-percent").value;
  const validity = document.getElementById("discount-code-validity").value;
  const searchQuery =
    new URLSearchParams(window.location.search).get("search") || "";

  if (!code || !percent || !validity) {
    alert("Bütün sahələri doldurun!");
    return;
  }

  const data = {
    code: code,
    discount_percent: percent,
    validity: validity,
    is_active: true,
  };

  fetch("/api/discount-codes/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-CSRFToken": getCookie("csrftoken"),
    },
    body: JSON.stringify(data),
  }).then((response) => {
    if (response.ok) {
      window.location.href = `?search=${encodeURIComponent(searchQuery)}`;
    } else {
      response.json().then((data) => {
        alert("Xəta: " + JSON.stringify(data));
      });
    }
  });
}

function toggleDiscountStatus(discountId) {
  const button = event.target;
  const isActive = button.classList.contains("active");
  const searchQuery =
    new URLSearchParams(window.location.search).get("search") || "";

  fetch(`/api/discount-codes/${discountId}/`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      "X-CSRFToken": getCookie("csrftoken"),
    },
    body: JSON.stringify({ is_active: !isActive }),
  }).then((response) => {
    if (response.ok) {
      window.location.href = `?search=${encodeURIComponent(searchQuery)}`;
    } else {
      alert("Status dəyişdirilərkən xəta baş verdi");
    }
  });
}

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

document.querySelectorAll(".toggle-status").forEach((button) => {
  button.addEventListener("click", function () {
    this.classList.toggle("active");
  });
});
