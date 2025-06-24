// Configuration for different environments
const CONFIG = {
  // Automatically detect environment and set API base URL
  API_BASE: (() => {
    const hostname = window.location.hostname;
    
    // Local development
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'http://localhost:5000/api';
    }
    
    // Production - Replace with your actual Railway URL
    return 'https://YOUR-RAILWAY-APP-NAME.railway.app/api';
  })(),
  
  // Payment configuration
  RAZORPAY_KEY: 'rzp_test_your_key_here', // Replace with your Razorpay key
  
  // App configuration
  APP_NAME: 'FYOF - Food Ordering Platform',
  VERSION: '1.0.0',
  
  // Feature flags
  FEATURES: {
    PAYMENT_ENABLED: true,
    CART_ENABLED: true,
    NOTIFICATIONS_ENABLED: true,
    ANALYTICS_ENABLED: true
  },
  
  // UI Configuration
  UI: {
    ITEMS_PER_PAGE: 10,
    MAX_CART_ITEMS: 50,
    CURRENCY: '₹',
    CURRENCY_CODE: 'INR'
  },
  
  // Validation rules
  VALIDATION: {
    MIN_PASSWORD_LENGTH: 6,
    MAX_NAME_LENGTH: 50,
    MAX_ADDRESS_LENGTH: 200
  }
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CONFIG;
}

// Global access
window.CONFIG = CONFIG;

console.log('🔧 FYOF Configuration loaded:', {
  environment: window.location.hostname === 'localhost' ? 'development' : 'production',
  apiBase: CONFIG.API_BASE,
  version: CONFIG.VERSION
});
