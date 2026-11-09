/**
 * Project Structure Setup for Healthy Catering Landing Page
 * This module handles the initial project structure setup and configuration
 */

// Directory structure configuration
const directoryStructure = [
  'css',
  'css/components',
  'css/utils',
  'js',
  'js/components',
  'images',
  'images/hero',
  'images/services',
  'images/menu',
  'images/team',
  'assets',
  'assets/icons',
];

// CSS custom properties configuration
const cssCustomProperties = {
  colors: {
    primary: {
      main: '#4CAF50',
      light: '#66BB6A',
    },
    secondary: {
      main: '#8D6E63',
      light: '#A1887F',
    },
    backgrounds: {
      white: '#FFFFFF',
      light: '#F5F5F5',
    },
  },
  spacing: {
    unit: 8,
  },
  typography: {
    fontFamily: '"Roboto", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    baseSize: 16,
    headingRange: {
      min: 24,
      max: 48,
    },
  },
};

// Responsive breakpoints configuration
const breakpoints = {
  mobile: 0,
  tablet: 768,
  desktop: 1024,
};

// Package.json configuration
const packageJson = {
  name: 'healthy-catering-landing-page',
  version: '1.0.0',
  description: 'A modern, responsive landing page for a healthy catering service',
  main: 'js/main.js',
  scripts: {
    start: 'npx http-server -p 8080',
    build: 'npm run build:css && npm run build:js',
    'build:css': 'echo "No CSS build step required for vanilla CSS"',
    'build:js': 'echo "No JS build step required for vanilla JS"',
    test: 'echo "No tests configured yet" && exit 0',
  },
  keywords: [
    'healthy',
    'catering',
    'landing-page',
    'responsive',
    'vanilla-js',
  ],
  author: '',
  license: 'MIT',
  devDependencies: {},
};

// README content
const readmeContent = `# Healthy Catering Landing Page

A modern, responsive landing page for a healthy catering service that provides nutritious, delicious meal options for individuals and events.

## Features

- Responsive design with mobile-first approach
- Accessibility compliant (WCAG 2.1 Level AA)
- Performance optimized with lazy loading and image optimization
- Modern vanilla JavaScript ES6+
- CSS custom properties for theming
- BEM methodology for CSS naming

## Project Structure

\`\`\`
healthy-catering-landing-page/
├── index.html                          # Main entry point
├── css/
│   ├── styles.css                      # Main stylesheet
│   ├── components/                     # Component-specific styles
│   │   ├── navigation.css
│   │   ├── hero.css
│   │   ├── services.css
│   │   ├── menu.css
│   │   ├── about.css
│   │   ├── contact.css
│   │   └── footer.css
│   └── utils/                          # Utility classes and variables
│       ├── variables.css
│       ├── typography.css
│       └── spacing.css
├── js/
│   ├── main.js                         # Main application entry point
│   ├── components/                     # Component JavaScript
│   │   ├── navigation.js
│   │   ├── smoothScroll.js
│   │   ├── formHandler.js
│   │   ├── emailService.js
│   │   ├── imageOptimizer.js
│   │   └── analytics.js
│   └── utils/                          # Utility functions
│       ├── validation.js
│       └── dom.js
├── images/
│   ├── hero/                           # Hero section images
│   ├── services/                       # Service category images
│   ├── menu/                           # Menu item images
│   └── team/                           # Team member photos
└── assets/
    └── icons/                          # SVG icons for UI elements
\`\`\`

## Installation

1. Clone or download this repository
2. No dependencies required - this is a vanilla JavaScript project
3. Open \`index.html\` in a web browser

For local development server:
\`\`\`bash
npx http-server -p 8080
\`\`\`

## Browser Support

- Chrome (current and previous versions)
- Firefox (current and previous versions)
- Safari (current and previous versions)
- Edge (current and previous versions)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Accessibility

This project follows WCAG 2.1 Level AA compliance guidelines:
- Keyboard navigation support
- Screen reader compatibility
- Proper ARIA labels and roles
- Sufficient color contrast (4.5:1 minimum)

## Performance

The project is optimized for performance:
- Lazy loading for images below the fold
- WebP image format with fallback
- Optimized CSS and JavaScript
- Minimal dependencies

## Requirements

See \`requirements.md\` for detailed requirements and acceptance criteria.

## License

MIT
`;

// CSS variables file content
const cssVariablesContent = `/* CSS Custom Properties - Variables */
/* Based on Requirement 13: Visual Branding Consistency */

:root {
  /* Primary Colors - Fresh Greens (60% of UI elements) */
  --color-primary: #4CAF50;
  --color-primary-light: #66BB6A;
  --color-primary-dark: #388E3C;

  /* Secondary Colors - Earth Tones (25% of UI elements) */
  --color-secondary: #8D6E63;
  --color-secondary-light: #A1887F;
  --color-secondary-dark: #6D4C41;

  /* Background Colors - Whites and Light Grays (15% of UI elements) */
  --color-background: #FFFFFF;
  --color-background-light: #F5F5F5;
  --color-background-dark: #E0E0E0;

  /* Text Colors */
  --color-text-primary: #212121;
  --color-text-secondary: #757575;
  --color-text-light: #FFFFFF;

  /* Spacing Unit - 8px baseline grid */
  --spacing-unit: 8px;
  --spacing-xs: calc(var(--spacing-unit) * 0.5); /* 4px */
  --spacing-sm: calc(var(--spacing-unit) * 1);   /* 8px */
  --spacing-md: calc(var(--spacing-unit) * 2);   /* 16px */
  --spacing-lg: calc(var(--spacing-unit) * 3);   /* 24px */
  --spacing-xl: calc(var(--spacing-unit) * 4);   /* 32px */
  --spacing-xxl: calc(var(--spacing-unit) * 5);  /* 40px */
  --spacing-xxxl: calc(var(--spacing-unit) * 6); /* 48px */

  /* Typography */
  --font-family: 'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  --font-size-base: 16px;
  --font-size-sm: calc(var(--font-size-base) * 0.875); /* 14px */
  --font-size-lg: calc(var(--font-size-base) * 1.125); /* 18px */
  --font-size-xl: calc(var(--font-size-base) * 1.25);  /* 20px */
  --font-size-xxl: calc(var(--font-size-base) * 1.5);  /* 24px */
  --font-size-xxxl: calc(var(--font-size-base) * 2);   /* 32px */
  --font-size-display: calc(var(--font-size-base) * 2.5); /* 40px */
  --font-size-hero: calc(var(--font-size-base) * 3);      /* 48px */

  /* Font Weights */
  --font-weight-light: 300;
  --font-weight-normal: 400;
  --font-weight-medium: 500;
  --font-weight-semibold: 600;
  --font-weight-bold: 700;

  /* Line Heights */
  --line-height-tight: 1.25;
  --line-height-normal: 1.5;
  --line-height-relaxed: 1.75;

  /* Border Radius */
  --border-radius-sm: 4px;
  --border-radius-md: 8px;
  --border-radius-lg: 12px;
  --border-radius-circle: 50%;

  /* Shadows */
  --shadow-sm: 0 2px 4px rgba(0, 0, 0, 0.1);
  --shadow-md: 0 4px 8px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 8px 16px rgba(0, 0, 0, 0.1);
  --shadow-xl: 0 12px 24px rgba(0, 0, 0, 0.15);

  /* Transitions */
  --transition-fast: 150ms ease;
  --transition-normal: 300ms ease;
  --transition-slow: 500ms ease;

  /* Z-index scale */
  --z-dropdown: 1000;
  --z-sticky: 1020;
  --z-fixed: 1030;
  --z-modal: 1040;
  --z-tooltip: 1050;
}

/* Dark mode support (optional) */
@media (prefers-color-scheme: dark) {
  :root {
    --color-background: #121212;
    --color-background-light: #1E1E1E;
    --color-text-primary: #FFFFFF;
    --color-text-secondary: #BDBDBD;
  }
}
`;

// Responsive breakpoints CSS
const cssBreakpointsContent = `/* Responsive Breakpoints */
/* Based on mobile-first approach with breakpoints at 768px (tablet) and 1024px (desktop) */

/* Mobile First - Default (0px and up) */
*,
*::before,
*::after {
  box-sizing: border-box;
}

/* Tablet (768px and up) */
@media (min-width: 768px) {
  :root {
    --font-size-display: calc(var(--font-size-base) * 3);  /* 48px */
  }
}

/* Desktop (1024px and up) */
@media (min-width: 1024px) {
  :root {
    --font-size-display: calc(var(--font-size-base) * 3.125); /* 50px */
  }
}

/* Utility classes for responsive behavior */
/* These can be used in HTML or CSS */
@media (max-width: 767px) {
  /* Mobile-specific styles */
  .u-hidden-mobile {
    display: none !important;
  }
  
  .u-block-mobile {
    display: block !important;
  }
  
  .u-flex-mobile {
    display: flex !important;
  }
}

@media (min-width: 768px) {
  /* Tablet-specific styles */
  .u-hidden-tablet {
    display: none !important;
  }
  
  .u-block-tablet {
    display: block !important;
  }
  
  .u-flex-tablet {
    display: flex !important;
  }
}

@media (min-width: 1024px) {
  /* Desktop-specific styles */
  .u-hidden-desktop {
    display: none !important;
  }
  
  .u-block-desktop {
    display: block !important;
  }
  
  .u-flex-desktop {
    display: flex !important;
  }
}

/* Screen reader only utility - visually hidden but accessible */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

/* Screen reader only when focused */
.sr-only-focusable:focus,
.sr-only-focusable:active {
  position: static;
  width: auto;
  height: auto;
  padding: inherit;
  margin: inherit;
  overflow: visible;
  clip: auto;
  white-space: normal;
}
`;

// JavaScript breakpoints configuration
const jsBreakpointsContent = `/**
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
`;

// JavaScript utility functions
const jsUtilsContent = `/**
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
  return \`date-\${Date.now()}-\${Math.random().toString(36).substr(2, 9)}\`;
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
`;

// Main initialization function
function initProjectStructure() {
  console.log('Initializing healthy catering landing page project structure...');
  
  // Log configuration
  console.log('✓ Directory structure defined');
  console.log('✓ CSS custom properties configured');
  console.log('✓ Responsive breakpoints configured');
  console.log('✓ Package.json configuration ready');
  
  // Create directories (in browser environment, this would be a warning)
  if (typeof window === 'undefined' && typeof process !== 'undefined' && process.argv) {
    console.log('Run in Node.js environment to create directories');
  } else {
    console.log('Directory creation requires Node.js environment');
  }
  
  return {
    directories: directoryStructure,
    css: cssCustomProperties,
    breakpoints,
    packageJson,
  };
}

// Export for use in Node.js or browser
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    directoryStructure,
    cssCustomProperties,
    breakpoints,
    packageJson,
    readmeContent,
    cssVariablesContent,
    cssBreakpointsContent,
    jsBreakpointsContent,
    jsUtilsContent,
    initProjectStructure,
  };
}

// Initialize if run directly
if (typeof require !== 'undefined' && require.main === module) {
  initProjectStructure();
}

// Export for ES modules
export {
  directoryStructure,
  cssCustomProperties,
  breakpoints,
  packageJson,
  readmeContent,
  cssVariablesContent,
  cssBreakpointsContent,
  jsBreakpointsContent,
  jsUtilsContent,
  initProjectStructure,
};
