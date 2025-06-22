// Event listeners and initialization

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
})();
