/**
 * Integration Module - Healthy Catering Landing Page
 * 
 * Main integration file that connects all components and manages initialization order.
 * Implements smooth navigation, form-to-email service connection, lazy loading,
 * and component communication.
 * 
 * Requirements: All requirements (final integration task)
 */

/**
 * Component Registry
 * Maintains references to initialized components for cross-component communication
 */
class ComponentRegistry {
  constructor() {
    this.components = new Map();
  }

  /**
   * Register a component
   * @param {string} name - Component name
   * @param {Object} instance - Component instance
   */
  register(name, instance) {
    if (!name || !instance) {
      throw new Error('Component name and instance are required');
    }
    this.components.set(name, instance);
    console.log(`Component registered: ${name}`);
  }

  /**
   * Get a registered component
   * @param {string} name - Component name
   * @returns {Object|null} Component instance or null if not found
   */
  get(name) {
    return this.components.get(name) || null;
  }

  /**
   * Check if a component is registered
   * @param {string} name - Component name
   * @returns {boolean} True if component is registered
   */
  has(name) {
    return this.components.has(name);
  }

  /**
   * Get all registered components
   * @returns {Map<string, Object>} Map of component names to instances
   */
  getAll() {
    return this.components;
  }

  /**
   * Unregister a component
   * @param {string} name - Component name
   */
  unregister(name) {
    this.components.delete(name);
    console.log(`Component unregistered: ${name}`);
  }
}

/**
 * Event Manager
 * Handles cross-component communication through a centralized event bus
 */
class EventManager {
  constructor() {
    this.events = new Map();
    this.observer = null;
  }

  /**
   * Subscribe to an event
   * @param {string} eventName - Event name
   * @param {Function} callback - Callback function
   * @param {Object} context - Context for callback (optional)
   * @returns {Function} Unsubscribe function
   */
  on(eventName, callback, context = null) {
    if (!this.events.has(eventName)) {
      this.events.set(eventName, []);
    }

    const handler = { callback, context };
    this.events.get(eventName).push(handler);

    return () => {
      this.off(eventName, callback);
    };
  }

  /**
   * Unsubscribe from an event
   * @param {string} eventName - Event name
   * @param {Function} callback - Callback function
   */
  off(eventName, callback) {
    if (!this.events.has(eventName)) return;

    const handlers = this.events.get(eventName);
    const filtered = handlers.filter(h => h.callback !== callback);
    this.events.set(eventName, filtered);
  }

  /**
   * Emit an event
   * @param {string} eventName - Event name
   * @param {Object} data - Event data
   */
  emit(eventName, data = {}) {
    if (!this.events.has(eventName)) return;

    const handlers = this.events.get(eventName);
    handlers.forEach(handler => {
      try {
        handler.callback.call(handler.context, data);
      } catch (error) {
        console.error(`Error in event handler for "${eventName}":`, error);
      }
    });
  }

  /**
   * Connect components through events
   * @param {string} sourceComponent - Source component name
   * @param {string} sourceEvent - Source event name
   * @param {string} targetComponent - Target component name
   * @param {string} targetMethod - Target method name
   */
  connect(sourceComponent, sourceEvent, targetComponent, targetMethod) {
    const registry = ComponentRegistry.getInstance();
    
    if (!registry.has(sourceComponent)) {
      console.warn(`Source component "${sourceComponent}" not registered`);
      return;
    }

    if (!registry.has(targetComponent)) {
      console.warn(`Target component "${targetComponent}" not registered`);
      return;
    }

    const sourceInstance = registry.get(sourceComponent);
    const targetInstance = registry.get(targetComponent);

    // Create proxy method on target component if it doesn't exist
    if (typeof targetInstance[targetMethod] !== 'function') {
      console.warn(`Method "${targetMethod}" not found on component "${targetComponent}"`);
      return;
    }

    // Subscribe to source event
    const unsubscribe = this.on(sourceEvent, (data) => {
      try {
        targetInstance[targetMethod](data);
      } catch (error) {
        console.error(`Error calling "${targetMethod}" on "${targetComponent}":`, error);
      }
    });

    // Store unsubscribe function for cleanup
    if (!this.disconnects) {
      this.disconnects = [];
    }
    this.disconnects.push(unsubscribe);
  }

  /**
   * Disconnect all event listeners
   */
  disconnectAll() {
    if (this.disconnects) {
      this.disconnects.forEach(unsubscribe => unsubscribe());
      this.disconnects = [];
    }

    this.events.clear();
  }
}

// Initialize singleton instances
const ComponentRegistry = (function() {
  let instance = null;

  return {
    getInstance() {
      if (!instance) {
        instance = new ComponentRegistry();
      }
      return instance;
    },
    reset() {
      instance = null;
    }
  };
})();

const EventManager = (function() {
  let instance = null;

  return {
    getInstance() {
      if (!instance) {
        instance = new EventManager();
      }
      return instance;
    },
    reset() {
      instance = null;
    }
  };
})();

/**
 * Main Integration Class
 * Coordinates all components and manages the application lifecycle
 */
class Integration {
  constructor() {
    this.registry = ComponentRegistry.getInstance();
    this.eventManager = EventManager.getInstance();
    this.isInitialized = false;
    this.initializationErrors = [];

    // Configuration
    this.config = {
      initializationOrder: [
        'accessibilityManager',
        'keyboardNavigation',
        'screenReaderSupport',
        'navigation',
        'lazyLoader',
        'formValidator',
        'formHandler',
        'emailService',
        'heroOptimizer',
        'imageErrorHandler',
        'contrastChecker',
      ],
      componentConfigs: {
        navigation: {
          breakpoint: 768,
          scrollSpeed: 500,
        },
        lazyLoader: {
          rootMargin: '200px',
          threshold: 0.1,
        },
        emailService: {
          provider: 'formsubmit',
          businessEmail: 'info@healthy-catering.com',
        },
      },
    };
  }

  /**
   * Initialize all components in the correct order
   * @returns {Promise<void>}
   */
  async init() {
    if (this.isInitialized) {
      console.log('Integration already initialized');
      return;
    }

    console.log('Starting integration initialization...');

    try {
      // Load and initialize components in order
      await this._loadAndInitializeComponents();

      // Connect components through events
      this._connectComponents();

      this.isInitialized = true;
      console.log('Integration initialization completed successfully');
      
      // Emit initialization complete event
      this.eventManager.emit('integration:ready', {
        timestamp: Date.now(),
        componentCount: this.registry.getAll().size,
      });

    } catch (error) {
      console.error('Integration initialization failed:', error);
      this.initializationErrors.push(error);
      throw error;
    }
  }

  /**
   * Load and initialize all components in order
   * @returns {Promise<void>}
   */
  async _loadAndInitializeComponents() {
    // Track initialization promises
    const initPromises = [];

    // Helper to initialize a component
    const initializeComponent = async (componentName, config = {}) => {
      try {
        // Import the component module
        let module;
        
        switch (componentName) {
          case 'accessibilityManager':
            module = await import('./accessibility.js');
            const accessibilityManager = new module.AccessibilityManager();
            this.registry.register('accessibilityManager', accessibilityManager);
            break;

          case 'keyboardNavigation':
            module = await import('./keyboardNavigation.js');
            const keyboardNavigation = new module.KeyboardNavigation();
            this.registry.register('keyboardNavigation', keyboardNavigation);
            break;

          case 'screenReaderSupport':
            module = await import('./screenReaderSupport.js');
            const screenReaderSupport = new module.ScreenReaderSupport();
            this.registry.register('screenReaderSupport', screenReaderSupport);
            break;

          case 'navigation':
            module = await import('./navigation.js');
            const navigation = new module.Navigation(config);
            this.registry.register('navigation', navigation);
            break;

          case 'lazyLoader':
            module = await import('./lazyLoader.js');
            const lazyLoader = new module.LazyLoader();
            this.registry.register('lazyLoader', lazyLoader);
            break;

          case 'formValidator':
            const form = document.getElementById('contactForm');
            if (form) {
              module = await import('./formValidation.js');
              const formValidator = new module.FormValidator(form);
              this.registry.register('formValidator', formValidator);
            } else {
              console.warn('Form not found, skipping formValidator initialization');
            }
            break;

          case 'formHandler':
            const validator = this.registry.get('formValidator');
            if (validator) {
              module = await import('./formHandler.js');
              const formHandler = new module.FormHandler(
                document.getElementById('contactForm'),
                validator
              );
              this.registry.register('formHandler', formHandler);
            } else {
              console.warn('FormValidator not found, skipping formHandler initialization');
            }
            break;

          case 'emailService':
            module = await import('./emailService.js');
            const emailService = new module.EmailService(config);
            this.registry.register('emailService', emailService);
            break;

          case 'heroOptimizer':
            module = await import('./heroOptimizer.js');
            const heroOptimizer = new module.HeroOptimizer();
            this.registry.register('heroOptimizer', heroOptimizer);
            break;

          case 'imageErrorHandler':
            module = await import('./imageErrorHandler.js');
            const imageErrorHandler = new module.ImageErrorHandler();
            this.registry.register('imageErrorHandler', imageErrorHandler);
            break;

          case 'contrastChecker':
            module = await import('./contrastChecker.js');
            // ContrastChecker uses static functions, no instantiation needed
            this.registry.register('contrastChecker', module);
            break;

          default:
            console.warn(`Unknown component: ${componentName}`);
        }
      } catch (error) {
        console.error(`Failed to initialize ${componentName}:`, error);
        this.initializationErrors.push({ component: componentName, error });
      }
    };

    // Initialize each component in order
    for (const componentName of this.config.initializationOrder) {
      const config = this.config.componentConfigs[componentName] || {};
      await initializeComponent(componentName, config);
    }

    // Check for any initialization errors
    if (this.initializationErrors.length > 0) {
      console.warn('Some components failed to initialize:', this.initializationErrors);
    }
  }

  /**
   * Connect components through events
   */
  _connectComponents() {
    // Connect navigation smooth scroll to form submission
    this.eventManager.on('form:submit', (data) => {
      const navigation = this.registry.get('navigation');
      if (navigation) {
        navigation.closeMenu();
      }
    });

    // Connect form validation to form handler
    this.eventManager.on('form:validSubmit', (data) => {
      const formHandler = this.registry.get('formHandler');
      if (formHandler) {
        // Form handler is already set up to listen for this event
      }
    });

    // Connect form submission to email service
    this.eventManager.on('form:validSubmit', (formData) => {
      const emailService = this.registry.get('emailService');
      if (emailService) {
        // Email service is already set up through formEmailHandler
      }
    });

    // Connect image lazy loading to page scroll
    this.eventManager.on('scroll:throttled', (data) => {
      const lazyLoader = this.registry.get('lazyLoader');
      if (lazyLoader) {
        // Lazy loader handles scroll internally
      }
    });

    // Connect accessibility manager to other components
    this.eventManager.on('form:errors', (data) => {
      const accessibilityManager = this.registry.get('accessibilityManager');
      if (accessibilityManager && typeof accessibilityManager.announceFormErrors === 'function') {
        accessibilityManager.announceFormErrors(data.errors, data.totalErrors);
      }
    });

    this.eventManager.on('form:success', (data) => {
      const accessibilityManager = this.registry.get('accessibilityManager');
      if (accessibilityManager && typeof accessibilityManager.announceFormSuccess === 'function') {
        accessibilityManager.announceFormSuccess(data.message);
      }
    });

    // Connect screen reader support to navigation
    this.eventManager.on('navigation:scrollEnd', (data) => {
      const screenReaderSupport = this.registry.get('screenReaderSupport');
      if (screenReaderSupport && typeof screenReaderSupport.announceNavigationChange === 'function') {
        screenReaderSupport.announceNavigationChange(data.sectionName);
      }
    });

    // Connect keyboard navigation to accessibility
    this.eventManager.on('focus:change', (data) => {
      const keyboardNavigation = this.registry.get('keyboardNavigation');
      if (keyboardNavigation && typeof keyboardNavigation.applyFocusStyles === 'function') {
        keyboardNavigation.applyFocusStyles(data.element);
      }
    });
  }

  /**
   * Handle cross-component communication
   */
  _handleComponentCommunication() {
    // Navigation component
    const navigation = this.registry.get('navigation');
    if (navigation && typeof navigation.smoothScrollTo === 'function') {
      // Navigation handles smooth scrolling internally
    }

    // Form validator
    const formValidator = this.registry.get('formValidator');
    if (formValidator) {
      // Form validator handles validation internally
    }

    // Lazy loader
    const lazyLoader = this.registry.get('lazyLoader');
    if (lazyLoader && typeof lazyLoader.setupObserver === 'function') {
      // Lazy loader handles image loading internally
    }

    // Email service
    const emailService = this.registry.get('emailService');
    if (emailService) {
      // Email service handles email sending internally
    }
  }

  /**
   * Trigger lazy loading for all images
   */
  triggerLazyLoading() {
    const lazyLoader = this.registry.get('lazyLoader');
    if (lazyLoader && typeof lazyLoader.setupObserver === 'function') {
      lazyLoader.setupObserver();
      console.log('Lazy loading triggered');
    }
  }

  /**
   * Validate form and trigger submission
   * @returns {Promise<boolean>} True if form is valid and submitted
   */
  async validateAndSubmitForm() {
    const formValidator = this.registry.get('formValidator');
    const formHandler = this.registry.get('formHandler');

    if (!formValidator || !formHandler) {
      console.error('Form validator or handler not initialized');
      return false;
    }

    // Trigger form validation
    const { isValid } = formValidator.validateAll();

    if (isValid) {
      // Trigger form submission
      this.eventManager.emit('form:validSubmit', formValidator._getFormData());
      return true;
    }

    return false;
  }

  /**
   * Navigate to a section
   * @param {string} sectionId - Section ID to navigate to
   * @returns {boolean} True if navigation succeeded
   */
  navigateToSection(sectionId) {
    const navigation = this.registry.get('navigation');

    if (navigation && typeof navigation.smoothScrollTo === 'function') {
      navigation.smoothScrollTo(`#${sectionId}`);
      return true;
    }

    console.error('Navigation component not available');
    return false;
  }

  /**
   * Refresh all lazy-loaded images
   */
  refreshLazyImages() {
    const lazyLoader = this.registry.get('lazyLoader');
    if (lazyLoader && typeof lazyLoader.loadAllImages === 'function') {
      lazyLoader.loadAllImages();
      console.log('Lazy images refreshed');
    }
  }

  /**
   * Reset the integration
   */
  reset() {
    console.log('Resetting integration...');

    // Disconnect event listeners
    this.eventManager.disconnectAll();

    // Destroy components
    this.registry.getAll().forEach((component, name) => {
      if (component && typeof component.destroy === 'function') {
        component.destroy();
      }
      this.registry.unregister(name);
    });

    this.isInitialized = false;
    this.initializationErrors = [];

    console.log('Integration reset complete');
  }

  /**
   * Get initialization status
   * @returns {Object} Initialization status
   */
  getStatus() {
    return {
      isInitialized: this.isInitialized,
      componentCount: this.registry.getAll().size,
      initializationErrors: this.initializationErrors.length,
      components: Array.from(this.registry.getAll().keys()),
    };
  }
}

// Initialize integration when DOM is ready
let integrationInstance = null;

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', async () => {
    try {
      integrationInstance = new Integration();
      await integrationInstance.init();
    } catch (error) {
      console.error('Failed to initialize integration:', error);
    }
  });
} else {
  try {
    integrationInstance = new Integration();
    await integrationInstance.init();
  } catch (error) {
    console.error('Failed to initialize integration:', error);
  }
}

// Export for potential module usage
export { Integration, ComponentRegistry, EventManager };

// Make available globally for debugging
if (typeof window !== 'undefined') {
  window.HealthyCateringIntegration = Integration;
  window.componentRegistry = () => ComponentRegistry.getInstance();
  window.eventManager = () => EventManager.getInstance();
}
