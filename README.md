# Contrast Heatmap - Chrome Extension

A Chrome Extension that scans webpages for text contrast issues and overlays a visual heatmap using HTML5 Canvas.

## Features

- **WCAG 2.0 Compliance Scanning**: Analyzes text contrast ratios against WCAG 2.0 standards
- **Visual Heatmap**: Color-coded overlay showing contrast compliance levels
  - **Blue**: Fail (contrast ratio < 4.5:1)
  - **Orange**: AA Level (contrast ratio 4.5:1 - 6.9:1)
  - **Red**: AAA Level (contrast ratio 7:1+)
- **Adjustable Opacity**: Control the transparency of the heatmap overlay
- **Real-time Scanning**: Automatically updates as page content changes
- **Performance Optimized**: Uses native JavaScript for content script (no React overhead)

## Tech Stack

- **Build Tool**: Vite 5+
- **Framework**: React 18 (Popup UI only)
- **Language**: JavaScript (no TypeScript)
- **Styling**: Tailwind CSS
- **Extension Plugin**: @crxjs/vite-plugin for Manifest V3 support

## Project Structure

```
contrast-heatmap/
├── src/
│   ├── content/
│   │   └── index.js           # Content script (DOM scanner)
│   ├── popup/
│   │   ├── App.jsx            # React popup component
│   │   ├── App.css            # Tailwind styles
│   │   ├── main.jsx           # React entry point
│   │   └── popup.html         # Popup template
│   ├── background/
│   │   └── service-worker.js  # Service worker
│   └── utils/
│       └── color.js           # Color parsing & WCAG utilities
├── public/
│   └── icons/                 # Extension icons (add later)
├── manifest.json              # Manifest V3 configuration
├── vite.config.js             # Vite configuration
├── tailwind.config.js         # Tailwind configuration
├── postcss.config.js          # PostCSS configuration
└── package.json               # Dependencies
```

## Installation

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Build the extension**:
   ```bash
   npm run build
   ```

3. **Load into Chrome**:
   - Open `chrome://extensions/`
   - Enable "Developer mode" (top-right corner)
   - Click "Load unpacked"
   - Select the `dist/` folder

## Development

Run the development server with HMR:
```bash
npm run dev
```

## Build

Create a production build:
```bash
npm run build
```

The compiled extension will be in the `dist/` folder.

## How It Works

### Popup UI
- React-based popup with toggle switch and opacity slider
- Saves user preferences to `chrome.storage.local`
- Communicates with content script via `chrome.runtime.sendMessage`

### Content Script
- Uses `document.createTreeWalker` to traverse all text nodes
- Implements `getEffectiveBackgroundColor()` to handle transparent backgrounds
- Calculates WCAG 2.0 luminance and contrast ratios
- Draws colored rectangles on a full-screen canvas overlay (z-index: 99999)
- Listens for DOM mutations and window resize events
- Responds to messages from the popup UI

### Color Utils
- **parseColor()**: Converts HEX/RGB/RGBA strings to RGB objects
- **calculateLuminance()**: WCAG 2.0 relative luminance calculation
- **calculateContrastRatio()**: Computes contrast ratio between two colors
- **getWCAGLevel()**: Determines AA/AAA compliance
- **getHeatmapColor()**: Returns RGBA color for the heatmap overlay

## WCAG 2.0 Compliance Levels

| Level | Normal Text | Large Text | Ratio  |
|-------|-------------|-----------|--------|
| Fail  | N/A         | N/A       | < 4.5  |
| AA    | 4.5:1       | 3:1       | 4.5-7  |
| AAA   | 7:1         | 4.5:1     | 7+     |

## Future Enhancements

- Add extension icons (16x16, 48x48, 128x128)
- Export contrast report as JSON/PDF
- Highlight specific failing elements
- Add settings for filtering elements
- Support for images and color combinations

## License

MIT
