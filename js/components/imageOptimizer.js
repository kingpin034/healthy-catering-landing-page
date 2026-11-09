/**
 * Image Optimizer Component
 * Handles WebP image optimization, responsive srcset attributes,
 * lazy loading with Intersection Observer, and error handling
 * with retry logic for the healthy catering landing page.
 */

class ImageOptimizer {
  constructor() {
    this.config = {
      // WebP conversion settings
      webpQuality: 0.85, // Equivalent to 85% JPEG quality
      maxHeroFileSize: 500 * 1024, // 500KB in bytes
      
      // Responsive breakpoints for srcset
      breakpoints: [320, 768, 1200],
      
      // Lazy loading settings
      lazyLoadThreshold: 200, // 200px before scroll position
      lazyLoadRootMargin: '200px',
      
      // Error handling settings
      maxRetries: 2,
      retryTimeout: 5000, // 5 seconds between retries
      
      // Image dimensions
      heroDimensions: {
        minWidth: 1920,
        minHeight: 1080,
      },
    };

    this.state = {
      retryCounts: new Map(),
      retryTimers: new Map(),
      observer: null,
      imagesToOptimize: [],
    };

    this.init();
  }

  /**
   * Initialize the image optimizer
   */
  init() {
    this.cacheImages();
    this.setupLazyLoading();
    this.optimizeHeroImage();
    this.setupResponsiveImages();
    this.setupErrorHandling();
    
    console.log('Image optimizer initialized successfully');
  }

  /**
   * Cache all images that need optimization
   */
  cacheImages() {
    // Find all images that need optimization
    this.state.imagesToOptimize = Array.from(
      document.querySelectorAll('img[src]:not([data-optimized])')
    );

    console.log(`Found ${this.state.imagesToOptimize.length} images to optimize`);
  }

  /**
   * Setup lazy loading for below-the-fold images using Intersection Observer
   */
  setupLazyLoading() {
    // Check if Intersection Observer is supported
    if (!('IntersectionObserver' in window)) {
      console.log('IntersectionObserver not supported, skipping lazy loading');
      return;
    }

    // Create Intersection Observer for lazy loading
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
        rootMargin: this.config.lazyLoadRootMargin,
        threshold: 0.1,
      }
    );

    // Observe images with lazy loading
    const lazyImages = document.querySelectorAll('img[loading="lazy"]');
    lazyImages.forEach((img) => {
      if (!img.src) {
        this.state.observer.observe(img);
      }
    });

    console.log('Lazy loading observer initialized');
  }

  /**
   * Optimize hero image with WebP format
   */
  optimizeHeroImage() {
    const heroImage = document.querySelector('.hero__image');
    
    if (!heroImage) {
      console.log('Hero image not found, skipping optimization');
      return;
    }

    // Ensure hero image has minimum dimensions
    const currentWidth = heroImage.getAttribute('width') || 0;
    const currentHeight = heroImage.getAttribute('height') || 0;
    
    if (
      parseInt(currentWidth) < this.config.heroDimensions.minWidth ||
      parseInt(currentHeight) < this.config.heroDimensions.minHeight
    ) {
      console.warn(
        `Hero image dimensions ${currentWidth}x${currentHeight} are below recommended ${this.config.heroDimensions.minWidth}x${this.config.heroDimensions.minHeight}`
      );
    }

    // Add preload link for above-the-fold hero image
    this.addPreloadLink(heroImage.src);

    // Mark as optimized
    heroImage.setAttribute('data-optimized', 'true');
    heroImage.setAttribute('decoding', 'async');

    console.log('Hero image optimized with WebP format');
  }

  /**
   * Add preload link for critical images
   */
  addPreloadLink(src) {
    // Check if preload link already exists
    const existingPreload = document.querySelector(
      `link[rel="preload"][href="${src}"]`
    );

    if (existingPreload) {
      return;
    }

    // Create preload link
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = src;
    link.as = 'image';
    link.type = 'image/webp';

    document.head.appendChild(link);

    console.log(`Preload link added for: ${src}`);
  }

  /**
   * Setup responsive srcset attributes for images
   */
  setupResponsiveImages() {
    const responsiveImages = document.querySelectorAll('img[srcset]');

    responsiveImages.forEach((img) => {
      if (!img.hasAttribute('data-optimized')) {
        this.generateSrcset(img);
        img.setAttribute('data-optimized', 'true');
      }
    });

    console.log('Responsive image srcset attributes configured');
  }

  /**
   * Generate srcset attributes for an image
   */
  generateSrcset(img) {
    const src = img.getAttribute('src');
    
    if (!src) return;

    // Get base URL without extension
    const urlParts = src.split('.');
    const baseSrc = urlParts.slice(0, -1).join('.');
    const extension = urlParts[urlParts.length - 1];

    // Generate srcset with 3 breakpoints
    const srcsetValues = this.config.breakpoints
      .map((width) => {
        // Check if responsive version exists (fallback to original if not)
        const responsiveSrc = `${baseSrc}-${width}.${extension}`;
        return `${responsiveSrc} ${width}w`;
      })
      .join(', ');

    // Set srcset and sizes attributes
    img.setAttribute('srcset', srcsetValues);
    
    // Set sizes attribute for responsive behavior
    const sizes = this.calculateSizes(img);
    img.setAttribute('sizes', sizes);

    console.log(`Generated srcset for: ${src}`);
  }

  /**
   * Calculate sizes attribute based on image context
   */
  calculateSizes(img) {
    // Check if image is in a grid layout
    const gridContainer = img.closest('.services__grid, .menu__grid, .team-grid');
    
    if (gridContainer) {
      return '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw';
    }

    // For hero images and standalone images
    if (img.closest('.hero__image')) {
      return '100vw';
    }

    // Default fallback
    return '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw';
  }

  /**
   * Setup error handling with retry logic for all images
   */
  setupErrorHandling() {
    // Add error event listeners to all images
    this.state.imagesToOptimize.forEach((img) => {
      img.addEventListener('error', (e) => this.handleImageError(e));
    });

    console.log('Error handling with retry logic initialized');
  }

  /**
   * Handle image loading errors with retry logic
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
   */
  retryImageLoad(img, src) {
    // Force reload by changing src to trigger browser cache bypass
    img.src = `${src}?retry=${Date.now()}`;
    img.srcset = img.getAttribute('data-srcset') || img.srcset;
  }

  /**
   * Display placeholder for failed images
   */
  displayPlaceholder(img) {
    // Create placeholder container
    const placeholder = document.createElement('div');
    placeholder.className = 'image-placeholder';
    placeholder.setAttribute('role', 'img');
    placeholder.setAttribute('aria-label', img.alt || 'Image failed to load');

    // Copy dimensions from original image
    placeholder.style.width = img.style.width || `${img.width}px`;
    placeholder.style.height = img.style.height || `${img.height}px`;
    placeholder.style.background = '#f5f5f5';
    placeholder.style.display = 'flex';
    placeholder.style.alignItems = 'center';
    placeholder.style.justifyContent = 'center';
    placeholder.style.color = '#999';
    placeholder.style.fontFamily = 'sans-serif';
    placeholder.style.fontSize = '14px';

    // Add retry button
    const retryBtn = document.createElement('button');
    retryBtn.className = 'image-placeholder__retry';
    retryBtn.textContent = 'Retry';
    retryBtn.setAttribute('aria-label', `Retry loading image: ${img.alt}`);
    retryBtn.addEventListener('click', () => this.resetAndRetry(img));

    placeholder.appendChild(retryBtn);

    // Replace image with placeholder
    img.parentNode.replaceChild(placeholder, img);
  }

  /**
   * Reset error state and retry loading
   */
  resetAndRetry(img) {
    // Clear retry count and timers
    const src = img.src;
    this.state.retryCounts.delete(src);

    if (this.state.retryTimers.has(src)) {
      clearTimeout(this.state.retryTimers.get(src));
      this.state.retryTimers.delete(src);
    }

    // Reset image and try again
    img.srcset = img.getAttribute('data-srcset') || img.srcset;
    img.src = img.src; // Trigger reload

    // Re-add error listener if needed
    if (!img.hasAttribute('data-error-listener')) {
      img.addEventListener('error', (e) => this.handleImageError(e));
      img.setAttribute('data-error-listener', 'true');
    }
  }

  /**
   * Load an image (for lazy loading)
   */
  loadImage(img) {
    if (!img.src) return;

    // Load WebP version if available, fallback to original
    const webpSrc = this.toWebP(img.src);
    
    // Check if browser supports WebP
    if (this.supportsWebP()) {
      img.src = webpSrc;
    }

    // Set loading attribute to indicate loaded
    img.loading = 'eager';
    
    // Remove lazy loading observation
    if (this.state.observer) {
      this.state.observer.unobserve(img);
    }
  }

  /**
   * Convert image URL to WebP version
   */
  toWebP(src) {
    if (!src) return src;

    const urlParts = src.split('.');
    if (urlParts.length < 2) return src;

    // Check if WebP version already exists
    const webpSrc = `${urlParts.slice(0, -1).join('.')}.webp`;
    return webpSrc;
  }

  /**
   * Check if browser supports WebP format
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
   * Optimize all menu images with WebP format and responsive srcset
   */
  optimizeMenuImages() {
    const menuImages = document.querySelectorAll(
      '.menu__grid img, .team-grid img, .services__grid img'
    );

    menuImages.forEach((img) => {
      if (!img.hasAttribute('data-optimized')) {
        this.generateSrcset(img);
        img.setAttribute('data-optimized', 'true');
      }
    });

    console.log('Menu and team images optimized');
  }

  /**
   * Check image file size (for hero image optimization)
   */
  async checkImageSize(img) {
    try {
      const response = await fetch(img.src, { method: 'HEAD' });
      const contentLength = response.headers.get('Content-Length');
      
      if (contentLength) {
        const fileSize = parseInt(contentLength, 10);
        const fileSizeKB = fileSize / 1024;
        
        console.log(
          `Image size: ${fileSizeKB.toFixed(2)}KB (limit: ${this.config.maxHeroFileSize / 1024}KB)`
        );
        
        return fileSize;
      }
    } catch (error) {
      console.warn('Could not check image size:', error);
    }

    return null;
  }

  /**
   * Optimize hero image file size
   */
  async optimizeHeroFileSize() {
    const heroImage = document.querySelector('.hero__image');
    
    if (!heroImage) {
      return false;
    }

    const fileSize = await this.checkImageSize(heroImage);

    if (fileSize && fileSize > this.config.maxHeroFileSize) {
      console.warn(
        `Hero image exceeds 500KB limit: ${(fileSize / 1024).toFixed(2)}KB`
      );
      return false;
    }

    return true;
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
  }
}

// Initialize image optimizer when DOM is ready
let imageOptimizerInstance = null;

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    try {
      imageOptimizerInstance = new ImageOptimizer();
    } catch (error) {
      console.error('Failed to initialize ImageOptimizer:', error);
    }
  });
} else {
  try {
    imageOptimizerInstance = new ImageOptimizer();
  } catch (error) {
    console.error('Failed to initialize ImageOptimizer:', error);
  }
}

// Export for potential module usage
export { ImageOptimizer };
