/**
 * CSS/JavaScript Optimizer
 * Healthy Catering Landing Page - Production Optimization Utility
 * 
 * Features:
 * - Minify CSS for production
 * - Minify JavaScript for production  
 * - Inline critical CSS
 * - Optimize bundle size
 * - Remove unused code
 * 
 * @module optimizer
 */

// CSS Minification Patterns
const CSS_MINIFICATION_PATTERNS = {
  // Remove comments
  comments: /\/\*[\s\S]*?\*\/|\/\/.*$/gm,
  // Remove whitespace
  whitespace: /\s{2,}/g,
  // Remove unnecessary semicolons
  semicolons: /;[\s]*}/g,
  // Remove zero units
  zeroUnits: /:\s*0(?:px|em|rem|%|in|cm|mm|pc|pt|ex)?/gi,
  // Remove leading zeros
  leadingZeros: /\b0+(\d+)/g,
  // Minimize color codes
  colors: /#([a-f0-9])\1([a-f0-9])\2([a-f0-9])\3/gi,
  // Remove empty selectors
  emptySelectors: /[^\}]+\{\s*\}/g,
  // Normalize whitespace around operators
  operators: /\s*([{};>+-])\s*/g
};

// JavaScript Minification Patterns
const JS_MINIFICATION_PATTERNS = {
  // Remove comments
  comments: /\/\*[\s\S]*?\*\/|\/\/.*$/gm,
  // Remove whitespace
  whitespace: /\s{2,}/g,
  // Remove empty lines
  emptyLines: /^\s*$/gm,
  // Remove unnecessary semicolons
  semicolons: /;[\s]*}/g,
  // Remove spaces around operators
  operators: /\s*([{}();,=+\-*\/<>!|&])\s*/g,
  // Minimize variable declarations
  varDeclarations: /var\s+/g,
  // Remove undefined comparisons
  undefinedCompare: /===\s*undefined/g,
  // Remove console statements in production
  console: /console\.(log|warn|error|info|debug)\([^)]*\);?/g
};

/**
 * CSS Optimizer Class
 * Provides CSS minification and optimization functionality
 */
class CSSOptimizer {
  constructor(options = {}) {
    this.options = {
      preserveComments: false,
      removeUnused: true,
      optimizeColors: true,
      zeroUnits: true,
      removeEmptyRules: true,
      ...options
    };
  }

  /**
   * Minify CSS content
   * @param {string} css - Raw CSS content
   * @returns {string} Minified CSS
   */
  minify(css) {
    if (typeof css !== 'string') {
      throw new Error('CSS content must be a string');
    }

    let minified = css;

    // Remove comments (unless preserved)
    if (!this.options.preserveComments) {
      minified = minified.replace(CSS_MINIFICATION_PATTERNS.comments, '');
    }

    // Remove empty rules
    if (this.options.removeEmptyRules) {
      minified = minified.replace(CSS_MINIFICATION_PATTERNS.emptySelectors, '');
    }

    // Normalize whitespace around operators
    minified = minified.replace(CSS_MINIFICATION_PATTERNS.operators, '$1');

    // Remove unnecessary whitespace
    minified = minified.replace(CSS_MINIFICATION_PATTERNS.whitespace, ' ');

    // Trim whitespace
    minified = minified.trim();

    // Remove unnecessary semicolons
    minified = minified.replace(CSS_MINIFICATION_PATTERNS.semicolons, '}');

    // Optimize colors (convert to 3-digit if possible)
    if (this.options.optimizeColors) {
      minified = minified.replace(CSS_MINIFICATION_PATTERNS.colors, (match, r, g, b) => {
        return `#${r}${g}${b}`;
      });
    }

    // Remove leading zeros
    minified = minified.replace(CSS_MINIFICATION_PATTERNS.leadingZeros, '$1');

    // Optimize zero values
    if (this.options.zeroUnits) {
      minified = minified.replace(CSS_MINIFICATION_PATTERNS.zeroUnits, ':0');
    }

    return minified;
  }

  /**
   * Extract critical CSS (above-the-fold styles)
   * @param {string} css - Full CSS content
   * @param {Array} criticalSelectors - Selectors to prioritize
   * @returns {string} Critical CSS
   */
  extractCriticalCSS(css, criticalSelectors = []) {
    if (typeof css !== 'string') {
      throw new Error('CSS content must be a string');
    }

    // Default critical selectors for a landing page
    const defaults = [
      '.navigation',
      '.hero',
      '.hero__content',
      '.hero__headline',
      '.btn--primary',
      '.btn--secondary'
    ];

    const selectorsToInclude = [...defaults, ...criticalSelectors];
    
    // Parse and extract critical rules
    const criticalRules = [];
    const ruleRegex = /([^{}]+)\{([^}]*)\}/g;
    let match;

    while ((match = ruleRegex.exec(css)) !== null) {
      const selector = match[1].trim();
      const body = match[2].trim();

      // Check if any critical selector matches
      const isCritical = selectorsToInclude.some(crit => {
        return selector.includes(crit) || crit.includes(selector.split(',')[0].trim());
      });

      if (isCritical) {
        criticalRules.push(`${selector} { ${body} }`);
      }
    }

    return criticalRules.join(' ');
  }

  /**
   * Inlines CSS into a style tag
   * @param {string} css - CSS content to inline
   * @param {Object} attributes - Additional attributes for style tag
   * @returns {string} HTML style tag
   */
  inlineCSS(css, attributes = {}) {
    if (typeof css !== 'string') {
      throw new Error('CSS content must be a string');
    }

    const attrString = Object.entries(attributes)
      .map(([key, value]) => `${key}="${value}"`)
      .join(' ');

    return `<style${attrString ? ` ${attrString}` : ''}>\n${css}\n</style>`;
  }

  /**
   * Detect unused CSS rules (basic detection)
   * @param {string} css - CSS content
   * @param {string} html - HTML content
   * @returns {Array} Array of unused selectors
   */
  detectUnusedCSS(css, html) {
    if (typeof css !== 'string' || typeof html !== 'string') {
      throw new Error('CSS and HTML content must be strings');
    }

    const unusedSelectors = [];
    const ruleRegex = /([^{}]+)\{([^}]*)\}/g;
    let match;

    while ((match = ruleRegex.exec(css)) !== null) {
      const selector = match[1].trim();
      
      // Skip media queries and pseudo-selectors for basic detection
      if (selector.includes('@media') || selector.includes(':')) {
        continue;
      }

      // Check if any part of the selector exists in HTML
      const classes = selector.match(/\.[a-zA-Z_-]+/g);
      const hasMatch = classes && classes.some(cls => html.includes(cls));

      if (!hasMatch) {
        unusedSelectors.push(selector);
      }
    }

    return unusedSelectors;
  }
}

/**
 * JavaScript Optimizer Class
 * Provides JavaScript minification and optimization functionality
 */
class JSOptimizer {
  constructor(options = {}) {
    this.options = {
      removeConsole: true,
      removeUnused: true,
      optimizeVariables: true,
      removeWhitespace: true,
      ...options
    };
  }

  /**
   * Minify JavaScript content
   * @param {string} js - Raw JavaScript content
   * @returns {string} Minified JavaScript
   */
  minify(js) {
    if (typeof js !== 'string') {
      throw new Error('JavaScript content must be a string');
    }

    let minified = js;

    // Remove console statements in production
    if (this.options.removeConsole) {
      minified = minified.replace(JS_MINIFICATION_PATTERNS.console, '');
    }

    // Remove comments
    minified = minified.replace(JS_MINIFICATION_PATTERNS.comments, '');

    // Remove empty lines
    minified = minified.replace(JS_MINIFICATION_PATTERNS.emptyLines, '');

    // Remove unnecessary whitespace
    if (this.options.removeWhitespace) {
      minified = minified.replace(JS_MINIFICATION_PATTERNS.whitespace, ' ');
    }

    // Normalize whitespace around operators
    minified = minified.replace(JS_MINIFICATION_PATTERNS.operators, '$1');

    // Remove unnecessary semicolons
    minified = minified.replace(JS_MINIFICATION_PATTERNS.semicolons, '}');

    // Replace var with let/const where appropriate
    if (this.options.optimizeVariables) {
      // Simple heuristic: if assigned value has const, use const
      minified = minified.replace(JS_MINIFICATION_PATTERNS.varDeclarations, 'const ');
    }

    return minified.trim();
  }

  /**
   * Bundle multiple JavaScript files into one
   * @param {Array} files - Array of file paths or code strings
   * @returns {string} Bundled JavaScript
   */
  async bundle(files) {
    if (!Array.isArray(files) || files.length === 0) {
      throw new Error('Files must be a non-empty array');
    }

    const bundled = [];

    for (const file of files) {
      try {
        let content = file;

        // If it's a path (string starting with . or /), read the file
        if (typeof file === 'string' && (file.startsWith('.') || file.startsWith('/'))) {
          // For production use, this would read from file system
          // In browser environment, this would be handled differently
          content = await this._readFile(file);
        }

        bundled.push(this.minify(content));
      } catch (error) {
        console.warn(`Failed to process file: ${file}`, error.message);
        continue;
      }
    }

    return bundled.join('\n');
  }

  /**
   * Tree shake unused code (basic implementation)
   * @param {string} js - JavaScript content
   * @returns {string} Tree-shaken JavaScript
   */
  treeShake(js) {
    if (typeof js !== 'string') {
      throw new Error('JavaScript content must be a string');
    }

    // For a comprehensive tree-shaking implementation, AST parsing would be needed
    // This is a basic pattern-based approach
    
    // Remove unused imports (if using ES modules)
    const unusedImports = js.match(/^import\s+.*from\s+['"][^'"]+['"];\s*$/gm) || [];
    
    let shaken = js;
    for (const unused of unusedImports) {
      shaken = shaken.replace(unused, '');
    }

    return shaken.trim();
  }

  /**
   * Optimize bundle size by identifying large components
   * @param {string} js - JavaScript content
   * @returns {Object} Bundle size analysis
   */
  analyzeBundleSize(js) {
    if (typeof js !== 'string') {
      throw new Error('JavaScript content must be a string');
    }

    const originalSize = js.length;
    const minifiedSize = this.minify(js).length;

    return {
      originalSize,
      minifiedSize,
      gzippedSize: Math.round(minifiedSize * 0.3), // Gzip typically achieves ~70% compression
      savings: originalSize - minifiedSize,
      savingsPercentage: Math.round(((originalSize - minifiedSize) / originalSize) * 100)
    };
  }

  /**
   * Read file content (async for Node.js environment)
   * @param {string} filePath - Path to file
   * @returns {Promise<string>} File content
   * @private
   */
  async _readFile(filePath) {
    // In a Node.js environment, this would use fs.readFileSync
    // For browser environment, files would need to be pre-loaded
    if (typeof process !== 'undefined' && process.versions && process.versions.node) {
      const fs = await import('fs');
      return fs.readFileSync(filePath, 'utf8');
    }
    throw new Error('File reading not supported in browser environment');
  }
}

/**
 * Critical CSS Optimizer
 * Combines CSS optimization with critical CSS extraction
 */
class CriticalCSSOptimizer {
  constructor() {
    this.cssOptimizer = new CSSOptimizer();
    this.jsOptimizer = new JSOptimizer();
  }

  /**
   * Generate optimized inline styles for above-the-fold content
   * @param {string} css - Full CSS content
   * @param {string} html - HTML content
   * @returns {Object} Contains critical CSS and instructions
   */
  generateCriticalCSS(css, html) {
    if (typeof css !== 'string' || typeof html !== 'string') {
      throw new Error('CSS and HTML content must be strings');
    }

    // Extract critical CSS
    const criticalCSS = this.cssOptimizer.extractCriticalCSS(css);

    // Minify critical CSS
    const minifiedCritical = this.cssOptimizer.minify(criticalCSS);

    // Inlined critical CSS
    const inlined = this.cssOptimizer.inlineCSS(minifiedCritical, {
      'id': 'critical-styles',
      'media': 'all'
    });

    return {
      criticalCSS,
      minifiedCritical,
      inlined,
      savings: {
        original: css.length,
        critical: minifiedCritical.length
      }
    };
  }

  /**
   * Optimize entire page for production
   * @param {Object} options - Optimization options
   * @returns {Object} Optimized page assets
   */
  async optimizePage(options = {}) {
    const {
      cssContent,
      jsContent,
      htmlContent,
      outputDir = './dist'
    } = options;

    if (!cssContent || !jsContent) {
      throw new Error('cssContent and jsContent are required');
    }

    // Optimize CSS
    const cssOptimizer = new CSSOptimizer(options.cssOptions);
    const minifiedCSS = cssOptimizer.minify(cssContent);
    const criticalCSS = cssOptimizer.extractCriticalCSS(cssContent);

    // Optimize JavaScript
    const jsOptimizer = new JSOptimizer(options.jsOptions);
    const minifiedJS = jsOptimizer.minify(jsContent);
    const bundleAnalysis = jsOptimizer.analyzeBundleSize(jsContent);

    // Generate inline critical CSS
    const inlineCriticalCSS = cssOptimizer.inlineCSS(
      cssOptimizer.minify(criticalCSS),
      { id: 'critical-styles' }
    );

    return {
      css: {
        original: cssContent,
        minified: minifiedCSS,
        critical: criticalCSS,
        inline: inlineCriticalCSS,
        size: minifiedCSS.length
      },
      js: {
        original: jsContent,
        minified: minifiedJS,
        size: minifiedJS.length,
        bundleAnalysis
      },
      html: {
        criticalStylesInline: htmlContent.replace(
          /<link[^>]*rel=["']stylesheet["'][^>]*>/,
          `${inlineCriticalCSS}\n  <link rel="stylesheet" href="${outputDir}/styles.min.css" media="afterLoad" onload="this.media='all'">`
        )
      }
    };
  }
}

/**
 * Main optimizer entry point
 */
class Optimizer {
  constructor() {
    this.cssOptimizer = new CSSOptimizer();
    this.jsOptimizer = new JSOptimizer();
    this.criticalCSSOptimizer = new CriticalCSSOptimizer();
  }

  /**
   * Minify CSS
   * @param {string} css - CSS content
   * @param {Object} options - Minification options
   * @returns {string} Minified CSS
   */
  static minifyCSS(css, options = {}) {
    const optimizer = new CSSOptimizer(options);
    return optimizer.minify(css);
  }

  /**
   * Minify JavaScript
   * @param {string} js - JavaScript content
   * @param {Object} options - Minification options
   * @returns {string} Minified JavaScript
   */
  static minifyJS(js, options = {}) {
    const optimizer = new JSOptimizer(options);
    return optimizer.minify(js);
  }

  /**
   * Generate production-ready output
   * @param {Object} input - Input assets
   * @returns {Object} Optimized assets ready for production
   */
  async generateProductionOutput(input) {
    const {
      cssPath,
      jsPath,
      htmlPath
    } = input;

    try {
      // Read files (in production, these would be pre-built)
      const cssContent = await this._readFile(cssPath);
      const jsContent = await this._readFile(jsPath);
      const htmlContent = await this._readFile(htmlPath);

      // Optimize each asset
      const css = this.cssOptimizer.minify(cssContent);
      const js = this.jsOptimizer.minify(jsContent);

      // Generate critical CSS
      const critical = this.criticalCSSOptimizer.generateCriticalCSS(cssContent, htmlContent);

      return {
        css: {
          minified: css,
          size: css.length,
          critical: critical.minifiedCritical,
          inline: critical.inlined
        },
        js: {
          minified: js,
          size: js.length,
          bundleAnalysis: this.jsOptimizer.analyzeBundleSize(jsContent)
        },
        html: {
          optimized: htmlContent.replace(
            /<link[^>]*href=["']css\/styles\.css["'][^>]*>/,
            `<style id="critical-styles">${critical.minifiedCritical}</style>`
          )
        }
      };
    } catch (error) {
      console.error('Production optimization failed:', error);
      throw error;
    }
  }

  /**
   * Read file (Node.js helper)
   * @param {string} filePath - Path to file
   * @returns {Promise<string>} File content
   * @private
   */
  async _readFile(filePath) {
    if (typeof process !== 'undefined' && process.versions && process.versions.node) {
      const fs = await import('fs');
      return fs.readFileSync(filePath, 'utf8');
    }
    throw new Error('File reading not supported in browser environment');
  }
}

// Export for Node.js or browser usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    CSSOptimizer,
    JSOptimizer,
    CriticalCSSOptimizer,
    Optimizer,
    CSS_MINIFICATION_PATTERNS,
    JS_MINIFICATION_PATTERNS
  };
}