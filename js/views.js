/**
 * View-related functions for the Earnings Calendar app
 */
const Views = {
  // Concurrency control
  fetchId: 0,
  fetchWeekId: 0,
  
  /**
   * Set calendar buttons visibility
   * @param {boolean} showDayButtons - Whether to show day buttons
   */
  setCalendarButtonsVisibility(showDayButtons) {
    const calendarWeekDiv = document.getElementById('calendarWeek');
    calendarWeekDiv.style.display = showDayButtons ? 'flex' : 'none';
  },
  
  /**
   * Render calendar week buttons
   * @param {Array} dates - Array of dates to render
   * @param {Date} selectedDay - Currently selected day
   * @param {Function} onDaySelect - Callback for day selection
   */
  renderCalendarWeek(dates, selectedDay, onDaySelect) {
    const calendarWeek = document.getElementById('calendarWeek');
    calendarWeek.innerHTML = '';
    
    dates.forEach((date) => {
      const div = document.createElement('div');
      div.innerHTML = Utils.formatDateForButton(date);
      
      if (Utils.formatDate(date) === Utils.formatDate(selectedDay)) {
        div.classList.add('active');
      }
      
      div.addEventListener('click', () => {
        onDaySelect(date);
      });
      
      calendarWeek.appendChild(div);
    });
  },
  
  /**
   * Render day view with earnings data
   * @param {Date} date - Date to render
   * @param {Function} onComplete - Callback when rendering is complete
   */
  async renderDayView(date, onComplete = () => {}) {
    const myId = ++this.fetchId;
    Utils.showLoadingOverlay();
    
    const stocksContainer = document.getElementById('stocks');
    const selectedDayHeader = document.getElementById('selectedDay');
    const symbolList = document.getElementById('symbolList');
    
    symbolList.innerHTML = '';
    selectedDayHeader.textContent = Utils.formatDateForSelected(date);
    
    try {
      const data = await API.fetchDailyEarnings(date);
      if (myId !== this.fetchId) return;
      
      const earnings = data.earningsCalendar || [];
      stocksContainer.innerHTML = '';
      
      if (earnings.length === 0) {
        stocksContainer.innerHTML = '<p>No data available for the selected date.</p>';
        return;
      }
      
      // Create symbol list
      for (const earning of earnings) {
        if (myId !== this.fetchId) return;
        
        const symbolItem = document.createElement('a');
        symbolItem.href = `#stock-${earning.symbol}`;
        symbolItem.textContent = earning.symbol;
        symbolList.appendChild(symbolItem);
      }
      
      // Create stock cards
      for (const earning of earnings) {
        if (myId !== this.fetchId) return;
        
        const profile = await API.fetchCompanyProfile(earning.symbol);
        if (myId !== this.fetchId) return;
        
        let hourIcon = '';
        const hour = earning.hour?.toLowerCase() || '';
        if (hour === 'bmo') hourIcon = '☀';
        else if (hour === 'amc') hourIcon = '🌙';
        
        // Handle missing/broken logos with an onerror fallback
        const imgSrc = profile?.logo || 'https://via.placeholder.com/50';
        
        const stockDiv = document.createElement('div');
        stockDiv.classList.add('stock');
        stockDiv.id = `stock-${earning.symbol}`;
        
        // Create image element separately for better control
        const img = document.createElement('img');
        img.alt = earning.symbol;
        img.onerror = function() {
          this.onerror = null;
          this.src = 'https://via.placeholder.com/50';
        };
        img.src = imgSrc;
        
        stockDiv.appendChild(img);
        // Create details div
        const detailsDiv = document.createElement('div');
        detailsDiv.className = 'details';
        
        // Symbol and name
        const symbolSpan = document.createElement('span');
        symbolSpan.className = 'symbol';
        symbolSpan.textContent = `${earning.symbol || 'N/A'} - ${profile?.name || 'N/A'}`;
        detailsDiv.appendChild(symbolSpan);
        
        // Description
        const descSpan = document.createElement('span');
        descSpan.textContent = profile?.description || '';
        detailsDiv.appendChild(descSpan);
        
        // EPS
        const epsSpan = document.createElement('span');
        const epsStrong = document.createElement('strong');
        epsStrong.textContent = 'Expected EPS: ';
        epsSpan.appendChild(epsStrong);
        epsSpan.appendChild(document.createTextNode(earning.epsEstimate ?? 'N/A'));
        detailsDiv.appendChild(epsSpan);
        
        // Revenue
        const revSpan = document.createElement('span');
        const revStrong = document.createElement('strong');
        revStrong.textContent = 'Expected Revenue: ';
        revSpan.appendChild(revStrong);
        revSpan.appendChild(document.createTextNode(earning.revenueEstimate ?? 'N/A'));
        detailsDiv.appendChild(revSpan);
        
        stockDiv.appendChild(detailsDiv);
        
        // Add hour icon if present
        if (hourIcon) {
          const iconSpan = document.createElement('span');
          iconSpan.className = 'market-icon';
          iconSpan.textContent = hourIcon;
          stockDiv.appendChild(iconSpan);
        }
        
        stocksContainer.appendChild(stockDiv);
      }
    } catch (error) {
      if (myId === this.fetchId) {
        alert('Error fetching data: ' + error.message);
      }
    } finally {
      if (myId === this.fetchId) {
        Utils.hideLoadingOverlay();
        onComplete();
      }
    }
  },
  
  /**
   * Render week view with earnings data (symbol-only, no images)
   * @param {Date} weekStart - Week start date
   * @param {Function} onComplete - Callback when rendering is complete
   */
  async renderWeekView(weekStart, onComplete = () => {}) {
    const myId = ++this.fetchWeekId;
    Utils.showLoadingOverlay();
    
    try {
      // Get weekdays (Mon-Fri)
      const weekDates = Utils.getWeekDates(weekStart);
      const fromDate = weekDates[0];
      const toDate = weekDates[4];
      
      // Render headers
      const weeklyContainer = document.getElementById('weeklyContainer');
      weeklyContainer.innerHTML = '';
      
      // Create column headers and containers
      weekDates.forEach((date, index) => {
        if (myId !== this.fetchWeekId) return;
        
        const colDiv = document.createElement('div');
        colDiv.className = 'day-col';
        
        const headerDiv = document.createElement('div');
        headerDiv.className = 'day-header';
        headerDiv.textContent = Utils.formatDateForWeekHeader(date);
        
        const stocksDiv = document.createElement('div');
        stocksDiv.className = 'week-stocks';
        stocksDiv.id = `weekCol${index}`;
        
        colDiv.appendChild(headerDiv);
        colDiv.appendChild(stocksDiv);
        weeklyContainer.appendChild(colDiv);
      });
      
      // Fetch weekly earnings data
      const data = await API.fetchWeeklyEarnings(fromDate, toDate);
      if (myId !== this.fetchWeekId) return;
      
      const earnings = data.earningsCalendar || [];
      
      if (earnings.length === 0) {
        const noDataDiv = document.createElement('div');
        noDataDiv.className = 'no-data';
        noDataDiv.textContent = 'No earnings data available for this week.';
        weeklyContainer.appendChild(noDataDiv);
        return;
      }
      
      // Group earnings by date
      const earningsByDate = Array(5).fill().map(() => []);
      
      earnings.forEach(earning => {
        const date = new Date(earning.date);
        const day = date.getDay() - 1; // 0 = Monday, 4 = Friday
        
        if (day >= 0 && day <= 4) {
          earningsByDate[day].push(earning);
        }
      });
      
      // Render the earnings with symbols only (no images)
      if (myId === this.fetchWeekId) {
        this.renderEarningsWithPlaceholders(weekDates, earningsByDate, myId);
      }
      
      Utils.hideLoadingOverlay();
      onComplete();
    } catch (error) {
      console.error('Error rendering week view:', error);
      if (myId === this.fetchWeekId) {
        alert('Error fetching weekly data: ' + error.message);
      }
      Utils.hideLoadingOverlay();
      onComplete();
    }
  }
  },
  
  /**
   * Show day view
   */
  showDayView() {
    document.getElementById('dayView').style.display = 'block';
    document.getElementById('weekView').style.display = 'none';
  },
  
  /**
   * Show week view
   */
  showWeekView() {
    document.getElementById('dayView').style.display = 'none';
    document.getElementById('weekView').style.display = 'block';
  },
  
  /**
   * Check if day view is visible
   * @returns {boolean} Whether day view is visible
   */
  isDayViewVisible() {
    return document.getElementById('dayView').style.display !== 'none';
  },
  
  /**
   * Check if week view is visible
   * @returns {boolean} Whether week view is visible
   */
  isWeekViewVisible() {
    return document.getElementById('weekView').style.display === 'block';
  },
  
  /**
   * Render earnings without images - only symbols
   * @param {Array} weekDates - Array of dates for the week
   * @param {Object} earningsByDate - Object mapping column index to earnings array
   * @param {number} myId - Current fetch ID to prevent race conditions
   */
  renderEarningsWithPlaceholders(weekDates, earningsByDate, myId) {
    weekDates.forEach((date, colIndex) => {
      if (myId !== this.fetchWeekId) return;

      const dayEarnings = earningsByDate[colIndex] || [];
      const container = document.getElementById(`weekCol${colIndex}`);
      if (!container) {
        console.error(`Container weekCol${colIndex} not found`);
        return;
      }

      // Clear any existing content
      container.innerHTML = '';

      dayEarnings.forEach(earning => {
        let hourIcon = '';
        const hour = earning.hour?.toLowerCase() || '';
        if (hour === 'bmo') hourIcon = '☀';
        else if (hour === 'amc') hourIcon = '🌙';
        
        const div = document.createElement('div');
        div.classList.add('week-stock-bubble');
        div.dataset.symbol = earning.symbol; // Keep symbol in dataset for consistency
        
        // Symbol display - make it more prominent since we removed images
        const symbolSpan = document.createElement('span');
        symbolSpan.className = 'week-symbol';
        symbolSpan.textContent = earning.symbol;
        
        div.appendChild(symbolSpan);
        
        if (hourIcon) {
          const iconSpan = document.createElement('span');
          iconSpan.className = 'week-market-icon';
          iconSpan.textContent = hourIcon;
          div.appendChild(iconSpan);
        }
        
        container.appendChild(div);
      });
    });
  },
  
  /**
   * Set up listener for batch progress events
   * @param {number} myId - Current fetch ID
   */
  setupBatchProgressListener(myId) {
    // Remove any existing listener
    if (this._batchProgressHandler) {
      window.removeEventListener('api-batch-progress', this._batchProgressHandler);
    }
    
    // Create new handler
    this._batchProgressHandler = (event) => {
      if (myId !== this.fetchWeekId) return;
      
      const { processedSymbols, totalSymbols, remainingBatches } = event.detail;
      console.log(`Batch progress: ${processedSymbols}/${totalSymbols} symbols processed, ${remainingBatches} batches remaining`);
      
      // Update the progress indicator
      this.updateProgressIndicator(processedSymbols, totalSymbols, remainingBatches);
      
      // Update images for symbols processed so far
      this.updateImagesFromCache(null, null, myId);
    };
    
    // Add the listener
    window.addEventListener('api-batch-progress', this._batchProgressHandler);
  },
  
  /**
   * Create progress indicator for image loading
   * @param {number} totalImages - Total number of images to load
   */
  createProgressIndicator(totalImages) {
    // First remove any existing indicator
    const existingIndicator = document.getElementById('batchProgressIndicator');
    if (existingIndicator) existingIndicator.remove();
    
    // Create container
    const progressContainer = document.createElement('div');
    progressContainer.id = 'batchProgressIndicator';
    progressContainer.className = 'batch-progress-indicator';
    
    // Create progress bar
    const progressBar = document.createElement('div');
    progressBar.className = 'progress-bar';
    
    // Create progress fill
    const progressFill = document.createElement('div');
    progressFill.className = 'progress-fill';
    progressFill.style.width = '0%';
    
    // Create text
    const progressText = document.createElement('div');
    progressText.className = 'progress-text';
    progressText.textContent = `Loading company logos: 0/${totalImages} (0%)`;
    
    // Assemble
    progressBar.appendChild(progressFill);
    progressContainer.appendChild(progressBar);
    progressContainer.appendChild(progressText);
    
    // Add to the page
    document.getElementById('weeklyContainer').appendChild(progressContainer);
  },
  
  /**
   * Update progress indicator
   * @param {number} processed - Number of images processed
   * @param {number} total - Total number of images
   * @param {number} remainingBatches - Number of batches still to process
   */
  updateProgressIndicator(processed, total, remainingBatches) {
    const container = document.getElementById('batchProgressIndicator');
    if (!container) return;
    
    const percent = Math.round((processed / total) * 100);
    const fill = container.querySelector('.progress-fill');
    const text = container.querySelector('.progress-text');
    
    if (fill) fill.style.width = `${percent}%`;
    if (text) {
      if (remainingBatches > 0) {
        text.textContent = `Loading company logos: ${processed}/${total} (${percent}%) - ${remainingBatches} batches remaining`;
      } else {
        text.textContent = `Loaded ${processed}/${total} company logos (${percent}%)`;
      }
    }
    
    // If all done, add a completion class
    if (percent === 100) {
      container.classList.add('complete');
      setTimeout(() => {
        container.classList.add('fade-out');
        setTimeout(() => container.remove(), 1000);
      }, 2000);
    }
  },
  
  /**
   * Update images from cache as they become available
   * @param {Array} weekDates - Array of dates for the week (can be null for batch updates)
   * @param {Object} earningsByDate - Object mapping column index to earnings array (can be null)
   * @param {number} myId - Current fetch ID to prevent race conditions
   */
  updateImagesFromCache(weekDates, earningsByDate, myId) {
    if (myId !== this.fetchWeekId) return;
    
    // Skip week view bubbles - we don't display images in the week view anymore
    // Only process day view images
    if (document.getElementById('weekView').style.display !== 'none') {
      // We're in week view, so don't process any images
      return;
    }
    
    // Only process day view images if needed in the future
    const bubbles = document.querySelectorAll('.stock');
    bubbles.forEach(bubble => {
      const img = bubble.querySelector('img');
      if (!img) return;
      
      const symbol = bubble.id.replace('stock-', '');
      if (!symbol) return;
      
      const profile = API.profileCache[symbol] || {};
      
      if (profile && profile.logo) {
        if (img.src !== profile.logo) {
          // Only update if the image source is different
          img.classList.remove('loading-image');
          img.onerror = function() {
            this.onerror = null;
            this.src = 'https://via.placeholder.com/50?text=' + encodeURIComponent(symbol);
          };
          img.src = profile.logo;
        }
      } else if (img.classList.contains('loading-image')) {
        // If no logo available, update placeholder to final state
        img.classList.remove('loading-image');
      }
    });
  
  }
};
