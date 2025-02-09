const sidebar = document.getElementById('sidebar');
const responsiveSidebar = document.getElementById('responsive-sidebar');
const navbar = document.getElementById('navbar');
const slot = document.getElementById('slot');
const toggleBars = document.querySelector('.fa-bars');
const toggleArrow = document.querySelector('.fa-arrow-right');

document.addEventListener('DOMContentLoaded', () => {
  const isSidebarClosed = localStorage.getItem('isSidebarClosed') === 'true';

  if (isSidebarClosed) {
    sidebar.style.display = 'none';
    responsiveSidebar.style.display = 'flex';
    navbar.style.width = 'calc(100% - 92px)';
    slot.style.width = 'calc(100% - 92px)';
    toggleBars.classList.add('d-none');
    toggleArrow.classList.remove('d-none');
  } else {
    sidebar.style.display = 'flex';
    responsiveSidebar.style.display = 'none';
    navbar.style.width = 'calc(100% - 245px)';
    slot.style.width = 'calc(100% - 245px)';
    toggleArrow.classList.add('d-none');
    toggleBars.classList.remove('d-none');
  }
});

toggleBars.addEventListener('click', () => {
  sidebar.style.display = 'none';
  responsiveSidebar.style.display = 'flex';
  navbar.style.width = 'calc(100% - 92px)';
  slot.style.width = 'calc(100% - 92px)';
  toggleBars.classList.add('d-none');
  toggleArrow.classList.remove('d-none');

  localStorage.setItem('isSidebarClosed', 'true');
});

toggleArrow.addEventListener('click', () => {
  sidebar.style.display = 'flex';
  responsiveSidebar.style.display = 'none';
  navbar.style.width = 'calc(100% - 245px)';
  slot.style.width = 'calc(100% - 245px)';
  toggleArrow.classList.add('d-none');
  toggleBars.classList.remove('d-none');

  localStorage.setItem('isSidebarClosed', 'false');
});


document.addEventListener("DOMContentLoaded", function () {
  const dropdownToggle = document.querySelector(".user-dropdown-menu-main .fa-chevron-down");
  const dropdownMenu = document.querySelector(".user-dropdown-menu");

  dropdownToggle.addEventListener("click", function () {
    if (dropdownMenu.classList.contains("show")) {
      dropdownMenu.classList.remove("show");
    } else {
      dropdownMenu.classList.add("show");
    }
  });

  document.addEventListener("click", function (event) {
    if (!dropdownToggle.contains(event.target) && !dropdownMenu.contains(event.target)) {
      dropdownMenu.classList.remove("show");
    }
  });
});
  