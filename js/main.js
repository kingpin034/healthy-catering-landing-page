/**
 * Main Application Entry Point for Healthy Catering Landing Page
 * ES6+ Vanilla JavaScript
 */

import { initBreakpointDetection } from './utils/breakpoints.js';

/**
 * Initialize the application when DOM is ready
 */
function initApp() {
  console.log('Initializing Healthy Catering Landing Page...');
  
  // Initialize responsive breakpoint detection
  const cleanupBreakpoint = initBreakpointDetection((newBreakpoint) => {
    console.log(`Breakpoint changed to: ${newBreakpoint}`);
    // Add custom breakpoint change logic here
  });
  
  console.log('Application initialized successfully');
  
  // Return cleanup function
  return () => {
    cleanupBreakpoint();
  };
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', initApp);

// Export for use in other modules
export { initApp };
