/**
 * Accessibility Audit Initialization
 * Healthy Catering Landing Page
 * 
 * Runs the accessibility audit when the page loads
 */

document.addEventListener('DOMContentLoaded', async () => {
  try {
    // Wait a bit for all components to initialize
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const audit = new AccessibilityAudit();
    await audit.audit();
    
    // Log results to console
    audit.logResults();
    
    // Make audit accessible globally
    window.accessibilityAudit = audit;
    
  } catch (error) {
    console.error('Accessibility audit initialization failed:', error);
  }
});

// Expose functions globally for manual testing
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
    console.log('Accessibility report downloaded');
  } else {
    console.warn('No accessibility audit instance available. Run the audit first.');
  }
};
