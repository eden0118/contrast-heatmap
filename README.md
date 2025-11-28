# Contrast Heatmap - Chrome Extension

A Chrome Extension that scans webpages for text contrast issues and overlays a visual heatmap using HTML5 Canvas. Uses the **APCA (Advanced Perceptual Contrast Algorithm)** standard for more accurate, human-perception-based contrast evaluation. Supports multiple languages (English / 中文) and light/dark modes.

## Features

- **APCA Contrast Analysis**: Uses Advanced Perceptual Contrast Algorithm for accurate, perception-based contrast evaluation
- **Viewport-Only Detection**: Only marks elements visible in the current viewport
- **Real-Time Rescan on Scroll**: Automatically rescans and updates heatmap as you scroll
- **Visual Heatmap Overlay**: Color-coded canvas showing APCA compliance levels
  - **Red**: Fail (Lc < 30 - Insufficient contrast)
  - **Yellow**: AA (Lc 45-59 - Standard contrast)
  - **Blue**: AAA (Lc ≥ 60 - Enhanced contrast)
- **Adjustable Opacity**: Control transparency (10% - 80%)
- **Multi-Language Support**: English & 中文 (Chinese)
- **Theme Support**: Light and Dark mode with system preference detection
- **Performance Optimized**: Native JavaScript with debounced scroll handling

## Features in Detail

### Language Support
- **Automatic Detection**: Detects browser language on first use
- **Manual Selection**: Change language anytime in the popup UI
- **Persistent Settings**: Language and theme preferences saved to Chrome Storage

### Theme Support
- **System Detection**: Auto-detects OS dark mode preference
- **Manual Override**: Switch between light and dark themes
- **Smooth Transitions**: Seamless theme switching without reload

### Smart Scanning
- **Text-Only Detection**: Analyzes only actual text content, skips empty elements
- **Viewport Optimization**: Only scans and highlights visible text in the current viewport
- **Dynamic Updates**: Rescans automatically when you scroll (with 100ms debounce for performance)
- **Color Accuracy**: Recursively finds effective background colors through DOM tree traversal

## Tech Stack

- **Build Tool**: Vite 5.4+
- **Framework**: React 18 (Popup UI)
- **Language**: JavaScript (ES6+)
- **Styling**: Tailwind CSS + PostCSS with dark mode support
- **Internationalization**: Custom i18n module with Chrome Storage
- **Extension**: Manifest V3 with @crxjs/vite-plugin

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
│   │   ├── App.jsx                   # React popup UI with i18n & theme
│   │   ├── App.css                   # Tailwind styles
│   │   ├── main.jsx                  # React entry
│   │   └── popup.html                # HTML template
│   ├── background/service-worker.js  # Service worker
│   └── utils/
│       ├── color.js                  # APCA contrast calculations
│       └── i18n.js                   # Internationalization (i18n) with theme support
├── _locales/
│   ├── en/messages.json              # English translations
│   └── zh/messages.json              # Chinese translations
├── public/icons/                     # Extension icons
├── manifest.json                     # Manifest V3
├── vite.config.js                    # Build config
├── tailwind.config.js                # Tailwind config with dark mode
├── postcss.config.js                 # PostCSS config
├── package.json                      # Dependencies
└── README.md                         # This file
```

## How It Works

### Content Script (`src/content/index.js`)
1. Creates an absolute-positioned canvas overlay covering the entire document
2. Uses `TreeWalker` to find all text nodes (skips whitespace/empty elements)
3. For each visible text node in the viewport:
   - Gets computed foreground color (from CSS)
   - Recursively finds effective background color (traverses up DOM tree)
   - Calculates APCA Lc (Lightness contrast) value
   - Maps to color level (fail/aa/aaa) based on APCA thresholds
   - Draws colored rectangle on canvas using document coordinates
4. **Scroll Handling**:
   - Listens for scroll events with 100ms debounce
   - Automatically rescans and redraws on scroll
   - Converts viewport coordinates to document coordinates for accuracy
5. Responds to popup messages (enable/disable/opacity updates)

### Popup UI (`src/popup/App.jsx`)
- React component with language selector, theme selector, toggle, and opacity slider
- Supports English and Chinese (自動偵測或手動選擇)
- Supports Light and Dark modes (自動偵測或手動選擇)
- Saves preferences to `chrome.storage.local`
- Sends messages to content script via `chrome.tabs.sendMessage`
- Displays APCA color legend with level descriptions

### Internationalization (`src/utils/i18n.js`)
- Supports English and Chinese with automatic browser detection
- Auto-detects system theme preference (light/dark)
- User can manually switch both language and theme
- Persists both preferences in Chrome Storage
- All UI text is translatable through the `t()` function

### Color Utils (`src/utils/color.js`) - APCA Implementation

**Key Functions:**
- **`calculateAPCAContrast()`**: Implements APCA algorithm using sRGB-to-linear RGB conversion
- **`getAPCALevel()`**: Maps APCA Lc value to fail/aa/aaa levels
- **`calculateLuminance()`**: Helper for sRGB luminance (intermediate step in APCA)
- **`getHeatmapColor()`**: Returns RGBA color string for visualization
- **`parseColor()`**: Converts HEX/RGB/RGBA color strings to RGB objects

## Color Guide & APCA Standards

### Heatmap Colors

| Color | APCA Level | Lc Range | Meaning | Recommended Use |
|-------|-----------|----------|---------|-----------------|
| 🔴 Red | Fail | Lc < 30 | Insufficient contrast | Not recommended |
| 🟡 Yellow | AA | Lc 45-59 | Standard contrast | Normal text acceptable |
| 🔵 Blue | AAA | Lc ≥ 60 | Enhanced contrast | Excellent readability |

### APCA (Advanced Perceptual Contrast Algorithm)

APCA is a more accurate contrast algorithm based on human visual perception, developed by the W3C. It provides better real-world readability assessment than the older WCAG 2.0 contrast ratio.

**Key Differences from WCAG 2.0:**

| Aspect | WCAG 2.0 | APCA |
|--------|----------|------|
| **Calculation** | Simple brightness ratio (1-21:1) | Perception-based Lc value (-108 to 108) |
| **Accuracy** | Less accurate for real-world use | More aligned with actual perception |
| **Font Size** | Size affects pass/fail thresholds | Implicitly considered in algorithm |
| **Direction** | No directional difference | Lighter/darker context matters |
| **Values** | 4.5:1 (AA), 7:1 (AAA) | 45 (AA), 60 (AAA) |

### APCA Calculation Details

The APCA algorithm works as follows:

1. **Convert colors from sRGB to linear RGB:**
   ```
   For each color channel (R, G, B):
   If sRGB ≤ 0.03928: linear = sRGB / 12.92
   Else: linear = ((sRGB + 0.055) / 1.055)^2.4
   ```

2. **Calculate relative luminance (Y):**
   ```
   Y = 0.2126 × R + 0.7152 × G + 0.0722 × B
   ```

3. **Apply APCA contrast formula:**
   ```
   Lc = sign(Yfg - Ybg) × (|Yfg - Ybg|)^0.37
   Scaled to approximate -108 to 108 range
   ```

### Color Conversion Examples

**Example 1: Black text on white background**
- Text: RGB(0, 0, 0) → Luminance ≈ 0
- Background: RGB(255, 255, 255) → Luminance ≈ 1.0
- APCA Lc ≈ 108 (Perfect - AAA)
- WCAG 2.0: 21:1 (AAA)

**Example 2: Gray text on white background**
- Text: RGB(128, 128, 128) → Luminance ≈ 0.216
- Background: RGB(255, 255, 255) → Luminance ≈ 1.0
- APCA Lc ≈ 57 (AA)
- WCAG 2.0: 4.6:1 (AA)

### Why APCA?

1. **Perceptual Accuracy**: Better reflects how humans actually perceive contrast
2. **Real-World Readability**: More applicable to various text sizes and contexts
3. **Future Standard**: Recommended direction for accessibility standards
4. **Better Guidance**: Provides more nuanced contrast evaluation

## Available Commands

```bash
npm run dev      # Development server with watch mode
npm run build    # Production build (generates dist/)
npm run preview  # Preview built extension locally
```

## File Descriptions

- **`src/content/index.js`** - Content script that scans the page and draws the heatmap overlay. Handles scroll events, rescans dynamically, and manages the canvas overlay.
- **`src/popup/App.jsx`** - React component for popup UI with language selector, theme selector, enable/disable toggle, and opacity controls with dark mode support
- **`src/utils/color.js`** - APCA (Advanced Perceptual Contrast Algorithm) implementation including color parsing, luminance calculation, and contrast level mapping
- **`src/utils/i18n.js`** - Internationalization and theme module for language detection, storage, theme detection, and translation utilities
- **`manifest.json`** - Extension configuration (Manifest V3) with i18n message placeholders
- **`_locales/en/messages.json`** - English translations for extension name and description
- **`_locales/zh/messages.json`** - Chinese translations for extension name and description
- **`vite.config.js`** - Vite bundler configuration with @crxjs/vite-plugin for extension building
- **`tailwind.config.js`** - Tailwind CSS customization with dark mode selector support
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
- Hidden elements (display: none) are skipped
- Canvas overlay may block text selection (due to absolute positioning)
- Language and theme selections are per-user, not per-page
- APCA calculation doesn't account for color blindness modes

## Improvements from Previous Versions

- **✨ APCA Algorithm**: Switched from WCAG 2.0 to APCA for more accurate, perception-based contrast evaluation
- **✨ Dark Mode Support**: Added light/dark theme switching with system preference detection
- **✨ Real-Time Rescanning**: Rescans and updates heatmap as you scroll
- **✨ Viewport-Only Marking**: Only highlights text visible in the current viewport
- **✨ Multi-Language Support**: English and Chinese with auto-detection
- **✨ Coordinate Accuracy**: Proper document-to-viewport coordinate conversion
- **✨ Better UI/UX**: Improved popup layout with unified settings controls

## Browser Support

- Chrome 88+
- Edge 88+ (Chromium-based)

## Version

v1.0.0 - APCA-based contrast scanning with multi-language & theme support

## Changelog

### v1.0.0
- ✨ **APCA Algorithm**: Replaced WCAG 2.0 with APCA for perception-based contrast evaluation
- ✨ **Dark Mode Support**: Added light/dark theme switching with system preference detection
- ✨ Real-time heatmap updating on scroll
- ✨ Viewport-only element detection
- ✨ Multi-language support (English / 中文)
- ✨ Improved coordinate accuracy
- ✨ Fixed canvas clearing and residual highlighting
- ✨ Debounced scroll events for better performance

## References

### APCA Documentation
- [WCAG 3 APCA Contrast](https://www.w3.org/WAI/WCAG3/0/#contrast) - Official W3C APCA specification
- [Accessible Colors Blog](https://www.accessible-colors.com/) - APCA tools and explanation
- [APCA GitHub](https://github.com/Myndex/APCA) - Open source APCA implementation

### Contrast Standards
- [WCAG 2.1 Contrast](https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html) - WCAG 2.0/2.1 contrast requirements
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/) - Popular contrast checking tool
- [Accessible Colors](https://accessible-colors.com/apca-contrast-calculator) - APCA calculator tool

## License

MIT
