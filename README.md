# Earnings Calendar

A web application that displays company earnings reports and schedules using the Finnhub API. The application allows users to view earnings data in both daily and weekly formats.

## Features

- **Day View**: Displays detailed company earnings information for a selected day
- **Week View**: Provides a weekly overview of company earnings
- **Navigation**: Easily move between weeks to explore past and upcoming earnings
- **Responsive Design**: Works on both desktop and mobile devices

## Technologies Used

- HTML5
- CSS3 (with responsive design)
- Vanilla JavaScript (ES6+)
- Finnhub API for financial data

## Project Structure

```
EarningsCalendar/
├── css/
│   └── styles.css
├── js/
│   ├── api.js      - API interaction functions
│   ├── config.js   - API key and configuration
│   ├── main.js     - Event listeners and initialization
│   ├── utils.js    - Utility functions
│   └── views.js    - UI rendering functions
├── index.html
└── README.md
```

## Setup and Usage

1. Clone this repository
2. Open `index.html` in a web browser
   - For best results, use a local server (e.g., `python -m http.server 8080`)
   - Navigate to `http://localhost:8080` in your browser

## API Key

The application uses a Finnhub API key for fetching financial data. The key is configured in `js/config.js`.

To use your own API key:
1. Sign up at [Finnhub.io](https://finnhub.io/) to get a free API key
2. Replace the existing key in `js/config.js` with your own key

## Features

### Day View
- Displays earnings announcements for a specific day
- Shows company logos, descriptions, expected EPS, and expected revenue
- Indicates morning (☀) or afternoon (🌙) earnings reports

### Week View
- Provides a weekly overview of earnings announcements
- Organizes companies by weekday (Monday through Friday)
- Indicates morning (☀) or afternoon (🌙) earnings reports

## License

This project is licensed under the MIT License - see the LICENSE file for details.
