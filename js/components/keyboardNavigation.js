/**
 * Keyboard Navigation Component
 * Ensures full keyboard navigation compliance for the healthy catering landing page.
 * Implements WCAG 2.1 Level AA keyboard navigation requirements.
 */

class KeyboardNavigation {
  constructor() {
    this.config = {
      skipLinkSelector: '.skip-link',
      focusableSelectors: [
        'a[href]',
        'button:not([disabled])',
        'input:not([disabled])',
        'select:not([disabled])',
        'textarea:not([disabled])',
        '[tabindex]:not([tabindex="-1"])',
        'audio[controls]',
        'video[controls]',
        '[contenteditable]:not([contenteditable="false"])',
      ].join(', '),
      modals: [],
    };

    this.elements = {
      skipLink: null,
      focusableElements: [],
      body: document.body,
    };

    this.state = {
      previousActiveElement: null,
      isNavigationTrapped: false,
    };

    this.init();
  }

  /**
   * Initialize keyboard navigation component
   */
  init() {
    try {
      this.cacheElements();
      this.setupSkipLink();
      this.setupGlobalKeyboardListeners();
      this.setupFocusManagement();
      this.validateTabOrder();
    } catch (error) {
      console.error('KeyboardNavigation initialization failed:', error);
    }
  }

  /**
   * Cache DOM elements
   */
  cacheElements() {
    this.elements.skipLink = document.querySelector(this.config.skipLinkSelector);
    this.elements.body = document.body;
  }

  /**
   * Setup skip-to-content link functionality
   * Requirement 9.2: Skip-to-content link for keyboard users
   */
  setupSkipLink() {
    if (!this.elements.skipLink) {
      console.warn('Skip link not found. Ensure skip-link class is applied to skip-to-content link.');
      return;
    }

    this.elements.skipLink.addEventListener('click', (e) => {
      e.preventDefault();
      
      // Find main content element
      const mainContent = document.getElementById('main-content') || 
                          document.querySelector('main') ||
                          document.getElementById('content');
      
      if (mainContent) {
        // Set focus to main content
        mainContent.setAttribute('tabindex', '-1');
        mainContent.focus();
        
        // Announce navigation change for screen readers
        this.announceToScreenReader('Skipped to main content');
        
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
   * Setup global keyboard listeners for activation keys
   * Requirement 9.2: Enter/Space activation for buttons and interactive elements
   */
  setupGlobalKeyboardListeners() {
    // Handle Enter and Space key activation
    document.addEventListener('keydown', (e) => {
      // Only trigger for interactive elements
      if (!this.isInteractiveElement(e.target)) return;
      
      // Handle Space key (prevent scrolling for interactive elements)
      if (e.key === ' ' && this.isInteractiveElement(e.target)) {
        // Only prevent default for interactive elements, not for scrolling
        if (e.target.tagName !== 'INPUT' && 
            e.target.tagName !== 'TEXTAREA' && 
            e.target.tagName !== 'SELECT' &&
            e.target.getAttribute('contenteditable') !== 'true') {
          e.preventDefault();
          this.triggerActivation(e.target);
        }
      }
    });

    // Handle Enter key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && this.isInteractiveElement(e.target)) {
        this.triggerActivation(e.target);
      }
    });
  }

  /**
   * Setup focus management
   * Requirement 9.2: Focus indicators and trap focus within modals
   */
  setupFocusManagement() {
    // Add focus event listeners to all focusable elements
    const updateFocusStyle = (element) => {
      element.addEventListener('focus', () => {
        this.applyFocusStyles(element);
      });
      
      element.addEventListener('blur', () => {
        this.removeFocusStyles(element);
      });
    };

    // Apply to all focusable elements
    this.updateFocusableElements();
    this.config.focusableSelectors.split(', ').forEach(selector => {
      document.querySelectorAll(selector).forEach(updateFocusStyle);
    });

    // Periodically update focusable elements (for dynamically added content)
    this.focusUpdateInterval = setInterval(() => {
      this.updateFocusableElements();
    }, 1000);
  }

  /**
   * Update list of focusable elements
   */
  updateFocusableElements() {
    try {
      this.elements.focusableElements = Array.from(
        document.querySelectorAll(this.config.focusableSelectors)
      ).filter(element => {
        // Filter out elements with negative tabindex
        if (element.getAttribute('tabindex') === '-1') {
          return false;
        }
        // Filter out hidden elements
        if (element.offsetParent === null && element.type !== 'hidden') {
          return false;
        }
        return true;
      });
    } catch (error) {
      console.error('Error updating focusable elements:', error);
    }
  }

  /**
   * Apply focus styles to element
   * Requirement 9.2: Visible focus indicator with minimum 2px outline
   */
  applyFocusStyles(element) {
    // Only apply custom focus styles to keyboard navigation
    if (this.state.isNavigationTrapped) {
      element.style.outline = '2px solid #4CAF50';
      element.style.outlineOffset = '2px';
    }
  }

  /**
   * Remove focus styles from element
   */
  removeFocusStyles(element) {
    element.style.outline = '';
    element.style.outlineOffset = '';
  }

  /**
   * Check if element is interactive
   */
  isInteractiveElement(element) {
    const interactiveTags = ['BUTTON', 'A', 'INPUT', 'SELECT', 'TEXTAREA'];
    const hasRole = element.getAttribute('role') === 'button';
    const isContentEditable = element.getAttribute('contenteditable') === 'true';
    
    return interactiveTags.includes(element.tagName) || 
           hasRole || 
           isContentEditable;
  }

  /**
   * Trigger activation for interactive element
   * Requirement 9.2: Enter/Space activation for buttons
   */
  triggerActivation(element) {
    // Clone and dispatch click event
    const event = new Event('click', {
      bubbles: true,
      cancelable: true,
    });
    
    element.dispatchEvent(event);
  }

  /**
   * Validate tab order follows visual structure
   * Requirement 9.2: Tab/Shift+Tab navigation order follows visual structure
   */
  validateTabOrder() {
    // This method logs tab order information for debugging
    // A comprehensive tab order test would require manual testing or automated tools
    
    const focusableElements = Array.from(document.querySelectorAll(this.config.focusableSelectors));
    const visibleElements = focusableElements.filter(el => {
      const style = window.getComputedStyle(el);
      return style.display !== 'none' && style.visibility !== 'hidden';
    });

    console.log('Tab order validation:', {
      totalFocusable: visibleElements.length,
      elements: visibleElements.map(el => ({
        tag: el.tagName,
        text: el.innerText?.substring(0, 30) || '',
        tabindex: el.getAttribute('tabindex') || 'default',
      })),
    });

    // Note: Automated tab order validation is limited. Manual testing recommended.
    // Common issues:
    // - Focusable elements that are visually hidden
    // - Non-interactive elements with tabindex
    // - Elements with incorrect tabindex order
  }

  /**
   * Trap focus within a container (for modals)
   * Requirement 9.2: Focus trap within modals
   */
  trapFocus(container) {
    if (!container) return;

    this.state.isNavigationTrapped = true;
    this.state.previousActiveElement = document.activeElement;

    // Add focus trap listener
    const trapFocus = (e) => {
      if (e.key !== 'Tab') return;

      const focusableElements = this.getFocusableElements(container);
      
      if (focusableElements.length === 0) {
        e.preventDefault();
        return;
      }

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (e.shiftKey) {
        // Shift + Tab: going backwards
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        }
      } else {
        // Tab: going forwards
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    };

    container.addEventListener('keydown', trapFocus);

    // Store trap info for release
    this.config.modals.push({
      container,
      trapFocus,
    });

    // Focus first element
    setTimeout(() => {
      firstElement.focus();
    }, 100);
  }

  /**
   * Release focus trap
   */
  releaseFocusTrap() {
    this.state.isNavigationTrapped = false;
    
    if (this.state.previousActiveElement) {
      this.state.previousActiveElement.focus();
      this.state.previousActiveElement = null;
    }

    // Remove all trap listeners
    this.config.modals.forEach(trap => {
      trap.container.removeEventListener('keydown', trap.trapFocus);
    });
    
    this.config.modals = [];
  }

  /**
   * Get focusable elements within a container
   */
  getFocusableElements(container) {
    return Array.from(container.querySelectorAll(this.config.focusableSelectors))
      .filter(element => {
        if (element.getAttribute('tabindex') === '-1') return false;
        const style = window.getComputedStyle(element);
        return style.display !== 'none' && style.visibility !== 'hidden';
      });
  }

  /**
   * Announce message to screen readers
   * Requirement 9.3: Screen reader announcements
   */
  announceToScreenReader(message) {
    // Create or reuse live region for announcements
    let announcer = document.getElementById('announcer');
    
    if (!announcer) {
      announcer = document.createElement('div');
      announcer.id = 'announcer';
      announcer.setAttribute('role', 'status');
      announcer.setAttribute('aria-live', 'polite');
      announcer.setAttribute('aria-atomic', 'true');
      announcer.style.cssText = 'position: absolute; left: -10000px; width: 1px; height: 1px; overflow: hidden;';
      document.body.appendChild(announcer);
    }

    // Clear and set message
    announcer.textContent = '';
    setTimeout(() => {
      announcer.textContent = message;
    }, 100);
  }

  /**
   * Get all focusable elements in document
   */
  getAllFocusableElements() {
    return this.elements.focusableElements;
  }

  /**
   * Find first focusable element
   */
  findFirstFocusable() {
    return this.elements.focusableElements[0] || null;
  }

  /**
   * Find last focusable element
   */
  findLastFocusable() {
    return this.elements.focusableElements[this.elements.focusableElements.length - 1] || null;
  }

  /**
   * Destroy the keyboard navigation instance
   */
  destroy() {
    // Clear interval
    if (this.focusUpdateInterval) {
      clearInterval(this.focusUpdateInterval);
    }

    // Release focus trap
    this.releaseFocusTrap();

    // Remove announcer
    const announcer = document.getElementById('announcer');
    if (announcer) {
      announcer.remove();
    }
  }

  /**
   * Get keyboard navigation state
   */
  getState() {
    return {
      isNavigationTrapped: this.state.isNavigationTrapped,
      focusableCount: this.elements.focusableElements.length,
      modalsTrapped: this.config.modals.length,
    };
  }

  /**
   * Check if keyboard navigation is enabled
   */
  isKeyboardNavigationEnabled() {
    // Check if user is likely using keyboard navigation
    // This is a heuristic - actual detection would require more complex logic
    return true; // Always enabled for this implementation
  }
}

// Initialize keyboard navigation when DOM is ready
let keyboardNavigationInstance = null;

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    try {
      keyboardNavigationInstance = new KeyboardNavigation();
    } catch (error) {
      console.error('Failed to initialize KeyboardNavigation:', error);
    }
  });
} else {
  try {
    keyboardNavigationInstance = new KeyboardNavigation();
  } catch (error) {
    console.error('Failed to initialize KeyboardNavigation:', error);
  }
}

// Export for potential module usage
export { KeyboardNavigation };
