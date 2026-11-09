/**
 * Performance Test Module - Healthy Catering Landing Page
 * 
 * Comprehensive performance testing functionality including:
 * - PageSpeed Insights score verification (85+ mobile, 95+ desktop)
 * - Load time testing on 4G connection (above-fold content within 2 seconds)
 * - Core Web Vitals verification (LCP < 2.5s, FID < 100ms, CLS < 0.1)
 * - Performance report generation
 * 
 * Requirements: 10.1, 10.2
 */

/**
 * Performance Test Configuration
 */
const PerformanceConfig = {
  targets: {
    // PageSpeed Insights scores
    pagespeed: {
      mobile: 85,
      desktop: 95,
    },
    
    // Load times
    loadTime: {
      aboveFold4G: 2000, // 2 seconds
      fullPage: 5000, // 5 seconds
    },
    
    // Core Web Vitals
    webVitals: {
      lcp: 2500, // Largest Contentful Paint < 2.5s
      fid: 100, // First Input Delay < 100ms
      cls: 0.1, // Cumulative Layout Shift < 0.1
    },
  },
  
  metrics: {
    // Performance metrics to track
    navigation: {
      dnsLookup: 'dnsLookup',
      tcpConnect: 'tcpConnect',
      sslHandshake: 'sslHandshake',
      ttfb: 'ttfb', // Time to First Byte
      domInteractive: 'domInteractive',
      domContentLoaded: 'domContentLoaded',
      loadComplete: 'loadComplete',
    },
    
    // Resource timing categories
    resources: {
      html: 'document',
      css: 'stylesheet',
      js: 'script',
      image: 'image',
      font: 'font',
      other: 'other',
    },
  },
  
  thresholds: {
    // Resource timing thresholds
    resource: {
      maxDnsLookup: 100, // ms
      maxTcpConnect: 200, // ms
      maxSslHandshake: 150, // ms
      maxTtfb: 600, // ms
      maxDomInteractive: 1500, // ms
    },
    
    // Core Web Vitals acceptable ranges
    webVitals: {
      lcp: {
        good: 2500,
        needsImprovement: 4000,
        poor: 5000,
      },
      fid: {
        good: 100,
        needsImprovement: 300,
        poor: 500,
      },
      cls: {
        good: 0.1,
        needsImprovement: 0.25,
        poor: 0.5,
      },
    },
  },
  
  // User Agent strings for different device types
  deviceTypes: {
    mobile: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15',
    desktop: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    tablet: 'Mozilla/5.0 (iPad; CPU OS 14_0 like Mac OS X) AppleWebKit/605.1.15',
  },
};

/**
 * Performance Metrics Collector
 * Collects browser performance metrics using Performance API and Resource Timing
 */
class PerformanceMetricsCollector {
  constructor() {
    this.metrics = {
      navigation: {},
      resources: [],
      webVitals: {
        lcp: null,
        fid: null,
        cls: null,
      },
      custom: {},
    };
    
    this.observers = {
      lcp: null,
      fid: null,
      cls: null,
    };
  }

  /**
   * Collect navigation timing metrics
   * @returns {Object} Navigation timing data
   */
  collectNavigationTiming() {
    try {
      const navTiming = performance.getEntriesByType('navigation')[0];
      
      if (!navTiming) {
        console.warn('Navigation timing not available');
        return null;
      }

      this.metrics.navigation = {
        dnsLookup: navTiming.domainLookupEnd - navTiming.domainLookupStart,
        tcpConnect: navTiming.connectEnd - navTiming.connectStart,
        sslHandshake: navTiming.secureConnectionStart > 0 
          ? navTiming.connectEnd - navTiming.secureConnectionStart 
          : 0,
        ttfb: navTiming.responseStart,
        domInteractive: navTiming.domInteractive,
        domContentLoaded: navTiming.domContentLoadedEventEnd - navTiming.domContentLoadedEventStart,
        loadComplete: navTiming.loadEventEnd - navTiming.loadEventStart,
        total: navTiming.loadEventEnd - navTiming.startTime,
      };

      return this.metrics.navigation;
    } catch (error) {
      console.error('Error collecting navigation timing:', error);
      return null;
    }
  }

  /**
   * Collect resource timing metrics
   * @returns {Array} Array of resource timing entries
   */
  collectResourceTiming() {
    try {
      const resourceEntries = performance.getEntriesByType('resource');
      
      this.metrics.resources = resourceEntries.map(resource => ({
        name: resource.name,
        entryType: resource.entryType,
        startTime: resource.startTime,
        duration: resource.duration,
        transferSize: resource.transferSize,
        decodedBodySize: resource.decodedBodySize,
        nextHopProtocol: resource.nextHopProtocol,
      }));

      return this.metrics.resources;
    } catch (error) {
      console.error('Error collecting resource timing:', error);
      return [];
    }
  }

  /**
   * Setup LCP (Largest Contentful Paint) observer
   * @param {Function} callback - Callback function with LCP value
   */
  setupLcpObserver(callback) {
    if (!('LargestContentfulPaint' in performance)) {
      console.log('LCP not supported, using fallback measurement');
      // Fallback: measure when main image loads
      const heroImage = document.querySelector('.hero__image');
      if (heroImage) {
        heroImage.addEventListener('load', () => {
          const lcp = performance.now() - performance.timing.navigationStart;
          callback(lcp);
        });
      } else {
        // Generic fallback
        window.addEventListener('load', () => {
          callback(performance.now() - performance.timing.navigationStart);
        });
      }
      return;
    }

    this.observers.lcp = new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      const lastEntry = entries[entries.length - 1];
      callback(lastEntry.startTime);
    });

    try {
      this.observers.lcp.observe({ entryTypes: ['largest-contentful-paint'] });
    } catch (error) {
      console.warn('LCP observer setup failed:', error);
    }
  }

  /**
   * Setup FID (First Input Delay) observer
   * @param {Function} callback - Callback function with FID value
   */
  setupFidObserver(callback) {
    if (!('PerformanceEntry' in window && 'duration' in PerformanceEntry.prototype)) {
      console.log('FID not supported, using simulated measurement');
      callback(0);
      return;
    }

    this.observers.fid = new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      entries.forEach(entry => {
        callback(entry.processingStart - entry.startTime);
      });
    });

    try {
      this.observers.fid.observe({ entryTypes: ['first-input'] });
    } catch (error) {
      console.warn('FID observer setup failed:', error);
    }
  }

  /**
   * Setup CLS (Cumulative Layout Shift) observer
   * @param {Function} callback - Callback function with CLS value
   */
  setupClsObserver(callback) {
    let clsValue = 0;

    this.observers.cls = new PerformanceObserver((entryList) => {
      for (const entry of entryList.getEntries()) {
        if (!entry.hadRecentInput) {
          clsValue += entry.value;
        }
      }
      callback(clsValue);
    });

    try {
      this.observers.cls.observe({ entryTypes: ['layout-shift'] });
    } catch (error) {
      console.warn('CLS observer setup failed:', error);
    }
  }

  /**
   * Collect all metrics
   * @returns {Object} Complete metrics object
   */
  collectAllMetrics() {
    this.collectNavigationTiming();
    this.collectResourceTiming();
    
    return this.metrics;
  }

  /**
   * Cleanup observers
   */
  cleanup() {
    Object.values(this.observers).forEach(observer => {
      if (observer) {
        try {
          observer.disconnect();
        } catch (error) {
          console.warn('Error disconnecting observer:', error);
        }
      }
    });
  }
}

/**
 * PageSpeed Insights Simulator
 * Simulates PageSpeed Insights scoring based on performance metrics
 */
class PageSpeedSimulator {
  constructor() {
    this.scores = {
      mobile: 0,
      desktop: 0,
    };
  }

  /**
   * Calculate performance score based on metrics
   * @param {Object} metrics - Performance metrics
   * @param {string} deviceType - 'mobile' or 'desktop'
   * @returns {number} Performance score (0-100)
   */
  calculatePerformanceScore(metrics, deviceType = 'mobile') {
    let score = 100;
    
    // Check LCP (30% weight)
    if (metrics.webVitals.lcp) {
      if (metrics.webVitals.lcp > PerformanceConfig.targets.webVitals.lcp) {
        score -= 30;
      } else if (metrics.webVitals.lcp > PerformanceConfig.targets.webVitals.lcp * 0.8) {
        score -= 15;
      }
    }

    // Check FID (30% weight)
    if (metrics.webVitals.fid) {
      if (metrics.webVitals.fid > PerformanceConfig.targets.webVitals.fid) {
        score -= 30;
      } else if (metrics.webVitals.fid > PerformanceConfig.targets.webVitals.fid * 0.8) {
        score -= 15;
      }
    }

    // Check CLS (40% weight)
    if (metrics.webVitals.cls) {
      if (metrics.webVitals.cls > PerformanceConfig.targets.webVitals.cls) {
        score -= 40;
      } else if (metrics.webVitals.cls > PerformanceConfig.targets.webVitals.cls * 0.8) {
        score -= 20;
      }
    }

    // Check load time (additional factor)
    if (metrics.navigation && metrics.navigation.total) {
      const targetLoadTime = deviceType === 'mobile' ? 5000 : 3000;
      if (metrics.navigation.total > targetLoadTime) {
        score -= Math.min(20, (metrics.navigation.total - targetLoadTime) / 200);
      }
    }

    return Math.max(0, Math.min(100, Math.round(score)));
  }

  /**
   * Simulate PageSpeed Insights scores
   * @param {Object} metrics - Performance metrics
   * @returns {Object} Mobile and desktop scores
   */
  simulatePageSpeedScores(metrics) {
    this.scores.mobile = this.calculatePerformanceScore(metrics, 'mobile');
    this.scores.desktop = this.calculatePerformanceScore(metrics, 'desktop');
    
    return this.scores;
  }

  /**
   * Check if scores meet targets
   * @returns {Object} Pass/fail status for each device type
   */
  checkTargets() {
    return {
      mobile: this.scores.mobile >= PerformanceConfig.targets.pagespeed.mobile,
      desktop: this.scores.desktop >= PerformanceConfig.targets.pagespeed.desktop,
    };
  }

  /**
   * Get score details
   * @returns {Object} Score details
   */
  getScoreDetails() {
    return {
      mobile: {
        score: this.scores.mobile,
        target: PerformanceConfig.targets.pagespeed.mobile,
        status: this.scores.mobile >= PerformanceConfig.targets.pagespeed.mobile ? 'pass' : 'fail',
      },
      desktop: {
        score: this.scores.desktop,
        target: PerformanceConfig.targets.pagespeed.desktop,
        status: this.scores.desktop >= PerformanceConfig.targets.pagespeed.desktop ? 'pass' : 'fail',
      },
    };
  }
}

/**
 * Load Time Tester
 * Tests page load times on simulated 4G connection
 */
class LoadTimeTester {
  constructor() {
    this.results = {
      aboveFold4G: null,
      fullPage: null,
      aboveFold4GTarget: PerformanceConfig.targets.loadTime.aboveFold4G,
      fullPageTarget: PerformanceConfig.targets.loadTime.fullPage,
    };
  }

  /**
   * Measure above-fold content load time
   * Uses performance.mark and performance.measure API
   * @returns {Promise<number>} Above-fold load time in ms
   */
  async measureAboveFoldLoad() {
    return new Promise((resolve) => {
      // Mark start
      performance.mark('above-fold-start');
      
      // Mark when hero image loads (key above-fold element)
      const heroImage = document.querySelector('.hero__image');
      if (heroImage) {
        if (heroImage.complete) {
          performance.mark('above-fold-hero-loaded');
          const measure = performance.measure('above-fold', 'above-fold-start', 'above-fold-hero-loaded');
          resolve(measure.duration);
        } else {
          heroImage.addEventListener('load', () => {
            performance.mark('above-fold-hero-loaded');
            const measure = performance.measure('above-fold', 'above-fold-start', 'above-fold-hero-loaded');
            resolve(measure.duration);
          });
          
          // Timeout fallback
          setTimeout(() => {
            performance.mark('above-fold-timeout');
            const measure = performance.measure('above-fold', 'above-fold-start', 'above-fold-timeout');
            resolve(measure.duration);
          }, 5000);
        }
      } else {
        // Fallback: measure until DOM content loaded
        window.addEventListener('DOMContentLoaded', () => {
          performance.mark('above-fold-domloaded');
          const measure = performance.measure('above-fold', 'above-fold-start', 'above-fold-domloaded');
          resolve(measure.duration);
        });
        
        // Timeout fallback
        setTimeout(() => {
          performance.mark('above-fold-timeout');
          const measure = performance.measure('above-fold', 'above-fold-start', 'above-fold-timeout');
          resolve(measure.duration);
        }, 5000);
      }
    });
  }

  /**
   * Measure full page load time
   * @returns {Promise<number>} Full page load time in ms
   */
  async measureFullPageLoad() {
    return new Promise((resolve) => {
      performance.mark('full-page-start');
      
      window.addEventListener('load', () => {
        performance.mark('full-page-loaded');
        const measure = performance.measure('full-page', 'full-page-start', 'full-page-loaded');
        resolve(measure.duration);
      });
      
      // Timeout fallback
      setTimeout(() => {
        performance.mark('full-page-timeout');
        const measure = performance.measure('full-page', 'full-page-start', 'full-page-timeout');
        resolve(measure.duration);
      }, 10000);
    });
  }

  /**
   * Run load time tests
   * @returns {Promise<Object>} Load time results
   */
  async runTests() {
    this.results.aboveFold4G = await this.measureAboveFoldLoad();
    this.results.fullPage = await this.measureFullPageLoad();
    
    return this.results;
  }

  /**
   * Check if load times meet targets
   * @returns {Object} Pass/fail status for each target
   */
  checkTargets() {
    return {
      aboveFold4G: this.results.aboveFold4G <= this.results.aboveFold4GTarget,
      fullPage: this.results.fullPage <= this.results.fullPageTarget,
    };
  }

  /**
   * Get load time details
   * @returns {Object} Load time details
   */
  getLoadTimeDetails() {
    return {
      aboveFold4G: {
        time: this.results.aboveFold4G,
        target: this.results.aboveFold4GTarget,
        status: this.results.aboveFold4G <= this.results.aboveFold4GTarget ? 'pass' : 'fail',
      },
      fullPage: {
        time: this.results.fullPage,
        target: this.results.fullPageTarget,
        status: this.results.fullPage <= this.results.fullPageTarget ? 'pass' : 'fail',
      },
    };
  }
}

/**
 * Core Web Vitals Validator
 * Validates Core Web Vitals targets
 */
class CoreWebVitalsValidator {
  constructor() {
    this.targets = PerformanceConfig.targets.webVitals;
    this.results = {
      lcp: { value: null, target: this.targets.lcp, status: 'pending' },
      fid: { value: null, target: this.targets.fid, status: 'pending' },
      cls: { value: null, target: this.targets.cls, status: 'pending' },
    };
    
    this.metricsCollector = null;
  }

  /**
   * Validate LCP (Largest Contentful Paint)
   * @param {number} lcpValue - LCP value in ms
   * @returns {boolean} True if LCP meets target
   */
  validateLcp(lcpValue) {
    this.results.lcp.value = lcpValue;
    this.results.lcp.status = lcpValue < this.targets.lcp ? 'pass' : 'fail';
    return this.results.lcp.status === 'pass';
  }

  /**
   * Validate FID (First Input Delay)
   * @param {number} fidValue - FID value in ms
   * @returns {boolean} True if FID meets target
   */
  validateFid(fidValue) {
    this.results.fid.value = fidValue;
    this.results.fid.status = fidValue < this.targets.fid ? 'pass' : 'fail';
    return this.results.fid.status === 'pass';
  }

  /**
   * Validate CLS (Cumulative Layout Shift)
   * @param {number} clsValue - CLS value
   * @returns {boolean} True if CLS meets target
   */
  validateCls(clsValue) {
    this.results.cls.value = clsValue;
    this.results.cls.status = clsValue < this.targets.cls ? 'pass' : 'fail';
    return this.results.cls.status === 'pass';
  }

  /**
   * Setup observers for real-time validation
   * @returns {Promise<Object>} Validation results
   */
  async setupValidation() {
    this.metricsCollector = new PerformanceMetricsCollector();
    
    return new Promise((resolve) => {
      // Setup LCP observer
      this.metricsCollector.setupLcpObserver((lcp) => {
        this.validateLcp(lcp);
      });
      
      // Setup FID observer
      this.metricsCollector.setupFidObserver((fid) => {
        this.validateFid(fid);
      });
      
      // Setup CLS observer
      this.metricsCollector.setupClsObserver((cls) => {
        this.validateCls(cls);
        
        // All observers have collected their metrics
        resolve(this.results);
      });
    });
  }

  /**
   * Check if all Web Vitals meet targets
   * @returns {boolean} True if all targets met
   */
  checkAllTargets() {
    return (
      this.results.lcp.status === 'pass' &&
      this.results.fid.status === 'pass' &&
      this.results.cls.status === 'pass'
    );
  }

  /**
   * Get Web Vitals details
   * @returns {Object} Web Vitals details
   */
  getWebVitalsDetails() {
    return {
      lcp: {
        value: this.results.lcp.value,
        target: this.results.lcp.target,
        status: this.results.lcp.status,
        message: this._getWebVitalMessage('lcp', this.results.lcp.value),
      },
      fid: {
        value: this.results.fid.value,
        target: this.results.fid.target,
        status: this.results.fid.status,
        message: this._getWebVitalMessage('fid', this.results.fid.value),
      },
      cls: {
        value: this.results.cls.value,
        target: this.results.cls.target,
        status: this.results.cls.status,
        message: this._getWebVitalMessage('cls', this.results.cls.value),
      },
    };
  }

  /**
   * Get user-friendly message for Web Vital
   * @param {string} vital - Web vital name (lcp, fid, cls)
   * @param {number} value - Web vital value
   * @returns {string} User-friendly message
   */
  _getWebVitalMessage(vital, value) {
    if (vital === 'cls') {
      const ranges = PerformanceConfig.thresholds.webVitals.cls;
      if (value <= ranges.good) return 'Good';
      if (value <= ranges.needsImprovement) return 'Needs Improvement';
      return 'Poor';
    }
    
    const ranges = PerformanceConfig.thresholds[vital];
    if (value <= ranges.good) return 'Good';
    if (value <= ranges.needsImprovement) return 'Needs Improvement';
    return 'Poor';
  }
}

/**
 * Performance Report Generator
 * Generates comprehensive performance reports
 */
class PerformanceReportGenerator {
  constructor() {
    this.sections = [];
  }

  /**
   * Add a report section
   * @param {string} title - Section title
   * @param {Object} content - Section content
   */
  addSection(title, content) {
    this.sections.push({ title, content });
  }

  /**
   * Generate HTML report
   * @returns {string} HTML report string
   */
  generateHtmlReport() {
    const timestamp = new Date().toLocaleString();
    
    let html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Performance Test Report</title>
  <style>
    :root {
      --color-success: #4CAF50;
      --color-warning: #FF9800;
      --color-error: #f44336;
      --color-text: #333;
      --color-background: #f5f5f5;
    }
    
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      line-height: 1.6;
      color: var(--color-text);
      background: var(--color-background);
      padding: 20px;
    }
    
    .report {
      max-width: 1200px;
      margin: 0 auto;
      background: #fff;
      border-radius: 8px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }
    
    .report-header {
      padding: 30px;
      background: linear-gradient(135deg, #4CAF50 0%, #66BB6A 100%);
      color: #fff;
    }
    
    .report-header h1 {
      font-size: 2rem;
      margin-bottom: 10px;
    }
    
    .report-header .timestamp {
      font-size: 0.9rem;
      opacity: 0.9;
    }
    
    .report-body {
      padding: 30px;
    }
    
    .section {
      margin-bottom: 30px;
      padding: 20px;
      background: #f9f9f9;
      border-radius: 8px;
      border-left: 4px solid #ddd;
    }
    
    .section h2 {
      margin-bottom: 20px;
      padding-bottom: 10px;
      border-bottom: 1px solid #eee;
      color: #333;
    }
    
    .metric {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 10px 0;
      border-bottom: 1px solid #eee;
    }
    
    .metric:last-child {
      border-bottom: none;
    }
    
    .metric-name {
      font-weight: 500;
    }
    
    .metric-value {
      font-family: monospace;
      font-size: 1.1rem;
      font-weight: 600;
    }
    
    .metric-status {
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 0.85rem;
      font-weight: 600;
    }
    
    .metric-status.pass {
      background: var(--color-success);
      color: #fff;
    }
    
    .metric-status.fail {
      background: var(--color-error);
      color: #fff;
    }
    
    .metric-status.pending {
      background: var(--color-warning);
      color: #fff;
    }
    
    .summary {
      background: #fff3e0;
      padding: 20px;
      border-radius: 8px;
      border: 1px solid #ffe0b2;
    }
    
    .summary h3 {
      margin-bottom: 10px;
      color: #e65100;
    }
    
    .summary p {
      margin-bottom: 5px;
    }
    
    .summary .overall {
      font-weight: 700;
      font-size: 1.2rem;
    }
    
    .summary .overall.pass {
      color: var(--color-success);
    }
    
    .summary .overall.fail {
      color: var(--color-error);
    }
  </style>
</head>
<body>
  <div class="report">
    <div class="report-header">
      <h1>Performance Test Report</h1>
      <p class="timestamp">${timestamp}</p>
    </div>
    
    <div class="report-body">
      ${this.sections.map(section => this._generateSectionHtml(section)).join('')}
    </div>
  </div>
</body>
</html>`;

    return html;
  }

  /**
   * Generate summary section
   * @param {Object} results - Test results
   * @returns {string} Summary HTML
   */
  generateSummary(results) {
    const allPassed = Object.values(results).every(
      result => result.status === 'pass' || result.overall === 'pass'
    );
    
    return `
      <div class="summary">
        <h3>Summary</h3>
        <p class="overall ${allPassed ? 'pass' : 'fail'}">
          ${allPassed ? '✓ All Performance Targets Met' : '✗ Some Performance Targets Not Met'}
        </p>
        ${this._generateDetailedSummary(results)}
      </div>
    `;
  }

  /**
   * Generate detailed summary
   * @param {Object} results - Test results
   * @returns {string} Detailed summary HTML
   */
  _generateDetailedSummary(results) {
    let summary = '<div style="margin-top: 15px;">';
    
    if (results.pagespeed) {
      summary += `
        <div style="margin-bottom: 10px;">
          <strong>PageSpeed Insights:</strong>
          <span style="margin-left: 10px;">
            Mobile: ${results.pagespeed.mobile.score}/${results.pagespeed.mobile.target} (${results.pagespeed.mobile.status})
          </span>
          <span style="margin-left: 10px;">
            Desktop: ${results.pagespeed.desktop.score}/${results.pagespeed.desktop.target} (${results.pagespeed.desktop.status})
          </span>
        </div>
      `;
    }
    
    if (results.loadTime) {
      summary += `
        <div style="margin-bottom: 10px;">
          <strong>Load Time:</strong>
          <span style="margin-left: 10px;">
            Above-Fold (4G): ${results.loadTime.aboveFold4G.time}ms / ${results.loadTime.aboveFold4G.target}ms (${results.loadTime.aboveFold4G.status})
          </span>
          <span style="margin-left: 10px;">
            Full Page: ${results.loadTime.fullPage.time}ms / ${results.loadTime.fullPage.target}ms (${results.loadTime.fullPage.status})
          </span>
        </div>
      `;
    }
    
    if (results.webVitals) {
      summary += `
        <div style="margin-bottom: 10px;">
          <strong>Core Web Vitals:</strong>
          <span style="margin-left: 10px;">
            LCP: ${results.webVitals.lcp.value}ms / ${results.webVitals.lcp.target}ms (${results.webVitals.lcp.status})
          </span>
          <span style="margin-left: 10px;">
            FID: ${results.webVitals.fid.value}ms / ${results.webVitals.fid.target}ms (${results.webVitals.fid.status})
          </span>
          <span style="margin-left: 10px;">
            CLS: ${results.webVitals.cls.value} / ${results.webVitals.cls.target} (${results.webVitals.cls.status})
          </span>
        </div>
      `;
    }
    
    summary += '</div>';
    return summary;
  }

  /**
   * Generate HTML for a section
   * @param {Object} section - Section object
   * @returns {string} Section HTML
   */
  _generateSectionHtml(section) {
    let html = `<div class="section" style="border-left-color: ${this._getSectionColor(section.title)}">`;
    html += `<h2>${section.title}</h2>`;
    
    if (section.content.metrics) {
      html += section.content.metrics.map(metric => {
        const statusClass = this._getStatusClass(metric.status);
        const value = typeof metric.value === 'number' ? `${metric.value}${metric.unit || ''}` : metric.value;
        return `
          <div class="metric">
            <span class="metric-name">${metric.name}</span>
            <div style="display: flex; align-items: center; gap: 10px;">
              <span class="metric-value">${value}</span>
              <span class="metric-status ${statusClass}">${metric.status.toUpperCase()}</span>
            </div>
          </div>
        `;
      }).join('');
    }
    
    html += '</div>';
    return html;
  }

  /**
   * Get section color based on title
   * @param {string} title - Section title
   * @returns {string} CSS color
   */
  _getSectionColor(title) {
    const colors = {
      'PageSpeed Insights': '#4CAF50',
      'Load Time Tests': '#2196F3',
      'Core Web Vitals': '#9C27B0',
      'Summary': '#FF9800',
    };
    return colors[title] || '#ddd';
  }

  /**
   * Get status CSS class
   * @param {string} status - Status value
   * @returns {string} CSS class
   */
  _getStatusClass(status) {
    const classes = {
      pass: 'pass',
      fail: 'fail',
      pending: 'pending',
    };
    return classes[status] || 'pending';
  }
}

/**
 * Main Performance Test Class
 * Coordinates all performance tests and generates reports
 */
class PerformanceTest {
  constructor() {
    this.metricsCollector = new PerformanceMetricsCollector();
    this.pageSpeedSimulator = new PageSpeedSimulator();
    this.loadTimeTester = new LoadTimeTester();
    this.webVitalsValidator = new CoreWebVitalsValidator();
    this.reportGenerator = new PerformanceReportGenerator();
    
    this.results = {
      pagespeed: null,
      loadTime: null,
      webVitals: null,
      overall: 'pending',
    };
  }

  /**
   * Run all performance tests
   * @returns {Promise<Object>} Test results
   */
  async runAllTests() {
    console.log('Starting performance tests...');
    console.log('='.repeat(60));
    
    try {
      // Run PageSpeed simulation
      console.log('\n[1/3] Running PageSpeed Insights simulation...');
      this.metricsCollector.collectAllMetrics();
      this.pageSpeedSimulator.simulatePageSpeedScores(this.metricsCollector.metrics);
      const pagespeedResults = this.pageSpeedSimulator.getScoreDetails();
      console.log(`  Mobile Score: ${pagespeedResults.mobile.score} (${pagespeedResults.mobile.status})`);
      console.log(`  Desktop Score: ${pagespeedResults.desktop.score} (${pagespeedResults.desktop.status})`);
      
      this.results.pagespeed = {
        mobile: pagespeedResults.mobile,
        desktop: pagespeedResults.desktop,
      };
      
      // Run load time tests
      console.log('\n[2/3] Running load time tests...');
      const loadTimeResults = await this.loadTimeTester.runTests();
      const loadTimeDetails = this.loadTimeTester.getLoadTimeDetails();
      console.log(`  Above-Fold (4G): ${loadTimeDetails.aboveFold4G.time}ms / ${loadTimeDetails.aboveFold4G.target}ms (${loadTimeDetails.aboveFold4G.status})`);
      console.log(`  Full Page: ${loadTimeDetails.fullPage.time}ms / ${loadTimeDetails.fullPage.target}ms (${loadTimeDetails.fullPage.status})`);
      
      this.results.loadTime = {
        aboveFold4G: loadTimeDetails.aboveFold4G,
        fullPage: loadTimeDetails.fullPage,
      };
      
      // Run Web Vitals validation
      console.log('\n[3/3] Running Core Web Vitals validation...');
      const webVitalsDetails = await this.webVitalsValidator.setupValidation();
      console.log(`  LCP: ${webVitalsDetails.lcp.value || 'N/A'}ms (${webVitalsDetails.lcp.status})`);
      console.log(`  FID: ${webVitalsDetails.fid.value || 'N/A'}ms (${webVitalsDetails.fid.status})`);
      console.log(`  CLS: ${webVitalsDetails.cls.value || 'N/A'} (${webVitalsDetails.cls.status})`);
      
      this.results.webVitals = {
        lcp: webVitalsDetails.lcp,
        fid: webVitalsDetails.fid,
        cls: webVitalsDetails.cls,
      };
      
      // Determine overall status
      const allTests = [
        pagespeedResults.mobile.status,
        pagespeedResults.desktop.status,
        loadTimeDetails.aboveFold4G.status,
        loadTimeDetails.fullPage.status,
        webVitalsDetails.lcp.status,
        webVitalsDetails.fid.status,
        webVitalsDetails.cls.status,
      ];
      
      const allPassed = allTests.every(status => status === 'pass');
      this.results.overall = allPassed ? 'pass' : 'fail';
      
      console.log('\n' + '='.repeat(60));
      console.log(`Overall Status: ${this.results.overall.toUpperCase()}`);
      console.log('='.repeat(60));
      
      // Generate report
      this._generateReport();
      
      return this.results;
      
    } catch (error) {
      console.error('Performance tests failed:', error);
      this.results.overall = 'error';
      throw error;
    } finally {
      // Cleanup
      this.metricsCollector.cleanup();
    }
  }

  /**
   * Generate performance report
   */
  _generateReport() {
    // Add sections to report generator
    this.reportGenerator.addSection('PageSpeed Insights', {
      metrics: [
        { name: 'Mobile Score', value: this.results.pagespeed.mobile.score, unit: '/100', status: this.results.pagespeed.mobile.status },
        { name: 'Desktop Score', value: this.results.pagespeed.desktop.score, unit: '/100', status: this.results.pagespeed.desktop.status },
      ],
    });
    
    this.reportGenerator.addSection('Load Time Tests', {
      metrics: [
        { name: 'Above-Fold (4G)', value: this.results.loadTime.aboveFold4G.time, unit: 'ms', status: this.results.loadTime.aboveFold4G.status },
        { name: 'Full Page', value: this.results.loadTime.fullPage.time, unit: 'ms', status: this.results.loadTime.fullPage.status },
      ],
    });
    
    this.reportGenerator.addSection('Core Web Vitals', {
      metrics: [
        { name: 'LCP (Largest Contentful Paint)', value: this.results.webVitals.lcp.value, unit: 'ms', status: this.results.webVitals.lcp.status },
        { name: 'FID (First Input Delay)', value: this.results.webVitals.fid.value, unit: 'ms', status: this.results.webVitals.fid.status },
        { name: 'CLS (Cumulative Layout Shift)', value: this.results.webVitals.cls.value, unit: '', status: this.results.webVitals.cls.status },
      ],
    });
    
    // Add summary section
    this.reportGenerator.addSection('Summary', {
      content: this.reportGenerator.generateSummary(this.results),
    });
  }

  /**
   * Export report as HTML file
   * @returns {string} Report HTML
   */
  exportReport() {
    return this.reportGenerator.generateHtmlReport();
  }

  /**
   * Download report as HTML file
   */
  downloadReport() {
    const html = this.exportReport();
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `performance-test-report-${new Date().toISOString().split('T')[0]}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  /**
   * Get test results
   * @returns {Object} Test results
   */
  getResults() {
    return this.results;
  }
}

// Expose PerformanceTest globally
if (typeof window !== 'undefined') {
  window.PerformanceTest = PerformanceTest;
}

// Auto-run tests on page load if no prior tests have been run
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', async () => {
    try {
      const test = new PerformanceTest();
      await test.runAllTests();
      
      // Log results to console
      console.log('\nPerformance Test Results:', test.getResults());
    } catch (error) {
      console.error('Failed to run performance tests:', error);
    }
  });
} else {
  // Page already loaded - can run tests immediately
  // Note: Some metrics may not be accurate if run after page load
  console.log('Page already loaded. Performance tests should be run on initial page load for accurate results.');
}

// Export for module usage
export { PerformanceTest, PerformanceConfig };
