// Utility functions for working with dates and UI elements

// Loading overlay control
function showLoadingOverlay() {
  document.getElementById('loadingOverlay').classList.add('active');
}

function hideLoadingOverlay() {
  document.getElementById('loadingOverlay').classList.remove('active');
}

// Format YYYY-MM-DD
function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// For the day buttons (e.g. Monday <br> 01/10)
function formatDateForButton(date) {
  const dayName = days[date.getDay()];
  const dd = String(date.getDate()).padStart(2, '0');
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  return `${dayName}<br>${mm}/${dd}`;
}

// For the selected day heading (e.g. "Friday - Jan 10, 2025")
function formatDateForSelected(date) {
  const dayName = days[date.getDay()];
  const dd = date.getDate();
  const mmShort = monthsShort[date.getMonth()];
  const yyyy = date.getFullYear();
  return `${dayName} - ${mmShort} ${dd}, ${yyyy}`;
}

// For week col headings: "Monday 01/10"
function formatDateForWeekHeader(date) {
  const dayName = days[date.getDay()];
  const dd = String(date.getDate()).padStart(2, '0');
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  return `${dayName} ${mm}/${dd}`;
}

// Get 5 weekdays (Mon-Fri)
function getWeekDates(startDate) {
  startDate = new Date(startDate); // Create a copy to avoid modifying the original
  startDate.setHours(0, 0, 0, 0);
  
  while (startDate.getDay() === 0 || startDate.getDay() === 6) {
    startDate.setDate(startDate.getDate() + 1);
  }
  
  while (startDate.getDay() !== 1) {
    startDate.setDate(startDate.getDate() - 1);
  }
  
  const dates = [];
  for (let i = 0; i < 5; i++) {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + i);
    dates.push(date);
  }
  return dates;
}

// Show/hide day buttons
function setCalendarButtonsVisibility(showDayButtons) {
  const calendarWeekDiv = document.getElementById('calendarWeek');
  calendarWeekDiv.style.display = showDayButtons ? 'flex' : 'none';
}

// View visibility checks
function dayViewVisible() {
  return document.getElementById('dayView').style.display !== 'none';
}

function weekViewVisible() {
  return document.getElementById('weekView').style.display === 'block';
}
