/**
 * Form Handler Component
 * Healthy Catering Landing Page
 * 
 * Implements form handling with CAPTCHA/spam protection and submission workflow:
 * - CAPTCHA/spam protection mechanism
 * - Success message display (5 seconds)
 * - Form data retention for resubmission (5 minutes)
 * - Form submission with error handling
 * - Loading states
 * - Proper accessibility support
 * 
 * Requirements: 6.2, 6.3, 12.1, 12.3
 */

import { FormValidator, EMAIL_REGEX } from './formValidation.js';

// Storage key for form data retention
const FORM_DATA_KEY = 'healthyCateringFormData';
const FORM_DATA_EXPIRY_KEY = 'healthyCateringFormDataExpiry';

// CAPTCHA configuration
const CAPTCHA_CONFIG = {
  minAnswerLength: 3,
  sessionDuration: 300000, // 5 minutes in milliseconds
};

/**
 * Simple CAPTCHA implementation for spam protection
 * Generates a random arithmetic question that users must solve
 */
class SimpleCaptcha {
  constructor() {
    this.answer = null;
    this.question = null;
    this.createdAt = null;
  }

  /**
   * Generate a new CAPTCHA question
   * @returns {Object} CAPTCHA object with question and answer
   */
  generate() {
    const num1 = Math.floor(Math.random() * 10) + 1;
    const num2 = Math.floor(Math.random() * 10) + 1;
    const operator = Math.random() > 0.5 ? '+' : '-';
    
    this.question = `What is ${num1} ${operator} ${num2}?`;
    this.answer = operator === '+' ? num1 + num2 : num1 - num2;
    this.createdAt = Date.now();

    return { question: this.question, answer: this.answer };
  }

  /**
   * Validate user's CAPTCHA answer
   * @param {string} userAnswer - User's submitted answer
   * @returns {boolean} True if answer is correct
   */
  validate(userAnswer) {
    if (!userAnswer || userAnswer.trim() === '') {
      return false;
    }

    const parsedAnswer = parseInt(userAnswer.trim(), 10);
    return parsedAnswer === this.answer;
  }

  /**
   * Check if CAPTCHA has expired
   * @returns {boolean} True if expired
   */
  isExpired() {
    if (!this.createdAt) return true;
    return Date.now() - this.createdAt > CAPTCHA_CONFIG.sessionDuration;
  }

  /**
   * Reset the CAPTCHA
   */
  reset() {
    this.answer = null;
    this.question = null;
    this.createdAt = null;
  }
}

/**
 * Form Handler - Manages form submission workflow
 */
class FormHandler {
  /**
   * @param {HTMLFormElement} form - The contact form element
   * @param {FormValidator} validator - FormValidator instance
   */
  constructor(form, validator) {
    this.form = form;
    this.validator = validator;
    this.captcha = new SimpleCaptcha();
    this.isSubmitting = false;
    this.maxRetries = 3;
    this.retryDelay = 1000; // 1 second between retries

    this._initialize();
  }

  /**
   * Initialize form handler
   */
  _initialize() {
    // Generate initial CAPTCHA
    this._generateCaptchaUI();

    // Bind submit event
    this.form.addEventListener('submit', (e) => this._handleFormSubmit(e));

    // Listen for validation success
    this.form.addEventListener('form:validSubmit', (e) => this._handleValidSubmit(e));

    // Load any saved form data
    this._loadFormData();

    // Setup form data cleanup
    this._setupFormDataCleanup();

    // Bind form field change events to save data
    this._bindFormDataSaving();
  }

  /**
   * Generate CAPTCHA UI elements
   */
  _generateCaptchaUI() {
    const captchaContainer = this.form.querySelector('.captcha-container');
    if (!captchaContainer) {
      console.warn('Captcha container not found in form');
      return;
    }

    // Remove existing captcha elements if any
    const existingCaptcha = captchaContainer.querySelector('.captcha');
    if (existingCaptcha) {
      existingCaptcha.remove();
    }

    const captchaObj = this.captcha.generate();

    // Create CAPTCHA question element
    const captchaQuestion = document.createElement('label');
    captchaQuestion.setAttribute('for', 'captcha-answer');
    captchaQuestion.className = 'captcha-question';
    captchaQuestion.textContent = captchaObj.question;

    // Create CAPTCHA input
    const captchaInput = document.createElement('input');
    captchaInput.type = 'text';
    captchaInput.id = 'captcha-answer';
    captchaInput.name = 'captchaAnswer';
    captchaInput.className = 'captcha-input';
    captchaInput.setAttribute('required', 'true');
    captchaInput.setAttribute('aria-required', 'true');
    captchaInput.setAttribute('autocomplete', 'off');
    captchaInput.setAttribute('aria-label', 'Captcha verification');
    captchaInput.setAttribute('placeholder', 'Enter answer');

    // Create CAPTCHA error element
    const captchaError = document.createElement('span');
    captchaError.id = 'captcha-error';
    captchaError.className = 'form-error';
    captchaError.setAttribute('role', 'alert');
    captchaError.setAttribute('aria-live', 'polite');

    // Create refresh button
    const refreshButton = document.createElement('button');
    refreshButton.type = 'button';
    refreshButton.className = 'captcha-refresh';
    refreshButton.setAttribute('aria-label', 'Refresh CAPTCHA');
    refreshButton.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/>
      </svg>
    `;

    refreshButton.addEventListener('click', () => {
      this._generateCaptchaUI();
      this.form.dispatchEvent(new Event('captcha:refreshed'));
    });

    // Append elements to container
    const captchaDiv = document.createElement('div');
    captchaDiv.className = 'captcha';
    captchaDiv.appendChild(captchaQuestion);
    captchaDiv.appendChild(captchaInput);
    captchaDiv.appendChild(captchaError);
    captchaDiv.appendChild(refreshButton);

    captchaContainer.appendChild(captchaDiv);

    // Store reference
    this.captchaInput = captchaInput;
    this.captchaError = captchaError;
  }

  /**
   * Validate CAPTCHA answer
   * @returns {Object} Validation result
   */
  _validateCaptcha() {
    if (!this.captchaInput) {
      return { valid: true, message: 'Captcha not configured' };
    }

    const answer = this.captchaInput.value.trim();
    
    if (!answer) {
      return { valid: false, message: 'Please enter the CAPTCHA answer' };
    }

    if (answer.length < CAPTCHA_CONFIG.minAnswerLength) {
      return { 
        valid: false, 
        message: 'Please enter a valid answer' 
      };
    }

    if (!this.captcha.validate(answer)) {
      this._showCaptchaError('Incorrect answer. Please try again.');
      this.captcha.reset();
      this._generateCaptchaUI();
      
      return { 
        valid: false, 
        message: 'CAPTCHA validation failed' 
      };
    }

    this._clearCaptchaError();
    return { valid: true, message: 'CAPTCHA validated' };
  }

  /**
   * Show CAPTCHA error
   * @param {string} message - Error message
   */
  _showCaptchaError(message) {
    if (!this.captchaError || !this.captchaInput) return;

    this.captchaInput.classList.add('is-error');
    this.captchaInput.setAttribute('aria-invalid', 'true');
    this.captchaError.textContent = message;
    this.captchaError.classList.add('is-visible');

    // Add focus indicator
    this.captchaInput.style.boxShadow = '0 0 0 2px rgba(244, 67, 54, 0.3)';
  }

  /**
   * Clear CAPTCHA error
   */
  _clearCaptchaError() {
    if (!this.captchaInput || !this.captchaError) return;

    this.captchaInput.classList.remove('is-error');
    this.captchaInput.setAttribute('aria-invalid', 'false');
    this.captchaError.classList.remove('is-visible');
    this.captchaInput.style.boxShadow = '';
  }

  /**
   * Load saved form data from localStorage (5 minutes expiry)
   */
  _loadFormData() {
    const savedData = localStorage.getItem(FORM_DATA_KEY);
    const expiry = localStorage.getItem(FORM_DATA_EXPIRY_KEY);

    if (!savedData || !expiry) {
      return;
    }

    const now = Date.now();
    if (now > parseInt(expiry, 10)) {
      // Data has expired
      this._clearSavedFormData();
      return;
    }

    try {
      const formData = JSON.parse(savedData);
      this._populateForm(formData);
      
      // Show success message for resubmission
      this._showResubmissionNotice();
    } catch (error) {
      console.error('Failed to parse saved form data:', error);
      this._clearSavedFormData();
    }
  }

  /**
   * Populate form with saved data
   * @param {Object} formData - Form data object
   */
  _populateForm(formData) {
    const fields = [
      'name', 'email', 'phone', 'eventType', 'eventDate', 'message'
    ];

    fields.forEach((fieldName) => {
      const field = this.form.querySelector(`[name="${fieldName}"]`);
      if (field && formData[fieldName]) {
        field.value = formData[fieldName];
      }
    });

    // Show success message for resubmission
    this._showFormStatus(
      'success',
      'We found your previous message. You can resubmit it or make changes.',
      5000
    );
  }

  /**
   * Show resubmission notice
   */
  _showResubmissionNotice() {
    // The message is shown in _populateForm
  }

  /**
   * Save form data to localStorage (5 minutes expiry)
   */
  _saveFormData() {
    const formData = this.validator._getFormData();
    const expiry = Date.now() + CAPTCHA_CONFIG.sessionDuration;

    try {
      localStorage.setItem(FORM_DATA_KEY, JSON.stringify(formData));
      localStorage.setItem(FORM_DATA_EXPIRY_KEY, expiry.toString());
    } catch (error) {
      console.error('Failed to save form data:', error);
    }
  }

  /**
   * Clear saved form data
   */
  _clearSavedFormData() {
    try {
      localStorage.removeItem(FORM_DATA_KEY);
      localStorage.removeItem(FORM_DATA_EXPIRY_KEY);
    } catch (error) {
      console.error('Failed to clear saved form data:', error);
    }
  }

  /**
   * Setup automatic form data cleanup after 5 minutes
   */
  _setupFormDataCleanup() {
    const expiry = localStorage.getItem(FORM_DATA_EXPIRY_KEY);

    if (expiry && Date.now() > parseInt(expiry, 10)) {
      this._clearSavedFormData();
    }

    // Set up interval to check for expired data
    setInterval(() => {
      const currentExpiry = localStorage.getItem(FORM_DATA_EXPIRY_KEY);
      if (currentExpiry && Date.now() > parseInt(currentExpiry, 10)) {
        this._clearSavedFormData();
      }
    }, 60000); // Check every minute
  }

  /**
   * Bind form field change events to save data
   */
  _bindFormDataSaving() {
    this.form.addEventListener('input', () => {
      if (!this.isSubmitting) {
        this._saveFormData();
      }
    });

    this.form.addEventListener('change', () => {
      if (!this.isSubmitting) {
        this._saveFormData();
      }
    });
  }

  /**
   * Handle form submission
   * @param {Event} event - Submit event
   */
  _handleFormSubmit(event) {
    event.preventDefault();

    if (this.isSubmitting) {
      return;
    }

    // Validate CAPTCHA first
    const captchaResult = this._validateCaptcha();
    if (!captchaResult.valid) {
      return;
    }

    // Trigger validation
    const { isValid, errors } = this.validator.validateAll();

    if (!isValid) {
      // Show form-level error summary
      this.validator._showFormErrorSummary(errors);
      
      // Focus on first invalid field
      this.validator._focusFirstInvalidField(errors);
      return;
    }

    // Start submission process
    this._startSubmission();
  }

  /**
   * Handle valid form submission (after validation passes)
   * @param {Event} event - Custom validSubmit event
   */
  _handleValidSubmit(event) {
    event.preventDefault();
    this._startSubmission();
  }

  /**
   * Start form submission process
   */
  _startSubmission() {
    this.isSubmitting = true;
    this._setLoadingState(true);

    // Get form data
    const formData = this.validator._getFormData();
    formData.captchaAnswer = this.captchaInput ? this.captchaInput.value : '';

    // Disable form fields
    this._disableFormFields(true);

    // Attempt submission with retries
    this._attemptSubmission(formData, 0);
  }

  /**
   * Attempt form submission with retry logic
   * @param {Object} formData - Form data to submit
   * @param {number} attemptNum - Current attempt number
   */
  _attemptSubmission(formData, attemptNum) {
    if (attemptNum >= this.maxRetries) {
      this._handleSubmissionFailure('Failed to submit form after multiple attempts. Please try again later.');
      return;
    }

    // Simulate API call (in production, this would be an actual email service call)
    this._submitToEmailService(formData)
      .then(() => {
        this._handleSubmissionSuccess(formData);
      })
      .catch((error) => {
        console.warn(`Submission attempt ${attemptNum + 1} failed:`, error);

        if (attemptNum < this.maxRetries - 1) {
          // Wait before retrying (exponential backoff)
          setTimeout(() => {
            this._attemptSubmission(formData, attemptNum + 1);
          }, this.retryDelay * (attemptNum + 1));
        } else {
          this._handleSubmissionFailure(error.message || 'Failed to submit form');
        }
      });
  }

  /**
   * Submit form data to email service
   * @param {Object} formData - Form data to submit
   * @returns {Promise} Promise that resolves on success, rejects on failure
   */
  _submitToEmailService(formData) {
    return new Promise((resolve, reject) => {
      // Simulate API call delay
      setTimeout(() => {
        // In production, this would make an actual API call to:
        // - FormSubmit.co
        // - EmailJS
        // - Web3Forms
        // - Or your own backend endpoint

        // For now, we simulate success
        // TODO: Replace with actual email service integration
        resolve();
      }, 1000);
    });
  }

  /**
   * Handle successful form submission
   * @param {Object} formData - Successfully submitted form data
   */
  _handleSubmissionSuccess(formData) {
    this.isSubmitting = false;
    this._setLoadingState(false);

    // Clear saved form data on success
    this._clearSavedFormData();

    // Clear form
    this.validator.reset();

    // Show success message
    this._showFormStatus(
      'success',
      'Thank you! Your message has been sent successfully. We will get back to you within 24 hours.',
      5000
    );

    // Clear CAPTCHA
    this.captcha.reset();
    this._generateCaptchaUI();

    // Enable form fields
    this._disableFormFields(false);

    // Announce success to screen readers
    const statusElement = document.getElementById('form-status');
    if (statusElement) {
      statusElement.setAttribute('role', 'status');
      statusElement.setAttribute('aria-live', 'polite');
    }
  }

  /**
   * Handle failed form submission
   * @param {string} message - Error message
   */
  _handleSubmissionFailure(message) {
    this.isSubmitting = false;
    this._setLoadingState(false);

    // Re-enable form fields
    this._disableFormFields(false);

    // Show persistent error with retry option
    this._showFormStatus(
      'error',
      `${message} <button type="button" class="retry-btn">Try Again</button>`,
      null
    );

    // Add retry button handler
    const retryBtn = this.form.querySelector('.retry-btn');
    if (retryBtn) {
      retryBtn.addEventListener('click', () => {
        this._startSubmission();
      });
    }

    // Clear CAPTCHA on failure (require re-validation)
    this.captcha.reset();
    this._generateCaptchaUI();
  }

  /**
   * Set form loading state
   * @param {boolean} isLoading - True to show loading, false to hide
   */
  _setLoadingState(isLoading) {
    const submitButton = this.form.querySelector('button[type="submit"]');
    
    if (!submitButton) return;

    if (isLoading) {
      // Show loading spinner
      const spinner = submitButton.querySelector('.btn__spinner');
      if (spinner) {
        spinner.classList.add('is-loading');
        spinner.setAttribute('aria-hidden', 'false');
      }

      // Change button text
      const text = submitButton.querySelector('.btn__text');
      if (text) {
        text.textContent = 'Sending...';
      }

      // Disable button
      submitButton.disabled = true;
      submitButton.setAttribute('aria-busy', 'true');
    } else {
      // Hide loading spinner
      const spinner = submitButton.querySelector('.btn__spinner');
      if (spinner) {
        spinner.classList.remove('is-loading');
        spinner.setAttribute('aria-hidden', 'true');
      }

      // Restore button text
      const text = submitButton.querySelector('.btn__text');
      if (text) {
        text.textContent = 'Send Message';
      }

      // Enable button
      submitButton.disabled = false;
      submitButton.setAttribute('aria-busy', 'false');
    }
  }

  /**
   * Enable or disable form fields
   * @param {boolean} disabled - True to disable, false to enable
   */
  _disableFormFields(disabled) {
    const fields = this.form.querySelectorAll('input, select, textarea');
    fields.forEach((field) => {
      if (field.name !== 'captchaAnswer') {
        field.disabled = disabled;
      }
    });
  }

  /**
   * Show form status message
   * @param {string} type - 'success' or 'error'
   * @param {string} message - Message to display
   * @param {number|null} duration - Duration in milliseconds (null for persistent)
   */
  _showFormStatus(type, message, duration) {
    const statusElement = document.getElementById('form-status');
    
    if (!statusElement) return;

    statusElement.innerHTML = `<div class="form-status--${type}">${message}</div>`;
    statusElement.classList.add('is-visible');
    statusElement.setAttribute('role', type === 'success' ? 'status' : 'alert');
    statusElement.setAttribute('aria-live', 'polite');

    if (duration) {
      setTimeout(() => {
        statusElement.classList.remove('is-visible');
      }, duration);
    }
  }

  /**
   * Clear form status
   */
  _clearFormStatus() {
    const statusElement = document.getElementById('form-status');
    if (statusElement) {
      statusElement.classList.remove('is-visible');
      statusElement.innerHTML = '';
    }
  }

  /**
   * Public method to manually refresh CAPTCHA
   */
  refreshCaptcha() {
    this.captcha.reset();
    this._generateCaptchaUI();
    this._clearCaptchaError();
  }

  /**
   * Public method to reset form state
   */
  reset() {
    this.isSubmitting = false;
    this._clearFormStatus();
    this._clearSavedFormData();
    this._disableFormFields(false);
    this._setLoadingState(false);
    this.validator.reset();
    this.captcha.reset();
    this._generateCaptchaUI();
  }
}

// Initialize form handler when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('contactForm');
  
  if (!form) {
    console.warn('Contact form not found');
    return;
  }

  // Check if validator is already initialized on form
  let validator = form.validator;
  
  if (!validator) {
    console.warn('FormValidator not initialized. Make sure to load formValidation.js before formHandler.js');
    return;
  }

  // Initialize form handler
  const handler = new FormHandler(form, validator);
  
  // Store handler instance on form for external access
  form.formHandler = handler;

  // Log initialization for debugging
  console.log('Form handler initialized');
});

// Export for ES module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { FormHandler, SimpleCaptcha };
}