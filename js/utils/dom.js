/**
 * Utility Functions for Healthy Catering Landing Page
 * ES6+ JavaScript utilities for DOM manipulation and common operations
 */

/**
 * Debounce function - limits the rate at which a function can fire
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
 * Throttle function - ensures a function is called at most once in specified interval
 * @param {Function} func - Function to throttle
 * @param {number} limit - Time limit in milliseconds
 * @returns {Function}
 */
export function throttle(func, limit = 100) {
  let inThrottle;
  
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * Check if element is in viewport
 * @param {HTMLElement} element - Element to check
 * @param {Object} options - Options object
 * @param {number} options.threshold - Threshold percentage (0-1)
 * @returns {boolean}
 */
export function isInViewport(element, options = { threshold: 0 }) {
  const rect = element.getBoundingClientRect();
  const windowHeight = window.innerHeight || document.documentElement.clientHeight;
  const windowWidth = window.innerWidth || document.documentElement.clientWidth;
  
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= windowHeight &&
    rect.right <= windowWidth
  );
}

/**
 * Check if element is near viewport (for lazy loading)
 * @param {HTMLElement} element - Element to check
 * @param {number} threshold - Pixels before viewport to consider "near"
 * @returns {boolean}
 */
export function isNearViewport(element, threshold = 200) {
  const rect = element.getBoundingClientRect();
  const windowHeight = window.innerHeight || document.documentElement.clientHeight;
  const windowWidth = window.innerWidth || document.documentElement.clientWidth;
  
  return (
    rect.top - threshold < windowHeight &&
    rect.left - threshold < windowWidth &&
    rect.bottom + threshold > 0 &&
    rect.right + threshold > 0
  );
}

/**
 * Smooth scroll to element
 * @param {HTMLElement|string} target - Element or CSS selector to scroll to
 * @param {number} duration - Scroll duration in milliseconds
 * @param {Function} callback - Callback function when scroll completes
 */
export function smoothScrollTo(target, duration = 500, callback) {
  const element = typeof target === 'string' ? document.querySelector(target) : target;
  
  if (!element) {
    console.error('Element not found for smooth scroll:', target);
    return;
  }
  
  const targetPosition = element.getBoundingClientRect().top + window.pageYOffset;
  const startPosition = window.pageYOffset;
  const distance = targetPosition - startPosition;
  const startTime = performance.now();
  
  function scroll(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    
    // Easing function: easeInOutQuart
    const ease = progress < 0.5
      ? 8 * progress * progress * progress * progress
      : 1 - 8 * (--progress) * progress * progress * progress;
    
    window.scrollTo(0, startPosition + distance * ease);
    
    if (progress < 1) {
      requestAnimationFrame(scroll);
    } else if (callback) {
      callback();
    }
  }
  
  requestAnimationFrame(scroll);
}

/**
 * Scroll to element with offset
 * @param {HTMLElement|string} target - Element or CSS selector to scroll to
 * @param {number} offset - Offset in pixels from the top
 * @param {number} duration - Scroll duration in milliseconds
 */
export function scrollToWithOffset(target, offset = 0, duration = 500) {
  const element = typeof target === 'string' ? document.querySelector(target) : target;
  
  if (!element) {
    console.error('Element not found:', target);
    return;
  }
  
  const rect = element.getBoundingClientRect();
  const yOffset = window.pageYOffset;
  const y = rect.top + yOffset - offset;
  
  window.scrollTo({ top: y, behavior: 'smooth' });
}

/**
 * Get closest parent matching selector
 * @param {HTMLElement} element - Starting element
 * @param {string} selector - CSS selector to match
 * @returns {HTMLElement|null}
 */
export function closest(element, selector) {
  if (Element.prototype.closest) {
    return element.closest(selector);
  }
  
  let el = element;
  
  while (el) {
    if (el.matches(selector)) {
      return el;
    }
    el = el.parentElement;
  }
  
  return null;
}

/**
 * Add event listener with support for multiple selectors
 * @param {string} selectors - CSS selector or space-separated selectors
 * @param {string} eventType - Event type
 * @param {Function} handler - Event handler function
 * @param {Object} options - Event options
 */
export function on(selectors, eventType, handler, options) {
  const elements = document.querySelectorAll(selectors);
  
  elements.forEach((element) => {
    element.addEventListener(eventType, handler, options);
  });
}

/**
 * Remove event listener from multiple elements
 * @param {string} selectors - CSS selector or space-separated selectors
 * @param {string} eventType - Event type
 * @param {Function} handler - Event handler function
 * @param {Object} options - Event options
 */
export function off(selectors, eventType, handler, options) {
  const elements = document.querySelectorAll(selectors);
  
  elements.forEach((element) => {
    element.removeEventListener(eventType, handler, options);
  });
}

/**
 * Format date to human-readable string
 * @param {Date|string} date - Date to format
 * @param {Object} options - Formatting options
 * @returns {string}
 */
export function formatDate(date, options = {}) {
  const dateObj = date instanceof Date ? date : new Date(date);
  
  const defaultOptions = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  };
  
  return dateObj.toLocaleDateString('en-US', { ...defaultOptions, ...options });
}

/**
 * Generate unique ID
 * @returns {string}
 */
export function generateId() {
  return `date-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Sanitize HTML string
 * @param {string} html - HTML string to sanitize
 * @returns {string}
 */
export function sanitizeHtml(html) {
  const tmp = document.createElement('DIV');
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || '';
}

/**
 * Clone deep - deep clone an object or array
 * @param {*} value - Value to clone
 * @returns {*}
 */
export function cloneDeep(value) {
  return JSON.parse(JSON.stringify(value));
}

/**
 * Check if object is empty
 * @param {Object} obj - Object to check
 * @returns {boolean}
 */
export function isEmpty(obj) {
  return Object.keys(obj).length === 0;
}

/**
 * Wait for DOM content loaded
 * @param {Function} callback - Callback function
 */
export function whenDomReady(callback) {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', callback);
  } else {
    callback();
  }
}

/**
 * Wait for images to load in an element
 * @param {HTMLElement} element - Element containing images
 * @returns {Promise<void>}
 */
export function waitForImages(element) {
  const images = element.querySelectorAll('img');
  const promises = Array.from(images).map((img) => {
    if (img.complete && img.naturalHeight !== 0) {
      return Promise.resolve();
    }
    
    return new Promise((resolve, reject) => {
      img.addEventListener('load', resolve);
      img.addEventListener('error', reject);
    });
  });
  
  return Promise.all(promises);
}
