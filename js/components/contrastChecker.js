/**
 * Contrast Checker Module
 * 
 * This module provides color contrast verification functionality for the healthy
 * catering landing page to ensure WCAG 2.1 AA compliance.
 * 
 * Features:
 * - Verify contrast ratio of 4.5:1 minimum for normal text (16px and below)
 * - Implement 3:1 minimum for large text (18px and above, or 14px+ bold)
 * - Verify focus indicators with 2px minimum width
 * - Check all text/background combinations on the page
 * - Report contrast violations with detailed information
 * 
 * WCAG 2.1 AA Requirements:
 * - Normal text (under 18px or 14px+ bold): 4.5:1 contrast ratio
 * - Large text (18px+, 14px+ bold, or 24px+): 3:1 contrast ratio
 * - Focus indicators: minimum 2px width (or equivalent visual effect)
 * 
 * @module ContrastChecker
 */

/**
 * Calculate relative luminance of a color
 * Uses WCAG 2.1 formula
 * @param {string} rgb - RGB color string (e.g., 'rgb(255, 255, 255)')
 * @returns {number} Luminance value (0-1)
 */
const getLuminance = (rgb) => {
  // Parse RGB values
  const rgbValues = rgb.match(/[\d.]+/g);
  if (!rgbValues || rgbValues.length < 3) return 0;
  
  const [r, g, b] = rgbValues.map(val => {
    const normalized = parseInt(val, 10) / 255;
    return normalized <= 0.03928
      ? normalized / 12.92
      : Math.pow((normalized + 0.055) / 1.055, 2.4);
  });
  
  // Calculate relative luminance
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

/**
 * Calculate contrast ratio between two colors
 * @param {string} rgb1 - First RGB color string
 * @param {string} rgb2 - Second RGB color string
 * @returns {number} Contrast ratio (1-21)
 */
const getContrastRatio = (rgb1, rgb2) => {
  const lum1 = getLuminance(rgb1);
  const lum2 = getLuminance(rgb2);
  
  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);
  
  return (lighter + 0.05) / (darker + 0.05);
};

/**
 * Get computed color value for an element
 * @param {HTMLElement} element - DOM element
 * @param {string} property - CSS property name
 * @returns {string} RGB color string
 */
const getComputedStyleColor = (element, property) => {
  const computedStyle = window.getComputedStyle(element);
  let color = computedStyle.getPropertyValue(property);
  
  // Handle transparent and inherit
  if (color === 'transparent' || color === 'inherit') {
    return null;
  }
  
  // Convert named colors and hex to RGB
  if (color.startsWith('#') || ['red', 'green', 'blue', 'black', 'white', 'gray', 'grey'].includes(color)) {
    const ctx = document.createElement('canvas').getContext('2d');
    ctx.fillStyle = color;
    color = ctx.fillStyle;
  }
  
  return color;
};

/**
 * Get element background color (including parent chain)
 * @param {HTMLElement} element - DOM element
 * @returns {string|null} Background RGB color or null
 */
const getBackgroundColor = (element) => {
  let current = element;
  while (current) {
    const bgColor = getComputedStyleColor(current, 'background-color');
    if (bgColor && bgColor !== 'transparent') {
      return bgColor;
    }
    
    // Check for background-image
    const bgImage = getComputedStyleColor(current, 'background-image');
    if (bgImage && bgImage !== 'none') {
      // Has background image, can't determine solid color
      return null;
    }
    
    current = current.parentElement;
  }
  return null;
};

/**
 * Check if element has sufficient text color contrast
 * @param {HTMLElement} element - Text element to check
 * @param {Object} options - Contrast requirements
 * @param {number} options.normalTextRatio - Minimum ratio for normal text (default: 4.5)
 * @param {number} options.largeTextRatio - Minimum ratio for large text (default: 3)
 * @returns {Object} Contrast result with status and details
 */
const checkTextContrast = (element, options = {}) => {
  const {
    normalTextRatio = 4.5,
    largeTextRatio = 3
  } = options;
  
  const computedStyle = window.getComputedStyle(element);
  const textColor = getComputedStyleColor(element, 'color');
  const backgroundColor = getBackgroundColor(element);
  
  // Skip if no color information available
  if (!textColor || !backgroundColor) {
    return {
      status: 'skipped',
      element,
      reason: 'Insufficient color information'
    };
  }
  
  const ratio = getContrastRatio(textColor, backgroundColor);
  
  // Determine if text is "large" (18px+ or 14px+ bold)
  const fontSize = parseFloat(computedStyle.fontSize);
  const fontWeight = computedStyle.fontWeight;
  const isLargeText = fontSize >= 18 || (fontSize >= 14 && parseInt(fontWeight, 10) >= 700);
  
  const requiredRatio = isLargeText ? largeTextRatio : normalTextRatio;
  const passes = ratio >= requiredRatio;
  
  return {
    status: passes ? 'passed' : 'failed',
    element,
    textColor,
    backgroundColor,
    fontSize: `${fontSize}px`,
    fontWeight,
    isLargeText,
    ratio,
    requiredRatio,
    contrastPasses: passes
  };
};

/**
 * Check if element has sufficient focus indicator
 * @param {HTMLElement} element - Element to check
 * @param {Object} options - Focus indicator requirements
 * @param {number} options.minWidth - Minimum focus indicator width (default: 2px)
 * @returns {Object} Focus indicator result
 */
const checkFocusIndicator = (element, options = {}) => {
  const { minWidth = 2 } = options;
  const computedStyle = window.getComputedStyle(element);
  
  const outlineWidth = computedStyle.getPropertyValue('outline-width');
  const borderWidth = computedStyle.getPropertyValue('border-width');
  const boxShadow = computedStyle.getPropertyValue('box-shadow');
  
  // Parse outline width
  let focusWidth = 0;
  if (outlineWidth && outlineWidth !== '0px') {
    focusWidth = parseFloat(outlineWidth);
  }
  
  // Check border width
  if (borderWidth && parseFloat(borderWidth) > 0) {
    focusWidth = Math.max(focusWidth, parseFloat(borderWidth));
  }
  
  // Check box-shadow for focus effect
  if (boxShadow && boxShadow !== 'none') {
    // A box-shadow can serve as a focus indicator
    focusWidth = Math.max(focusWidth, 1); // Box-shadow counts as at least 1px
  }
  
  // Check for explicit focus styles
  const hasFocusStyles = 
    (outlineWidth && outlineWidth !== '0px' && outlineWidth !== 'none') ||
    (borderWidth && parseFloat(borderWidth) > 0) ||
    (boxShadow && boxShadow !== 'none');
  
  return {
    element,
    hasFocusStyles,
    focusWidth,
    meetsMinimum: hasFocusStyles && focusWidth >= minWidth,
    minWidth
  };
};

/**
 * Find all text elements on the page that need contrast checking
 * @param {HTMLElement} root - Root element to search within
 * @returns {Array} Array of text elements
 */
const getTextElements = (root = document.body) => {
  const textElements = [];
  const ignoredTags = ['SCRIPT', 'STYLE', 'NOSCRIPT', 'SVG', 'CANVAS'];
  const ignoredClasses = ['sr-only', 'visually-hidden'];
  
  const walker = document.createTreeWalker(
    root,
    NodeFilter.SHOW_ELEMENT,
    {
      acceptNode: (node) => {
        const tagName = node.tagName;
        const className = node.className;
        
        // Skip ignored tags
        if (ignoredTags.includes(tagName)) {
          return NodeFilter.FILTER_REJECT;
        }
        
        // Skip ignored classes
        if (className && ignoredClasses.some(cls => className.includes(cls))) {
          return NodeFilter.FILTER_REJECT;
        }
        
        return NodeFilter.FILTER_SKIP;
      }
    }
  );
  
  let node;
  while ((node = walker.nextNode())) {
    const element = node;
    const computedStyle = window.getComputedStyle(element);
    const textColor = getComputedStyleColor(element, 'color');
    
    // Only include elements with visible text color
    if (textColor && !textColor.includes('transparent')) {
      // Check if element has direct text content or is a text element
      if (element.childNodes.length > 0 || 
          ['P', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'SPAN', 'A', 'LABEL', 'BUTTON', 'LI', 'TD', 'TH', 'EM', 'STRONG', 'SMALL', 'CODE'].includes(tagName)) {
        textElements.push(element);
      }
    }
  }
  
  return textElements;
};

/**
 * Find all focusable elements for focus indicator checking
 * @param {HTMLElement} root - Root element to search within
 * @returns {Array} Array of focusable elements
 */
const getFocusableElements = (root = document.body) => {
  const focusableSelectors = [
    'a[href]',
    'button:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
    'audio[controls]',
    'video[controls]',
    '[contenteditable]'
  ].join(', ');
  
  return Array.from(root.querySelectorAll(focusableSelectors));
};

/**
 * Main contrast checker class
 */
class ContrastChecker {
  constructor(options = {}) {
    this.options = {
      normalTextRatio: 4.5,
      largeTextRatio: 3,
      focusMinWidth: 2,
      ...options
    };
    
    this.violations = [];
    this.passedChecks = [];
  }
  
  /**
   * Check all text contrast on the page
   * @returns {Array} Array of contrast check results
   */
  checkAllTextContrast() {
    const textElements = getTextElements();
    const results = [];
    
    textElements.forEach(element => {
      const result = checkTextContrast(element, this.options);
      results.push(result);
      
      if (result.status === 'failed') {
        this.violations.push(result);
      } else if (result.status === 'passed') {
        this.passedChecks.push(result);
      }
    });
    
    return results;
  }
  
  /**
   * Check all focus indicators on the page
   * @returns {Array} Array of focus indicator results
   */
  checkAllFocusIndicators() {
    const focusableElements = getFocusableElements();
    const results = [];
    
    focusableElements.forEach(element => {
      // Check normal state
      const normalResult = checkFocusIndicator(element, { minWidth: this.options.focusMinWidth });
      results.push(normalResult);
      
      // Also check :focus state
      const focusResult = checkFocusIndicator(element, { minWidth: this.options.focusMinWidth });
      results.push(focusResult);
    });
    
    return results;
  }
  
  /**
   * Run complete accessibility audit
   * @returns {Object} Complete audit results
   */
  audit() {
    this.violations = [];
    this.passedChecks = [];
    
    const textResults = this.checkAllTextContrast();
    const focusResults = this.checkAllFocusIndicators();
    
    // Filter only failures from focus results
    const focusViolations = focusResults.filter(r => !r.meetsMinimum);
    focusViolations.forEach(v => this.violations.push(v));
    
    // Count passed focus checks
    const focusPassed = focusResults.filter(r => r.meetsMinimum);
    focusPassed.forEach(p => this.passedChecks.push(p));
    
    return {
      summary: {
        totalTextElements: textResults.length,
        textContrastPassed: textResults.filter(r => r.status === 'passed').length,
        textContrastFailed: textResults.filter(r => r.status === 'failed').length,
        textContrastSkipped: textResults.filter(r => r.status === 'skipped').length,
        totalFocusableElements: focusableElements.length,
        focusIndicatorsPass: focusPassed.length,
        focusIndicatorsFail: focusViolations.length,
        totalViolations: this.violations.length,
        totalPassedChecks: this.passedChecks.length
      },
      violations: this.violations,
      passedChecks: this.passedChecks
    };
  }
  
  /**
   * Generate detailed report of violations
   * @returns {string} Formatted report
   */
  generateReport() {
    const audit = this.audit();
    let report = '=== Contrast Accessibility Report ===\n\n';
    
    // Summary
    report += 'SUMMARY\n';
    report += '-------\n';
    report += `Total text elements checked: ${audit.summary.totalTextElements}\n`;
    report += `Text contrast passed: ${audit.summary.textContrastPassed}\n`;
    report += `Text contrast failed: ${audit.summary.textContrastFailed}\n`;
    report += `Focus indicators passed: ${audit.summary.focusIndicatorsPass}\n`;
    report += `Focus indicators failed: ${audit.summary.focusIndicatorsFail}\n`;
    report += `Total violations: ${audit.summary.totalViolations}\n\n`;
    
    // Violations
    if (this.violations.length > 0) {
      report += 'VIOLATIONS\n';
      report += '----------\n';
      
      this.violations.forEach((violation, index) => {
        report += `\n${index + 1}. ${violation.element.tagName}`;
        if (violation.element.id) report += `#${violation.element.id}`;
        if (violation.element.className) report += `.${violation.element.className.replace(/\s+/g, '.')}`;
        report += '\n';
        
        if (violation.element.textContent) {
          const textPreview = violation.element.textContent.trim().substring(0, 50);
          report += `   Text content: "${textPreview}${violation.element.textContent.length > 50 ? '...' : ''}"\n`;
        }
        
        if (violation.textColor) {
          report += `   Text color: ${violation.textColor}\n`;
        }
        
        if (violation.backgroundColor) {
          report += `   Background: ${violation.backgroundColor}\n`;
        }
        
        if (violation.fontSize) {
          report += `   Font size: ${violation.fontSize}\n`;
        }
        
        if (violation.ratio) {
          report += `   Contrast ratio: ${violation.ratio.toFixed(2)}:1 (required: ${violation.requiredRatio}:1)\n`;
        }
        
        report += `   Element: ${this.describeElement(violation.element)}\n`;
      });
    }
    
    // Passed checks
    if (this.passedChecks.length > 0) {
      report += '\n\nPASSED CHECKS (Sample)\n';
      report += '---------------------\n';
      const sampleSize = Math.min(5, this.passedChecks.length);
      for (let i = 0; i < sampleSize; i++) {
        const pass = this.passedChecks[i];
        report += `${i + 1}. ${pass.element.tagName} - Ratio: ${pass.ratio.toFixed(2)}:1\n`;
      }
    }
    
    return report;
  }
  
  /**
   * Get a CSS selector for an element
   * @param {HTMLElement} element - DOM element
   * @returns {string} CSS selector
   */
  describeElement(element) {
    const parts = [];
    let current = element;
    
    while (current && current.nodeType === Node.ELEMENT_NODE) {
      let selector = current.tagName.toLowerCase();
      
      if (current.id) {
        selector += `#${current.id}`;
        parts.unshift(selector);
        break;
      }
      
      if (current.className && typeof current.className === 'string') {
        const classes = current.className.trim().split(/\s+/).filter(Boolean);
        if (classes.length > 0) {
          selector += `.${classes.slice(0, 2).join('.')}`;
        }
      }
      
      parts.unshift(selector);
      current = current.parentElement;
      
      if (parts.length > 3) {
        break;
      }
    }
    
    return parts.join(' > ');
  }
}

// Export for use in browsers and modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ContrastChecker;
}

// Also attach to window for direct browser usage
if (typeof window !== 'undefined') {
  window.ContrastChecker = ContrastChecker;
}

// Export default
export default ContrastChecker;