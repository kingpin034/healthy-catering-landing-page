/**
 * Contrast Checker Initialization
 * Healthy Catering Landing Page
 * 
 * This file initializes the contrast checker and accessibility audit systems.
 * It ensures all accessibility components are properly loaded and ready for testing.
 */

// Initialize accessibility audit
if (typeof AccessibilityAudit !== 'undefined') {
  const accessibilityAudit = new AccessibilityAudit();
  
  // Run audit after page loads
  window.addEventListener('load', async () => {
    await accessibilityAudit.audit();
    accessibilityAudit.logResults();
  });
} else {
  console.warn('AccessibilityAudit not available. Check that accessibilityAudit.js is loaded.');
}

// Expose audit functionality globally for manual testing
window.runAccessibilityAudit = async function() {
  try {
    const audit = new AccessibilityAudit();
    await audit.audit();
    audit.logResults();
    return audit.exportJSON();
  } catch (error) {
    console.error('Accessibility audit failed:', error);
    return null;
  }
};

window.downloadAccessibilityReport = function() {
  if (window.accessibilityAudit) {
    window.accessibilityAudit.saveReport();
  } else {
    console.warn('No accessibility audit instance available. Run the audit first.');
  }
};