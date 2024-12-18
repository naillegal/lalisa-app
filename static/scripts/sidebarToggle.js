// sidebar close-open toggle
const sidebar = document.getElementById('sidebar');
const responsiveSidebar = document.getElementById('responsive-sidebar');
const navbar = document.getElementById('navbar');
const slot = document.getElementById('slot');
const toggleBars = document.querySelector('.fa-bars');
const toggleArrow = document.querySelector('.fa-arrow-right');

// Səhifə yüklənəndə localStorage-dən vəziyyəti yoxlayırıq
document.addEventListener('DOMContentLoaded', () => {
  const isSidebarClosed = localStorage.getItem('isSidebarClosed') === 'true';

  if (isSidebarClosed) {
    // Sidebar bağlı vəziyyət
    sidebar.style.display = 'none';
    responsiveSidebar.style.display = 'flex';
    navbar.style.width = 'calc(100% - 92px)';
    slot.style.width = 'calc(100% - 92px)';
    toggleBars.classList.add('d-none');
    toggleArrow.classList.remove('d-none');
  } else {
    // Sidebar açıq vəziyyət
    sidebar.style.display = 'flex';
    responsiveSidebar.style.display = 'none';
    navbar.style.width = 'calc(100% - 245px)';
    slot.style.width = 'calc(100% - 245px)';
    toggleArrow.classList.add('d-none');
    toggleBars.classList.remove('d-none');
  }
});

// Sidebar bağlı vəziyyətə keçid
toggleBars.addEventListener('click', () => {
  sidebar.style.display = 'none';
  responsiveSidebar.style.display = 'flex';
  navbar.style.width = 'calc(100% - 92px)';
  slot.style.width = 'calc(100% - 92px)';
  toggleBars.classList.add('d-none');
  toggleArrow.classList.remove('d-none');

  // Vəziyyəti yadda saxlayırıq
  localStorage.setItem('isSidebarClosed', 'true');
});

// Sidebar açıq vəziyyətə keçid
toggleArrow.addEventListener('click', () => {
  sidebar.style.display = 'flex';
  responsiveSidebar.style.display = 'none';
  navbar.style.width = 'calc(100% - 245px)';
  slot.style.width = 'calc(100% - 245px)';
  toggleArrow.classList.add('d-none');
  toggleBars.classList.remove('d-none');

  // Vəziyyəti yadda saxlayırıq
  localStorage.setItem('isSidebarClosed', 'false');
});


// navbar user chevron dropdown menu toggle 
document.addEventListener("DOMContentLoaded", function () {
  const dropdownToggle = document.querySelector(".user-dropdown-menu-main .fa-chevron-down");
  const dropdownMenu = document.querySelector(".user-dropdown-menu");

  dropdownToggle.addEventListener("click", function () {
    // Dropdown açılıbsa bağlanır, bağlıdırsa açılır
    if (dropdownMenu.classList.contains("show")) {
      dropdownMenu.classList.remove("show");
    } else {
      dropdownMenu.classList.add("show");
    }
  });

  // Səhifədə başqa bir yerə klik edilərsə, menyunu bağla
  document.addEventListener("click", function (event) {
    if (!dropdownToggle.contains(event.target) && !dropdownMenu.contains(event.target)) {
      dropdownMenu.classList.remove("show");
    }
  });
});
  

// sidebar active 
document.querySelectorAll(".route").forEach((route) => {
  route.addEventListener("click", function () {
    document
      .querySelectorAll(".route")
      .forEach((item) => item.classList.remove("active")); // Aktiv sinifi sil
    this.classList.add("active"); // Yeni sinifi əlavə et
  });
});