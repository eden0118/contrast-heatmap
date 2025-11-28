# Contrast Heatmap - Setup & Development Guide

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Development Mode
```bash
npm run dev
```

This starts Vite with HMR (Hot Module Replacement) enabled via @crxjs/vite-plugin.

### 3. Build for Production
```bash
npm run build
```

Output will be in the `dist/` folder.

### 4. Load Extension in Chrome

1. Open `chrome://extensions/`
2. Enable **Developer mode** (toggle in top-right)
3. Click **Load unpacked**
4. Select the `dist/` folder

## Architecture Overview

### Entry Points

- **Popup**: `src/popup/main.jsx` → `src/popup/popup.html`
  - React component for extension UI
  - Controls: Toggle switch and opacity slider
  - Communicates via `chrome.runtime.sendMessage`

- **Content Script**: `src/content/index.js`
  - Scans DOM for text contrast issues
  - Draws overlay canvas with heatmap colors
  - Listens for messages from popup
  - Survives page navigation and DOM mutations

- **Service Worker**: `src/background/service-worker.js`
  - Initializes storage on install
  - Handles global extension events

### Key Files

| File | Purpose |
|------|---------|
| `manifest.json` | Manifest V3 configuration with permissions |
| `vite.config.js` | Vite + @crxjs/vite-plugin setup |
| `src/utils/color.js` | WCAG contrast calculation utilities |
| `src/content/index.js` | DOM scanner & canvas overlay logic |
| `src/popup/App.jsx` | React UI component |
| `src/popup/popup.html` | HTML template for popup |
| `tailwind.config.js` | Tailwind CSS configuration |
| `postcss.config.js` | PostCSS (Tailwind processing) |

## Core Functions

### `getEffectiveBackgroundColor(element)`
```javascript
// Recursively finds the effective background color by traversing up the DOM
// Handles transparent backgrounds
// Returns: {r: number, g: number, b: number}
```

### `calculateContrastRatio(foreground, background)`
```javascript
// Calculates WCAG 2.0 contrast ratio
// Returns: number (1-21 range)
// Example: 4.5 = AA compliant for normal text
```

### `getWCAGLevel(ratio, size)`
```javascript
// Determines WCAG compliance level
// size: 'normal' (default) or 'large' (18pt+)
// Returns: 'fail' | 'aa' | 'aaa'
```

## Canvas Overlay Details

- **Position**: Fixed, full-screen (covers entire viewport)
- **Z-Index**: 99999 (always on top)
- **Pointer Events**: None (doesn't interfere with page interaction)
- **Colors**:
  - Blue (`#3B82F6`): Fail (< 4.5:1)
  - Orange (`#FB923C`): AA (4.5:1+)
  - Red (`#EF4444`): AAA (7:1+)

## DOM Scanning Process

1. **TreeWalker**: Traverses all text nodes in `document.body`
2. **Range API**: Gets bounding rectangles for each text node
3. **Style Computation**: Extracts foreground & background colors
4. **WCAG Calculation**: Computes luminance and contrast ratio
5. **Canvas Drawing**: Fills rectangles with heatmap colors

## State Management

User preferences stored in `chrome.storage.local`:
```javascript
{
  enabled: boolean,      // Scanner on/off
  opacity: number        // 0.1 to 0.8
}
```

## Message Protocol

### Popup → Content Script

```javascript
// Enable heatmap
{ type: 'ENABLE_HEATMAP' }

// Disable heatmap
{ type: 'DISABLE_HEATMAP' }

// Update opacity
{ type: 'UPDATE_OPACITY', opacity: 0.5 }

// Get current status
{ type: 'GET_STATUS' }
```

## Debugging

### View Console Errors
- **Popup**: Right-click popup → "Inspect" → Console
- **Content Script**: Open DevTools (F12) on the webpage → Console
- **Service Worker**: `chrome://extensions/` → Details → Inspect views → service worker

### Enable Source Maps
Add to `vite.config.js`:
```javascript
build: {
  sourcemap: true
}
```

## Build Output Structure

```
dist/
├── popup/
│   └── popup.html
├── src/
│   ├── content/
│   │   └── index.js
│   └── background/
│       └── service-worker.js
├── manifest.json
└── [other bundled files]
```

## WCAG 2.0 Standards Reference

### Contrast Ratios by Level

| Font Size | Normal Text | Large Text |
|-----------|------------|-----------|
| Any | 3:1 | 3:1 (AAA) |
| Any | 4.5:1 | 3:1 (AA) |
| Any | 7:1 | 4.5:1 (AAA) |

- **Normal Text**: < 18pt (14px)
- **Large Text**: 18pt+ (24px+)

## Troubleshooting

### Extension Not Loading
1. Check manifest.json syntax: `npm run build`
2. Verify dist folder exists and contains manifest.json
3. Reload extension in chrome://extensions/

### Heatmap Not Appearing
1. Check console for errors (F12)
2. Verify content script is injected: Check chrome://extensions/ > Details
3. Ensure website matches `<all_urls>` in manifest

### Canvas Overlay Too Opaque/Transparent
1. Adjust opacity slider in popup (0.1 - 0.8)
2. Check opacity value stored in `chrome.storage.local`

### Performance Issues
1. Reduce DOM scanning frequency (increase debounce timeout in content script)
2. Disable MutationObserver for performance testing
3. Check if page has excessive DOM changes

## Next Steps

### Add Icons
Create icon images at these sizes and place in `public/icons/`:
- `icon-16.png` (16x16)
- `icon-48.png` (48x48)
- `icon-128.png` (128x128)

### Add Additional Features
- Export contrast report (JSON/CSV)
- Filter by WCAG level
- Skip specific elements (tags, classes)
- Color picker integration
- Performance metrics dashboard

### Publishing
1. Test thoroughly in development
2. Build with `npm run build`
3. Submit to Chrome Web Store

---

**Reference**: [Chrome Extension Documentation](https://developer.chrome.com/docs/extensions/)
