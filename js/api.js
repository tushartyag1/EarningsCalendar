// API functions for fetching data

// Fetch a single company profile
async function fetchCompanyProfile(symbol) {
  try {
    const response = await fetch(
      `https://finnhub.io/api/v1/stock/profile2?symbol=${symbol}&token=${apiKey}`
    );
    if (!response.ok) {
      throw new Error('Failed to fetch company profile');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching company profile:', error);
    return null;
  }
}

// Fetch earnings for a specific day
async function fetchEarnings(date) {
  const myId = ++fetchId;
  showLoadingOverlay();

  const stocksContainer = document.getElementById('stocks');
  const selectedDayHeader = document.getElementById('selectedDay');
  const symbolList = document.getElementById('symbolList');
  symbolList.innerHTML = '';
  selectedDayHeader.textContent = formatDateForSelected(date);

  try {
    const response = await fetch(
      `https://finnhub.io/api/v1/calendar/earnings?from=${formatDate(date)}&to=${formatDate(date)}&token=${apiKey}`
    );
    if (!response.ok) {
      throw new Error('Failed to fetch data');
    }
    if (myId !== fetchId) return;

    const data = await response.json();
    const earnings = data.earningsCalendar || [];
    stocksContainer.innerHTML = '';

    if (earnings.length === 0) {
      stocksContainer.innerHTML = '<p>No earnings today.</p>';
      return;
    }

    for (const earning of earnings) {
      if (myId !== fetchId) return;
      const symbolItem = document.createElement('a');
      symbolItem.href = `#stock-${earning.symbol}`;
      symbolItem.textContent = earning.symbol;
      symbolList.appendChild(symbolItem);
    }

    for (const earning of earnings) {
      if (myId !== fetchId) return;
      const profile = await fetchCompanyProfile(earning.symbol);
      if (myId !== fetchId) return;

      let hourIcon = '';
      const hour = earning.hour?.toLowerCase() || '';
      if (hour === 'bmo') hourIcon = '☀';
      else if (hour === 'amc') hourIcon = '🌙';

      // Handle missing/broken logos with an onerror fallback
      const imgSrc = profile?.logo || 'https://via.placeholder.com/50';

      const stockDiv = document.createElement('div');
      stockDiv.classList.add('stock');
      stockDiv.id = `stock-${earning.symbol}`;

      stockDiv.innerHTML = `
        <img 
          src="${imgSrc}" 
          alt="${earning.symbol}"
          onerror="this.onerror=null; this.src='https://via.placeholder.com/50';"
        />
        <div class="details">
          <span class="symbol">
            ${earning.symbol || 'N/A'} - ${profile?.name || 'N/A'}
          </span>
          <span>
            ${profile?.description || ''}
          </span>
          <span>
            <strong>Expected EPS:</strong> 
            ${earning.epsEstimate ?? 'N/A'}
          </span>
          <span>
            <strong>Expected Revenue:</strong> 
            ${earning.revenueEstimate ?? 'N/A'}
          </span>
        </div>
        ${hourIcon ? `<span class="market-icon">${hourIcon}</span>` : ''}
      `;
      stocksContainer.appendChild(stockDiv);
    }
  } catch (error) {
    if (myId === fetchId) {
      alert('Error fetching data: ' + error.message);
    }
  } finally {
    if (myId === fetchId) {
      hideLoadingOverlay();
    }
  }
}

// Fetch earnings for an entire week
async function fetchWeeklyEarnings() {
  const myId = ++fetchWeekId;
  showLoadingOverlay();

  const weeklyContainer = document.getElementById('weeklyContainer');
  weeklyContainer.innerHTML = '';

  const weekDates = getWeekDates(new Date(currentWeekStart));
  const fromDate = formatDate(weekDates[0]);
  const toDate = formatDate(weekDates[4]);

  // Create 5 columns
  weekDates.forEach((d, i) => {
    const colDiv = document.createElement('div');
    colDiv.classList.add('day-col');
    
    const heading = document.createElement('h3');
    heading.textContent = formatDateForWeekHeader(d);

    colDiv.appendChild(heading);
    colDiv.id = `weekCol${i}`;
    weeklyContainer.appendChild(colDiv);
  });

  try {
    const response = await fetch(
      `https://finnhub.io/api/v1/calendar/earnings?from=${fromDate}&to=${toDate}&token=${apiKey}`
    );
    if (!response.ok) {
      throw new Error('Failed to fetch weekly data');
    }
    if (myId !== fetchWeekId) return;

    const data = await response.json();
    const earnings = data.earningsCalendar || [];

    // date => col index
    const dateMap = {};
    weekDates.forEach((d, i) => {
      dateMap[formatDate(d)] = i;
    });

    for (const earning of earnings) {
      if (myId !== fetchWeekId) return;
      
      const colIndex = dateMap[earning.date];
      if (colIndex === undefined) continue;

      let hourIcon = '';
      const hour = earning.hour?.toLowerCase() || '';
      if (hour === 'bmo') hourIcon = '☀';
      else if (hour === 'amc') hourIcon = '🌙';
      const div = document.createElement('div');
      div.classList.add('week-stock-bubble');
      div.dataset.symbol = earning.symbol; // Keep symbol in dataset for consistency
      div.innerHTML = `
        <span class="week-symbol">${earning.symbol}</span>
        ${hourIcon ? `<span class="week-market-icon">${hourIcon}</span>` : ''}
      `;

      document.getElementById(`weekCol${colIndex}`).appendChild(div);
    }
  } catch (error) {
    if (myId === fetchWeekId) {
      alert('Error fetching weekly data: ' + error.message);
    }
  } finally {
    if (myId === fetchWeekId) {
      hideLoadingOverlay();
    }
  }
}
