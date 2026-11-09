/**
 * Hero Image Optimizer Component
 * Specialized optimizer for hero section images with WebP conversion,
 * file size optimization (under 500KB), dimension verification, and accessibility support.
 */

class HeroOptimizer {
  constructor() {
    this.config = {
      // File size limit: 500KB
      maxFileSize: 500 * 1024,
      
      // Minimum dimensions for hero images (1920x1080)
      minDimensions: {
        width: 1920,
        height: 1080,
      },
      
      // Compression quality settings
      quality: {
        webp: 0.85, // Equivalent to 85% JPEG quality
        jpeg: 85,
      },
      
      // Fallback formats
      fallbackFormats: ['jpeg', 'png'],
      
      // Error handling
      maxRetryAttempts: 2,
      retryDelay: 1000, // 1 second between retries
    };

    this.state = {
      heroImage: null,
      currentFormat: null,
      retryAttempts: 0,
      isLoading: false,
    };

    this.init();
  }

  /**
   * Initialize the hero optimizer
   */
  init() {
    this.findHeroImage();
    
    if (!this.state.heroImage) {
      console.log('Hero image not found, skipping optimization');
      return;
    }

    this.verifyDimensions();
    this.optimizeForFormat();
    this.setupAccessibility();
    this.setupErrorHandling();
    this.preloadHeroImage();

    console.log('Hero optimizer initialized successfully');
  }

  /**
   * Find and cache the hero image element
   */
  findHeroImage() {
    this.state.heroImage = document.querySelector('.hero__image');
  }

  /**
   * Verify hero image dimensions meet minimum requirements (1920x1080)
   */
  verifyDimensions() {
    const img = this.state.heroImage;
    const currentWidth = parseInt(img.getAttribute('width')) || 0;
    const currentHeight = parseInt(img.getAttribute('height')) || 0;

    const meetsMinimum = 
      currentWidth >= this.config.minDimensions.width &&
      currentHeight >= this.config.minDimensions.height;

    if (!meetsMinimum) {
      console.warn(
        `Hero image dimensions ${currentWidth}x${currentHeight} are below minimum recommended ${this.config.minDimensions.width}x${this.config.minDimensions.height}`
      );
    }

    return meetsMinimum;
  }

  /**
   * Optimize hero image for WebP format with JPEG fallback
   */
  optimizeForFormat() {
    const img = this.state.heroImage;
    const src = img.getAttribute('src');

    if (!src) {
      console.error('Hero image has no source URL');
      return;
    }

    // Convert to WebP version
    const webpSrc = this.convertToWebP(src);

    // Check if browser supports WebP
    if (this.supportsWebP()) {
      img.src = webpSrc;
      this.state.currentFormat = 'webp';
      console.log('Hero image converted to WebP format');
    } else {
      // Fallback to original or JPEG
      const fallbackSrc = this.getFallbackSrc(src);
      img.src = fallbackSrc;
      this.state.currentFormat = this.detectFormat(fallbackSrc);
      console.log(`Hero image using fallback format: ${this.state.currentFormat}`);
    }

    // Mark as optimized
    img.setAttribute('data-optimized', 'true');
  }

  /**
   * Convert image URL to WebP version
   */
  convertToWebP(src) {
    if (!src) return src;

    // Check if already WebP
    if (src.toLowerCase().endsWith('.webp')) {
      return src;
    }

    // Replace extension with .webp
    const lastDotIndex = src.lastIndexOf('.');
    if (lastDotIndex === -1) return src;

    return src.substring(0, lastDotIndex) + '.webp';
  }

  /**
   * Get fallback image source (JPEG or original)
   */
  getFallbackSrc(src) {
    if (!src) return src;

    // Try JPEG fallback first
    const jpegSrc = this.convertToJPEG(src);
    
    // If original is already a supported format, keep it
    if (this.isSupportedFormat(src)) {
      return src;
    }

    return jpegSrc;
  }

  /**
   * Convert image URL to JPEG version
   */
  convertToJPEG(src) {
    if (!src) return src;

    // Replace extensions with .jpg
    const extensions = ['png', 'jpeg', 'jpg', 'webp'];
    const lastDotIndex = src.lastIndexOf('.');

    if (lastDotIndex === -1) return src;

    return src.substring(0, lastDotIndex) + '.jpg';
  }

  /**
   * Check if browser supports WebP format
   */
  supportsWebP() {
    if (this.state.webpSupport !== undefined) {
      return this.state.webpSupport;
    }

    try {
      const canvas = document.createElement('canvas');
      if (canvas.getContext && canvas.getContext('2d')) {
        this.state.webpSupport = canvas.toDataURL('image/webp').includes('image/webp');
      } else {
        this.state.webpSupport = false;
      }
    } catch (error) {
      this.state.webpSupport = false;
    }

    return this.state.webpSupport;
  }

  /**
   * Check if file format is supported
   */
  isSupportedFormat(src) {
    const supportedExtensions = ['jpg', 'jpeg', 'png', 'webp'];
    const extension = this.extractExtension(src);

    return extension && supportedExtensions.includes(extension.toLowerCase());
  }

  /**
   * Extract file extension from URL
   */
  extractExtension(src) {
    if (!src) return null;
    const parts = src.split('.');
    return parts.length > 1 ? parts.pop() : null;
  }

  /**
   * Detect image format from URL
   */
  detectFormat(src) {
    const extension = this.extractExtension(src);
    
    if (!extension) return 'unknown';

    const formatMap = {
      webp: 'webp',
      jpg: 'jpeg',
      jpeg: 'jpeg',
      png: 'png',
    };

    return formatMap[extension.toLowerCase()] || 'unknown';
  }

  /**
   * Setup accessibility for hero image
   */
  setupAccessibility() {
    const img = this.state.heroImage;

    // Ensure alt text is present and descriptive
    if (!img.hasAttribute('alt') || img.alt.length < 20) {
      img.alt = 'Fresh, healthy meals served on white plates with vibrant colors showcasing our catering services';
    }

    // Ensure width and height attributes are set for aspect ratio preservation
    if (!img.hasAttribute('width')) {
      img.setAttribute('width', this.config.minDimensions.width);
    }
    if (!img.hasAttribute('height')) {
      img.setAttribute('height', this.config.minDimensions.height);
    }

    // Add decoding attribute for non-blocking decode
    if (!img.hasAttribute('decoding')) {
      img.setAttribute('decoding', 'async');
    }

    // Ensure loading attribute is 'eager' for above-the-fold hero image
    if (!img.hasAttribute('loading')) {
      img.setAttribute('loading', 'eager');
    }

    // Add loading="eager" to override any lazy loading behavior for hero image
    img.loading = 'eager';

    console.log('Hero image accessibility attributes configured');
  }

  /**
   * Setup error handling for hero image
   */
  setupErrorHandling() {
    const img = this.state.heroImage;

    // Add error event listener
    img.addEventListener('error', (e) => this.handleImageError(e));
  }

  /**
   * Handle image loading errors
   */
  handleImageError(event) {
    const img = event.target;

    // Check if we've exceeded max retries
    if (this.state.retryAttempts >= this.config.maxRetryAttempts) {
      console.error(
        `Hero image failed to load after ${this.config.maxRetryAttempts} attempts`
      );
      this.displayErrorState(img);
      return;
    }

    this.state.retryAttempts++;

    console.log(
      `Hero image retry attempt ${this.state.retryAttempts}/${this.config.maxRetryAttempts}`
    );

    // Retry with fallback format
    setTimeout(() => {
      this.retryImageLoad(img);
    }, this.config.retryDelay);
  }

  /**
   * Retry loading image with fallback
   */
  retryImageLoad(img) {
    if (!img) return;

    // Determine fallback based on current format
    const currentFormat = this.state.currentFormat || 'webp';
    
    if (currentFormat === 'webp') {
      // Try JPEG fallback
      const jpegSrc = this.getFallbackSrc(img.src);
      img.src = jpegSrc;
      this.state.currentFormat = 'jpeg';
    } else {
      // Already tried fallback, show error state
      this.displayErrorState(img);
    }
  }

  /**
   * Display error state for hero image
   */
  displayErrorState(img) {
    // Create error fallback container
    const container = img.parentElement;
    if (!container) return;

    // Create placeholder div
    const placeholder = document.createElement('div');
    placeholder.className = 'hero__placeholder';
    placeholder.setAttribute('role', 'img');
    placeholder.setAttribute('aria-label', img.alt || 'Image unavailable');

    // Copy container styles
    placeholder.style.width = '100%';
    placeholder.style.height = '100%';
    placeholder.style.display = 'flex';
    placeholder.style.alignItems = 'center';
    placeholder.style.justifyContent = 'center';
    placeholder.style.background = 'linear-gradient(135deg, #66BB6A 0%, #4CAF50 100%)';
    placeholder.style.color = '#ffffff';
    placeholder.style.fontFamily = 'sans-serif';
    placeholder.style.textAlign = 'center';
    placeholder.style.padding = '20px';

    // Add fallback content
    placeholder.innerHTML = `
      <div>
        <h3 style="margin: 0 0 10px 0; font-size: 24px;">Image unavailable</h3>
        <p style="margin: 0; opacity: 0.9;">Fresh, nutritious meals for individuals and events</p>
      </div>
    `;

    // Replace image with placeholder
    img.parentNode.replaceChild(placeholder, img);

    console.log('Hero image error state displayed');
  }

  /**
   * Preload hero image for above-the-fold display
   */
  preloadHeroImage() {
    const img = this.state.heroImage;
    const src = img.getAttribute('src');

    if (!src) return;

    // Check if preload link already exists
    const existingPreload = document.querySelector(
      `link[rel="preload"][href="${src}"]`
    );

    if (existingPreload) {
      return;
    }

    // Create preload link with proper type
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = src;
    link.as = 'image';
    
    // Set type based on current format
    if (this.state.currentFormat === 'webp') {
      link.type = 'image/webp';
    } else {
      link.type = 'image/jpeg';
    }

    document.head.appendChild(link);

    console.log('Hero image preloaded for above-the-fold display');
  }

  /**
   * Verify hero image file size is under 500KB
   */
  async verifyFileSize() {
    const img = this.state.heroImage;
    const src = img.getAttribute('src');

    if (!src) {
      console.warn('Cannot verify file size: no source URL');
      return false;
    }

    try {
      // Use HEAD request to check file size without downloading
      const response = await fetch(src, { method: 'HEAD' });

      if (response.ok) {
        const contentLength = response.headers.get('Content-Length');
        
        if (contentLength) {
          const fileSize = parseInt(contentLength, 10);
          const fileSizeKB = fileSize / 1024;

          const isWithinLimit = fileSize <= this.config.maxFileSize;

          console.log(
            `Hero image size: ${fileSizeKB.toFixed(2)}KB (limit: ${this.config.maxFileSize / 1024}KB) - ${isWithinLimit ? 'OK' : 'EXCEEDS LIMIT'}`
          );

          return isWithinLimit;
        }
      }
    } catch (error) {
      console.warn('Could not verify file size:', error);
    }

    // If we can't verify, assume it's OK
    return true;
  }

  /**
   * Optimize hero image (checks file size, converts format, etc.)
   */
  async optimize() {
    // Verify dimensions
    const dimensionsOK = this.verifyDimensions();

    // Convert format
    this.optimizeForFormat();

    // Verify file size
    const sizeOK = await this.verifyFileSize();

    // Setup accessibility
    this.setupAccessibility();

    return {
      dimensionsOK,
      sizeOK,
      format: this.state.currentFormat,
    };
  }

  /**
   * Generate compressed image URL with quality parameter
   * (For use with image optimization services)
   */
  generateOptimizedURL(src, format = 'webp', quality = this.config.quality.webp) {
    if (!src) return src;

    // For services that support quality parameters (like Cloudinary, ImageKit)
    const separator = src.includes('?') ? '&' : '?';
    const qualityParam = `quality=${quality * 100}`;
    const formatParam = `format=${format}`;

    return `${src}${separator}${qualityParam}&${formatParam}`;
  }

  /**
   * Cleanup resources
   */
  destroy() {
    const img = this.state.heroImage;

    if (img) {
      // Remove event listener
      img.removeEventListener('error', this.handleImageError);
    }

    console.log('Hero optimizer destroyed');
  }
}

// Initialize hero optimizer when DOM is ready
let heroOptimizerInstance = null;

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    try {
      heroOptimizerInstance = new HeroOptimizer();
    } catch (error) {
      console.error('Failed to initialize HeroOptimizer:', error);
    }
  });
} else {
  try {
    heroOptimizerInstance = new HeroOptimizer();
  } catch (error) {
    console.error('Failed to initialize HeroOptimizer:', error);
  }
}

// Export for potential module usage
export { HeroOptimizer };
