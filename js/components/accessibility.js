/**
 * Accessibility Component
 * Healthy Catering Landing Page
 * 
 * Implements comprehensive accessibility features for WCAG 2.1 Level AA compliance:
 * - ARIA labels, roles, and attributes for interactive elements
 * - Proper heading hierarchy management
 * - Live regions for dynamic content announcements
 * - Screen reader only utility class
 * - Focus management utilities
 * - Keyboard navigation support
 * 
 * Requirements: 9.1, 9.2, 9.6
 */

/**
 * Accessibility Manager
 * Handles all accessibility features for the landing page
 */
class AccessibilityManager {
  constructor() {
    this.config = {
      liveRegionId: 'sr-live-region',
      skipLinkId: 'skip-link',
      focusableSelectors: 'a, button, input, select, textarea, [tabindex]:not([tabindex="-1"])',
    };

    this.elements = {
      skipLink: null,
      mainContent: null,
      liveRegion: null,
    };

    this.init();
  }

  /**
   * Initialize accessibility features
   */
  init() {
    this.cacheElements();
    this.setupLiveRegion();
    this.setupSkipLink();
    this.ensureProperHeadingHierarchy();
    this.addMissingARIAAttributes();
    this.setupFocusManagement();
  }

  /**
   * Cache DOM elements
   */
  cacheElements() {
    this.elements.skipLink = document.getElementById(this.config.skipLinkId);
    this.elements.mainContent = document.getElementById('main-content');
    this.elements.liveRegion = document.getElementById(this.config.liveRegionId);
  }

  /**
   * Setup live region for screen reader announcements
   */
  setupLiveRegion() {
    if (!this.elements.liveRegion) {
      // Create live region if it doesn't exist
      this.elements.liveRegion = document.createElement('div');
      this.elements.liveRegion.id = this.config.liveRegionId;
      this.elements.liveRegion.className = 'sr-only';
      this.elements.liveRegion.setAttribute('role', 'status');
      this.elements.liveRegion.setAttribute('aria-live', 'polite');
      this.elements.liveRegion.setAttribute('aria-atomic', 'true');
      
      // Append to body
      document.body.appendChild(this.elements.liveRegion);
    }
  }

  /**
   * Setup skip-to-content link functionality
   */
  setupSkipLink() {
    if (!this.elements.skipLink || !this.elements.mainContent) return;

    this.elements.skipLink.addEventListener('click', (e) => {
      e.preventDefault();
      
      // Set focus to main content area
      this.elements.mainContent.setAttribute('tabindex', '-1');
      this.elements.mainContent.focus();
      
      // Remove tabindex after user navigates away
      const handleBlur = () => {
        this.elements.mainContent.removeAttribute('tabindex');
        this.elements.mainContent.removeEventListener('blur', handleBlur);
      };
      
      this.elements.mainContent.addEventListener('blur', handleBlur);
    });

    // Ensure skip link is visible on focus
    this.elements.skipLink.addEventListener('focus', () => {
      this.elements.skipLink.style.position = 'absolute';
      this.elements.skipLink.style.top = '0';
      this.elements.skipLink.style.left = '0';
      this.elements.skipLink.style.zIndex = '1000';
    });

    this.elements.skipLink.addEventListener('blur', () => {
      this.elements.skipLink.style.position = '';
      this.elements.skipLink.style.top = '';
      this.elements.skipLink.style.left = '';
      this.elements.skipLink.style.zIndex = '';
    });
  }

  /**
   * Ensure proper heading hierarchy
   */
  ensureProperHeadingHierarchy() {
    // Define expected heading structure
    const sections = [
      { id: 'home', expectedLevel: 1 },
      { id: 'services', expectedLevel: 2 },
      { id: 'menu', expectedLevel: 2 },
      { id: 'about', expectedLevel: 2 },
      { id: 'contact', expectedLevel: 2 },
    ];

    sections.forEach((section) => {
      const sectionElement = document.getElementById(section.id);
      if (!sectionElement) return;

      // Find the main heading in the section
      const currentH1 = sectionElement.querySelector('h1');
      const currentH2 = sectionElement.querySelector('h2');

      if (currentH1 && section.expectedLevel !== 1) {
        // Convert h1 to h2 for subsections
        currentH1.tagName = 'H2';
        currentH1.setAttribute('id', currentH1.getAttribute('id') || section.id);
      } else if (currentH2 && section.expectedLevel === 1) {
        // Convert h2 to h1 for main section
        currentH2.tagName = 'H1';
        currentH2.setAttribute('id', currentH2.getAttribute('id') || section.id);
      }
    });
  }

  /**
   * Add missing ARIA attributes to interactive elements
   */
  addMissingARIAAttributes() {
    // Add role="banner" to navigation
    const nav = document.querySelector('nav[role="navigation"]');
    if (nav && !nav.getAttribute('role')) {
      nav.setAttribute('role', 'navigation');
    }

    // Add role="main" to main content area if not present
    const main = document.querySelector('main');
    if (main && !main.getAttribute('role')) {
      main.setAttribute('role', 'main');
    }

    // Add role="contentinfo" to footer
    const footer = document.querySelector('footer');
    if (footer && !footer.getAttribute('role')) {
      footer.setAttribute('role', 'contentinfo');
    }

    // Add aria-label to landmark regions
    this._ensureLandmarkLabels();

    // Add role="search" to search forms (if any)
    const searchForm = document.querySelector('form[role="search"]');
    if (searchForm && !searchForm.getAttribute('role')) {
      searchForm.setAttribute('role', 'search');
    }
  }

  /**
   * Ensure landmark regions have appropriate labels
   */
  _ensureLandmarkLabels() {
    // Main navigation
    const nav = document.querySelector('nav');
    if (nav && !nav.getAttribute('aria-label')) {
      nav.setAttribute('aria-label', 'Main navigation');
    }

    // Footer navigation
    const footerNav = document.querySelector('footer nav');
    if (footerNav && !footerNav.getAttribute('aria-label')) {
      footerNav.setAttribute('aria-label', 'Footer navigation');
    }
  }

  /**
   * Setup focus management utilities
   */
  setupFocusManagement() {
    // Add focus event listeners for visible focus indicators
    document.addEventListener('focusin', (e) => {
      if (this._isFocusableElement(e.target)) {
        e.target.style.outlineWidth = '2px';
        e.target.style.outlineStyle = 'solid';
        e.target.style.outlineOffset = '2px';
      }
    });

    document.addEventListener('focusout', (e) => {
      if (this._isFocusableElement(e.target)) {
        e.target.style.outlineWidth = '';
        e.target.style.outlineStyle = '';
        e.target.style.outlineOffset = '';
      }
    });

    // Ensure form fields have proper ARIA attributes
    this._ensureFormAccessibility();
  }

  /**
   * Check if element is focusable
   * @param {HTMLElement} element - Element to check
   * @returns {boolean} True if element is focusable
   */
  _isFocusableElement(element) {
    return element.matches(this.config.focusableSelectors);
  }

  /**
   * Ensure form accessibility attributes
   */
  _ensureFormAccessibility() {
    const forms = document.querySelectorAll('form');
    
    forms.forEach((form) => {
      // Ensure form has role="form" if no other role
      if (!form.getAttribute('role')) {
        form.setAttribute('role', 'form');
      }

      // Add aria-describedby to form for error announcements
      const statusId = form.id + '-status';
      const statusElement = document.getElementById(statusId) || document.getElementById('form-status');
      
      if (statusElement && !form.getAttribute('aria-describedby')) {
        form.setAttribute('aria-describedby', statusId);
      }

      // Ensure form fields have proper attributes
      const inputs = form.querySelectorAll('input, select, textarea');
      
      inputs.forEach((input) => {
        this._ensureFieldAccessibility(input, form);
      });
    });
  }

  /**
   * Ensure individual form field accessibility
   * @param {HTMLElement} field - Form field element
   * @param {HTMLElement} form - Parent form element
   */
  _ensureFieldAccessibility(field, form) {
    const fieldId = field.id;
    const fieldName = field.name;
    
    // Get label for this field
    let label = null;
    if (fieldId) {
      label = document.querySelector(`label[for="${fieldId}"]`);
    }
    
    if (!label) {
      label = field.closest('.form-group')?.querySelector('label');
    }

    if (label) {
      // Ensure label has for attribute matching field id
      if (!label.getAttribute('for') && fieldId) {
        label.setAttribute('for', fieldId);
      }

      // Get error element if exists
      const errorId = fieldId ? `${fieldId}-error` : null;
      const errorElement = errorId ? document.getElementById(errorId) : null;

      // Add aria-describedby with all relevant IDs
      const describedByParts = [];
      if (errorElement) {
        describedByParts.push(errorElement.id);
      }
      
      // Add any existing describedBy values
      const currentDescribedBy = field.getAttribute('aria-describedby');
      if (currentDescribedBy) {
        describedByParts.push(currentDescribedBy);
      }

      if (describedByParts.length > 0) {
        field.setAttribute('aria-describedby', describedByParts.join(' ').trim());
      }

      // Add aria-labelledby if label exists
      if (!field.getAttribute('aria-labelledby') && label.id) {
        field.setAttribute('aria-labelledby', label.id);
      }

      // Ensure proper required/optional state
      if (field.required) {
        field.setAttribute('aria-required', 'true');
      } else {
        field.setAttribute('aria-required', 'false');
      }

      // Add autocomplete attributes for form fields where appropriate
      this._addAutocompleteAttributes(field);
    }
  }

  /**
   * Add autocomplete attributes to form fields
   * @param {HTMLElement} field - Form field element
   */
  _addAutocompleteAttributes(field) {
    const nameAttributes = ['name', 'username', 'nickname'];
    const emailAttributes = ['email', 'e-mail'];
    const telAttributes = ['phone', 'tel', 'telephone'];
    const addressAttributes = ['address', 'street', 'location'];

    const fieldName = field.name.toLowerCase();

    if (nameAttributes.some(attr => fieldName.includes(attr))) {
      field.setAttribute('autocomplete', 'name');
    }

    if (emailAttributes.some(attr => fieldName.includes(attr))) {
      field.setAttribute('autocomplete', 'email');
    }

    if (telAttributes.some(attr => fieldName.includes(attr))) {
      field.setAttribute('autocomplete', 'tel');
    }

    if (addressAttributes.some(attr => fieldName.includes(attr))) {
      field.setAttribute('autocomplete', 'street-address');
    }

    if (fieldName.includes('zip') || fieldName.includes('postal')) {
      field.setAttribute('autocomplete', 'postal-code');
    }
  }

  /**
   * Announce message to screen readers
   * @param {string} message - Message to announce
   * @param {string} priority - 'polite' or 'assertive'
   */
  announce(message, priority = 'polite') {
    if (!this.elements.liveRegion) return;

    // Clear existing content and set new message
    this.elements.liveRegion.textContent = '';
    this.elements.liveRegion.setAttribute('aria-live', priority);
    
    // Force announcement by changing content
    setTimeout(() => {
      this.elements.liveRegion.textContent = message;
    }, 50);
  }

  /**
   * Announce form validation errors
   * @param {Object} errors - Map of field names to error messages
   * @param {number} totalErrors - Total number of errors
   */
  announceFormErrors(errors, totalErrors) {
    const errorMessages = Array.from(errors.values()).join('. ');
    this.announce(`${totalErrors} validation errors found. ${errorMessages}`, 'assertive');
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
   * Get screen reader only class
   * @returns {string} CSS class string
   */
  getScreenReaderOnlyClass() {
    return 'sr-only';
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
   * Trap focus within a container (for modals, etc.)
   * @param {HTMLElement} container - Container to trap focus within
   * @returns {Function} Function to release focus trap
   */
  trapFocus(container) {
    const focusableElements = container.querySelectorAll(this.config.focusableSelectors);
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
   * Destroy the accessibility manager
   */
  destroy() {
    // Remove event listeners
    document.removeEventListener('focusin', () => {});
    document.removeEventListener('focusout', () => {});
  }
}

/**
 * Screen Reader Only CSS Class Implementation
 * Use this utility to add screen reader only styling to elements
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
export { AccessibilityManager, ScreenReaderOnly };

// Initialize accessibility when DOM is ready
let accessibilityManager = null;
let screenReaderOnly = null;

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    accessibilityManager = new AccessibilityManager();
    screenReaderOnly = new ScreenReaderOnly();
  });
} else {
  accessibilityManager = new AccessibilityManager();
  screenReaderOnly = new ScreenReaderOnly();
}

// Make accessible globally for other components
if (typeof window !== 'undefined') {
  window.AccessibilityManager = AccessibilityManager;
  window.ScreenReaderOnly = ScreenReaderOnly;
  window.accessibilityManager = accessibilityManager;
  window.screenReaderOnly = screenReaderOnly;
}
