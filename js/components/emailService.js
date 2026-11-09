/**
 * Email Service Integration
 * Healthy Catering Landing Page
 * 
 * Implements serverless email delivery with:
 * - Configuration for FormSubmit or EmailJS for serverless email delivery
 * - Send confirmation email to visitor (up to 5000 characters)
 * - Send notification email to business (up to 10000 characters)
 * - Visitor's submitted data in formatted structure
 * - Retry logic (up to 3 retries with exponential backoff)
 * - Error handling with persistent error message
 * - Accessibility support for loading states and error messages
 * 
 * Requirements: 12.1, 12.2, 12.3, 12.5
 */

/**
 * Email Service Configuration
 * Supports multiple email providers with unified API
 */
class EmailService {
  constructor(config = {}) {
    this.config = {
      provider: config.provider || 'formsubmit', // 'formsubmit', 'emailjs', 'web3forms'
      serviceId: config.serviceId || '',
      templateId: config.templateId || '',
      publicKey: config.publicKey || '',
      businessEmail: config.businessEmail || 'info@healthy-catering.com',
      confirmationSubject: config.confirmationSubject || 'Thank You for Your Contact Request',
      notificationSubject: config.notificationSubject || 'New Contact Form Submission',
      maxRetries: 3,
      retryDelay: 1000, // Base delay in milliseconds
      retryMultiplier: 2,
      ...config,
    };

    this.isSending = false;
    this.lastError = null;
  }

  /**
   * Send confirmation email to visitor
   * @param {Object} formData - Visitor's submitted data
   * @returns {Promise<Object>} Email send result with status and message
   */
  async sendConfirmationEmail(formData) {
    const { name, email } = formData;
    
    if (!email) {
      return {
        success: false,
        error: 'Email address is required for confirmation',
      };
    }

    const emailData = this._buildConfirmationEmailData(formData);
    
    try {
      const result = await this._sendEmail(email, this.config.confirmationSubject, emailData);
      return result;
    } catch (error) {
      this.lastError = error;
      return {
        success: false,
        error: error.message || 'Failed to send confirmation email',
      };
    }
  }

  /**
   * Send notification email to business
   * @param {Object} formData - Visitor's submitted data
   * @returns {Promise<Object>} Email send result with status and message
   */
  async sendNotificationEmail(formData) {
    const emailData = this._buildNotificationEmailData(formData);
    
    try {
      const result = await this._sendEmail(this.config.businessEmail, this.config.notificationSubject, emailData);
      return result;
    } catch (error) {
      this.lastError = error;
      return {
        success: false,
        error: error.message || 'Failed to send notification email',
      };
    }
  }

  /**
   * Build confirmation email content
   * @param {Object} formData - Visitor's submitted data
   * @returns {string} Formatted email content (up to 5000 characters)
   */
  _buildConfirmationEmailData(formData) {
    const { name, email, phone, eventType, eventDate, message } = formData;

    const emailContent = `
Hello ${name || 'Valued Customer'},

Thank you for contacting us! We've received your message and will get back to you shortly.

Your inquiry details:
${this._formatFormData(formData)}

We typically respond within 24 hours. If you need to reach us immediately, please call us at +1 (234) 567-890.

Best regards,
The Healthy Catering Team
info@healthy-catering.com

---
This is an automated message. Please do not reply directly to this email.
`.trim();

    // Ensure content is within 5000 characters limit (Requirement 12.1)
    if (emailContent.length > 5000) {
      console.warn('Confirmation email content exceeds 5000 characters limit');
      return emailContent.slice(0, 5000);
    }

    return emailContent;
  }

  /**
   * Build notification email content for business
   * @param {Object} formData - Visitor's submitted data
   * @returns {string} Formatted email content (up to 10000 characters)
   */
  _buildNotificationEmailData(formData) {
    const { name, email, phone, eventType, eventDate, message } = formData;

    const emailContent = `
NEW CONTACT FORM SUBMISSION
===========================

Received at: ${new Date().toLocaleString()}
Source: Healthy Catering Landing Page

Visitor Information:
- Name: ${name || 'Not provided'}
- Email: ${email || 'Not provided'}
- Phone: ${phone || 'Not provided'}
- Event Type: ${eventType || 'Not provided'}
- Event Date: ${eventDate || 'Not provided'}

Message:
${message || 'No message provided'}

===========================
This is an automated notification from the contact form on your website.
Please respond to the visitor via their provided email address.
`.trim();

    // Ensure content is within 10000 characters limit (Requirement 12.2)
    if (emailContent.length > 10000) {
      console.warn('Notification email content exceeds 10000 characters limit');
      return emailContent.slice(0, 10000);
    }

    return emailContent;
  }

  /**
   * Format form data for email display
   * @param {Object} data - Form data object
   * @returns {string} Formatted data string
   */
  _formatFormData(data) {
    return Object.entries(data)
      .map(([key, value]) => `- ${this._formatFieldName(key)}: ${value || 'Not provided'}`)
      .join('\n');
  }

  /**
   * Format field name for display
   * @param {string} fieldName - Raw field name
   * @returns {string} Formatted field name
   */
  _formatFieldName(fieldName) {
    return fieldName
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, (str) => str.toUpperCase())
      .trim();
  }

  /**
   * Send email with retry logic
   * @param {string} to - Recipient email address
   * @param {string} subject - Email subject
   * @param {string} content - Email body content
   * @returns {Promise<Object>} Email send result
   */
  async _sendEmail(to, subject, content) {
    let lastError;
    
    for (let attempt = 0; attempt < this.config.maxRetries; attempt++) {
      try {
        const result = await this._executeEmailSend(to, subject, content, attempt);
        return result;
      } catch (error) {
        lastError = error;
        
        // If this is not the last attempt, wait before retrying
        if (attempt < this.config.maxRetries - 1) {
          const delay = this.config.retryDelay * Math.pow(this.config.retryMultiplier, attempt);
          await this._sleep(delay);
        }
      }
    }

    // All retries failed
    this.lastError = lastError;
    return {
      success: false,
      error: lastError?.message || 'Email sending failed after all retries',
    };
  }

  /**
   * Execute actual email sending based on provider
   * @param {string} to - Recipient email address
   * @param {string} subject - Email subject
   * @param {string} content - Email body content
   * @param {number} attempt - Current attempt number
   * @returns {Promise<Object>} Email send result
   */
  async _executeEmailSend(to, subject, content, attempt) {
    switch (this.config.provider) {
      case 'emailjs':
        return await this._sendViaEmailJS(to, subject, content);
      case 'web3forms':
        return await this._sendViaWeb3Forms(to, subject, content);
      case 'formsubmit':
      default:
        return await this._sendViaFormSubmit(to, subject, content);
    }
  }

  /**
   * Send email using FormSubmit.co (default)
   * @param {string} to - Recipient email address
   * @param {string} subject - Email subject
   * @param {string} content - Email body content
   * @returns {Promise<Object>} Email send result
   */
  async _sendViaFormSubmit(to, subject, content) {
    // Create a form element to submit
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = 'https://formsubmit.co/replace-with-your-email@example.com';
    
    // Add required fields
    const emailInput = document.createElement('input');
    emailInput.type = 'hidden';
    emailInput.name = '_email';
    emailInput.value = to;
    
    const subjectInput = document.createElement('input');
    subjectInput.type = 'hidden';
    subjectInput.name = '_subject';
    subjectInput.value = subject;
    
    const bodyInput = document.createElement('input');
    bodyInput.type = 'hidden';
    bodyInput.name = '_body';
    bodyInput.value = content;
    
    // Add security fields
    const tokenInput = document.createElement('input');
    tokenInput.type = 'hidden';
    tokenInput.name = '_captcha';
    tokenInput.value = 'false';
    
    const retryInput = document.createElement('input');
    retryInput.type = 'hidden';
    retryInput.name = '_retry';
    retryInput.value = String(attempt);
    
    form.appendChild(emailInput);
    form.appendChild(subjectInput);
    form.appendChild(bodyInput);
    form.appendChild(tokenInput);
    form.appendChild(retryInput);
    
    document.body.appendChild(form);
    
    // Submit form
    return new Promise((resolve, reject) => {
      form.addEventListener('submit', () => {
        // FormSubmit redirects on success, so we consider it successful
        resolve({
          success: true,
          message: 'Email sent successfully',
          provider: 'formsubmit',
        });
      });
      
      form.addEventListener('error', () => {
        reject(new Error('Form submission failed'));
      });
      
      // Use fetch instead for better control
      fetch('https://formsubmit.co/replace-with-your-email@example.com', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          email: to,
          subject: subject,
          body: content,
          _captcha: 'false',
          _retry: attempt,
        }),
      })
        .then((response) => {
          if (response.ok) {
            resolve({
              success: true,
              message: 'Email sent successfully',
              provider: 'formsubmit',
            });
          } else {
            reject(new Error(`FormSubmit API error: ${response.statusText}`));
          }
        })
        .catch((error) => {
          reject(error);
        })
        .finally(() => {
          document.body.removeChild(form);
        });
    });
  }

  /**
   * Send email using EmailJS
   * @param {string} to - Recipient email address
   * @param {string} subject - Email subject
   * @param {string} content - Email body content
   * @returns {Promise<Object>} Email send result
   */
  async _sendViaEmailJS(to, subject, content) {
    if (!this.config.serviceId || !this.config.templateId || !this.config.publicKey) {
      throw new Error('EmailJS configuration is missing required parameters');
    }

    // Initialize EmailJS if not already loaded
    if (!window.emailjs) {
      await this._loadEmailJS();
    }

    const templateParams = {
      to_email: to,
      from_name: 'Contact Form',
      subject: subject,
      message: content,
      reply_to: to,
    };

    return new Promise((resolve, reject) => {
      window.emailjs.send(this.config.serviceId, this.config.templateId, templateParams)
        .then(() => {
          resolve({
            success: true,
            message: 'Email sent successfully via EmailJS',
            provider: 'emailjs',
          });
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  /**
   * Send email using Web3Forms
   * @param {string} to - Recipient email address
   * @param {string} subject - Email subject
   * @param {string} content - Email body content
   * @returns {Promise<Object>} Email send result
   */
  async _sendViaWeb3Forms(to, subject, content) {
    // Web3Forms uses a simple API with access key
    // This would require the access key to be configured
    // For now, we'll use the fetch-based approach
    
    const formData = new FormData();
    formData.append('access_key', this.config.accessKey || 'your-access-key');
    formData.append('from_name', 'Contact Form');
    formData.append('subject', subject);
    formData.append('email', to);
    formData.append('message', content);
    
    return new Promise((resolve, reject) => {
      fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        body: formData,
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.success) {
            resolve({
              success: true,
              message: 'Email sent successfully via Web3Forms',
              provider: 'web3forms',
            });
          } else {
            reject(new Error(data.message || 'Web3Forms API error'));
          }
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  /**
   * Load EmailJS SDK dynamically
   * @returns {Promise<void>}
   */
  _loadEmailJS() {
    return new Promise((resolve, reject) => {
      // Check if already loaded
      if (window.emailjs) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/@emailjs/browser@3/dist/email.min.js';
      script.onload = () => {
        window.emailjs.init(this.config.publicKey);
        resolve();
      };
      script.onerror = () => {
        reject(new Error('Failed to load EmailJS SDK'));
      };
      document.body.appendChild(script);
    });
  }

  /**
   * Helper to sleep for a specified duration
   * @param {number} ms - Duration in milliseconds
   * @returns {Promise<void>}
   */
  _sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Get last error if any
   * @returns {Error|null} Last error encountered
   */
  getLastError() {
    return this.lastError;
  }

  /**
   * Check if an email is currently being sent
   * @returns {boolean} True if sending in progress
   */
  isSendingInProgress() {
    return this.isSending;
  }

  /**
   * Configure the email service
   * @param {Object} config - Configuration options
   */
  configure(config = {}) {
    this.config = {
      ...this.config,
      ...config,
    };
  }

  /**
   * Validate that the email service is properly configured
   * @returns {Object} Validation result with isValid and errors
   */
  validateConfiguration() {
    const errors = [];

    switch (this.config.provider) {
      case 'emailjs':
        if (!this.config.serviceId) {
          errors.push('EmailJS serviceId is required');
        }
        if (!this.config.templateId) {
          errors.push('EmailJS templateId is required');
        }
        if (!this.config.publicKey) {
          errors.push('EmailJS publicKey is required');
        }
        break;

      case 'web3forms':
        if (!this.config.accessKey) {
          errors.push('Web3Forms accessKey is required');
        }
        break;

      case 'formsubmit':
      default:
        // FormSubmit doesn't require complex configuration
        // Just use the businessEmail as the destination
        break;
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}

/**
 * Contact Form Email Handler
 * Integrates email service with form submission
 */
class FormEmailHandler {
  /**
   * @param {HTMLFormElement} form - The contact form element
   * @param {EmailService} emailService - Email service instance
   */
  constructor(form, emailService) {
    this.form = form;
    this.emailService = emailService;
    this.formStatus = document.getElementById('form-status');
    
    this._bindEvents();
    this._setupAccessibility();
  }

  /**
   * Setup accessibility features
   */
  _setupAccessibility() {
    // Ensure form status element has proper attributes
    if (this.formStatus) {
      this.formStatus.setAttribute('role', 'status');
      this.formStatus.setAttribute('aria-live', 'polite');
      this.formStatus.setAttribute('aria-atomic', 'true');
    }
  }

  /**
   * Bind event listeners
   */
  _bindEvents() {
    // Listen for form:validSubmit event from FormValidator
    this.form.addEventListener('form:validSubmit', (e) => {
      this._handleFormSubmission(e.detail);
    });
  }

  /**
   * Handle form submission
   * @param {Object} formData - Form data from validator
   */
  async _handleFormSubmission(formData) {
    this.emailService.isSending = true;
    
    // Show loading state
    this._showLoadingState();
    
    try {
      // Send notification to business
      const notificationResult = await this.emailService.sendNotificationEmail(formData);
      
      // Send confirmation to visitor (even if notification fails)
      const confirmationResult = await this.emailService.sendConfirmationEmail(formData);
      
      // Check results
      if (notificationResult.success && confirmationResult.success) {
        this._showSuccessState();
      } else {
        const errors = [];
        if (!notificationResult.success) errors.push(notificationResult.error);
        if (!confirmationResult.success) errors.push(confirmationResult.error);
        
        throw new Error(errors.join('. '));
      }
    } catch (error) {
      this._showErrorState(error.message);
      
      // Retain form data for resubmission (Requirement 12.3)
      this._retainFormData(formData);
      
      console.error('Email sending failed:', error);
    } finally {
      this.emailService.isSending = false;
    }
  }

  /**
   * Show loading state during email sending
   */
  _showLoadingState() {
    if (!this.formStatus) return;

    const spinner = `
      <span class="btn__spinner" role="status" aria-hidden="true"></span>
      <span class="loading-text">Sending your message...</span>
    `;

    this.formStatus.innerHTML = `
      <div class="form-status--loading" role="alert" aria-live="polite">
        ${spinner}
      </div>
    `;
    this.formStatus.classList.add('is-visible');

    // Disable form during sending
    this._disableForm(true);
  }

  /**
   * Show success state after successful email sending
   */
  _showSuccessState() {
    if (!this.formStatus) return;

    this.formStatus.innerHTML = `
      <div class="form-status--success" role="status" aria-live="polite">
        <strong>Thank you!</strong> Your message has been sent successfully. We'll be in touch soon.
      </div>
    `;
    this.formStatus.classList.add('is-visible');

    // Clear form after 5 seconds (Requirement 6.2)
    setTimeout(() => {
      this.formStatus.classList.remove('is-visible');
      this.formStatus.innerHTML = '';
      this._resetForm();
    }, 5000);

    this._disableForm(false);
  }

  /**
   * Show error state when email sending fails
   * @param {string} errorMessage - Error message to display
   */
  _showErrorState(errorMessage) {
    if (!this.formStatus) return;

    this.formStatus.innerHTML = `
      <div class="form-status--error" role="alert" aria-live="polite">
        <strong>Oops!</strong> There was a problem sending your message. 
        Please try again later or contact us directly.
        <button class="retry-btn" aria-label="Try sending your message again">
          Try Again
        </button>
      </div>
    `;
    this.formStatus.classList.add('is-visible');

    // Add retry button listener
    const retryBtn = this.formStatus.querySelector('.retry-btn');
    if (retryBtn) {
      retryBtn.addEventListener('click', () => {
        // Re-enable form and re-send
        this._disableForm(false);
        this.formStatus.classList.remove('is-visible');
        this.formStatus.innerHTML = '';
        
        // Dispatch valid submit event again
        this.form.dispatchEvent(new CustomEvent('form:validSubmit', {
          bubbles: true,
          detail: this._getFormData(),
        }));
      });
    }

    this._disableForm(false);
  }

  /**
   * Retain form data for resubmission
   * @param {Object} formData - Form data to retain
   */
  _retainFormData(formData) {
    // Store in sessionStorage for up to 5 minutes (Requirement 12.3)
    sessionStorage.setItem('contactFormData', JSON.stringify(formData));
    sessionStorage.setItem('contactFormTimestamp', Date.now().toString());

    // Clear form but keep data in storage
    this._clearFormFields();
  }

  /**
   * Reset form after successful submission
   */
  _resetForm() {
    this._clearFormFields();
    
    // Remove stored form data
    sessionStorage.removeItem('contactFormData');
    sessionStorage.removeItem('contactFormTimestamp');
  }

  /**
   * Clear all form fields
   */
  _clearFormFields() {
    const inputs = this.form.querySelectorAll('input, textarea, select');
    inputs.forEach((input) => {
      input.value = '';
    });
  }

  /**
   * Get current form data
   * @returns {Object} Form data object
   */
  _getFormData() {
    const formData = {};
    const inputs = this.form.querySelectorAll('input, textarea, select');
    
    inputs.forEach((input) => {
      formData[input.name] = input.value.trim();
    });
    
    return formData;
  }

  /**
   * Disable or enable form elements
   * @param {boolean} disabled - True to disable, false to enable
   */
  _disableForm(disabled) {
    const inputs = this.form.querySelectorAll('input, textarea, select, button[type="submit"]');
    inputs.forEach((input) => {
      input.disabled = disabled;
    });

    // Update button text
    const submitBtn = this.form.querySelector('button[type="submit"]');
    if (submitBtn) {
      if (disabled) {
        submitBtn.innerHTML = '<span class="btn__text">Sending...</span>';
      } else {
        submitBtn.innerHTML = '<span class="btn__text">Send Message</span>';
      }
    }
  }
}

// Initialize email service and form handler when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('contactForm');
  
  if (form) {
    // Configure email service
    const emailService = new EmailService({
      provider: 'formsubmit', // Change to 'emailjs' or 'web3forms' as needed
      businessEmail: 'info@healthy-catering.com',
      maxRetries: 3,
      retryDelay: 1000,
    });

    // Validate configuration
    const configValidation = emailService.validateConfiguration();
    if (!configValidation.isValid) {
      console.warn('Email service configuration issues:', configValidation.errors);
    }

    // Initialize form email handler
    const formEmailHandler = new FormEmailHandler(form, emailService);
    
    // Store instances for external access
    form.emailService = emailService;
    form.formEmailHandler = formEmailHandler;
    
    // Log initialization for debugging
    console.log('Email service and form handler initialized', {
      provider: emailService.config.provider,
      businessEmail: emailService.config.businessEmail,
    });
  }
});

// Export for ES module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { EmailService, FormEmailHandler };
}