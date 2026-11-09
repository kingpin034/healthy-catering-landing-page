/**
 * Responsive Breakpoints Configuration
 * Mobile-first approach with breakpoints at 768px (tablet) and 1024px (desktop)
 */

// Breakpoint definitions
export const BREAKPOINTS = {
  mobile: 0,
  tablet: 768,
  desktop: 1024,
};

/**
 * Get current breakpoint name based on window width
 * @returns {string} 'mobile', 'tablet', or 'desktop'
 */
export function getCurrentBreakpoint() {
  const width = window.innerWidth;
  
  if (width >= BREAKPOINTS.desktop) {
    return 'desktop';
  } else if (width >= BREAKPOINTS.tablet) {
    return 'tablet';
  } else {
    return 'mobile';
  }
}

/**
 * Check if current screen width matches or exceeds a breakpoint
 * @param {number} breakpoint - Breakpoint to check against
 * @returns {boolean}
 */
export function matchesBreakpoint(breakpoint) {
  return window.innerWidth >= breakpoint;
}

/**
 * Check if current screen is mobile
 * @returns {boolean}
 */
export function isMobile() {
  return window.innerWidth < BREAKPOINTS.tablet;
}

/**
 * Check if current screen is tablet or larger
 * @returns {boolean}
 */
export function isTabletOrLarger() {
  return window.innerWidth >= BREAKPOINTS.tablet;
}

/**
 * Check if current screen is desktop
 * @returns {boolean}
 */
export function isDesktop() {
  return window.innerWidth >= BREAKPOINTS.desktop;
}

/**
 * Get breakpoint-specific values
 * @param {Object} values - Object with breakpoint keys
 * @param {number} fallback - Fallback value if no breakpoint matches
 * @returns {*} Value for current breakpoint or fallback
 */
export function getBreakpointValue(values, fallback = null) {
  if (isDesktop() && values.desktop !== undefined) {
    return values.desktop;
  } else if (isTabletOrLarger() && values.tablet !== undefined) {
    return values.tablet;
  } else if (values.mobile !== undefined) {
    return values.mobile;
  }
  return fallback;
}

/**
 * Debounce function for resize events
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function}
 */
export function debounce(func, wait = 250) {
  let timeout;
  
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Initialize responsive breakpoint detection
 * @param {Function} callback - Callback function when breakpoint changes
 * @returns {Function} Cleanup function to remove event listeners
 */
export function initBreakpointDetection(callback) {
  let currentBreakpoint = getCurrentBreakpoint();
  
  const handleResize = debounce(() => {
    const newBreakpoint = getCurrentBreakpoint();
    
    if (newBreakpoint !== currentBreakpoint) {
      currentBreakpoint = newBreakpoint;
      callback(newBreakpoint);
    }
  }, 250);
  
  window.addEventListener('resize', handleResize);
  
  // Return cleanup function
  return () => {
    window.removeEventListener('resize', handleResize);
  };
}
