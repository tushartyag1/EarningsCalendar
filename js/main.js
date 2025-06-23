// Event listeners and initialization

// Theme toggle functionality
document.getElementById('themeToggle').addEventListener('change', function() {
  if (this.checked) {
    document.body.classList.add(DARK_THEME);
    localStorage.setItem(THEME_KEY, DARK_THEME);
    currentTheme = DARK_THEME;
  } else {
    document.body.classList.remove(DARK_THEME);
    localStorage.setItem(THEME_KEY, LIGHT_THEME);
    currentTheme = LIGHT_THEME;
  }
});

// Initialize theme based on saved preference or default to dark theme
function initializeTheme() {
  // If no theme is saved, or if the saved theme is not dark, default to dark mode
  if (!localStorage.getItem(THEME_KEY) || currentTheme !== DARK_THEME) {
    document.body.classList.add(DARK_THEME);
    document.getElementById('themeToggle').checked = true;
    localStorage.setItem(THEME_KEY, DARK_THEME);
    currentTheme = DARK_THEME;
  } else if (currentTheme === DARK_THEME) {
    document.body.classList.add(DARK_THEME);
    document.getElementById('themeToggle').checked = true;
  }
}

// Prev week button
document.getElementById('prevWeek').addEventListener('click', () => {
  const testDate = new Date(currentWeekStart);
  testDate.setDate(testDate.getDate() - 7);
  if (testDate < maxDateBackward) return;

  currentWeekStart = testDate;
  const weekDates = getWeekDates(currentWeekStart);
  if (dayViewVisible()) {
    setCalendarButtonsVisibility(true);
    renderCalendarWeek(weekDates);
    selectedDay = weekDates[0];
    fetchEarnings(selectedDay);
  }
  if (weekViewVisible()) {
    setCalendarButtonsVisibility(false);
    fetchWeeklyEarnings();
  }
});

// Next week button
document.getElementById('nextWeek').addEventListener('click', () => {
  const testDate = new Date(currentWeekStart);
  testDate.setDate(testDate.getDate() + 7);
  if (testDate > maxDateForward) return;

  currentWeekStart = testDate;
  const weekDates = getWeekDates(currentWeekStart);
  if (dayViewVisible()) {
    setCalendarButtonsVisibility(true);
    renderCalendarWeek(weekDates);
    selectedDay = weekDates[0];
    fetchEarnings(selectedDay);
  }
  if (weekViewVisible()) {
    setCalendarButtonsVisibility(false);
    fetchWeeklyEarnings();
  }
});

// Toggle Day View
document.getElementById('dayViewBtn').addEventListener('click', () => {
  document.getElementById('dayView').style.display = 'block';
  document.getElementById('weekView').style.display = 'none';
  setCalendarButtonsVisibility(true);
  fetchEarnings(selectedDay);
});

// Toggle Week View
document.getElementById('weekViewBtn').addEventListener('click', () => {
  document.getElementById('dayView').style.display = 'none';
  document.getElementById('weekView').style.display = 'block';
  setCalendarButtonsVisibility(false);
  fetchWeeklyEarnings();
});

// Initialize Day View by default
(function init() {
  document.getElementById('dayView').style.display = 'block';
  document.getElementById('weekView').style.display = 'none';
  setCalendarButtonsVisibility(true);

  const initialWeekDates = getWeekDates(currentWeekStart);
  renderCalendarWeek(initialWeekDates);
  fetchEarnings(selectedDay);
  
  // Apply saved theme preference
  initializeTheme();
})();
