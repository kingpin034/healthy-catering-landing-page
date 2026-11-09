#!/bin/bash

# Generate placeholder SVG logo
mkdir -p assets/icons
cat > assets/icons/logo.svg << 'LOGO'
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40" width="40" height="40">
  <circle cx="20" cy="20" r="18" fill="#4CAF50"/>
  <path d="M20 10 L25 20 L20 30 L15 20 Z" fill="#FFFFFF"/>
  <circle cx="20" cy="20" r="4" fill="#66BB6A"/>
</svg>
LOGO

# Generate service icons
cat > assets/icons/business-event.svg << 'ICON'
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <rect x="10" y="20" width="44" height="34" rx="2" fill="#4CAF50"/>
  <rect x="26" y="10" width="12" height="10" fill="#66BB6A"/>
  <path d="M10 30 H54" stroke="#FFFFFF" stroke-width="2"/>
</svg>
ICON

cat > assets/icons/wedding.svg << 'ICON'
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <circle cx="22" cy="25" r="10" fill="none" stroke="#4CAF50" stroke-width="3"/>
  <circle cx="42" cy="25" r="10" fill="none" stroke="#4CAF50" stroke-width="3"/>
  <path d="M32 40 L32 50" stroke="#66BB6A" stroke-width="3"/>
</svg>
ICON

cat > assets/icons/fitness.svg << 'ICON'
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <rect x="15" y="28" width="8" height="8" fill="#4CAF50"/>
  <rect x="41" y="28" width="8" height="8" fill="#4CAF50"/>
  <rect x="23" y="30" width="18" height="4" fill="#66BB6A"/>
</svg>
ICON

cat > assets/icons/meal-prep.svg << 'ICON'
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <rect x="12" y="20" width="40" height="30" rx="3" fill="#4CAF50"/>
  <line x1="12" y1="35" x2="52" y2="35" stroke="#FFFFFF" stroke-width="2"/>
  <line x1="32" y1="20" x2="32" y2="50" stroke="#FFFFFF" stroke-width="2"/>
</svg>
ICON

echo "✅ Placeholder SVG assets created!"
echo "📝 These are minimal placeholders for testing deployment."
echo "🎨 Replace with professional assets before production launch."
