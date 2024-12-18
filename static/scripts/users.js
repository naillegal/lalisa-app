// Başlıq checkbox seçimi
const headerCheckbox = document.querySelector('th .custom-checkbox input[type="checkbox"]');

// Bütün satır checkbox-ları seçimi
const rowCheckboxes = document.querySelectorAll('td .custom-checkbox input[type="checkbox"]');

// Başlıq checkbox-a basıldığında funksionallıq
headerCheckbox.addEventListener('change', function () {
  const isChecked = this.checked; // Başlıq checkbox-ın seçilib-seçilmədiyini yoxla
  rowCheckboxes.forEach((checkbox) => {
    checkbox.checked = isChecked; // Hər bir satır checkbox-ını seçili hala gətir və ya çıxar
    const checkmark = checkbox.nextElementSibling;
    if (isChecked) {
      checkmark.classList.add('checked'); // Vizual effekt üçün sinif əlavə edə bilərsiniz
    } else {
      checkmark.classList.remove('checked');
    }
  });
});
