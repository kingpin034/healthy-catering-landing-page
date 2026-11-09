/**
 * Responsive Menu Images Component
 * Handles responsive menu images with WebP format, srcset attributes,
 * and error handling with retry logic for the healthy catering landing page.
 * 
 * Validates: Requirements 11.2
 */

class ResponsiveMenuImages {
  constructor() {
    this.config = {
      // WebP conversion settings
      webpQuality: 0.85, // Equivalent to 85% JPEG quality
      
      // Responsive breakpoints for srcset
      breakpoints: [320, 768, 1200],
      
      // Error handling settings
      maxRetries: 2,
      retryTimeout: 5000, // 5 seconds between retries
      
      // Menu image dimensions (minimum recommended)
      minDimensions: {
        width: 300,
        height: 225,
      },
    };

    this.state = {
      retryCounts: new Map(),
      retryTimers: new Map(),
      menuImages: [],
      imagesProcessed: new Set(),
    };

    this.init();
  }

  /**
   * Initialize the responsive menu images component
   */
  init() {
    this.cacheMenuImages();
    
    if (this.state.menuImages.length === 0) {
      console.log('No menu images found, skipping initialization');
      return;
    }

    this.setupResponsiveSrcset();
    this.setupErrorHandling();
    this.optimizeToWebP();
    
    console.log('Responsive menu images initialized successfully');
  }

  /**
   * Cache all menu images from the page
   */
  cacheMenuImages() {
    // Find all images that are part of menu items
    const menuImageSelectors = [
      '.menu__grid img',
      '.menu-item img',
      '.menu__grid picture source',
    ];

    const menuImages = Array.from(
      document.querySelectorAll(menuImageSelectors.join(', '))
    );

    // Filter to only include actual image elements with src attributes
    this.state.menuImages = menuImages.filter((img) => {
      return (
        img.tagName === 'IMG' &&
        img.hasAttribute('src') &&
        !img.hasAttribute('data-menu-optimized')
      );
    });

    console.log(`Found ${this.state.menuImages.length} menu images to optimize`);
  }

  /**
   * Convert all menu images to WebP format
   */
  optimizeToWebP() {
    this.state.menuImages.forEach((img) => {
      const originalSrc = img.getAttribute('src');
      const webpSrc = this.toWebP(originalSrc);
      
      // Store original src for fallback
      img.setAttribute('data-original-src', originalSrc);
      
      // Check if browser supports WebP
      if (this.supportsWebP()) {
        img.src = webpSrc;
      }
      
      img.setAttribute('data-menu-optimized', 'true');
    });

    console.log('Menu images converted to WebP format');
  }

  /**
   * Setup responsive srcset attributes for menu images
   */
  setupResponsiveSrcset() {
    this.state.menuImages.forEach((img) => {
      if (!img.hasAttribute('data-menu-optimized')) {
        this.generateSrcset(img);
        img.setAttribute('data-menu-optimized', 'true');
      }
    });

    console.log('Responsive srcset attributes configured for menu images');
  }

  /**
   * Generate srcset attributes with 3 breakpoints (320px, 768px, 1200px)
   * @param {HTMLImageElement} img - The image element to optimize
   */
  generateSrcset(img) {
    const src = img.getAttribute('src');
    
    if (!src) {
      console.warn('Image has no src attribute, skipping srcset generation');
      return;
    }

    // Get base URL without extension
    const urlParts = src.split('.');
    const baseSrc = urlParts.slice(0, -1).join('.');
    const extension = urlParts[urlParts.length - 1];

    // Generate srcset with 3 breakpoints (320px, 768px, 1200px)
    const srcsetValues = this.config.breakpoints
      .map((width) => {
        // Construct responsive URL with width suffix
        // Example: dish-320.webp, dish-768.webp, dish-1200.webp
        const responsiveSrc = `${baseSrc}-${width}.${extension}`;
        return `${responsiveSrc} ${width}w`;
      })
      .join(', ');

    // Set srcset attribute
    img.setAttribute('srcset', srcsetValues);

    // Set sizes attribute for responsive behavior
    this.setSizesAttribute(img);

    console.log(`Generated srcset (320px, 768px, 1200px) for: ${src}`);
  }

  /**
   * Set sizes attribute for responsive behavior
   * @param {HTMLImageElement} img - The image element
   */
  setSizesAttribute(img) {
    // Menu images are typically 1 column on mobile, 2-3 on desktop
    // They're in a grid container with 3 items per row on desktop
    const sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw';
    
    img.setAttribute('sizes', sizes);
    console.log(`Set sizes attribute for responsive behavior: ${sizes}`);
  }

  /**
   * Setup error handling with retry logic for menu images
   */
  setupErrorHandling() {
    this.state.menuImages.forEach((img) => {
      // Store original alt text for error state
      if (!img.hasAttribute('data-original-alt')) {
        img.setAttribute('data-original-alt', img.alt || '');
      }

      // Add error event listener
      img.addEventListener('error', (e) => this.handleImageError(e));
    });

    console.log('Error handling with retry logic initialized for menu images');
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
        `Menu image failed to load after ${this.config.maxRetries} retries: ${src}`
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
      `Menu image retry ${retryCount}/${this.config.maxRetries}: ${src}`
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
    // Force reload by appending cache-buster parameter
    const cacheBuster = `?retry=${Date.now()}`;
    img.src = src + cacheBuster;

    // Also try to reload srcset if it exists
    if (img.hasAttribute('srcset')) {
      const srcset = img.getAttribute('srcset');
      img.srcset = srcset;
    }
  }

  /**
   * Display accessible placeholder for failed images
   * @param {HTMLImageElement} img - The original image element
   */
  displayPlaceholder(img) {
    // Create placeholder container
    const placeholder = document.createElement('div');
    placeholder.className = 'menu-image-placeholder';
    placeholder.setAttribute('role', 'img');
    placeholder.setAttribute('aria-label', img.alt || 'Menu image failed to load');

    // Copy dimensions from original image
    const width = img.getAttribute('width') || img.offsetWidth;
    const height = img.getAttribute('height') || img.offsetHeight;
    
    placeholder.style.width = `${width}px`;
    placeholder.style.height = `${height}px`;
    placeholder.style.display = 'flex';
    placeholder.style.alignItems = 'center';
    placeholder.style.justifyContent = 'center';
    placeholder.style.backgroundColor = '#f5f5f5';
    placeholder.style.color = '#999';
    placeholder.style.fontFamily = 'sans-serif';
    placeholder.style.fontSize = '14px';
    placeholder.style.borderRadius = '8px';
    placeholder.style.overflow = 'hidden';

    // Create placeholder content
    const content = document.createElement('div');
    content.style.textAlign = 'center';
    content.style.padding = '10px';

    // Add icon
    const icon = document.createElement('span');
    icon.style.fontSize = '24px';
    icon.style.display = 'block';
    icon.style.marginBottom = '5px';
    icon.textContent = '🍽️';

    // Add text
    const text = document.createElement('span');
    text.textContent = img.alt || 'Menu item';

    content.appendChild(icon);
    content.appendChild(text);
    placeholder.appendChild(content);

    // Add retry button with accessibility
    const retryBtn = document.createElement('button');
    retryBtn.className = 'menu-image-placeholder__retry';
    retryBtn.textContent = 'Retry';
    retryBtn.style.marginTop = '8px';
    retryBtn.style.padding = '6px 12px';
    retryBtn.style.cursor = 'pointer';
    retryBtn.style.border = 'none';
    retryBtn.style.borderRadius = '4px';
    retryBtn.style.backgroundColor = '#4CAF50';
    retryBtn.style.color = 'white';
    retryBtn.style.fontFamily = 'sans-serif';
    retryBtn.style.fontSize = '12px';
    retryBtn.setAttribute('aria-label', `Retry loading image: ${img.alt || 'Menu item'}`);
    retryBtn.addEventListener('click', () => this.resetAndRetry(img));

    placeholder.appendChild(retryBtn);

    // Replace image with placeholder
    img.parentNode.replaceChild(placeholder, img);

    console.log('Displaying placeholder for failed menu image');
  }

  /**
   * Reset error state and retry loading
   * @param {HTMLImageElement|HTMLDivElement} img - The image or placeholder element
   */
  resetAndRetry(img) {
    // If this is a placeholder div, get the original image reference
    let originalImg = img;
    if (img.tagName === 'DIV') {
      // The placeholder replaced the image, so we need to create a new image element
      const alt = img.getAttribute('aria-label') || '';
      const originalSrc = img.getAttribute('data-original-src') || '';
      
      // Remove placeholder
      img.remove();
      
      // Create new image element
      originalImg = document.createElement('img');
      originalImg.alt = alt;
      
      // Insert before the placeholder's parent (which was the placeholder's previous sibling)
      const placeholder = document.querySelector('.menu-image-placeholder');
      if (placeholder && placeholder.previousElementSibling) {
        placeholder.previousElementSibling.parentNode.insertBefore(
          originalImg,
          placeholder.previousElementSibling.nextSibling
        );
      }
    }

    // Clear retry count and timers
    const src = originalImg.src;
    this.state.retryCounts.delete(src);

    if (this.state.retryTimers.has(src)) {
      clearTimeout(this.state.retryTimers.get(src));
      this.state.retryTimers.delete(src);
    }

    // Reload with cache-buster
    const cacheBuster = `?retry=${Date.now()}`;
    originalImg.src = src + cacheBuster;

    // Re-add error listener
    originalImg.addEventListener('error', (e) => this.handleImageError(e));
  }

  /**
   * Convert image URL to WebP version
   * @param {string} src - Original image URL
   * @returns {string} WebP version of the URL
   */
  toWebP(src) {
    if (!src) return src;

    const urlParts = src.split('.');
    if (urlParts.length < 2) return src;

    // Convert to WebP format
    const webpSrc = `${urlParts.slice(0, -1).join('.')}.webp`;
    return webpSrc;
  }

  /**
   * Check if browser supports WebP format
   * @returns {boolean} True if WebP is supported
   */
  supportsWebP() {
    if (!this.state.webpSupport) {
      this.state.webpSupport = false;
      
      try {
        const canvas = document.createElement('canvas');
        if (canvas.getContext && canvas.getContext('2d')) {
          this.state.webpSupport = canvas.toDataURL('image/webp').includes('image/webp');
        }
      } catch (e) {
        // Silent fail - WebP not supported
      }
    }

    return this.state.webpSupport;
  }

  /**
   * Get all menu images that need processing
   * @returns {HTMLImageElement[]} Array of menu image elements
   */
  getMenuImages() {
    return this.state.menuImages;
  }

  /**
   * Check if an image has been processed
   * @param {HTMLImageElement} img - The image element
   * @returns {boolean} True if processed
   */
  isProcessed(img) {
    return this.state.imagesProcessed.has(img);
  }

  /**
   * Add image to processed set
   * @param {HTMLImageElement} img - The image element
   */
  markAsProcessed(img) {
    this.state.imagesProcessed.add(img);
  }

  /**
   * Cleanup resources
   */
  destroy() {
    // Clear retry timers
    this.state.retryTimers.forEach((timerId) => clearTimeout(timerId));
    this.state.retryTimers.clear();
    this.state.retryCounts.clear();
    this.state.imagesProcessed.clear();
  }
}

// Initialize responsive menu images when DOM is ready
let responsiveMenuImagesInstance = null;

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    try {
      responsiveMenuImagesInstance = new ResponsiveMenuImages();
    } catch (error) {
      console.error('Failed to initialize ResponsiveMenuImages:', error);
    }
  });
} else {
  try {
    responsiveMenuImagesInstance = new ResponsiveMenuImages();
  } catch (error) {
    console.error('Failed to initialize ResponsiveMenuImages:', error);
  }
}

// Export for potential module usage
export { ResponsiveMenuImages };
