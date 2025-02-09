document.addEventListener("DOMContentLoaded", function () {
  const globalCheckbox = document.getElementById("global-checkbox");
  const rowCheckboxes = document.querySelectorAll(".row-checkbox");
  const exportBtn = document.getElementById("export-btn");
  const searchInput = document.getElementById("search-input");
  const paginationButtons = document.querySelectorAll(".page-btn");

  let allSelected = false;
  let selectedIds = new Set();

  globalCheckbox.addEventListener("change", function () {
    if (this.checked) {
      allSelected = true;
      rowCheckboxes.forEach((cb) => {
        cb.checked = true;
      });
    } else {
      allSelected = false;
      rowCheckboxes.forEach((cb) => {
        cb.checked = false;
      });
      selectedIds.clear();
    }
  });

  rowCheckboxes.forEach((cb) => {
    cb.addEventListener("change", function () {
      if (!this.checked) {
        globalCheckbox.checked = false;
        allSelected = false;
        selectedIds.delete(this.getAttribute("data-id"));
      } else {
        selectedIds.add(this.getAttribute("data-id"));
      }
    });
  });

  exportBtn.addEventListener("click", function () {
    const searchQuery = searchInput.value;
    let exportUrl = "/api/excel/export/?";
    if (globalCheckbox.checked) {
      exportUrl += "search=" + encodeURIComponent(searchQuery);
    } else {
      if (selectedIds.size === 0) {
        alert(
          "Zəhmət olmasa ixrac etmək üçün ən azı bir sətir seçin və ya ümumi checkboxu işarələyin."
        );
        return;
      }
      exportUrl += "ids=" + Array.from(selectedIds).join(",");
    }
    window.location.href = exportUrl;
  });

  searchInput.addEventListener("keydown", function (e) {
    if (e.key === "Enter") {
      const query = searchInput.value;
      const url = new URL(window.location.href);
      url.searchParams.set("search", query);
      url.searchParams.set("page", 1);
      window.location.href = url.toString();
    }
  });

  paginationButtons.forEach((btn) => {
    btn.addEventListener("click", function () {
      const page = this.getAttribute("data-page");
      const url = new URL(window.location.href);
      url.searchParams.set("page", page);
      window.location.href = url.toString();
    });
  });
});
