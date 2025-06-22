/**
 * Main application logic for the Earnings Calendar app
 */
class EarningsCalendarApp {
  constructor() {
    // Initialize state
    this.today = new Date();
    this.adjustForWeekend();
    
    // Date bounds (1 month before/after)
    this.maxDateBackward = new Date(this.today);
    this.maxDateBackward.setMonth(this.maxDateBackward.getMonth() - CONFIG.MAX_MONTHS_BACKWARD);
    
    this.maxDateForward = new Date(this.today);
    this.maxDateForward.setMonth(this.maxDateForward.getMonth() + CONFIG.MAX_MONTHS_FORWARD);
    
    this.currentWeekStart = new Date(this.today);
    this.selectedDay = new Date(this.today);
    
    // Initialize event listeners
    this.initEventListeners();
    
    // Initialize app
    this.init();
  }
  
  /**
   * Adjust date if it's a weekend
   */
  adjustForWeekend() {
    // If it's Saturday (6) or Sunday (0), move to the upcoming Monday
    if (this.today.getDay() === 6) {
      this.today.setDate(this.today.getDate() + 2);
    } else if (this.today.getDay() === 0) {
      this.today.setDate(this.today.getDate() + 1);
    }
  }
  
  /**
   * Initialize event listeners
   */
  initEventListeners() {
    // Previous week button
    document.getElementById('prevWeek').addEventListener('click', () => {
      this.navigateWeek(-1);
    });
    
    // Next week button
    document.getElementById('nextWeek').addEventListener('click', () => {
      this.navigateWeek(1);
    });
    
    // Day view button
    document.getElementById('dayViewBtn').addEventListener('click', () => {
      this.switchToDayView();
    });
    
    // Week view button
    document.getElementById('weekViewBtn').addEventListener('click', () => {
      this.switchToWeekView();
    });
  }
  
  /**
   * Navigate to previous or next week
   * @param {number} direction - Direction to navigate (-1 for previous, 1 for next)
   */
  navigateWeek(direction) {
    const testDate = new Date(this.currentWeekStart);
    testDate.setDate(testDate.getDate() + (7 * direction));
    
    // Check bounds
    if (direction < 0 && testDate < this.maxDateBackward) return;
    if (direction > 0 && testDate > this.maxDateForward) return;
    
    this.currentWeekStart = testDate;
    const weekDates = Utils.getWeekDates(this.currentWeekStart);
    
    if (Views.isDayViewVisible()) {
      Views.setCalendarButtonsVisibility(true);
      Views.renderCalendarWeek(weekDates, this.selectedDay, (date) => {
        this.selectedDay = date;
        Views.renderCalendarWeek(weekDates, this.selectedDay, (date) => {
          this.selectedDay = date;
          Views.renderDayView(this.selectedDay);
        });
        Views.renderDayView(this.selectedDay);
      });
      this.selectedDay = weekDates[0];
      Views.renderDayView(this.selectedDay);
    }
    
    if (Views.isWeekViewVisible()) {
      Views.setCalendarButtonsVisibility(false);
      Views.renderWeekView(this.currentWeekStart);
    }
  }
  
  /**
   * Switch to day view
   */
  switchToDayView() {
    Views.showDayView();
    Views.setCalendarButtonsVisibility(true);
    
    const weekDates = Utils.getWeekDates(this.currentWeekStart);
    Views.renderCalendarWeek(weekDates, this.selectedDay, (date) => {
      this.selectedDay = date;
      Views.renderCalendarWeek(weekDates, this.selectedDay, (date) => {
        this.selectedDay = date;
        Views.renderDayView(this.selectedDay);
      });
      Views.renderDayView(this.selectedDay);
    });
    
    Views.renderDayView(this.selectedDay);
  }
  
  /**
   * Switch to week view
   */
  switchToWeekView() {
    Views.showWeekView();
    Views.setCalendarButtonsVisibility(false);
    Views.renderWeekView(this.currentWeekStart);
  }
  
  /**
   * Initialize the app
   */
  init() {
    // Set default view
    if (CONFIG.DEFAULT_VIEW === 'day') {
      this.switchToDayView();
    } else {
      this.switchToWeekView();
    }
  }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  const app = new EarningsCalendarApp();
});
