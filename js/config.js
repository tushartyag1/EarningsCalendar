// API key and configuration
const apiKey = 'cu0c59pr01ql96gq8rrgcu0c59pr01ql96gq8rs0';

// Grab today's date
const today = new Date();
today.setDate(today.getDate() - 1);

// Date bounds (1 month before/after)
const maxDateBackward = new Date(today);
maxDateBackward.setMonth(maxDateBackward.getMonth() - 1);
const maxDateForward = new Date(today);
maxDateForward.setMonth(maxDateForward.getMonth() + 1);

// Initial state
let currentWeekStart = new Date(today);
let selectedDay = new Date(today);

// Concurrency controls
let fetchId = 0;     // concurrency for day
let fetchWeekId = 0; // concurrency for week

// Day and month names
const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const monthsShort = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", 
                     "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
