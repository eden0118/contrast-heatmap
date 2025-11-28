# Contrast Heatmap - Chrome Extension

A Chrome Extension that scans webpages for text contrast issues and overlays a visual heatmap using HTML5 Canvas. Supports multiple languages (English / 中文).

## Features

- **Full-Page WCAG 2.0 Scanning**: Analyzes text contrast ratios across the entire webpage
- **Viewport-Only Detection**: Only marks elements visible in the current viewport
- **Real-Time Rescan on Scroll**: Automatically rescans and updates heatmap as you scroll
- **Visual Heatmap Overlay**: Color-coded canvas showing compliance levels
  - **Red**: Issues (below AA standard - needs work)
  - **Yellow**: AA Standard (4.5:1 - 6.9:1)
  - **Blue**: AAA Compliant (fully meets AAA - 7:1+)
- **Adjustable Opacity**: Control transparency (10% - 80%)
- **Multi-Language Support**: English & 中文 (Chinese)
- **Performance Optimized**: Native JavaScript with debounced scroll handling

## Features in Detail

### Language Support
- **Automatic Detection**: Detects browser language on first use
- **Manual Selection**: Change language anytime in the popup UI
- **Persistent Settings**: Language preference is saved to Chrome Storage

### Smart Scanning
- **Text-Only Detection**: Analyzes only actual text content, skips empty elements
- **Viewport Optimization**: Only scans and highlights visible text in the current viewport
- **Dynamic Updates**: Rescans automatically when you scroll (with 100ms debounce for performance)

## Tech Stack

- **Build Tool**: Vite 5.4+
- **Framework**: React 18 (Popup UI)
- **Language**: JavaScript (ES6+)
- **Styling**: Tailwind CSS + PostCSS
- **Internationalization**: Custom i18n module with Chrome Storage
- **Extension**: Manifest V3 with @crxjs/vite-plugin

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Build the Extension
```bash
npm run build
```

### 3. Load in Chrome
- Open `chrome://extensions/`
- Enable "Developer mode" (top right)
- Click "Load unpacked"
- Select the `dist/` folder

### 4. Use the Extension
- Click the extension icon in your toolbar
- Select your preferred language (English or 中文)
- Toggle "Enable Scanner" to activate
- Adjust opacity slider as needed
- Scroll to trigger automatic rescans with real-time updates

## Development

Run the development server with watch mode:
```bash
npm run dev
```

This automatically rebuilds as you edit files.

## Project Structure

```
contrast-heatmap/
├── src/
│   ├── content/index.js              # Content script (full-page scanner)
│   ├── popup/
│   │   ├── App.jsx                   # React popup UI with i18n
│   │   ├── App.css                   # Tailwind styles
│   │   ├── main.jsx                  # React entry
│   │   └── popup.html                # HTML template
│   ├── background/service-worker.js  # Service worker
│   └── utils/
│       ├── color.js                  # WCAG contrast calculations
│       └── i18n.js                   # Internationalization (i18n)
├── _locales/
│   ├── en/messages.json              # English translations
│   └── zh/messages.json              # Chinese translations
├── public/icons/                     # Extension icons
├── manifest.json                     # Manifest V3
├── vite.config.js                    # Build config
├── tailwind.config.js                # Tailwind config
├── postcss.config.js                 # PostCSS config
├── package.json                      # Dependencies
└── README.md                         # This file
```

## How It Works

### Content Script (`src/content/index.js`)
1. Creates an absolute-positioned canvas overlay covering the entire document
2. Uses `TreeWalker` to find all text nodes (skips whitespace/empty elements)
3. For each visible text node in the viewport:
   - Gets computed foreground color
   - Recursively finds effective background color (traverses up DOM tree)
   - Calculates WCAG 2.0 contrast ratio
   - Maps to color level (fail/aa/aaa)
   - Draws colored rectangle on canvas using document coordinates
4. **Scroll Handling**:
   - Listens for scroll events with 100ms debounce
   - Automatically rescans and redraws on scroll
   - Converts viewport coordinates to document coordinates for accuracy
5. Responds to popup messages (enable/disable/opacity updates)

### Popup UI (`src/popup/App.jsx`)
- React component with language selector, toggle, and opacity slider
- Supports English and Chinese (自動偵測或手動選擇)
- Saves preferences to `chrome.storage.local`
- Sends messages to content script via `chrome.tabs.sendMessage`
- Displays color legend with explanations

### Internationalization (`src/utils/i18n.js`)
- Supports English and Chinese (Simplified: zh-CN format)
- Auto-detects browser language on first use
- User can manually switch languages
- Persists language preference in Chrome Storage
- All UI text is translatable through the `t()` function

### Color Utils (`src/utils/color.js`)
- **calculateLuminance()**: WCAG 2.0 relative luminance algorithm
- **calculateContrastRatio()**: Calculates contrast between two colors
- **getWCAGLevel()**: Maps contrast ratio to fail/aa/aaa levels
- **getHeatmapColor()**: Returns RGBA color string for visualization
- **parseColor()**: Converts HEX/RGB/RGBA color strings to RGB objects

## Color Guide

| Color | Level | Ratio | Meaning |
|-------|-------|-------|---------|
| 🔴 Red | Fail | < 4.5:1 | Issues - needs work |
| 🟡 Yellow | AA | 4.5:1 - 6.9:1 | Attention - AA standard |
| 🔵 Blue | AAA | ≥ 7:1 | Fully compliant |

## WCAG 2.0 Standards

### Contrast Ratio Requirements

| Level | Normal Text | Large Text |
|-------|-------------|-----------|
| Fail | < 4.5:1 | < 3:1 |
| AA | 4.5:1 | 3:1 |
| AAA | 7:1 | 4.5:1 |

*Large text = 18pt+ or 14px+ (bold)*

## Available Commands

```bash
npm run dev      # Development server with watch mode
npm run build    # Production build (generates dist/)
npm run preview  # Preview built extension locally
```

## File Descriptions

- **`src/content/index.js`** - Content script that scans the page and draws the heatmap overlay. Handles scroll events and rescans dynamically.
- **`src/popup/App.jsx`** - React component for popup UI with language selector, enable/disable toggle, and opacity controls
- **`src/utils/color.js`** - WCAG 2.0 color contrast calculations and luminance algorithms
- **`src/utils/i18n.js`** - Internationalization module for language detection, storage, and translation utilities
- **`manifest.json`** - Extension configuration (Manifest V3) with i18n message placeholders
- **`_locales/en/messages.json`** - English translations for extension name and description
- **`_locales/zh/messages.json`** - Chinese translations for extension name and description
- **`vite.config.js`** - Vite bundler configuration with @crxjs plugin for extension building
- **`tailwind.config.js`** - Tailwind CSS customization
- **`postcss.config.js`** - PostCSS and Autoprefixer configuration

## Troubleshooting

### Extension won't load
- Verify `dist/` folder exists after `npm run build`
- Check manifest.json is valid (check console for errors)
- Try reloading the extension

### Heatmap not showing
- Toggle "Enable Scanner" on/off
- Check that page has text content
- Open DevTools console to see errors

### Colors seem wrong
- Clear extension data in Chrome settings
- Rebuild: `npm run build`
- Reload extension in `chrome://extensions/`

### Performance issues
- Large pages (1000+ text nodes) may be slower
- This is expected - consider reducing opacity or disabling on complex sites

## Known Limitations

- Cannot scan text in iframes (Chrome security restriction)
- Font size detection is approximate (pixel-based heuristic: 24px ≈ 18pt)
- Hidden elements (display: none) are skipped
- Canvas overlay may block text selection (due to absolute positioning)
- Language selection is per-user, not per-page

## Improvements from Previous Version

- **✨ Real-Time Rescanning**: Now rescans and updates heatmap as you scroll instead of disabling
- **✨ Viewport-Only Marking**: Only highlights text visible in the current viewport
- **✨ Multi-Language Support**: Added English and Chinese (中文) support
- **✨ Coordinate Accuracy**: Proper document-to-viewport coordinate conversion
- **✨ No Residual Highlighting**: Fixed canvas clearing issues on scroll

## Browser Support

- Chrome 88+
- Edge 88+ (Chromium-based)

## Version

v1.0.0 - Real-time WCAG scanning with multi-language support and dynamic scroll handling

## Changelog

### v1.0.0
- ✨ Real-time heatmap updating on scroll
- ✨ Viewport-only element detection
- ✨ Multi-language support (English / 中文)
- ✨ Improved coordinate accuracy
- ✨ Fixed canvas clearing and residual highlighting
- ✨ Debounced scroll events for better performance

## License

MIT
