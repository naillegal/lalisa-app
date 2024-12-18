// Handle toggle-status buttons
document.querySelectorAll('.toggle-status').forEach(button => {
    button.addEventListener('click', function () {
        this.classList.toggle('active');
    });
});

// Select necessary elements
const activityTimeBtn = document.querySelector('.activity-time');
const activityTimePopup = document.querySelector('.activity-time-popup');
const overlay = document.getElementById('overlay');
const activityTimePopupMonthBtn = document.querySelector('.activity-time-popup-month');
const activityTimePopupInfinityBtn = document.querySelector('.activity-time-popup-infinity');
const withTimeBtn = document.querySelector('.with-time');
const infinityBtn = document.querySelector('.infinity');

// Initially hide 'with-time' and 'infinity' buttons
withTimeBtn.style.display = 'none';
infinityBtn.style.display = 'none';

// Function to show the popup and overlay
function showPopup() {
    activityTimePopup.style.display = 'block';
    overlay.style.display = 'block';
}

// Function to hide the popup and overlay
function hidePopup() {
    activityTimePopup.style.display = 'none';
    overlay.style.display = 'none';
}

// Event listener to show popup when 'Aktivlik müddəti' button is clicked
activityTimeBtn.addEventListener('click', showPopup);

// Event listener for '1-30 gün' button inside the popup
activityTimePopupMonthBtn.addEventListener('click', function() {
    hidePopup();
    activityTimeBtn.style.display = 'none';       // Hide the original button
    withTimeBtn.style.display = 'inline-block';   // Show the 'with-time' button
    infinityBtn.style.display = 'none';           // Ensure 'infinity' button is hidden
});

// Event listener for 'Limitsiz' button inside the popup
activityTimePopupInfinityBtn.addEventListener('click', function() {
    hidePopup();
    activityTimeBtn.style.display = 'none';       // Hide the original button
    infinityBtn.style.display = 'inline-block';   // Show the 'infinity' button
    withTimeBtn.style.display = 'none';           // Ensure 'with-time' button is hidden
});

// Event listener to hide popup when clicking on the overlay
overlay.addEventListener('click', hidePopup);

// Optional: If you want to allow closing the popup by pressing the 'Esc' key
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        hidePopup();
    }
});
