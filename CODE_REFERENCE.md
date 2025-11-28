# Code Reference & Examples

## File Descriptions

### `manifest.json`
Manifest V3 configuration that defines:
- Extension permissions: `activeTab`, `scripting`, `storage`
- Popup UI entry point: `popup.html`
- Content script injection: `src/content/index.js`
- Service worker: `src/background/service-worker.js`
- Extension icons (16, 48, 128px)

### `vite.config.js`
```javascript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { crx } from '@crxjs/vite-plugin';
import manifest from './manifest.json';

export default defineConfig({
  plugins: [react(), crx({ manifest })],
  // ... build options
});
```
- Uses `@crxjs/vite-plugin` to handle Manifest V3
- Enables HMR for development
- Bundles popup, content script, and service worker separately

### `src/utils/color.js`
Core utility module with WCAG calculations:

#### `parseColor(colorString: string): {r, g, b}`
Converts color strings to RGB:
```javascript
parseColor('#FF0000')        // → { r: 255, g: 0, b: 0 }
parseColor('rgb(255, 0, 0)') // → { r: 255, g: 0, b: 0 }
```

#### `calculateLuminance({r, g, b}): number`
WCAG 2.0 relative luminance calculation:
```javascript
const white = { r: 255, g: 255, b: 255 };
calculateLuminance(white)  // → 1.0 (maximum)

const black = { r: 0, g: 0, b: 0 };
calculateLuminance(black)  // → 0.0 (minimum)
```

#### `calculateContrastRatio(foreground, background): number`
```javascript
const black = { r: 0, g: 0, b: 0 };
const white = { r: 255, g: 255, b: 255 };
calculateContrastRatio(black, white)  // → 21:1 (maximum)
```

#### `getWCAGLevel(ratio, size = 'normal'): 'fail' | 'aa' | 'aaa'`
```javascript
getWCAGLevel(3, 'normal')     // → 'fail' (needs 4.5 for normal)
getWCAGLevel(4.5, 'normal')   // → 'aa'
getWCAGLevel(7, 'normal')     // → 'aaa'
getWCAGLevel(3, 'large')      // → 'aa' (3:1 ok for large)
```

#### `getHeatmapColor(level, opacity = 0.3): string`
```javascript
getHeatmapColor('fail', 0.3)  // → 'rgba(59, 130, 246, 0.3)'
getHeatmapColor('aa', 0.3)    // → 'rgba(251, 146, 60, 0.3)'
getHeatmapColor('aaa', 0.3)   // → 'rgba(239, 68, 68, 0.3)'
```

---

### `src/content/index.js`
Content script that runs in page context:

#### `getEffectiveBackgroundColor(element): {r, g, b}`
Crucial recursive function that traverses up the DOM:
```javascript
// Example: <div style="background: transparent">
//            <span style="color: red">Text here</span>
//          </div>

// For the span, this will:
// 1. Check span's background → transparent, keep going
// 2. Check div's background → might be transparent, keep going
// 3. Check body's background → find actual color or default to white

const bgColor = getEffectiveBackgroundColor(spanElement);
```

#### `createCanvasOverlay()`
Sets up the overlay canvas:
- Position: `fixed`, top-left at `(0, 0)`
- Size: Full viewport (`innerWidth` × `innerHeight`)
- Z-index: `99999` (always on top)
- Pointer-events: `none` (doesn't block clicks)
- Initially hidden (`display: none`)

#### `scanForContrastIssues()`
Main scanning algorithm:
```javascript
// 1. Clear previous canvas
ctx.clearRect(0, 0, canvas.width, canvas.height);

// 2. Walk through all text nodes
const walker = document.createTreeWalker(
  document.body,
  NodeFilter.SHOW_TEXT,
  null,
  false
);

// 3. For each text node:
//    - Get bounding rectangle
//    - Extract foreground & background colors
//    - Calculate contrast ratio
//    - Determine WCAG level
//    - Draw colored rectangle

// 4. Draw on canvas with calculated opacity
ctx.fillStyle = getHeatmapColor(level, opacity);
ctx.fillRect(rect.left, rect.top, rect.width, rect.height);
```

#### Message Handling
```javascript
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  switch (message.type) {
    case 'ENABLE_HEATMAP':
      enableHeatmap();

    case 'DISABLE_HEATMAP':
      disableHeatmap();

    case 'UPDATE_OPACITY':
      opacity = message.opacity;
      scanForContrastIssues();

    case 'GET_STATUS':
      sendResponse({ isEnabled });
  }
});
```

---

### `src/popup/App.jsx`
React component for the extension popup:

#### State Management
```javascript
const [isEnabled, setIsEnabled] = useState(false);
const [opacity, setOpacity] = useState(0.3);
const [loading, setLoading] = useState(true);

// Load from chrome.storage.local on mount
useEffect(() => {
  chrome.storage.local.get(['enabled', 'opacity'], (result) => {
    if (result.enabled !== undefined) setIsEnabled(result.enabled);
    if (result.opacity !== undefined) setOpacity(result.opacity);
    setLoading(false);
  });
}, []);
```

#### Toggle Handler
```javascript
const handleToggle = (e) => {
  const newState = e.target.checked;
  setIsEnabled(newState);

  // 1. Save to storage
  chrome.storage.local.set({ enabled: newState });

  // 2. Message active tab
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, {
      type: newState ? 'ENABLE_HEATMAP' : 'DISABLE_HEATMAP'
    });
  });
};
```

#### Opacity Slider
```javascript
const handleOpacityChange = (e) => {
  const newOpacity = parseFloat(e.target.value);
  setOpacity(newOpacity);

  // 1. Save to storage
  chrome.storage.local.set({ opacity: newOpacity });

  // 2. Message active tab
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, {
      type: 'UPDATE_OPACITY',
      opacity: newOpacity
    });
  });
};
```

#### UI Elements (Tailwind)
- Toggle switch: Custom styled button with animation
- Opacity slider: HTML5 range input with Tailwind classes
- Legend: Color indicators for WCAG levels
- Responsive: Fixed width (w-80) popup

---

### `src/background/service-worker.js`
Service worker for extension initialization:

```javascript
chrome.runtime.onInstalled.addListener(() => {
  // Initialize storage on first install
  chrome.storage.local.get(['enabled', 'opacity'], (result) => {
    if (result.enabled === undefined) {
      chrome.storage.local.set({
        enabled: false,    // Off by default
        opacity: 0.3       // 30% opacity
      });
    }
  });
});
```

---

## Development Workflow

### 1. Local Development
```bash
npm install
npm run dev
```
Vite watches files and rebuilds. @crxjs/vite-plugin handles HMR.

### 2. Load in Chrome
1. Open `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked" → select the project root
4. Extension appears in toolbar

### 3. Testing
- **Popup UI**: Click extension icon
- **Content Script**: Open DevTools (F12) → Console
- **Service Worker**: `chrome://extensions/` → inspect

### 4. Build for Release
```bash
npm run build
```
Creates `dist/` folder ready for Chrome Web Store submission.

---

## Common Patterns

### Sending Message to Content Script
```javascript
chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
  chrome.tabs.sendMessage(tabs[0].id, {
    type: 'ENABLE_HEATMAP'
  }, (response) => {
    console.log(response);  // { status: 'enabled' }
  });
});
```

### Listening in Content Script
```javascript
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'ENABLE_HEATMAP') {
    enableHeatmap();
    sendResponse({ status: 'enabled' });
  }
});
```

### Persist User Preferences
```javascript
// Save
chrome.storage.local.set({ enabled: true, opacity: 0.5 });

// Load
chrome.storage.local.get(['enabled', 'opacity'], (result) => {
  console.log(result);  // { enabled: true, opacity: 0.5 }
});
```

---

## Performance Considerations

### DOM Scanning
- **TreeWalker**: Efficient method for traversing text nodes
- **Range API**: Gets accurate bounding boxes for text
- **Debouncing**: MutationObserver uses 500ms debounce

### Canvas Drawing
- **Memory**: Canvas cleared before each redraw
- **Opacity**: Done at color level, not canvas level
- **Z-Index**: 99999 ensures visibility without reflow

### Storage
- Minimal data: Only 2 values (enabled, opacity)
- Quick access: `chrome.storage.local` (no sync needed)

---

## Testing Checklist

- [ ] Extension loads in Chrome
- [ ] Popup UI appears when extension icon clicked
- [ ] Toggle switch enables/disables heatmap
- [ ] Opacity slider updates heatmap transparency
- [ ] State persists after page reload
- [ ] Canvas overlay appears on various websites
- [ ] Colors match WCAG levels (blue/orange/red)
- [ ] No JavaScript errors in console
- [ ] Performance acceptable (no jank)

---

## Useful Resources

- [Chrome Extension Docs](https://developer.chrome.com/docs/extensions/)
- [WCAG 2.0 Contrast](https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html)
- [Vite Documentation](https://vitejs.dev/)
- [@crxjs/vite-plugin](https://github.com/crxjs/chrome-extension-tools)
- [Chrome DevTools](https://developer.chrome.com/docs/devtools/)
