# Contrast Heatmap - Chrome Extension

A Chrome Extension that scans webpages for text contrast issues and overlays a visual heatmap using HTML5 Canvas. Automatically clears when you scroll.

## Features

- **Full-Page WCAG 2.0 Scanning**: Analyzes text contrast ratios across the entire webpage
- **Text-Only Detection**: Skips empty elements, analyzes only actual text content
- **Visual Heatmap Overlay**: Color-coded canvas showing compliance levels
  - **Red**: Issues (below AA standard - needs work)
  - **Yellow**: Attention (AA standard - 4.5:1 - 6.9:1)
  - **Blue**: AAA Compliant (fully meets AAA - 7:1+)
- **Adjustable Opacity**: Control transparency (10% - 80%)
- **Auto-Clear on Scroll**: Overlay disables automatically when scrolling
- **Performance Optimized**: Native JavaScript (no React overhead in content script)

## Tech Stack

- **Build Tool**: Vite 5.4+
- **Framework**: React 18 (Popup UI)
- **Language**: JavaScript (no TypeScript)
- **Styling**: Tailwind CSS + PostCSS
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
- Toggle "Enable Scanner" to activate
- Adjust opacity slider as needed
- **Scroll to auto-clear** and rescan

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
│   │   ├── App.jsx                   # React popup UI
│   │   ├── App.css                   # Tailwind styles
│   │   ├── main.jsx                  # React entry
│   │   └── popup.html                # HTML template
│   ├── background/service-worker.js  # Service worker
│   └── utils/color.js                # WCAG utilities
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
1. Creates a full-page canvas overlay
2. Uses `TreeWalker` to find all text nodes (skips whitespace/empty elements)
3. For each text node:
   - Gets computed foreground color
   - Recursively finds effective background color
   - Calculates WCAG 2.0 contrast ratio
   - Maps to color level (fail/aa/aaa)
   - Draws colored rectangle on canvas
4. Listens for scroll events to auto-disable
5. Responds to popup messages (enable/disable/opacity)

### Popup UI (`src/popup/App.jsx`)
- React component with toggle and opacity slider
- Saves preferences to `chrome.storage.local`
- Sends messages to content script via `chrome.tabs.sendMessage`
- Displays color legend

### Color Utils (`src/utils/color.js`)
- **calculateLuminance()**: WCAG 2.0 relative luminance
- **calculateContrastRatio()**: Contrast between two colors
- **getWCAGLevel()**: Maps ratio to fail/aa/aaa
- **getHeatmapColor()**: Returns RGBA color for heatmap
- **parseColor()**: Converts HEX/RGB/RGBA strings

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

- **`src/content/index.js`** - Content script that scans the page and draws overlay
- **`src/popup/App.jsx`** - React component for popup UI with controls
- **`src/utils/color.js`** - WCAG color calculations
- **`manifest.json`** - Extension configuration (Manifest V3)
- **`vite.config.js`** - Vite bundler with @crxjs plugin
- **`tailwind.config.js`** - Tailwind CSS customization
- **`postcss.config.js`** - PostCSS and Autoprefixer config

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

- Cannot scan text in iframes (security restriction)
- Overlay disappears on scroll (by design)
- Font size detection is approximate (pixel-based heuristic)
- Hidden elements are skipped
- Canvas overlay blocks text selection

## Browser Support

- Chrome 88+
- Edge 88+ (Chromium-based)

## Version

v1.0.0 - Full-page WCAG scanning with auto-clear on scroll

## License

MIT
