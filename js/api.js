/**
 * API functions for the Earnings Calendar app
 */
const API = {
  // Cache for company profiles to avoid repeated API calls
  profileCache: {},
  
  // Batch processing and rate limiting configuration
  batchSize: 5,             // Process profiles in smaller batches of 5 (less likely to hit rate limits)
  batchDelayMs: 6000,       // 6 seconds between batches (allowing ~50 requests/minute)
  requestQueue: [],         // Queue for individual API requests
  batchQueue: [],           // Queue for batches of symbols
  isProcessingQueue: false, // Flag for processing individual requests
  isProcessingBatch: false, // Flag for processing batches
  currentBatchPromises: [], // Promises for the current batch
  processedSymbols: 0,      // Counter for monitoring processed symbols
  totalSymbols: 0,          // Total symbols to process in current job
  
  /**
   * Fetches company profiles in batches to respect the Finnhub API rate limit of 60 calls/minute
   * @param {Array} symbols - Array of stock symbols
   * @returns {Promise} Promise that resolves when all batches have been processed
   */
  fetchProfilesInBatches(symbols) {
    // Reset counters for monitoring
    this.processedSymbols = 0;
    this.totalSymbols = symbols.length;
    
    // Filter out symbols that are already in the cache
    const symbolsToFetch = symbols.filter(symbol => !this.profileCache[symbol]);
    
    if (symbolsToFetch.length === 0) {
      return Promise.resolve([]);
    }
    
    // Split symbols into batches
    const batches = [];
    for (let i = 0; i < symbolsToFetch.length; i += this.batchSize) {
      batches.push(symbolsToFetch.slice(i, i + this.batchSize));
    }
    
    console.log(`Splitting ${symbolsToFetch.length} profiles into ${batches.length} batches of ${this.batchSize}`);
    
    // Clear any existing queue and add new batches
    this.batchQueue = [];
    this.batchQueue.push(...batches);
    
    // Create a deferred promise that will resolve when all batches are processed
    const deferred = {};
    const promise = new Promise((resolve, reject) => {
      deferred.resolve = resolve;
      deferred.reject = reject;
    });
    
    // Store the deferred promise for resolution when all batches complete
    this._currentBatchingJob = {
      deferred,
      totalBatches: batches.length,
      processedBatches: 0,
      symbols
    };
    
    // Start processing batches if not already processing
    if (!this.isProcessingBatch) {
      this.processBatchQueue();
    }
    
    return promise;
  },
  
  /**
   * Process batches of symbols with a delay between each batch
   */
  async processBatchQueue() {
    if (this.batchQueue.length === 0 || this.isProcessingBatch) {
      // All batches completed, resolve the main promise
      if (this._currentBatchingJob && this.batchQueue.length === 0) {
        this._currentBatchingJob.deferred.resolve(this._currentBatchingJob.symbols);
      }
      return;
    }
    
    this.isProcessingBatch = true;
    
    try {
      const batch = this.batchQueue.shift();
      console.log(`Processing batch ${this._currentBatchingJob?.processedBatches + 1} of ${this._currentBatchingJob?.totalBatches}: ${batch.length} symbols`);
      
      // Process this batch with individual Promise handling
      const promises = batch.map(symbol => {
        return this.fetchCompanyProfile(symbol)
          .then(result => {
            // Track each successful symbol
            this.processedSymbols++;
            return result;
          })
          .catch(err => {
            console.error(`Failed to fetch profile for ${symbol}:`, err);
            this.processedSymbols++;
            // Store the error in cache so we don't retry failed symbols
            this.profileCache[symbol] = { error: true };
            return { error: true };
          });
      });
      
      // Wait for all promises to settle
      await Promise.allSettled(promises);
      
      // Increment batch counter
      if (this._currentBatchingJob) {
        this._currentBatchingJob.processedBatches++;
      }
      
      // Update progress for views
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('api-batch-progress', {
          detail: {
            processedSymbols: this.processedSymbols,
            totalSymbols: this.totalSymbols,
            remainingBatches: this.batchQueue.length
          }
        }));
      }
      
      // If there are more batches, schedule processing with delay
      if (this.batchQueue.length > 0) {
        console.log(`Waiting ${this.batchDelayMs/1000} seconds before processing next batch. ${this.batchQueue.length} batches remaining.`);
        setTimeout(() => {
          this.isProcessingBatch = false;
          this.processBatchQueue();
        }, this.batchDelayMs);
      } else {
        console.log(`All batches processed. Total symbols processed: ${this.processedSymbols}/${this.totalSymbols}`);
        this.isProcessingBatch = false;
        
        // Call processBatchQueue again to handle promise resolution
        this.processBatchQueue();
      }
    } catch (error) {
      console.error('Error processing batch:', error);
      this.isProcessingBatch = false;
      
      // Don't stop on errors, continue with next batch
      setTimeout(() => {
        this.processBatchQueue();
      }, this.batchDelayMs);
    }
  },
  
  /**
   * Processes the next request in the queue with rate limiting.
   */
  async processQueue() {
    if (this.isProcessingQueue || this.requestQueue.length === 0) {
      return;
    }
    this.isProcessingQueue = true;
    
    const { url, symbol, resolve, reject } = this.requestQueue.shift();
    
    try {
      const response = await fetch(url);
      
      // Handle rate limit error specifically
      if (response.status === 429) {
        console.warn('Rate limit hit. Re-queuing and pausing.');
        // Put it back at the front of the queue
        this.requestQueue.unshift({ url, symbol, resolve, reject });
        // Wait for a longer period before trying again
        setTimeout(() => {
          this.isProcessingQueue = false;
          this.processQueue();
        }, 5000); // Wait 5 seconds
        return;
      }

      if (!response.ok) {
        throw new Error(`Failed to fetch profile for ${symbol}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // A valid but empty response means the symbol is not found
      if (Object.keys(data).length === 0) {
        console.warn(`No data found for symbol: ${symbol}`);
        this.profileCache[symbol] = { notFound: true }; // Cache not-found result
        resolve(this.profileCache[symbol]);
      } else {
        this.profileCache[symbol] = data;
        resolve(data);
      }

    } catch (error) {
      console.error(`Error fetching profile for ${symbol}:`, error);
      this.profileCache[symbol] = { error: true }; // Cache error result
      reject(error);
    } finally {
      // Process the next item after a delay to respect rate limits
      setTimeout(() => {
        this.isProcessingQueue = false;
        this.processQueue();
      }, 1000); // Delay of 1s between individual requests
    }
  },

  /**
   * Get a profile from cache or queue it for fetching
   * @param {string} symbol - Stock symbol
   * @returns {Promise} Promise resolving to company profile data
   */
  getOrQueueProfile(symbol) {
    // Return from cache if available
    if (this.profileCache[symbol]) {
      return Promise.resolve(this.profileCache[symbol]);
    }
    
    return new Promise((resolve, reject) => {
      const url = `https://finnhub.io/api/v1/stock/profile2?symbol=${symbol}&token=${CONFIG.API_KEY}`;
      this.requestQueue.push({ url, symbol, resolve, reject });
      this.processQueue();
    });
  },
  
  /**
   * Fetch company profile data
   * @param {string} symbol - Stock symbol
   * @returns {Promise} Promise resolving to company profile data
   */
  fetchCompanyProfile(symbol) {
    return this.getOrQueueProfile(symbol);
  },
  
  /**
   * Fetch earnings data for a specific date
   * @param {Date} date - Date to fetch earnings for
   * @returns {Promise} Promise resolving to earnings data
   */
  async fetchDailyEarnings(date) {
    try {
      const formattedDate = Utils.formatDate(date);
      const response = await fetch(
        `https://finnhub.io/api/v1/calendar/earnings?from=${formattedDate}&to=${formattedDate}&token=${CONFIG.API_KEY}`
      );
      if (!response.ok) {
        throw new Error('Failed to fetch daily earnings data');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching daily earnings:', error);
      throw error;
    }
  },
  
  /**
   * Fetch earnings data for a week
   * @param {Date} fromDate - Start date
   * @param {Date} toDate - End date
   * @returns {Promise} Promise resolving to earnings data
   */
  async fetchWeeklyEarnings(fromDate, toDate) {
    try {
      const formattedFromDate = Utils.formatDate(fromDate);
      const formattedToDate = Utils.formatDate(toDate);
      const response = await fetch(
        `https://finnhub.io/api/v1/calendar/earnings?from=${formattedFromDate}&to=${formattedToDate}&token=${CONFIG.API_KEY}`
      );
      if (!response.ok) {
        throw new Error('Failed to fetch weekly earnings data');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching weekly earnings:', error);
      throw error;
    }
  }
};
