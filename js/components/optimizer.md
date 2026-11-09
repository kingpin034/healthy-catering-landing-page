# CSS/JavaScript Optimizer

This optimizer utility provides production-ready minification and optimization for the Healthy Catering Landing Page.

## Features

- **CSS Minification**: Removes comments, whitespace, unused rules, and optimizes values
- **JavaScript Minification**: Removes comments, whitespace, console statements, and optimizes syntax
- **Critical CSS Extraction**: Identifies and extracts above-the-fold styles
- **Critical CSS Inlining**: Inlines critical CSS for faster above-the-fold rendering
- **Bundle Size Analysis**: Provides size metrics and optimization suggestions
- **Unused Code Detection**: Identifies unused CSS selectors

## Usage

### Basic Minification

```javascript
import { CSSOptimizer, JSOptimizer } from './js/components/optimizer.js';

// Minify CSS
const cssOptimizer = new CSSOptimizer();
const minifiedCSS = cssOptimizer.minify(rawCSS);

// Minify JavaScript
const jsOptimizer = new JSOptimizer();
const minifiedJS = jsOptimizer.minify(rawJS);
```

### Critical CSS Optimization

```javascript
import { CriticalCSSOptimizer } from './js/components/optimizer.js';

const criticalOptimizer = new CriticalCSSOptimizer();
const critical = criticalOptimizer.generateCriticalCSS(fullCSS, html);

// Use the critical CSS in your HTML
// The 'inlined' property contains the critical CSS wrapped in a <style> tag
```

### Production Build

```javascript
import { Optimizer } from './js/components/optimizer.js';

const optimizer = new Optimizer();

const output = await optimizer.generateProductionOutput({
  cssPath: './css/styles.css',
  jsPath: './js/main.js',
  htmlPath: './index.html'
});

// Output contains:
// - output.css.minified (minified CSS)
// - output.js.minified (minified JavaScript)
// - output.html.optimized (HTML with critical CSS inlined)
// - Bundle size analysis
```

## Configuration Options

### CSS Optimizer Options

```javascript
const cssOptimizer = new CSSOptimizer({
  preserveComments: false,     // Keep comments in minified output
  removeUnused: true,          // Remove unused CSS rules
  optimizeColors: true,        // Convert colors to 3-digit format
  zeroUnits: true,             // Remove units from zero values
  removeEmptyRules: true       // Remove empty CSS rules
});
```

### JavaScript Optimizer Options

```javascript
const jsOptimizer = new JSOptimizer({
  removeConsole: true,         // Remove console.* statements
  removeUnused: true,          // Remove unused code (basic)
  optimizeVariables: true,     // Optimize var declarations
  removeWhitespace: true       // Remove whitespace
});
```

## Integration with Build Process

### Using with Node.js Build Script

Create a `build.js` file:

```javascript
import { Optimizer } from './js/components/optimizer.js';
import fs from 'fs';

async function build() {
  try {
    const optimizer = new Optimizer();
    
    const output = await optimizer.generateProductionOutput({
      cssPath: './css/styles.css',
      jsPath: './js/main.js',
      htmlPath: './index.html'
    });

    // Write minified CSS
    fs.writeFileSync('./dist/styles.min.css', output.css.minified);

    // Write minified JavaScript
    fs.writeFileSync('./dist/scripts.min.js', output.js.minified);

    // Write optimized HTML
    fs.writeFileSync('./dist/index.html', output.html.optimized);

    console.log('Production build complete!');
    console.log('CSS size:', output.css.size, 'bytes');
    console.log('JS size:', output.js.size, 'bytes');
    console.log('Bundle analysis:', output.js.bundleAnalysis);

  } catch (error) {
    console.error('Build failed:', error);
    process.exit(1);
  }
}

build();
```

Run the build:

```bash
node build.js
```

### Using with ES Modules

```javascript
import { CSSOptimizer, JSOptimizer } from './js/components/optimizer.js';

const cssOptimizer = new CSSOptimizer();
const jsOptimizer = new JSOptimizer();

// Fetch and minify remote CSS/JS
const cssResponse = await fetch('./css/styles.css');
const cssText = await cssResponse.text();
const minifiedCSS = cssOptimizer.minify(cssText);
```

## API Reference

### CSSOptimizer

#### `minify(css, options)`
Minify CSS content
- **Parameters**: 
  - `css` (string): Raw CSS content
  - `options` (object): Configuration options
- **Returns**: Minified CSS string

#### `extractCriticalCSS(css, criticalSelectors)`
Extract critical CSS rules
- **Parameters**: 
  - `css` (string): Full CSS content
  - `criticalSelectors` (array): Selectors to prioritize
- **Returns**: Critical CSS string

#### `inlineCSS(css, attributes)`
Wrap CSS in a style tag
- **Parameters**: 
  - `css` (string): CSS content
  - `attributes` (object): HTML attributes for style tag
- **Returns**: HTML style tag string

#### `detectUnusedCSS(css, html)`
Detect unused CSS selectors
- **Parameters**: 
  - `css` (string): CSS content
  - `html` (string): HTML content
- **Returns**: Array of unused selectors

### JSOptimizer

#### `minify(js, options)`
Minify JavaScript content
- **Parameters**: 
  - `js` (string): Raw JavaScript content
  - `options` (object): Configuration options
- **Returns**: Minified JavaScript string

#### `bundle(files)`
Bundle multiple JavaScript files
- **Parameters**: 
  - `files` (array): Array of file paths or code strings
- **Returns**: Bundled and minified JavaScript string

#### `treeShake(js)`
Remove unused code (basic tree-shaking)
- **Parameters**: 
  - `js` (string): JavaScript content
- **Returns**: Tree-shaken JavaScript string

#### `analyzeBundleSize(js)`
Analyze bundle size and optimization potential
- **Parameters**: 
  - `js` (string): JavaScript content
- **Returns**: Bundle analysis object with size metrics

### CriticalCSSOptimizer

#### `generateCriticalCSS(css, html)`
Generate optimized critical CSS for above-the-fold content
- **Parameters**: 
  - `css` (string): Full CSS content
  - `html` (string): HTML content
- **Returns**: Object with criticalCSS, minifiedCritical, inlined, and savings

#### `optimizePage(options)`
Optimize entire page for production
- **Parameters**: 
  - `options` (object): Optimization options
- **Returns**: Complete page optimization results

### Optimizer (Static)

#### `minifyCSS(css, options)`
Static method for CSS minification
#### `minifyJS(js, options)`
Static method for JavaScript minification

## Performance Benefits

1. **Faster Load Times**: Minified CSS/JS reduces file sizes by 50-70%
2. **Critical CSS Inlining**: Above-the-fold content renders without waiting for CSS
3. **Reduced Bandwidth**: Smaller files mean less data transfer
4. **Improved Core Web Vitals**: Faster LCP and FID scores

## Browser Compatibility

The optimizer generates code compatible with:
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Testing

Run the optimizer in Node.js:

```bash
node -e "
const { CSSOptimizer, JSOptimizer } = require('./js/components/optimizer.js');
const cssOpt = new CSSOptimizer();
const jsOpt = new JSOptimizer();

console.log('CSS Minified:', cssOpt.minify('body { color: #ffffff; }'));
console.log('JS Minified:', jsOpt.minify('const x = 1; console.log(x);'));
"
```

## License

MIT - See LICENSE file for details.