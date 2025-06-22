# Earnings Calendar

A modern web application that displays upcoming company earnings reports using the Finnhub API.

## Project Structure

The project has been restructured into a more organized format following software engineering best practices:

```
EarningsCalendar/
├── index.html           # Main HTML file
├── css/
│   └── styles.css       # Styles for the application
├── js/
│   ├── config.js        # Configuration settings and API key
│   ├── utils.js         # Utility functions for date formatting, etc.
│   ├── api.js           # API interaction functions
│   ├── views.js         # View rendering functions
│   └── app.js           # Main application logic
├── images/              # Directory for any images (currently empty)
└── README.md            # Project documentation
```

## Features

- View earnings reports by day or week
- Navigate between weeks
- See company details including logos, descriptions, and earnings estimates
- Responsive design that works on mobile and desktop

## How to Run

1. Simply serve the project directory with any HTTP server
2. Open the index.html file in a web browser

## API

This application uses the Finnhub API to fetch earnings data. The API key is configured in `js/config.js`.

## Browser Compatibility

The application is compatible with all modern browsers including:
- Chrome
- Firefox
- Safari
- Edge
