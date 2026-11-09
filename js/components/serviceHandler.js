/**
 * Service Handler Component
 * Handles service category loading, rendering, and error management
 * Requirements: 3.1, 3.2, 3.4, 3.5
 */

class ServiceHandler {
  /**
   * @param {Object} options - Configuration options
   * @param {string} options.containerSelector - CSS selector for the services grid container
   * @param {Array} options.defaultServices - Default service data if external loading fails
   * @param {number} options.maxRetries - Maximum number of retry attempts for failed services
   * @param {number} options.retryDelay - Delay in milliseconds between retry attempts
   */
  constructor(options = {}) {
    this.containerSelector = options.containerSelector || '.services__grid';
    this.maxRetries = options.maxRetries ?? 2;
    this.retryDelay = options.retryDelay ?? 1000;
    
    // Default service data
    this.defaultServices = options.defaultServices || [
      {
        id: 'corporate-events',
        title: 'Corporate Events',
        description: 'Professional catering for business meetings, conferences, and corporate gatherings.',
        icon: 'assets/icons/business-event.svg',
        features: [
          'Delivered hot meals',
          'Custom menu options',
          'Service staff available'
        ]
      },
      {
        id: 'weddings',
        title: 'Weddings',
        description: 'Elegant catering for your special day with custom menu design and professional service.',
        icon: 'assets/icons/wedding.svg',
        features: [
          'Custom menu design',
          'Professional service staff',
          'Beverage service options'
        ]
      },
      {
        id: 'fitness-retreats',
        title: 'Fitness Retreats',
        description: 'Nutrition-focused meals designed for fitness enthusiasts and wellness retreats.',
        icon: 'assets/icons/fitness.svg',
        features: [
          'High-protein options',
          'Organic ingredients',
          'Dietary-specific meals'
        ]
      },
      {
        id: 'personal-meal-prep',
        title: 'Personal Meal Prep',
        description: 'Weekly meal preparation services tailored to your dietary needs and preferences.',
        icon: 'assets/icons/meal-prep.svg',
        features: [
          'Weekly delivery',
          'Dietary-specific planning',
          'Flexible subscription options'
        ]
      }
    ];

    // Store service elements for error handling
    this.serviceElements = new Map();
    this.failedServices = new Map();
    this.loadingServices = new Set();
  }

  /**
   * Initialize the service handler
   */
  init() {
    this.container = document.querySelector(this.containerSelector);
    
    if (!this.container) {
      console.error('Service handler: Container not found', this.containerSelector);
      return;
    }

    this.renderLoadingState();
    this.loadServices();
  }

  /**
   * Load service data from JSON or use default data
   */
  async loadServices() {
    try {
      // Try to load from services.json first
      const serviceResponse = await fetch('data/services.json');
      
      if (!serviceResponse.ok) {
        throw new Error('Failed to load services.json');
      }

      const servicesData = await serviceResponse.json();
      
      if (!Array.isArray(servicesData) || servicesData.length === 0) {
        throw new Error('Invalid services data format');
      }

      this.renderServices(servicesData);

    } catch (error) {
      console.warn('Service handler: Using default service data due to error:', error.message);
      
      // Fallback to default data
      this.renderServices(this.defaultServices);
    }
  }

  /**
   * Render service cards to the DOM
   * @param {Array} services - Array of service objects
   */
  renderServices(services) {
    this.container.innerHTML = '';
    this.serviceElements.clear();
    this.failedServices.clear();
    this.loadingServices.clear();

    const fragment = document.createDocumentFragment();

    services.forEach(service => {
      const serviceCard = this.createServiceCard(service);
      fragment.appendChild(serviceCard);
      
      // Track the service element for error handling
      this.serviceElements.set(service.id, serviceCard);
    });

    this.container.appendChild(fragment);

    // Post-render: attempt to load icons
    this.loadServiceIcons();
  }

  /**
   * Create a service card element
   * @param {Object} service - Service data object
   * @returns {HTMLElement} - Service card DOM element
   */
  createServiceCard(service) {
    const card = document.createElement('article');
    card.className = 'service-card';
    card.setAttribute('role', 'button');
    card.setAttribute('tabindex', '0');
    card.setAttribute('aria-label', `${service.title} catering service`);
    card.setAttribute('data-service-id', service.id);

    // Loading state
    card.classList.add('service-card--loading');
    this.loadingServices.add(service.id);

    // Card content template
    card.innerHTML = `
      <div class="service-card__icon">
        <img 
          src="${service.icon || 'assets/icons/business-event.svg'}" 
          alt="${service.title} icon"
          width="64" 
          height="64"
          loading="lazy"
        >
      </div>
      <h3 class="service-card__title">${this.escapeHtml(service.title)}</h3>
      <p class="service-card__description">${this.escapeHtml(service.description)}</p>
      <ul class="service-card__features" role="list">
        ${service.features && service.features.length > 0 
          ? service.features.map(feature => 
              `<li>${this.escapeHtml(feature)}</li>`
            ).join('')
          : '<li>No features available</li>'
        }
      </ul>
    `;

    // Add keyboard interaction
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        this.handleServiceClick(service);
      }
    });

    card.addEventListener('click', () => this.handleServiceClick(service));

    // Error handling
    this.setupErrorHandling(card, service);

    return card;
  }

  /**
   * Setup error handling for a service card
   * @param {HTMLElement} card - Service card element
   * @param {Object} service - Service data
   */
  setupErrorHandling(card, service) {
    const img = card.querySelector('img');
    
    // Track image load errors
    img.addEventListener('error', () => {
      this.handleServiceError(card, service, 'icon-load-error');
    });

    // Timeout for service loading (in case of network issues)
    const loadTimeout = setTimeout(() => {
      if (this.loadingServices.has(service.id)) {
        this.handleServiceError(card, service, 'timeout');
      }
    }, 10000);

    // Store timeout reference for cleanup
    card.dataset.loadTimeout = loadTimeout;
  }

  /**
   * Handle service card errors
   * @param {HTMLElement} card - Service card element
   * @param {Object} service - Service data
   * @param {string} errorCode - Error code
   */
  handleServiceError(card, service, errorCode) {
    const serviceId = service.id || 'unknown';

    // Track the failure
    if (!this.failedServices.has(serviceId)) {
      this.failedServices.set(serviceId, {
        card,
        service,
        error: errorCode,
        retries: 0
      });
    }

    const failureInfo = this.failedServices.get(serviceId);

    // Check if we've exceeded max retries
    if (failureInfo.retries >= this.maxRetries) {
      this.displayErrorState(card, service, errorCode, true);
    } else {
      // Retry loading
      failureInfo.retries++;
      setTimeout(() => {
        this.retryServiceLoad(service, card);
      }, this.retryDelay * failureInfo.retries);
    }
  }

  /**
   * Retry loading a failed service
   * @param {Object} service - Service data
   * @param {HTMLElement} card - Service card element
   */
  retryServiceLoad(service, card) {
    const failureInfo = this.failedServices.get(service.id);
    
    if (!failureInfo) return;

    // Remove error state temporarily
    card.classList.remove('service-card--error');
    card.querySelector('.service-card__icon')?.classList.remove('service-card__icon--error');

    // Try to reload the icon
    const img = card.querySelector('img');
    if (img) {
      img.src = `${service.icon}?retry=${failureInfo.retries}&t=${Date.now()}`;
      img.onload = () => {
        this.loadingServices.delete(service.id);
        card.classList.remove('service-card--loading');
        // Remove error tracking since it succeeded
        this.failedServices.delete(service.id);
      };
      img.onerror = () => {
        this.handleServiceError(card, service, 'icon-retry-error');
      };
    }
  }

  /**
   * Display error state for a service card
   * @param {HTMLElement} card - Service card element
   * @param {Object} service - Service data
   * @param {string} errorCode - Error code
   * @param {boolean} isFinal - Whether this is the final error state
   */
  displayErrorState(card, service, errorCode, isFinal = false) {
    const serviceId = service.id || 'unknown';
    
    // Remove loading state
    this.loadingServices.delete(serviceId);
    card.classList.remove('service-card--loading');
    card.classList.remove('service-card--error');

    // If this is the final error, replace card with error state
    if (isFinal) {
      const errorContainer = document.createElement('div');
      errorContainer.className = 'service-error';
      errorContainer.setAttribute('role', 'alert');
      errorContainer.setAttribute('aria-live', 'polite');
      errorContainer.innerHTML = `
        <p class="service-error__message">Failed to load: ${this.escapeHtml(service.title)}</p>
        <p class="service-error__description">Error code: ${errorCode}</p>
        <button class="service-error__retry" type="button">
          <span class="service-error__retry-text">Retry</span>
        </button>
      `;

      // Add retry functionality
      const retryButton = errorContainer.querySelector('.service-error__retry');
      retryButton.addEventListener('click', () => {
        this.retryServiceLoad(service, errorContainer);
      });

      // Store reference to retry button for cleanup
      errorContainer.dataset.serviceId = serviceId;

      // Replace the card with error container
      card.parentNode.replaceChild(errorContainer, card);

      // Update the service elements map
      this.serviceElements.delete(serviceId);
      this.serviceElements.set(serviceId, errorContainer);
    } else {
      // Add error state to card
      card.classList.add('service-card--error');
      card.querySelector('.service-card__icon')?.classList.add('service-card__icon--error');
      
      // Update icon to show error
      const img = card.querySelector('img');
      if (img) {
        img.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23e57373"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>';
        img.alt = 'Error loading icon';
      }
    }
  }

  /**
   * Load service icons with error handling
   */
  loadServiceIcons() {
    const images = this.container.querySelectorAll('article.service-card img');
    
    images.forEach(img => {
      img.addEventListener('error', (e) => {
        const card = e.target.closest('article.service-card');
        const serviceId = card?.dataset.serviceId;
        
        if (serviceId) {
          const service = this.defaultServices.find(s => s.id === serviceId);
          if (service) {
            this.handleServiceError(card, service, 'icon-load-error');
          }
        }
      });
    });
  }

  /**
   * Handle service card clicks
   * @param {Object} service - Service data
   */
  handleServiceClick(service) {
    console.log('Service clicked:', service.title);
    
    // In a real implementation, this might:
    // - Show a modal with more details
    // - Scroll to a contact form
    // - Navigate to a dedicated service page
    
    // For now, just log the interaction
    this.trackServiceInteraction(service);
  }

  /**
   * Track service interactions for analytics
   * @param {Object} service - Service data
   */
  trackServiceInteraction(service) {
    if (typeof window.analytics !== 'undefined') {
      window.analytics.track('service_click', {
        serviceId: service.id,
        serviceName: service.title
      });
    }
  }

  /**
   * Render loading skeleton state
   */
  renderLoadingState() {
    this.container.innerHTML = '';

    // Create skeleton cards
    const skeletonCards = [1, 2, 3, 4].map(() => {
      const skeleton = document.createElement('article');
      skeleton.className = 'service-card service-card--loading';
      skeleton.setAttribute('aria-busy', 'true');
      skeleton.innerHTML = `
        <div class="service-card__icon">
          <div style="width:64px;height:64px;background:var(--color-background-light);border-radius:4px;"></div>
        </div>
        <div class="service-card__title" style="height:24px;background:var(--color-background-light);border-radius:4px;width:70%;margin:0 auto var(--spacing-sm)"></div>
        <div class="service-card__description" style="height:16px;background:var(--color-background-light);border-radius:4px;width:100%;margin:0 0 var(--spacing-md)"></div>
        <div style="display:flex;flex-direction:column;gap:4px">
          <div style="height:12px;background:var(--color-background-light);border-radius:4px;width:90%"></div>
          <div style="height:12px;background:var(--color-background-light);border-radius:4px;width:80%"></div>
          <div style="height:12px;background:var(--color-background-light);border-radius:4px;width:70%"></div>
        </div>
      `;
      return skeleton;
    });

    skeletonCards.forEach(skeleton => this.container.appendChild(skeleton));
  }

  /**
   * Get failed services count
   * @returns {number} Number of failed services
   */
  getFailedCount() {
    return this.failedServices.size;
  }

  /**
   * Get service elements map
   * @returns {Map} Map of service IDs to DOM elements
   */
 getServiceElements() {
    return this.serviceElements;
  }

  /**
   * Escape HTML to prevent XSS
   * @param {string} text - Text to escape
   * @returns {string} Escaped text
   */
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * Manual retry of all failed services
   */
  retryAllFailedServices() {
    this.failedServices.forEach((failureInfo, serviceId) => {
      const card = failureInfo.card;
      const service = failureInfo.service;
      
      // Reset retry count
      failureInfo.retries = 0;
      
      // Retry
      this.retryServiceLoad(service, card);
    });
  }
}

// Initialize service handler when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  const serviceHandler = new ServiceHandler();
  serviceHandler.init();

  // Expose for global access if needed
  window.serviceHandler = serviceHandler;
});

export default ServiceHandler;
