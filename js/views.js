// View rendering functions

// Render day buttons for day view
function renderCalendarWeek(dates) {
  const calendarWeek = document.getElementById('calendarWeek');
  calendarWeek.innerHTML = '';
  dates.forEach((date) => {
    const div = document.createElement('div');
    div.innerHTML = formatDateForButton(date);
    if (formatDate(date) === formatDate(selectedDay)) {
      div.classList.add('active');
    }
    div.addEventListener('click', () => {
      selectedDay = new Date(date);
      renderCalendarWeek(dates);
      fetchEarnings(selectedDay);
    });
    calendarWeek.appendChild(div);
  });
}

// Update week view based on week start date
function updateWeekView() {
  setCalendarButtonsVisibility(false);
  fetchWeeklyEarnings();
}

// Update day view based on selected day
function updateDayView() {
  const weekDates = getWeekDates(currentWeekStart);
  setCalendarButtonsVisibility(true);
  renderCalendarWeek(weekDates);
  fetchEarnings(selectedDay);
}
