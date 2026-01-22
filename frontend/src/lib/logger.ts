
// Custom logger implementation
const loggerImpl = {
  // In production, log() does nothing
  log: process.env.NODE_ENV === 'production' 
    ? () => {} 
    : (...args: any[]) => {
        // Only log in development
        const skipMessages = [
          'Fetching features from API',
          'Fetching bento card data from API',
          'Fetching pricing plans from API',
          'Fetching files for workspace',
          'Found 0 files for workspace',
          'Multiple GoTrueClient instances',
          'Unknown message type: SELECTEXT_URL_RESPONSE',
          'Unrecognized feature:',
          'Tab changed to:',  // Filter to remove tab change logs
          'gptengineer.js',   // Filter for gptengineer.js related logs
        ];
        
        // Skip logging system messages
        if (args.length > 0 && typeof args[0] === 'string' && 
            skipMessages.some(msg => args[0].includes(msg))) {
          return;
        }
        
        console.log(...args);
      },
  
  // Always keep error logging
  error: (...args: any[]) => {
    if (process.env.NODE_ENV !== 'production') {
      // Only log errors in development
      console.error(...args);
    }
  },
  
  // Keep warn and info for potential production monitoring
  warn: (...args: any[]) => {
    if (process.env.NODE_ENV !== 'production') {
      // Only log warnings in development
      console.warn(...args);
    }
  },
  
  info: (...args: any[]) => {
    if (process.env.NODE_ENV !== 'production') {
      // Only log info in development
      console.info(...args);
    }
  }
};

// Export the logger
export const logger = loggerImpl;

// Override console methods in development
if (process.env.NODE_ENV !== 'production') {
  const originalConsoleLog = console.log;

  console.log = (...args: any[]) => {
    // Extend the skip messages to include these file fetching logs
    const skipMessages = [
      'Fetching features from API',
      'Fetching bento card data from API',
      'Fetching pricing plans from API',
      'Fetching files for workspace',
      'Found 0 files for workspace',
      'Multiple GoTrueClient instances',
      'Unknown message type: SELECTEXT_URL_RESPONSE',
      'Unrecognized feature:',
      'Tab changed to:',  // Filter to remove tab change logs
      'gptengineer.js',   // Filter for gptengineer.js related logs
    ];
    
    // Skip logging system messages
    if (args.length > 0 && typeof args[0] === 'string' && 
        skipMessages.some(msg => args[0].includes(msg))) {
      return;
    }
    
    // Use original console for everything else
    originalConsoleLog(...args);
  };
}
