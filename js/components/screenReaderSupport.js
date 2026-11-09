/**
 * Screen Reader Support Component
 * Healthy Catering Landing Page
 * 
 * Implements comprehensive screen reader support as per requirements 9.3 and 9.6:
 * - Meaningful alt text validation for images (20+ characters for content images)
 * - aria-live regions for form validation errors
 * - aria-announced navigation changes
 * - Screen reader only class implementation
 * - Dynamic content announcements
 * 
 * Requirements: 9.3, 9.6
 */

/**
 * Screen Reader Support Manager
 * Handles all screen reader specific features for the landing page
 */
class ScreenReaderSupport {
  constructor() {
    this.config = {
      liveRegionId: 'sr-announcer',
      imageAltMinLength: 20,
      announcementDelay: 100,
      focusManagement: {
        skipLink: '.skip-link',
        mainContent: '#main-content',
      },
    };

    this.elements = {
      liveRegion: null,
      skipLink: null,
      mainContent: null,
    };

    this.imageCache = new Map();
    this.init();
  }

  /**
   * Initialize screen reader support features
   */
  init() {
    this.cacheElements();
    this.setupLiveRegion();
    this.setupSkipLink();
    this.setupImageValidation();
    this.setupFormAnnouncements();
    this.setupNavigationAnnouncements();
    this.setupDynamicContentAnnouncements();
  }

  /**
   * Cache DOM elements
   */
  cacheElements() {
    this.elements.skipLink = document.querySelector(this.config.focusManagement.skipLink);
    this.elements.mainContent = document.getElementById('main-content');
  }

  /**
   * Setup live region for screen reader announcements
   * Requirement 9.3: aria-live regions for dynamic content
   */
  setupLiveRegion() {
    // Create or reuse existing live region
    this.elements.liveRegion = document.getElementById(this.config.liveRegionId);
    
    if (!this.elements.liveRegion) {
      this.elements.liveRegion = document.createElement('div');
      this.elements.liveRegion.id = this.config.liveRegionId;
      this.elements.liveRegion.setAttribute('role', 'status');
      this.elements.liveRegion.setAttribute('aria-live', 'polite');
      this.elements.liveRegion.setAttribute('aria-atomic', 'true');
      this.elements.liveRegion.setAttribute('aria-relevant', 'additions text');
      
      // Visually hidden but accessible to screen readers
      this.elements.liveRegion.style.cssText = 
        'position: absolute; ' +
        'left: -10000px; ' +
        'width: 1px; ' +
        'height: 1px; ' +
        'overflow: hidden; ' +
        'clip: rect(0, 0, 0, 0); ' +
        'white-space: nowrap; ' +
        'border: 0;';
      
      document.body.appendChild(this.elements.liveRegion);
    }
  }

  /**
   * Setup skip-to-content link functionality
   * Requirement 9.6: Skip link for keyboard users
   */
  setupSkipLink() {
    if (!this.elements.skipLink) {
      console.warn('Skip link not found. Adding to page structure...');
      this._createSkipLink();
      return;
    }

    this.elements.skipLink.addEventListener('click', (e) => {
      e.preventDefault();
      
      // Find main content element
      const mainContent = this.elements.mainContent || 
                         document.getElementById('main-content') ||
                         document.querySelector('main');
      
      if (mainContent) {
        // Set focus to main content area
        mainContent.setAttribute('tabindex', '-1');
        mainContent.focus();
        
        // Announce navigation change for screen readers
        this.announce('Skipped to main content', 'polite');
        
        // Remove tabindex after use
        setTimeout(() => {
          mainContent.removeAttribute('tabindex');
        }, 1000);
      } else {
        console.warn('Main content element not found for skip link');
      }
    });
  }

  /**
   * Create skip link if not present
   */
  _createSkipLink() {
    const skipLink = document.createElement('a');
    skipLink.href = '#main-content';
    skipLink.className = 'skip-link';
    skipLink.textContent = 'Skip to main content';
    
    // Position absolutely initially (hidden)
    skipLink.style.cssText = 
      'position: absolute; ' +
      'left: -999px; ' +
      'z-index: 100;';
    
    // Make visible on focus
    skipLink.addEventListener('focus', () => {
      skipLink.style.left = '50%';
      skipLink.style.transform = 'translateX(-50%)';
      skipLink.style.top = '0';
    });
    
    skipLink.addEventListener('blur', () => {
      skipLink.style.left = '-999px';
      skipLink.style.transform = 'none';
      skipLink.style.top = '';
    });
    
    document.body.prepend(skipLink);
    this.elements.skipLink = skipLink;
  }

  /**
   * Setup image alt text validation
   * Requirement 9.3: Meaningful alt text for all images (20+ characters)
   */
  setupImageValidation() {
    // Validate existing images
    this._validateAllImages();
    
    // Watch for dynamically added images
    this._setupImageObserver();
  }

  /**
   * Validate all images on the page
   */
  _validateAllImages() {
    const images = document.querySelectorAll('img');
    const imagesWithShortAlt = [];
    const imagesWithoutAlt = [];

    images.forEach((img) => {
      const alt = img.getAttribute('alt');
      const src = img.getAttribute('src');

      if (!alt) {
        // Image without alt attribute - add empty alt for decorative images
        if (img.getAttribute('role') !== 'presentation' && 
            img.getAttribute('aria-hidden') !== 'true' &&
            !src?.includes('.svg')) {
          imagesWithoutAlt.push(img);
        }
      } else if (alt.length > 0 && alt.length < this.config.imageAltMinLength) {
        // Image with short alt text
        imagesWithShortAlt.push({
          img,
          currentAlt: alt,
          length: alt.length,
        });
      }
    });

    // Log warnings for short alt text
    if (imagesWithShortAlt.length > 0) {
      console.warn(
        `${imagesWithShortAlt.length} image(s) have alt text shorter than ${this.config.imageAltMinLength} characters. ` +
        'Consider adding more descriptive alt text for better screen reader support.'
      );
      
      imagesWithShortAlt.forEach(({ img, currentAlt, length }) => {
        console.warn(`Image "${currentAlt}" (length: ${length}) at ${img.src || 'unknown location'} has short alt text`);
      });
    }

    if (imagesWithoutAlt.length > 0) {
      console.warn(
        `${imagesWithoutAlt.length} image(s) are missing alt attributes. ` +
        'Add appropriate alt text or use role="presentation" for decorative images.'
      );
    }
  }

  /**
   * Setup MutationObserver to watch for dynamically added images
   */
  _setupImageObserver() {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              // Check if node is an image or contains images
              if (node.tagName === 'IMG') {
                this._validateImage(node);
              } else {
                // Check for images within the node
                const images = node.querySelectorAll('img');
                images.forEach((img) => {
                  this._validateImage(img);
                });
              }
            }
          });
        }
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  }

  /**
   * Validate a single image's alt text
   * @param {HTMLImageElement} img - Image element to validate
   */
  _validateImage(img) {
    const alt = img.getAttribute('alt');
    const src = img.getAttribute('src');

    if (!alt) {
      // Add empty alt for decorative images
      if (img.getAttribute('role') !== 'presentation' && 
          img.getAttribute('aria-hidden') !== 'true') {
        img.setAttribute('alt', '');
        console.warn(`Added empty alt text to image at ${src || 'unknown location'}`);
      }
    } else if (alt.length > 0 && alt.length < this.config.imageAltMinLength) {
      console.warn(
        `Image alt text "${alt}" (length: ${alt.length}) is shorter than recommended ${this.config.imageAltMinLength} characters. ` +
        'Consider adding more descriptive text for better accessibility.'
      );
    }
  }

  /**
   * Setup form validation error announcements
   * Requirement 9.6: Form validation error announcements
   */
  setupFormAnnouncements() {
    // Add aria-live to form status regions
    const formStatusElements = document.querySelectorAll('[id$="-status"], .form-status');
    
    formStatusElements.forEach((element) => {
      if (!element.getAttribute('role')) {
        element.setAttribute('role', 'status');
      }
      if (!element.getAttribute('aria-live')) {
        element.setAttribute('aria-live', 'polite');
      }
    });
  }

  /**
   * Setup navigation change announcements
   * Requirement 9.6: Navigation changes announcements
   */
  setupNavigationAnnouncements() {
    // Listen for hash changes (smooth scroll may trigger these)
    window.addEventListener('hashchange', () => {
      const hash = window.location.hash;
      if (hash) {
        const section = document.querySelector(hash);
        if (section) {
          this._announceSectionChange(section);
        }
      }
    });

    // Listen for smooth scroll completion
    document.addEventListener('scroll', (e) => {
      // Only trigger for smooth scroll events
      if (e.target.classList.contains('smooth-scroll')) {
        const hash = window.location.hash;
        if (hash) {
          const section = document.querySelector(hash);
          if (section) {
            this._announceSectionChange(section);
          }
        }
      }
    }, { passive: true, once: true });
  }

  /**
   * Announce section change for screen readers
   * @param {HTMLElement} section - Section element
   */
  _announceSectionChange(section) {
    // Get section title or heading
    const heading = section.querySelector('h1, h2, h3, h4, h5, h6');
    const sectionName = heading ? heading.textContent.trim() : 'section';
    
    // Announce navigation change
    this.announce(`Navigated to ${sectionName}`, 'polite');
    
    // Set focus to section heading for screen reader context
    setTimeout(() => {
      if (heading) {
        heading.setAttribute('tabindex', '-1');
        heading.focus();
      }
    }, 100);
  }

  /**
   * Setup dynamic content announcements
   * Requirement 9.3: Dynamic content announcements
   */
  setupDynamicContentAnnouncements() {
    // Setup announcements for common dynamic events
    this._setupFormSubmissionAnnouncements();
    this._setupLoadingStateAnnouncements();
    this._setupFilterChangeAnnouncements();
  }

  /**
   * Setup form submission announcements
   */
  _setupFormSubmissionAnnouncements() {
    const forms = document.querySelectorAll('form');
    
    forms.forEach((form) => {
      form.addEventListener('submit', () => {
        this.announce('Form submission in progress. Please wait.', 'polite');
      });
    });
  }

  /**
   * Setup loading state announcements
   */
  _setupLoadingStateAnnouncements() {
    // Add loading state announcements
    const loadingElements = document.querySelectorAll('[data-loading], [aria-busy="true"]');
    
    loadingElements.forEach((element) => {
      element.addEventListener('loadstart', () => {
        this.announce('Content is loading. Please wait.', 'polite');
      });
      
      element.addEventListener('loadend', () => {
        this.announce('Content has loaded.', 'polite');
      });
    });
  }

  /**
   * Setup filter change announcements (for menu filtering)
   */
  _setupFilterChangeAnnouncements() {
    const filterButtons = document.querySelectorAll('.filter-btn, [data-filter]');
    
    filterButtons.forEach((button) => {
      button.addEventListener('click', () => {
        const filter = button.getAttribute('data-filter') || button.textContent;
        this.announce(`Filter applied: ${filter}`, 'polite');
      });
    });
  }

  /**
   * Announce message to screen readers
   * Requirement 9.3: aria-live regions for announcements
   * @param {string} message - Message to announce
   * @param {string} priority - 'polite' or 'assertive'
   */
  announce(message, priority = 'polite') {
    if (!this.elements.liveRegion) {
      console.error('Screen reader announcer not initialized');
      return;
    }

    // Clear existing content
    this.elements.liveRegion.textContent = '';
    this.elements.liveRegion.setAttribute('aria-live', priority);
    
    // Force announcement by changing content
    setTimeout(() => {
      this.elements.liveRegion.textContent = message;
    }, this.config.announcementDelay);
  }

  /**
   * Announce form validation errors
   * @param {Object} errors - Map of field names to error messages
   * @param {number} totalErrors - Total number of errors
   */
  announceFormErrors(errors, totalErrors) {
    const errorMessages = Array.from(errors.values()).join('. ');
    this.announce(`${totalErrors} validation error${totalErrors !== 1 ? 's' : ''}. ${errorMessages}`, 'assertive');
  }

  /**
   * Announce form success
   * @param {string} message - Success message
   */
  announceFormSuccess(message) {
    this.announce(message, 'polite');
  }

  /**
   * Announce navigation changes
   * @param {string} sectionName - Name of the section navigated to
   */
  announceNavigationChange(sectionName) {
    this.announce(`Navigated to ${sectionName} section`, 'polite');
  }

  /**
   * Announce loading state
   * @param {string} message - Loading message
   */
  announceLoading(message) {
    this.announce(message, 'polite');
  }

  /**
   * Announce error state
   * @param {string} message - Error message
   */
  announceError(message) {
    this.announce(message, 'assertive');
  }

  /**
   * Announce warning state
   * @param {string} message - Warning message
   */
  announceWarning(message) {
    this.announce(message, 'polite');
  }

  /**
   * Announce success state
   * @param {string} message - Success message
   */
  announceSuccess(message) {
    this.announce(message, 'polite');
  }

  /**
   * Announce loading progress
   * @param {number} percentage - Loading percentage
   */
  announceLoadingProgress(percentage) {
    this.announce(`Loading ${percentage}% complete`, 'polite');
  }

  /**
   * Announce item count changes
   * @param {string} itemType - Type of item (e.g., "menu items")
   * @param {number} count - Number of items
   */
  announceItemCount(itemType, count) {
    this.announce(`Found ${count} ${itemType}`, 'polite');
  }

  /**
   * Announce page load completion
   */
  announcePageLoaded() {
    this.announce('Page loaded successfully', 'polite');
  }

  /**
   * Announce filter changes
   * @param {string} filterName - Name of applied filter
   */
  announceFilterChange(filterName) {
    this.announce(`${filterName} filter applied.`, 'polite');
  }

  /**
   * Create screen reader only element
   * @param {string} text - Text content for the element
   * @param {Object} options - Optional configuration
   * @returns {HTMLElement} Created element
   */
  createScreenReaderOnlyElement(text, options = {}) {
    const element = document.createElement('span');
    element.className = 'sr-only';
    element.textContent = text;
    
    if (options.id) {
      element.id = options.id;
    }
    
    if (options.attributes) {
      Object.entries(options.attributes).forEach(([key, value]) => {
        element.setAttribute(key, value);
      });
    }
    
    return element;
  }

  /**
   * Add screen reader only class to element
   * @param {HTMLElement} element - Element to make screen reader only
   */
  addScreenReaderOnlyClass(element) {
    element.classList.add('sr-only');
  }

  /**
   * Remove screen reader only class from element
   * @param {HTMLElement} element - Element to remove screen reader only class from
   */
  removeScreenReaderOnlyClass(element) {
    element.classList.remove('sr-only');
  }

  /**
   * Toggle screen reader only class on element
   * @param {HTMLElement} element - Element to toggle
   * @param {boolean} force - Force add or remove
   */
  toggleScreenReaderOnlyClass(element, force) {
    element.classList.toggle('sr-only', force);
  }

  /**
   * Set up focus trap within a container
   * @param {HTMLElement} container - Container to trap focus within
   * @returns {Function} Function to release focus trap
   */
  trapFocus(container) {
    const focusableSelectors = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
    const focusableElements = container.querySelectorAll(focusableSelectors);
    
    if (focusableElements.length === 0) return () => {};

    const firstFocusable = focusableElements[0];
    const lastFocusable = focusableElements[focusableElements.length - 1];

    const handleKeydown = (e) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstFocusable) {
          e.preventDefault();
          lastFocusable.focus();
        }
      } else {
        if (document.activeElement === lastFocusable) {
          e.preventDefault();
          firstFocusable.focus();
        }
      }
    };

    // Ensure first element is focused
    if (firstFocusable) {
      firstFocusable.focus();
    }

    container.addEventListener('keydown', handleKeydown);

    return () => {
      container.removeEventListener('keydown', handleKeydown);
    };
  }

  /**
   * Destroy the screen reader support manager
   */
  destroy() {
    // Remove live region
    if (this.elements.liveRegion) {
      this.elements.liveRegion.remove();
      this.elements.liveRegion = null;
    }

    // Remove skip link
    if (this.elements.skipLink) {
      this.elements.skipLink.remove();
      this.elements.skipLink = null;
    }
  }

  /**
   * Get screen reader support state
   */
  getState() {
    return {
      liveRegion: !!this.elements.liveRegion,
      skipLink: !!this.elements.skipLink,
      announcementCount: this.announcementCount || 0,
    };
  }
}

/**
 * Screen Reader Only CSS Class
 * Utility for creating visually hidden but screen reader accessible elements
 */
class ScreenReaderOnly {
  constructor() {
    this.className = 'sr-only';
    this._addStyles();
  }

  /**
   * Add screen reader only styles if not already present
   */
  _addStyles() {
    // Check if styles already exist
    if (document.getElementById('sr-only-styles')) return;

    const styles = `
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

      /* Allow screen reader to announce when element becomes visible */
      .sr-only:focus {
        position: static;
        width: auto;
        height: auto;
        margin: 0;
        overflow: visible;
        clip: auto;
        white-space: normal;
      }
    `;

    const styleElement = document.createElement('style');
    styleElement.id = 'sr-only-styles';
    styleElement.textContent = styles;
    document.head.appendChild(styleElement);
  }

  /**
   * Add screen reader only class to element
   * @param {HTMLElement} element - Element to make screen reader only
   */
  add(element) {
    element.classList.add(this.className);
  }

  /**
   * Remove screen reader only class from element
   * @param {HTMLElement} element - Element to remove screen reader only class from
   */
  remove(element) {
    element.classList.remove(this.className);
  }

  /**
   * Toggle screen reader only class on element
   * @param {HTMLElement} element - Element to toggle
   * @param {boolean} force - Force add or remove
   */
  toggle(element, force) {
    element.classList.toggle(this.className, force);
  }
}

// Export for module usage
export { ScreenReaderSupport, ScreenReaderOnly };

// Initialize screen reader support when DOM is ready
let screenReaderSupport = null;
let screenReaderOnlyUtil = null;

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    screenReaderSupport = new ScreenReaderSupport();
    screenReaderOnlyUtil = new ScreenReaderOnly();
  });
} else {
  screenReaderSupport = new ScreenReaderSupport();
  screenReaderOnlyUtil = new ScreenReaderOnly();
}

// Make accessible globally for other components
if (typeof window !== 'undefined') {
  window.ScreenReaderSupport = ScreenReaderSupport;
  window.ScreenReaderOnly = ScreenReaderOnly;
  window.screenReaderSupport = screenReaderSupport;
  window.screenReaderOnlyUtil = screenReaderOnlyUtil;
}
