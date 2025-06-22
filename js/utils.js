/**
 * Utility functions for the Earnings Calendar app
 */
const Utils = {
  // Date constants
  days: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
  monthsShort: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
  
  /**
   * Show loading overlay
   */
  showLoadingOverlay() {
    document.getElementById('loadingOverlay').classList.add('active');
  },
  
  /**
   * Hide loading overlay
   */
  hideLoadingOverlay() {
    document.getElementById('loadingOverlay').classList.remove('active');
  },
  
  /**
   * Format date as YYYY-MM-DD
   * @param {Date} date - Date to format
   * @returns {string} Formatted date string
   */
  formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  },
  
  /**
   * Format date for calendar button (e.g. Monday <br> 01/10)
   * @param {Date} date - Date to format
   * @returns {string} Formatted date string with HTML
   */
  formatDateForButton(date) {
    const dayName = this.days[date.getDay()];
    const dd = String(date.getDate()).padStart(2, '0');
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    return `${dayName}<br>${mm}/${dd}`;
  },
  
  /**
   * Format date for selected day heading (e.g. "Friday - Jan 10, 2025")
   * @param {Date} date - Date to format
   * @returns {string} Formatted date string
   */
  formatDateForSelected(date) {
    const dayName = this.days[date.getDay()];
    const dd = date.getDate();
    const mmShort = this.monthsShort[date.getMonth()];
    const yyyy = date.getFullYear();
    return `${dayName} - ${mmShort} ${dd}, ${yyyy}`;
  },
  
  /**
   * Format date for week header (e.g. "Monday 01/10")
   * @param {Date} date - Date to format
   * @returns {string} Formatted date string
   */
  formatDateForWeekHeader(date) {
    const dayName = this.days[date.getDay()];
    const dd = String(date.getDate()).padStart(2, '0');
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    return `${dayName} ${mm}/${dd}`;
  },
  
  /**
   * Get 5 weekdays (Mon-Fri) starting from the given date
   * @param {Date} startDate - Starting date
   * @returns {Array} Array of 5 Date objects
   */
  getWeekDates(startDate) {
    const current = new Date(startDate);
    current.setHours(0, 0, 0, 0);

    // Calculate the difference to get to the previous Monday.
    // dayOfWeek is 0 for Sunday, 1 for Monday, etc.
    const dayOfWeek = current.getDay();
    const diff = current.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
    const monday = new Date(current.setDate(diff));

    // Get 5 weekdays (Monday to Friday)
    const dates = [];
    for (let i = 0; i < 5; i++) {
      const date = new Date(monday);
      date.setDate(monday.getDate() + i);
      dates.push(date);
    }
    return dates;
  }
};
