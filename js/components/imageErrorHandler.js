/**
 * Image Error Handler Component
 * Provides comprehensive image error handling with fallback and retry logic
 * for the healthy catering landing page.
 *
 * Features:
 * - Intersection Observer threshold of 0.1 for lazy loading
 * - Placeholder display for failed images with accessibility support
 * - Retry logic (up to 2 retries after 5 second timeout)
 * - Error handling for all images on the page
 * - Modern ES6+ JavaScript implementation
 */

class ImageErrorHandler {
  constructor() {
    this.config = {
      // Intersection Observer configuration
      rootMargin: '200px',
      threshold: 0.1, // Load when 10% of image is visible
      
      // Error handling
      maxRetries: 2,
      retryTimeout: 5000, // 5 seconds between retries
      
      // Accessibility
      loadingAttribute: 'lazy',
      
      // Placeholder styling
      placeholderClass: 'image-error-handler__placeholder',
      retryButtonClass: 'image-error-handler__retry-btn',
    };

    this.state = {
      observer: null,
      retryCounts: new Map(),
      retryTimers: new Map(),
      images: [],
    };

    this.init();
  }

  /**
   * Initialize the image error handler
   */
  init() {
    this.cacheImages();
    
    if (this.state.images.length === 0) {
      console.log('Image Error Handler: No images found on the page');
      return;
    }

    this.setupObserver();
    this.setupErrorHandling();
    
    console.log(
      `Image Error Handler initialized with ${this.state.images.length} images`
    );
  }

  /**
   * Cache all images on the page
   */
  cacheImages() {
    this.state.images = Array.from(document.querySelectorAll('img'));
  }

  /**
   * Set up Intersection Observer for lazy loading
   */
  setupObserver() {
    // Check if Intersection Observer is supported
    if (!('IntersectionObserver' in window)) {
      console.log('IntersectionObserver not supported, using native lazy loading');
      return;
    }

    // Create Intersection Observer with threshold of 0.1
    this.state.observer = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const img = entry.target;
            this.loadImage(img);
            observer.unobserve(img);
          }
        });
      },
      {
        rootMargin: this.config.rootMargin,
        threshold: 0.1, // Requirement: Intersection Observer threshold of 0.1
      }
    );

    // Observe all images
    this.state.images.forEach((img) => {
      if (img.loading === this.config.loadingAttribute) {
        this.state.observer.observe(img);
      }
    });
  }

  /**
   * Setup error handling for all images on the page
   */
  setupErrorHandling() {
    // Use event delegation for better performance
    document.addEventListener('error', (event) => {
      if (event.target.tagName === 'IMG') {
        this.handleImageError(event);
      }
    }, true); // Use capture phase to catch errors before they bubble

    console.log('Error handling set up for all images on the page');
  }

  /**
   * Load an image (for lazy loading)
   * @param {HTMLImageElement} img - The image element to load
   */
  loadImage(img) {
    // Native lazy loading handles the actual loading
    // This method can be extended for custom loading behavior
    
    // Set decoding attribute for non-blocking render
    if (!img.hasAttribute('decoding')) {
      img.decoding = 'async';
    }

    // Remove lazy loading observation
    if (this.state.observer) {
      this.state.observer.unobserve(img);
    }

    // Add loaded class for styling
    img.classList.add('image-error-handler--loaded');

    // Remove any placeholder if present
    const placeholder = img.closest(`.${this.config.placeholderClass}`);
    if (placeholder) {
      placeholder.classList.add('image-error-handler--hidden');
    }
  }

  /**
   * Handle image loading errors with retry logic
   * @param {Event} event - The error event
   */
  handleImageError(event) {
    const img = event.target;
    const src = img.src;

    // Get current retry count
    let retryCount = this.state.retryCounts.get(src) || 0;

    // Check if we've exceeded max retries
    if (retryCount >= this.config.maxRetries) {
      console.error(
        `Image Error Handler: Failed to load after ${this.config.maxRetries} retries: ${src}`
      );
      this.displayPlaceholder(img);
      return;
    }

    // Clear any existing retry timer
    if (this.state.retryTimers.has(src)) {
      clearTimeout(this.state.retryTimers.get(src));
      this.state.retryTimers.delete(src);
    }

    // Increment retry count
    retryCount++;
    this.state.retryCounts.set(src, retryCount);

    console.log(
      `Image Error Handler: Retry ${retryCount}/${this.config.maxRetries} for: ${src}`
    );

    // Set timeout before retry (5 second timeout as per requirement)
    const timerId = setTimeout(() => {
      this.retryImageLoad(img, src);
      this.state.retryTimers.delete(src);
    }, this.config.retryTimeout);

    this.state.retryTimers.set(src, timerId);
  }

  /**
   * Retry loading an image
   * @param {HTMLImageElement} img - The image element
   * @param {string} src - The image source URL
   */
  retryImageLoad(img, src) {
    // Force reload by changing src to trigger browser cache bypass
    img.src = `${src}?retry=${Date.now()}`;
    
    // Remove error state
    img.classList.remove('image-error-handler--error');
  }

  /**
   * Display placeholder for failed images with accessibility support
   * @param {HTMLImageElement} img - The image element that failed
   */
  displayPlaceholder(img) {
    // Create placeholder container
    const placeholder = document.createElement('figure');
    placeholder.className = this.config.placeholderClass;
    placeholder.setAttribute('role', 'img');
    placeholder.setAttribute('aria-label', img.alt || 'Image failed to load');
    placeholder.setAttribute('aria-describedby', 'image-placeholder-message');
    
    // Copy dimensions from original image
    const width = img.width || img.getAttribute('width');
    const height = img.height || img.getAttribute('height');
    
    if (width) placeholder.style.width = `${width}px`;
    if (height) placeholder.style.height = `${height}px`;
    
    placeholder.style.display = 'flex';
    placeholder.style.alignItems = 'center';
    placeholder.style.justifyContent = 'center';
    placeholder.style.backgroundColor = '#f5f5f5';
    placeholder.style.borderRadius = '8px';
    placeholder.style.overflow = 'hidden';

    // Create message container
    const messageContainer = document.createElement('figcaption');
    messageContainer.style.textAlign = 'center';
    messageContainer.style.padding = '16px';
    messageContainer.style.color = '#666';
    messageContainer.style.fontFamily = 'system-ui, -apple-system, sans-serif';
    messageContainer.style.fontSize = '14px';
    messageContainer.innerHTML = `
      <p id="image-placeholder-message">
        Image unavailable
      </p>
      <div style="margin-top: 8px;">
        <button 
          type="button" 
          class="${this.config.retryButtonClass}"
          aria-label="Retry loading image"
        >
          Retry
        </button>
      </div>
    `;

    // Add retry button functionality with proper event handling
    const retryBtn = messageContainer.querySelector('button');
    retryBtn.addEventListener('click', () => {
      this.resetAndRetry(img);
    }, { once: true });

    // Add visually hidden description for screen readers
    const description = document.createElement('span');
    description.className = 'sr-only';
    description.id = 'image-placeholder-message';
    description.textContent = 'Image failed to load. Click retry button to try again.';

    placeholder.appendChild(messageContainer);
    placeholder.appendChild(description);

    // Replace image with placeholder
    if (img.parentNode) {
      img.parentNode.replaceChild(placeholder, img);
    }
  }

  /**
   * Reset error state and retry loading
   * @param {HTMLImageElement} img - The image element
   */
  resetAndRetry(img) {
    // Clear retry count and timers
    const src = img.src;
    this.state.retryCounts.delete(src);

    if (this.state.retryTimers.has(src)) {
      clearTimeout(this.state.retryTimers.get(src));
      this.state.retryTimers.delete(src);
    }

    // Remove placeholder and restore image
    const placeholder = img.closest(`.${this.config.placeholderClass}`);
    if (placeholder) {
      // Remove placeholder and re-add image
      placeholder.parentNode.replaceChild(img, placeholder);
      
      // Reset loading attribute and retry
      img.loading = this.config.loadingAttribute;
      
      // Re-observe if Intersection Observer is available
      if (this.state.observer) {
        this.state.observer.observe(img);
      }
      
      // Force reload
      img.src = img.src;
    }
  }

  /**
   * Load all images immediately (eager loading)
   * Useful for testing or when lazy loading is disabled
   */
  loadAllImages() {
    if (this.state.observer) {
      // Disconnect observer to stop observing
      this.state.observer.disconnect();
    }

    // Load all images immediately
    this.state.images.forEach((img) => {
      // Remove lazy loading if present
      if (img.loading === this.config.loadingAttribute) {
        img.loading = 'eager';
      }
      
      // Force reload
      img.src = img.src;
      
      // Set decoding for non-blocking render
      img.decoding = 'async';
      
      // Add loaded class
      img.classList.add('image-error-handler--loaded');
    });
  }

  /**
   * Update the root margin (loading threshold)
   * @param {string} rootMargin - The new root margin value (e.g., '200px')
   */
  updateThreshold(rootMargin) {
    if (!this.state.observer) {
      console.log('Image Error Handler: Observer not initialized');
      return;
    }

    // Update configuration
    this.config.rootMargin = rootMargin;
    
    // Update existing observer options
    this.state.observer.disconnect();
    
    // Create new observer with updated threshold
    this.setupObserver();
  }

  /**
   * Update the retry configuration
   * @param {number} maxRetries - Maximum number of retries
   * @param {number} retryTimeout - Timeout in milliseconds between retries
   */
  updateRetryConfig(maxRetries, retryTimeout) {
    this.config.maxRetries = maxRetries;
    this.config.retryTimeout = retryTimeout;
  }

  /**
   * Cleanup resources
   */
  destroy() {
    // Disconnect Intersection Observer
    if (this.state.observer) {
      this.state.observer.disconnect();
    }

    // Clear retry timers
    this.state.retryTimers.forEach((timerId) => clearTimeout(timerId));
    this.state.retryTimers.clear();
    this.state.retryCounts.clear();
    
    // Clear images array
    this.state.images = [];
  }

  /**
   * Get the current state of image error handling
   * @returns {Object} Current state information
   */
  getState() {
    return {
      imagesCount: this.state.images.length,
      retryCounts: Object.fromEntries(this.state.retryCounts),
      observerActive: !!this.state.observer,
    };
  }
}

// Export for potential module usage
export { ImageErrorHandler };

// Initialize when DOM is ready
let imageErrorHandlerInstance = null;

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    try {
      imageErrorHandlerInstance = new ImageErrorHandler();
    } catch (error) {
      console.error('Image Error Handler: Failed to initialize', error);
    }
  });
} else {
  try {
    imageErrorHandlerInstance = new ImageErrorHandler();
  } catch (error) {
    console.error('Image Error Handler: Failed to initialize', error);
  }
}
