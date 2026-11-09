# Healthy Catering Landing Page

A modern, responsive landing page for a healthy catering service that provides nutritious, delicious meal options for individuals and events.

## Features

- Responsive design with mobile-first approach
- Accessibility compliant (WCAG 2.1 Level AA)
- Performance optimized with lazy loading and image optimization
- Modern vanilla JavaScript ES6+
- CSS custom properties for theming
- BEM methodology for CSS naming

## Project Structure

```
healthy-catering-landing-page/
├── index.html                          # Main entry point
├── css/
│   ├── styles.css                      # Main stylesheet
│   ├── components/                     # Component-specific styles
│   │   ├── navigation.css
│   │   ├── hero.css
│   │   ├── services.css
│   │   ├── menu.css
│   │   ├── about.css
│   │   ├── contact.css
│   │   └── footer.css
│   └── utils/                          # Utility classes and variables
│       ├── variables.css
│       ├── typography.css
│       └── spacing.css
├── js/
│   ├── main.js                         # Main application entry point
│   ├── components/                     # Component JavaScript
│   │   ├── navigation.js
│   │   ├── smoothScroll.js
│   │   ├── formHandler.js
│   │   ├── emailService.js
│   │   ├── imageOptimizer.js
│   │   └── analytics.js
│   └── utils/                          # Utility functions
│       ├── validation.js
│       └── dom.js
├── images/
│   ├── hero/                           # Hero section images
│   ├── services/                       # Service category images
│   ├── menu/                           # Menu item images
│   └── team/                           # Team member photos
└── assets/
    └── icons/                          # SVG icons for UI elements
```

## Installation

1. Clone or download this repository
2. No dependencies required - this is a vanilla JavaScript project
3. Open `index.html` in a web browser

For local development server:
```bash
npx http-server -p 8080
```

## Browser Support

- Chrome (current and previous versions)
- Firefox (current and previous versions)
- Safari (current and previous versions)
- Edge (current and previous versions)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Accessibility

This project follows WCAG 2.1 Level AA compliance guidelines:
- Keyboard navigation support
- Screen reader compatibility
- Proper ARIA labels and roles
- Sufficient color contrast (4.5:1 minimum)

## Performance

The project is optimized for performance:
- Lazy loading for images below the fold
- WebP image format with fallback
- Optimized CSS and JavaScript
- Minimal dependencies

## Requirements

See `.kiro/specs/healthy-catering-landing-page/requirements.md` for detailed requirements and acceptance criteria.

## License

MIT
