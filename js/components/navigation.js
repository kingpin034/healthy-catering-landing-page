/**
 * Navigation Component
 * Handles hamburger menu toggle, smooth scroll, keyboard navigation,
 * and accessibility features for the healthy catering landing page.
 */

class Navigation {
  constructor() {
    this.config = {
      breakpoint: 768,
      scrollSpeed: 500,
      menuItems: [
        { href: '#home', label: 'Home', sectionId: 'home' },
        { href: '#services', label: 'Services', sectionId: 'services' },
        { href: '#menu', label: 'Menu', sectionId: 'menu' },
        { href: '#about', label: 'About', sectionId: 'about' },
        { href: '#contact', label: 'Contact', sectionId: 'contact' },
      ],
    };

    this.elements = {
      nav: null,
      toggle: null,
      menu: null,
      links: [],
    };

    this.state = {
      isMobile: false,
      menuOpen: false,
      focusIndex: -1,
    };

    this.init();
  }

  /**
   * Initialize the navigation component
   */
  init() {
    try {
      this.cacheElements();
      this.checkBreakpoint();
      this.bindEvents();
      this.updateMenuItems();
    } catch (error) {
      console.error('Navigation initialization failed:', error);
    }
  }

  /**
   * Cache DOM elements
   */
  cacheElements() {
    this.elements.nav = document.querySelector('.navigation');
    this.elements.toggle = this.elements.nav?.querySelector('.navigation__toggle');
    this.elements.menu = this.elements.nav?.querySelector('.navigation__menu');
    this.elements.links = Array.from(this.elements.menu?.querySelectorAll('a') || []);

    if (!this.elements.nav || !this.elements.toggle || !this.elements.menu) {
      throw new Error('Navigation elements not found');
    }
  }

  /**
   * Check if current viewport is at mobile breakpoint
   */
  checkBreakpoint() {
    this.state.isMobile = window.innerWidth < this.config.breakpoint;
  }

  /**
   * Bind event listeners
   */
  bindEvents() {
    // Hamburger menu toggle
    this.elements.toggle.addEventListener('click', () => this.toggleMenu());
    this.elements.toggle.addEventListener('keydown', (e) => this.handleToggleKeydown(e));

    // Menu link navigation
    this.elements.links.forEach((link, index) => {
      link.addEventListener('click', (e) => this.handleLinkClick(e, index));
      link.addEventListener('keydown', (e) => this.handleLinkKeydown(e, index));
    });

    // Keyboard navigation for menu
    document.addEventListener('keydown', (e) => this.handleGlobalKeydown(e));

    // Click outside to close (mobile only)
    document.addEventListener('click', (e) => this.handleClickOutside(e));

    // Breakpoint change listener
    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        this.checkBreakpoint();
        if (!this.state.isMobile) {
          this.closeMenu();
        }
      }, 150);
    });

    // Close menu on escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.state.menuOpen) {
        this.closeMenu();
        this.elements.toggle.focus();
      }
    });
  }

  /**
   * Update menu items based on section IDs
   */
  updateMenuItems() {
    const currentHash = window.location.hash;
    
    this.elements.links.forEach((link) => {
      const targetId = link.getAttribute('href').replace('#', '');
      const targetSection = document.getElementById(targetId);
      
      if (!targetSection) {
        console.warn(`Section "${targetId}" not found for navigation link`);
      }
    });
  }

  /**
   * Toggle mobile menu open/closed
   */
  toggleMenu() {
    if (this.state.menuOpen) {
      this.closeMenu();
    } else {
      this.openMenu();
    }
  }

  /**
   * Open the mobile menu
   */
  openMenu() {
    if (!this.state.isMobile) return;

    this.state.menuOpen = true;
    this.elements.menu.classList.add('navigation__menu--open');
    this.elements.toggle.classList.add('navigation__toggle--active');
    this.elements.toggle.setAttribute('aria-expanded', 'true');

    // Trap focus within menu
    this.state.focusIndex = 0;
    this.elements.links[0]?.focus();
  }

  /**
   * Close the mobile menu
   */
  closeMenu() {
    this.state.menuOpen = false;
    this.elements.menu.classList.remove('navigation__menu--open');
    this.elements.toggle.classList.remove('navigation__toggle--active');
    this.elements.toggle.setAttribute('aria-expanded', 'false');
    this.state.focusIndex = -1;
  }

  /**
   * Handle hamburger menu toggle keyboard events
   */
  handleToggleKeydown(e) {
    const validKeys = ['Enter', ' ', 'ArrowDown'];

    if (validKeys.includes(e.key)) {
      e.preventDefault();
      this.toggleMenu();
    }

    if (e.key === 'ArrowDown' && this.state.isMobile) {
      e.preventDefault();
      this.openMenu();
    }
  }

  /**
   * Handle menu link keyboard navigation
   */
  handleLinkKeydown(e, index) {
    const linkCount = this.elements.links.length;

    switch (e.key) {
      case 'ArrowDown':
      case 'ArrowRight':
        e.preventDefault();
        this.state.focusIndex = (index + 1) % linkCount;
        this.elements.links[this.state.focusIndex]?.focus();
        break;

      case 'ArrowUp':
      case 'ArrowLeft':
        e.preventDefault();
        this.state.focusIndex = (index - 1 + linkCount) % linkCount;
        this.elements.links[this.state.focusIndex]?.focus();
        break;

      case 'Home':
        e.preventDefault();
        this.state.focusIndex = 0;
        this.elements.links[0]?.focus();
        break;

      case 'End':
        e.preventDefault();
        this.state.focusIndex = linkCount - 1;
        this.elements.links[this.state.focusIndex]?.focus();
        break;

      case 'Enter':
      case ' ':
        e.preventDefault();
        this.elements.links[index]?.click();
        break;
    }
  }

  /**
   * Handle global keyboard navigation
   */
  handleGlobalKeydown(e) {
    if (!this.state.menuOpen) return;

    // Close menu on Escape
    if (e.key === 'Escape') {
      this.closeMenu();
      this.elements.toggle.focus();
      return;
    }

    // Menu item navigation
    if (['ArrowDown', 'ArrowUp', 'ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(e.key)) {
      const activeElement = document.activeElement;
      const index = this.elements.links.indexOf(activeElement);

      if (index >= 0) {
        this.handleLinkKeydown(e, index);
      }
    }
  }

  /**
   * Handle link click with smooth scroll
   */
  handleLinkClick(e, index) {
    const link = e.currentTarget;
    const targetId = link.getAttribute('href');

    // Prevent default only if it's a hash link
    if (targetId.startsWith('#')) {
      e.preventDefault();
      
      this.closeMenu();
      this.smoothScrollTo(targetId);
      
      // Update focus state
      this.state.focusIndex = index;
    }
  }

  /**
   * Smooth scroll to section
   */
  smoothScrollTo(targetId) {
    // Validate target section exists
    const targetSection = document.querySelector(targetId);
    
    if (!targetSection) {
      console.warn(`Navigation: Section "${targetId}" not found`);
      return;
    }

    // Get scroll position
    const targetPosition = targetSection.getBoundingClientRect().top + window.pageYOffset;
    const startPosition = window.pageYOffset;
    const distance = targetPosition - startPosition;
    const duration = this.config.scrollSpeed;
    const startTime = performance.now();

    // Ensure minimum duration for smooth animation
    const animationDuration = Math.max(duration, 300);

    // Smooth scroll animation
    const animateScroll = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / animationDuration, 1);
      
      // Ease out quart function for smooth scroll
      const ease = 1 - Math.pow(1 - progress, 4);
      
      window.scrollTo(0, startPosition + distance * ease);

      if (progress < 1) {
        requestAnimationFrame(animateScroll);
      } else {
        // Ensure we land exactly at the target
        window.scrollTo(0, targetPosition);
        
        // Set focus to target section for accessibility
        targetSection.setAttribute('tabindex', '-1');
        targetSection.focus();
        
        // Remove tabindex after user navigates away
        setTimeout(() => {
          targetSection.removeAttribute('tabindex');
        }, 1000);
      }
    };

    requestAnimationFrame(animateScroll);
  }

  /**
   * Handle click outside to close (mobile only)
   */
  handleClickOutside(e) {
    if (!this.state.isMobile || !this.state.menuOpen) return;

    const isClickInsideNav = this.elements.nav.contains(e.target);
    const isClickOnToggle = this.elements.toggle.contains(e.target);

    if (!isClickInsideNav || !isClickOnToggle) {
      this.closeMenu();
    }
  }

  /**
   * Get current breakpoint state
   */
  isMobileBreakpoint() {
    return this.state.isMobile;
  }

  /**
   * Check if menu is currently open
   */
  isMenuOpen() {
    return this.state.menuOpen;
  }

  /**
   * Destroy the navigation instance
   */
  destroy() {
    // Remove event listeners
    this.elements.toggle?.removeEventListener('click', () => this.toggleMenu());
    this.elements.toggle?.removeEventListener('keydown', (e) => this.handleToggleKeydown(e));
    
    this.elements.links.forEach((link) => {
      link.removeEventListener('click', (e) => this.handleLinkClick(e));
      link.removeEventListener('keydown', (e) => this.handleLinkKeydown(e));
    });

    document.removeEventListener('click', (e) => this.handleClickOutside(e));
    document.removeEventListener('keydown', (e) => this.handleGlobalKeydown(e));
    
    // Close menu
    this.closeMenu();
  }
}

// Initialize navigation when DOM is ready
let navigationInstance = null;

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    try {
      navigationInstance = new Navigation();
    } catch (error) {
      console.error('Failed to initialize Navigation:', error);
    }
  });
} else {
  try {
    navigationInstance = new Navigation();
  } catch (error) {
    console.error('Failed to initialize Navigation:', error);
  }
}

// Export for potential module usage
export { Navigation };
