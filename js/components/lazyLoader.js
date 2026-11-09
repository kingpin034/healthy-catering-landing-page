/**
 * Lazy Loader Component
 * Handles lazy loading for images using Intersection Observer with configurable thresholds.
 * Implements error handling and accessibility support for the healthy catering landing page.
 */

class LazyLoader {
  constructor() {
    this.config = {
      // Intersection Observer configuration
      rootMargin: '200px', // 200px threshold before scroll position
      threshold: 0.1, // Load when 10% of image is visible
      
      // Error handling
      maxRetries: 2,
      retryTimeout: 5000, // 5 seconds between retries
      
      // Accessibility
      loadingAttribute: 'lazy', // Native lazy loading attribute value
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
   * Initialize the lazy loader
   */
  init() {
    this.cacheImages();
    
    if (this.state.images.length === 0) {
      console.log('No images found to lazy load');
      return;
    }

    this.setupObserver();
    this.markBelowFoldImages();
    
    console.log(`Lazy loader initialized with ${this.state.images.length} images`);
  }

  /**
   * Cache all images on the page
   */
  cacheImages() {
    this.state.images = Array.from(document.querySelectorAll('img'));
    console.log(`Found ${this.state.images.length} images on the page`);
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

    // Create Intersection Observer
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
        threshold: 0.1,
      }
    );

    // Observe all images with native lazy loading
    this.state.images.forEach((img) => {
      if (img.loading === this.config.loadingAttribute) {
        this.state.observer.observe(img);
      }
    });

    console.log('Intersection Observer configured with 200px threshold');
  }

  /**
   * Mark images below the fold for lazy loading
   * Above-the-fold content gets eager loading, below-fold gets lazy loading
   */
  markBelowFoldImages() {
    // Calculate viewport height
    const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
    
    this.state.images.forEach((img) => {
      // Skip already optimized images
      if (img.hasAttribute('data-optimized')) {
        return;
      }

      // Get image position
      const rect = img.getBoundingClientRect();
      const imageTop = rect.top;

      // If image is below viewport (with some buffer), mark for lazy loading
      if (imageTop > viewportHeight * 1.5) {
        img.loading = this.config.loadingAttribute;
      }
    });
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
    img.classList.add('lazy-loaded');

    console.log('Image loaded:', img.src);
  }

  /**
   * Setup error handling for failed images
   */
  setupErrorHandling() {
    this.state.images.forEach((img) => {
      img.addEventListener('error', (e) => this.handleImageError(e));
    });
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
        `Image failed to load after ${this.config.maxRetries} retries: ${src}`
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
      `Image retry ${retryCount}/${this.config.maxRetries}: ${src}`
    );

    // Set timeout before retry
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
  }

  /**
   * Display placeholder for failed images
   * @param {HTMLImageElement} img - The image element that failed
   */
  displayPlaceholder(img) {
    // Create placeholder container
    const placeholder = document.createElement('div');
    placeholder.className = 'lazy-placeholder';
    placeholder.setAttribute('role', 'img');
    placeholder.setAttribute('aria-label', img.alt || 'Image failed to load');
    placeholder.setAttribute('aria-describedby', 'placeholder-message');

    // Copy dimensions from original image
    const width = img.width || img.getAttribute('width') || '100%';
    const height = img.height || img.getAttribute('height') || 'auto';
    
    placeholder.style.width = typeof width === 'number' ? `${width}px` : width;
    placeholder.style.height = typeof height === 'number' ? `${height}px` : height;
    placeholder.style.background = '#f5f5f5';
    placeholder.style.display = 'flex';
    placeholder.style.alignItems = 'center';
    placeholder.style.justifyContent = 'center';
    placeholder.style.color = '#999';
    placeholder.style.fontFamily = 'sans-serif';
    placeholder.style.fontSize = '14px';
    placeholder.style.borderRadius = '8px';

    // Create message container
    const messageContainer = document.createElement('div');
    messageContainer.style.textAlign = 'center';
    messageContainer.innerHTML = `
      <p id="placeholder-message">Image failed to load</p>
      <button type="button" class="lazy-placeholder__retry">Retry</button>
    `;

    // Add retry button functionality
    const retryBtn = messageContainer.querySelector('button');
    retryBtn.addEventListener('click', () => this.resetAndRetry(img));

    // Add description for screen readers
    const description = document.createElement('span');
    description.id = 'placeholder-message';
    description.className = 'sr-only';
    description.textContent = 'Image failed to load. Click retry button to try again.';

    placeholder.appendChild(messageContainer);
    placeholder.appendChild(description);

    // Replace image with placeholder
    img.parentNode.replaceChild(placeholder, img);
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
    // The placeholder is the img element's replacement
    if (img.parentNode && img.parentNode.classList.contains('lazy-placeholder')) {
      const placeholder = img.parentNode;
      
      // Remove placeholder and re-add image
      placeholder.parentNode.replaceChild(img, placeholder);
      
      // Reset loading attribute and retry
      img.loading = this.config.loadingAttribute;
      
      // Re-observe if Intersection Observer is available
      if (this.state.observer) {
        this.state.observer.observe(img);
      }
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
      img.classList.add('lazy-loaded');
    });

    console.log('All images loaded eagerly');
  }

  /**
   * Update the root margin (loading threshold)
   * @param {string} rootMargin - The new root margin value (e.g., '200px')
   */
  updateThreshold(rootMargin) {
    if (!this.state.observer) {
      console.log('Observer not initialized');
      return;
    }

    // Update configuration
    this.config.rootMargin = rootMargin;
    
    // Update existing observer options
    this.state.observer.disconnect();
    
    // Create new observer with updated threshold
    this.setupObserver();
    
    console.log(`Threshold updated to: ${rootMargin}`);
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
    
    console.log('Lazy loader destroyed');
  }
}

// Initialize lazy loader when DOM is ready
let lazyLoaderInstance = null;

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    try {
      lazyLoaderInstance = new LazyLoader();
      lazyLoaderInstance.setupErrorHandling();
    } catch (error) {
      console.error('Failed to initialize LazyLoader:', error);
    }
  });
} else {
  try {
    lazyLoaderInstance = new LazyLoader();
    lazyLoaderInstance.setupErrorHandling();
  } catch (error) {
    console.error('Failed to initialize LazyLoader:', error);
  }
}

// Export for potential module usage
export { LazyLoader };
