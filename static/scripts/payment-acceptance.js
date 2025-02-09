document.addEventListener("DOMContentLoaded", () => {
  const openCustomerBannerBtn = document.querySelector(
    ".open-customer-acceptance-banner-detail"
  );
  const openPaymentBannerBtn = document.querySelector(
    ".open-payment-acceptance-banner-detail"
  );
  const paymentAcceptanceUpside = document.querySelector(
    ".payment-acceptance-upside"
  );
  const paymentAcceptanceBanners = document.querySelector(
    ".payment-acceptance-banners"
  );
  const customerAcceptanceTableBg = document.querySelector(
    ".customer-acceptance-table-bg"
  );
  const paymentAcceptanceTableBg = document.querySelector(
    ".payment-acceptance-table-bg"
  );
  const paymentAcceptanceDetail = document.querySelector(
    ".payment-acceptance-detail"
  );
  const overlay = document.getElementById("overlay");

  const customerAcceptanceWarningPopup = document.querySelector(
    ".customer-acceptance-warning-popup"
  );
  const closeCustomerWarningPopupBtn =
    customerAcceptanceWarningPopup.querySelector(
      ".close-customer-acceptance-warning-popup-btn i"
    );
  const customerWarningCloseButtons =
    customerAcceptanceWarningPopup.querySelectorAll(
      ".customer-acceptance-warning-popup-close, .customer-acceptance-warning-popup-confirm"
    );

  const methodCashBtn = paymentAcceptanceDetail.querySelector(".method-cash");
  const methodCardBtn = paymentAcceptanceDetail.querySelector(".method-card");
  const methodCashbackBtn =
    paymentAcceptanceDetail.querySelector(".method-cashback");

  const paymentCashPopup = document.querySelector(
    ".payment-acceptance-detail-cash-popup"
  );
  const paymentCardPopup = document.querySelector(
    ".payment-acceptance-detail-card-popup"
  );
  const paymentCashbackPopup = document.querySelector(
    ".payment-acceptance-detail-cashback-popup"
  );

  const closePaymentCashPopupBtn = paymentCashPopup.querySelector(
    ".close-payment-acceptance-detail-cash-popup-btn i"
  );
  const closePaymentCardPopupBtn = paymentCardPopup.querySelector(
    ".close-payment-acceptance-detail-card-popup-btn i"
  );
  const closePaymentCashbackPopupBtn = paymentCashbackPopup.querySelector(
    ".close-payment-acceptance-detail-cashback-popup-btn i"
  );

  const closeButtons = document.querySelectorAll(
    ".payment-acceptance-detail-cash-popup-close, .payment-acceptance-detail-cash-popup-confirm, .payment-acceptance-detail-card-popup-close, .payment-acceptance-detail-card-popup-confirm, .payment-acceptance-detail-cashback-popup-close, .payment-acceptance-detail-cashback-popup-confirm"
  );

  let currentReservationId = null;
  let currentTotalAmount = 0;
  let currentRemainingDebt = 0;

  openCustomerBannerBtn.addEventListener("click", () => {
    paymentAcceptanceUpside.style.display = "none";
    paymentAcceptanceBanners.style.display = "none";
    customerAcceptanceTableBg.style.display = "block";
  });

  openPaymentBannerBtn.addEventListener("click", () => {
    paymentAcceptanceUpside.style.display = "none";
    paymentAcceptanceBanners.style.display = "none";
    paymentAcceptanceTableBg.style.display = "block";
  });

  const customerAcceptButtons = document.querySelectorAll(
    ".accept-customer-btn"
  );
  customerAcceptButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const reservationId = btn.getAttribute("data-reservation-id");
      currentReservationId = reservationId;
      customerAcceptanceWarningPopup.style.display = "block";
      overlay.style.display = "block";
      const confirmBtn = customerAcceptanceWarningPopup.querySelector(
        ".customer-acceptance-warning-popup-confirm"
      );
      confirmBtn.onclick = () => {
        fetch(`/api/reservations/${reservationId}/accept_customer/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": getCSRFToken(),
          },
        })
          .then((response) => response.json())
          .then((data) => {
            if (data.detail === "Reservation accepted.") {
              document
                .getElementById(`reservation-row-${reservationId}`)
                .remove();
              location.reload();
            } else {
              alert(data.detail);
            }
          });
        customerAcceptanceWarningPopup.style.display = "none";
        overlay.style.display = "none";
      };
    });
  });

  closeCustomerWarningPopupBtn.addEventListener("click", () => {
    customerAcceptanceWarningPopup.style.display = "none";
    overlay.style.display = "none";
  });
  customerWarningCloseButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      customerAcceptanceWarningPopup.style.display = "none";
      overlay.style.display = "none";
    });
  });

  const acceptPaymentButtons = document.querySelectorAll(".accept-payment-btn");
  acceptPaymentButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const reservationId = btn.getAttribute("data-reservation-id");
      currentReservationId = reservationId;
      fetch(`/api/reservations/${reservationId}/details/`)
        .then((response) => response.json())
        .then((data) => {
          const profileImage = document.getElementById("profileImage");
          profileImage.src = data.customer_image;
          document.getElementById("profileName").innerText = data.customer_name;
          document.getElementById("cashbackBalance").innerText =
            data.cashback_balance + " ₼";
          document.getElementById("popupCashbackBalance").innerText =
            data.cashback_balance + " ₼";

          const servicesTableBody =
            document.getElementById("servicesTableBody");
          servicesTableBody.innerHTML = "";
          data.services.forEach((service) => {
            const tr = document.createElement("tr");
            const tdName = document.createElement("td");
            tdName.innerText = service.name;
            const tdPrice = document.createElement("td");
            tdPrice.style.color = "rgba(84, 186, 79, 1)";
            tdPrice.innerText = service.price + "₼";
            tr.appendChild(tdName);
            tr.appendChild(tdPrice);
            servicesTableBody.appendChild(tr);
          });
          currentTotalAmount = data.total_price;
          currentRemainingDebt = data.remaining_debt;
          document.getElementById("totalAmount").innerText =
            data.total_price + " ₼";
          document.getElementById("remainingDebt").innerText =
            data.remaining_debt + " ₼";

          paymentAcceptanceTableBg.style.display = "none";
          paymentAcceptanceDetail.style.display = "block";
        });
    });
  });

  methodCashBtn.addEventListener("click", () => {
    paymentCashPopup.style.display = "block";
    overlay.style.display = "block";
  });
  methodCardBtn.addEventListener("click", () => {
    paymentCardPopup.style.display = "block";
    overlay.style.display = "block";
  });
  methodCashbackBtn.addEventListener("click", () => {
    paymentCashbackPopup.style.display = "block";
    overlay.style.display = "block";
  });

  closePaymentCashPopupBtn.addEventListener("click", () => {
    paymentCashPopup.style.display = "none";
    overlay.style.display = "none";
  });
  closePaymentCardPopupBtn.addEventListener("click", () => {
    paymentCardPopup.style.display = "none";
    overlay.style.display = "none";
  });
  closePaymentCashbackPopupBtn.addEventListener("click", () => {
    paymentCashbackPopup.style.display = "none";
    overlay.style.display = "none";
  });
  closeButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      paymentCashPopup.style.display = "none";
      paymentCardPopup.style.display = "none";
      paymentCashbackPopup.style.display = "none";
      overlay.style.display = "none";
    });
  });

  function createPayment(paymentType, amount) {
    fetch("/api/payments/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-CSRFToken": getCSRFToken(),
      },
      body: JSON.stringify({
        reservation_id: currentReservationId,
        payment_type: paymentType,
        amount: amount,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.detail === "Payment recorded.") {
          fetch(`/api/reservations/${currentReservationId}/details/`)
            .then((response) => response.json())
            .then((data) => {
              let remainingDebt = data.remaining_debt;
              if (
                typeof remainingDebt === "undefined" ||
                remainingDebt === null ||
                remainingDebt < 0
              ) {
                remainingDebt = 0;
              }
              currentRemainingDebt = remainingDebt;
              document.getElementById("remainingDebt").innerText =
                remainingDebt + " ₼";
              if (typeof data.cashback_balance !== "undefined") {
                document.getElementById("cashbackBalance").innerText =
                  data.cashback_balance + " ₼";
                document.getElementById("popupCashbackBalance").innerText =
                  data.cashback_balance + " ₼";
              }

              if (remainingDebt === 0) {
                alert("Ödəniş uğurla bitdi");
                window.location.href = "/payment-acceptance/";
              }
            });
        } else {
          alert(data.detail);
        }
      });
  }

  document.getElementById("applyCashBtn").addEventListener("click", () => {
    const amount = parseFloat(document.getElementById("cashAmountInput").value);
    if (isNaN(amount) || amount <= 0) {
      alert("Zəhmət olmasa düzgün məbləğ daxil edin.");
      return;
    }
    createPayment("cash", amount);
    paymentCashPopup.style.display = "none";
    overlay.style.display = "none";
  });

  document.getElementById("applyCardBtn").addEventListener("click", () => {
    const amount = parseFloat(document.getElementById("cardAmountInput").value);
    if (isNaN(amount) || amount <= 0) {
      alert("Zəhmət olmasa düzgün məbləğ daxil edin.");
      return;
    }
    createPayment("card", amount);
    paymentCardPopup.style.display = "none";
    overlay.style.display = "none";
  });

  document.getElementById("applyCashbackBtn").addEventListener("click", () => {
    const amount = parseFloat(
      document.getElementById("cashbackAmountInput").value
    );
    if (isNaN(amount) || amount <= 0) {
      alert("Zəhmət olmasa düzgün məbləğ daxil edin.");
      return;
    }
    const currentPopupCashback = parseFloat(
      document.getElementById("popupCashbackBalance").innerText
    );
    if (amount > currentPopupCashback) {
      alert("Cashback balansı yetərsizdir.");
      return;
    }
    createPayment("cashback", amount);
    paymentCashbackPopup.style.display = "none";
    overlay.style.display = "none";
  });

  function getCSRFToken() {
    let cookieValue = null;
    if (document.cookie && document.cookie !== "") {
      const cookies = document.cookie.split(";");
      for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i].trim();
        if (cookie.substring(0, 10) === "csrftoken=") {
          cookieValue = decodeURIComponent(cookie.substring(10));
          break;
        }
      }
    }
    return cookieValue;
  }

  overlay.addEventListener("click", () => {
    customerAcceptanceWarningPopup.style.display = "none";
    paymentCashPopup.style.display = "none";
    paymentCardPopup.style.display = "none";
    paymentCashbackPopup.style.display = "none";
    overlay.style.display = "none";
  });
});
