/**
 * Form Validation Component
 * Healthy Catering Landing Page
 * 
 * Implements comprehensive form validation with:
 * - Email validation using standard regex patterns
 * - Real-time validation with visible error messages
 * - Form field focus indicators (2px minimum outline)
 * - Validation for all required fields
 * - Proper ARIA attributes for accessibility
 * - Form submission handling with error/success display
 * 
 * Requirements: 6.2, 6.3, 9.5, 12.1
 */

// Email validation regex pattern
const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

// Minimum length validations
const MIN_LENGTHS = {
  NAME: 2,
  PHONE: 10,
  MESSAGE: 10,
};

// Maximum length validations
const MAX_LENGTHS = {
  NAME: 100,
  EMAIL: 254,
  PHONE: 20,
  MESSAGE: 2000,
};

/**
 * Contact Form Validator
 * Handles validation for all form fields with proper accessibility support
 */
class FormValidator {
  /**
   * @param {HTMLFormElement} form - The contact form element
   */
  constructor(form) {
    this.form = form;
    this.fields = this._initializeFields();
    this.errorSummaries = new Map();
    
    this._bindEvents();
    this._setupAccessibility();
  }

  /**
   * Initialize form fields with validation properties
   * @returns {Map<string, Object>} Map of field name to validation config
   */
  _initializeFields() {
    const fields = new Map();
    
    // Name field - Required
    const nameField = this.form.querySelector('[name="name"]');
    if (nameField) {
      fields.set('name', {
        element: nameField,
        label: nameField.parentElement.querySelector('label')?.textContent || 'Full Name',
        required: true,
        minLength: MIN_LENGTHS.NAME,
        maxLength: MAX_LENGTHS.NAME,
        validate: (value) => this._validateName(value),
        errorElement: document.getElementById('name-error'),
      });
    }

    // Email field - Required, must validate email format
    const emailField = this.form.querySelector('[name="email"]');
    if (emailField) {
      fields.set('email', {
        element: emailField,
        label: emailField.parentElement.querySelector('label')?.textContent || 'Email Address',
        required: true,
        email: true,
        minLength: 1,
        maxLength: MAX_LENGTHS.EMAIL,
        validate: (value) => this._validateEmail(value),
        errorElement: document.getElementById('email-error'),
      });
    }

    // Phone field - Optional (but if provided, must be valid)
    const phoneField = this.form.querySelector('[name="phone"]');
    if (phoneField) {
      fields.set('phone', {
        element: phoneField,
        label: phoneField.parentElement.querySelector('label')?.textContent || 'Phone Number',
        required: false,
        phone: true,
        minLength: MIN_LENGTHS.PHONE,
        maxLength: MAX_LENGTHS.PHONE,
        validate: (value) => this._validatePhone(value),
        errorElement: document.getElementById('phone-error'),
      });
    }

    // Event Type field - Required
    const eventTypeField = this.form.querySelector('[name="eventType"]');
    if (eventTypeField) {
      fields.set('eventType', {
        element: eventTypeField,
        label: eventTypeField.parentElement.querySelector('label')?.textContent || 'Event Type',
        required: true,
        validate: (value) => this._validateEventType(value),
        errorElement: document.getElementById('event-type-error'),
      });
    }

    // Event Date field - Optional
    const eventDateField = this.form.querySelector('[name="eventDate"]');
    if (eventDateField) {
      fields.set('eventDate', {
        element: eventDateField,
        label: eventDateField.parentElement.querySelector('label')?.textContent || 'Event Date',
        required: false,
        date: true,
        validate: (value) => this._validateEventDate(value),
        errorElement: document.getElementById('event-date-error'),
      });
    }

    // Message field - Required
    const messageField = this.form.querySelector('[name="message"]');
    if (messageField) {
      fields.set('message', {
        element: messageField,
        label: messageField.parentElement.querySelector('label')?.textContent || 'Message',
        required: true,
        minLength: MIN_LENGTHS.MESSAGE,
        maxLength: MAX_LENGTHS.MESSAGE,
        validate: (value) => this._validateMessage(value),
        errorElement: document.getElementById('message-error'),
      });
    }

    return fields;
  }

  /**
   * Setup accessibility features
   */
  _setupAccessibility() {
    // Ensure all fields have proper ARIA attributes
    this.fields.forEach((config) => {
      const { element, required, errorElement } = config;
      
      // Set aria-required
      if (required) {
        element.setAttribute('aria-required', 'true');
      } else {
        element.setAttribute('aria-required', 'false');
      }
      
      // Ensure aria-describedby points to error element
      if (errorElement) {
        const describedBy = element.getAttribute('aria-describedby') || '';
        if (!describedBy.includes(errorElement.id)) {
          element.setAttribute('aria-describedby', `${describedBy} ${errorElement.id}`.trim());
        }
      }
    });
  }

  /**
   * Bind event listeners
   */
  _bindEvents() {
    // Real-time validation on input
    this.fields.forEach((config) => {
      const { element } = config;
      
      element.addEventListener('input', () => this._validateField(config));
      element.addEventListener('blur', () => this._validateField(config));
      element.addEventListener('change', () => this._validateField(config));
    });

    // Form submission
    this.form.addEventListener('submit', (e) => this._handleFormSubmit(e));
  }

  /**
   * Validate a single field
   * @param {Object} config - Field validation configuration
   * @returns {Object} Validation result with isValid and errorMessage
   */
  _validateField(config) {
    const { element, label, required, validate } = config;
    const value = element.value.trim();
    const isValid = this._isFieldValid(config, value);

    if (isValid) {
      this._clearFieldError(config);
    } else {
      this._showFieldError(config, this._getFieldErrorMessage(config, value));
    }

    return { isValid, errorMessage: isValid ? null : this._getFieldErrorMessage(config, value) };
  }

  /**
   * Check if a field is valid
   * @param {Object} config - Field validation configuration
   * @param {string} value - Field value
   * @returns {boolean} True if field is valid
   */
  _isFieldValid(config, value) {
    const { required, minLength, maxLength, email, phone, date, validate } = config;

    // If field is not required and empty, it's valid
    if (!required && value === '') {
      return true;
    }

    // If field is required and empty, it's invalid
    if (required && value === '') {
      return false;
    }

    // Run custom validation if provided
    if (validate) {
      const result = validate(value);
      if (!result.valid) {
        return false;
      }
    }

    // Email validation
    if (email && !EMAIL_REGEX.test(value)) {
      return false;
    }

    // Minimum length validation
    if (minLength && value.length < minLength) {
      return false;
    }

    // Maximum length validation
    if (maxLength && value.length > maxLength) {
      return false;
    }

    // Phone validation (allow digits, spaces, dashes, parentheses, and + for country code)
    if (phone && !/^[\d\s\-\+\(\)]+$/.test(value)) {
      return false;
    }

    return true;
  }

  /**
   * Validate name field
   * @param {string} value - Name value
   * @returns {Object} Validation result
   */
  _validateName(value) {
    // Must contain at least 2 characters
    if (value.length < MIN_LENGTHS.NAME) {
      return {
        valid: false,
        message: `Name must be at least ${MIN_LENGTHS.NAME} characters`,
      };
    }

    // Must not exceed maximum length
    if (value.length > MAX_LENGTHS.NAME) {
      return {
        valid: false,
        message: `Name must be less than ${MAX_LENGTHS.NAME} characters`,
      };
    }

    // Must contain at least one letter
    if (!/[a-zA-Z]/.test(value)) {
      return {
        valid: false,
        message: 'Name must contain at least one letter',
      };
    }

    return { valid: true };
  }

  /**
   * Validate email field
   * @param {string} value - Email value
   * @returns {Object} Validation result
   */
  _validateEmail(value) {
    if (!EMAIL_REGEX.test(value)) {
      return {
        valid: false,
        message: 'Please enter a valid email address',
      };
    }

    return { valid: true };
  }

  /**
   * Validate phone field
   * @param {string} value - Phone value
   * @returns {Object} Validation result
   */
  _validatePhone(value) {
    if (value === '') {
      return { valid: true };
    }

    // Remove all non-digit characters to check length
    const digitsOnly = value.replace(/\D/g, '');
    
    if (digitsOnly.length < MIN_LENGTHS.PHONE) {
      return {
        valid: false,
        message: `Phone number must be at least ${MIN_LENGTHS.PHONE} digits`,
      };
    }

    if (digitsOnly.length > MAX_LENGTHS.PHONE) {
      return {
        valid: false,
        message: `Phone number is too long`,
      };
    }

    return { valid: true };
  }

  /**
   * Validate event type field
   * @param {string} value - Event type value
   * @returns {Object} Validation result
   */
  _validateEventType(value) {
    if (value === '' || value === 'Select an event type') {
      return {
        valid: false,
        message: 'Please select an event type',
      };
    }

    return { valid: true };
  }

  /**
   * Validate event date field
   * @param {string} value - Event date value
   * @returns {Object} Validation result
   */
  _validateEventDate(value) {
    if (value === '') {
      return { valid: true };
    }

    const selectedDate = new Date(value);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (selectedDate < today) {
      return {
        valid: false,
        message: 'Event date cannot be in the past',
      };
    }

    // Check if date is more than 2 years in the future
    const twoYearsLater = new Date();
    twoYearsLater.setFullYear(twoYearsLater.getFullYear() + 2);

    if (selectedDate > twoYearsLater) {
      return {
        valid: false,
        message: 'Please select a date within the next 2 years',
      };
    }

    return { valid: true };
  }

  /**
   * Validate message field
   * @param {string} value - Message value
   * @returns {Object} Validation result
   */
  _validateMessage(value) {
    if (value.length < MIN_LENGTHS.MESSAGE) {
      return {
        valid: false,
        message: `Message must be at least ${MIN_LENGTHS.MESSAGE} characters`,
      };
    }

    if (value.length > MAX_LENGTHS.MESSAGE) {
      return {
        valid: false,
        message: `Message must be less than ${MAX_LENGTHS.MESSAGE} characters`,
      };
    }

    return { valid: true };
  }

  /**
   * Get error message for a field
   * @param {Object} config - Field validation configuration
   * @param {string} value - Field value
   * @returns {string} Error message
   */
  _getFieldErrorMessage(config, value) {
    const { required, label } = config;

    // Required field check
    if (required && value === '') {
      return `${label} is required`;
    }

    // Run validation to get specific error
    const { validate } = config;
    if (validate) {
      const result = validate(value);
      if (!result.valid) {
        return result.message;
      }
    }

    return 'Invalid value';
  }

  /**
   * Show field error state
   * @param {Object} config - Field validation configuration
   * @param {string} message - Error message to display
   */
  _showFieldError(config, message) {
    const { element, errorElement } = config;

    // Add error class to input
    element.classList.add('is-error');
    element.classList.remove('is-success');

    // Set aria-invalid attribute
    element.setAttribute('aria-invalid', 'true');

    // Show error message element
    if (errorElement) {
      errorElement.textContent = message;
      errorElement.classList.add('is-visible');
      element.setAttribute('aria-describedby', `${element.getAttribute('aria-describedby') || ''} ${errorElement.id}`.trim());
    }

    // Set focus indicator (2px minimum - Requirement 9.5)
    element.style.boxShadow = '0 0 0 2px rgba(244, 67, 54, 0.3)';
  }

  /**
   * Clear field error state
   * @param {Object} config - Field validation configuration
   */
  _clearFieldError(config) {
    const { element, errorElement } = config;

    // Remove error class from input
    element.classList.remove('is-error');

    // Set aria-invalid to false
    element.setAttribute('aria-invalid', 'false');

    // Hide error message if it exists
    if (errorElement) {
      errorElement.classList.remove('is-visible');
    }

    // Restore focus indicator to default (2px minimum - Requirement 9.5)
    element.style.boxShadow = '';
  }

  /**
   * Validate all fields and return overall form validity
   * @returns {Object} Form validation result
   */
  validateAll() {
    let isValid = true;
    const errors = new Map();

    this.fields.forEach((config) => {
      const value = config.element.value.trim();
      const fieldResult = this._validateField(config);
      
      if (!fieldResult.isValid) {
        isValid = false;
        errors.set(config.element.name, fieldResult.errorMessage);
      }
    });

    return { isValid, errors };
  }

  /**
   * Handle form submission
   * @param {Event} event - Submit event
   */
  _handleFormSubmit(event) {
    event.preventDefault();

    const { isValid, errors } = this.validateAll();

    if (isValid) {
      // Clear any previous form status
      this._clearFormStatus();

      // Dispatch custom event for form submission handling
      this.form.dispatchEvent(new CustomEvent('form:validSubmit', {
        bubbles: true,
        detail: this._getFormData(),
      }));
    } else {
      // Show form-level error summary
      this._showFormErrorSummary(errors);

      // Focus on first invalid field
      this._focusFirstInvalidField(errors);
    }
  }

  /**
   * Get all form data
   * @returns {Object} Form data object
   */
  _getFormData() {
    const formData = {};
    this.fields.forEach((config) => {
      formData[config.element.name] = config.element.value.trim();
    });
    return formData;
  }

  /**
   * Show form-level error summary
   * @param {Map} errors - Map of field names to error messages
   */
  _showFormErrorSummary(errors) {
    const statusElement = document.getElementById('form-status');
    
    if (!statusElement) return;

    // Build error list
    const errorList = Array.from(errors.entries())
      .map(([field, message]) => `- ${message}`)
      .join('<br>');

    statusElement.innerHTML = `
      <div class="form-status--error">
        <strong>Please fix the following errors:</strong><br>
        ${errorList}
      </div>
    `;
    statusElement.classList.add('is-visible');
    statusElement.setAttribute('role', 'alert');
    statusElement.setAttribute('aria-live', 'polite');

    // Auto-hide after 5 seconds
    setTimeout(() => {
      statusElement.classList.remove('is-visible');
    }, 5000);
  }

  /**
   * Clear form status messages
   */
  _clearFormStatus() {
    const statusElement = document.getElementById('form-status');
    if (statusElement) {
      statusElement.classList.remove('is-visible');
      statusElement.innerHTML = '';
    }
  }

  /**
   * Focus on first invalid field
   * @param {Map} errors - Map of field names to error messages
   */
  _focusFirstInvalidField(errors) {
    const firstInvalidField = Array.from(errors.keys())[0];
    const fieldConfig = this.fields.get(firstInvalidField);
    
    if (fieldConfig && fieldConfig.element) {
      fieldConfig.element.focus();
    }
  }

  /**
   * Show success message
   * @param {string} message - Success message to display
   */
  showSuccess(message = 'Thank you! Your message has been sent successfully.') {
    const statusElement = document.getElementById('form-status');
    
    if (!statusElement) return;

    statusElement.innerHTML = `
      <div class="form-status--success">
        ${message}
      </div>
    `;
    statusElement.classList.add('is-visible');
    statusElement.setAttribute('role', 'status');
    statusElement.setAttribute('aria-live', 'polite');

    // Auto-hide after 5 seconds (Requirement 6.2)
    setTimeout(() => {
      statusElement.classList.remove('is-visible');
      this._clearFormFields();
    }, 5000);

    // Announce to screen readers
    if (statusElement.getAttribute('aria-live') === 'polite') {
      // The message will be announced automatically due to aria-live
    }
  }

  /**
   * Clear all form fields
   */
  _clearFormFields() {
    this.fields.forEach((config) => {
      config.element.value = '';
      this._clearFieldError(config);
    });
  }

  /**
   * Reset form validation state
   */
  reset() {
    this._clearFormFields();
    this._clearFormStatus();
  }
}

// Initialize form validation when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('contactForm');
  
  if (form) {
    const validator = new FormValidator(form);
    
    // Store validator instance on form for external access
    form.validator = validator;
    
    // Log initialization for debugging
    console.log('Form validator initialized', {
      fieldCount: validator.fields.size,
      fields: Array.from(validator.fields.keys()),
    });
  }
});

// Export for ES module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { FormValidator, EMAIL_REGEX };
}