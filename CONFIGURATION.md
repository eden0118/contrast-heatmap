# Configuration Reference

## manifest.json - Complete Structure

```json
{
  "manifest_version": 3,
  "name": "Contrast Heatmap",
  "version": "1.0.0",
  "description": "Scan webpages for text contrast issues and overlay a heatmap visualization",

  "permissions": [
    "activeTab",      // Required to detect current tab
    "scripting",      // Required to inject content script
    "storage"         // Required to save user preferences
  ],

  "icons": {
    "16": "/icons/icon-16.png",    // Small icon
    "48": "/icons/icon-48.png",    // Medium icon
    "128": "/icons/icon-128.png"   // Large icon (Chrome Web Store)
  },

  "action": {
    "default_popup": "/popup/popup.html",  // Popup when clicking extension
    "default_title": "Contrast Heatmap"    // Tooltip text
  },

  "content_scripts": [
    {
      "matches": ["<all_urls>"],           // Run on all websites
      "js": ["/src/content/index.js"],     // Content script file
      "all_frames": false,                 // Only main frame (not iframes)
      "run_at": "document_end"             // Wait until DOM ready
    }
  ],

  "background": {
    "service_worker": "/src/background/service-worker.js"  // Service worker
  }
}
```

### Permission Explanations

| Permission | Purpose | Why Needed |
|-----------|---------|-----------|
| `activeTab` | Detect which tab is active | Know where to inject content script |
| `scripting` | Inject content scripts | Run scanner on webpage |
| `storage` | Use chrome.storage.local | Save toggle & opacity settings |

---

## vite.config.js - Build Configuration

```javascript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';           // React JSX support
import { crx } from '@crxjs/vite-plugin';           // Chrome Extension plugin
import manifest from './manifest.json';

export default defineConfig({
  plugins: [
    react(),                                         // Transform JSX
    crx({ manifest })                                // Handle Manifest V3
  ],

  build: {
    outDir: 'dist',                                  // Output directory
    rollupOptions: {
      output: {
        chunkFileNames: 'chunks/[name]-[hash].js'    // Code split naming
      }
    }
  }
});
```

### Key Features
- **@crxjs/vite-plugin**: Automatically bundles manifest.json, handles code splitting
- **React Plugin**: Transforms JSX to React.createElement
- **HMR Ready**: Dev mode with hot reloading

---

## tailwind.config.js - Styling Configuration

```javascript
export default {
  content: [
    './src/**/*.{js,jsx}'  // Scan these files for Tailwind classes
  ],

  theme: {
    extend: {
      colors: {
        'fail': '#3B82F6',     // Blue - Fail
        'aa': '#FB923C',       // Orange - AA Level
        'aaa': '#EF4444'       // Red - AAA Level
      }
    }
  },

  plugins: []
};
```

### Custom Colors
- Used in popup UI for legend
- Match canvas heatmap colors
- Can be extended with more utilities

---

## postcss.config.js - CSS Processing

```javascript
export default {
  plugins: {
    tailwindcss: {},   // Tailwind CSS plugin
    autoprefixer: {}   // Add vendor prefixes (e.g., -webkit-)
  }
};
```

### Processing Pipeline
```
CSS with Tailwind @directives
    ↓
Tailwind (generate utilities)
    ↓
Autoprefixer (add -webkit-, -moz-, etc.)
    ↓
Final optimized CSS
```

---

## package.json - Dependencies

### Scripts

| Script | Purpose | Usage |
|--------|---------|-------|
| `npm run dev` | Start Vite dev server with HMR | Development |
| `npm run build` | Build for production | Before loading in Chrome |
| `npm run preview` | Preview production build | Testing |
| `npm run lint` | Run ESLint | Code quality |

### Dev Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| `@crxjs/vite-plugin` | ^2.0.0 | Chrome Extension Manifest V3 support |
| `@vitejs/plugin-react` | ^4.2.1 | React JSX transformation |
| `vite` | ^5.0.8 | Build tool |
| `tailwindcss` | ^3.4.1 | CSS utility framework |
| `postcss` | ^8.4.32 | CSS plugin processor |
| `autoprefixer` | ^10.4.17 | Vendor prefix generator |

### Runtime Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| `react` | ^18.2.0 | UI framework (popup only) |
| `react-dom` | ^18.2.0 | React DOM rendering |

---

## Environment Setup

### Node.js Version
- **Minimum**: Node 16+
- **Recommended**: Node 18+
- **Check**: `node --version`

### npm Version
- **Minimum**: npm 8+
- **Check**: `npm --version`

### Install Node
- **macOS**: `brew install node`
- **Linux**: `apt-get install nodejs npm`
- **Windows**: Download from nodejs.org

---

## Chrome Extension API Usage

### chrome.runtime.onMessage
Listen for messages from popup:
```javascript
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'ENABLE_HEATMAP') {
    // Handle message
  }
  sendResponse({ status: 'ok' });
});
```

### chrome.tabs.sendMessage
Send message to content script:
```javascript
chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
  chrome.tabs.sendMessage(tabs[0].id, { type: 'ENABLE_HEATMAP' });
});
```

### chrome.storage.local
Persistent storage (key-value):
```javascript
// Save
chrome.storage.local.set({ enabled: true, opacity: 0.3 });

// Load
chrome.storage.local.get(['enabled', 'opacity'], (result) => {
  console.log(result);
});

// Clear
chrome.storage.local.clear();
```

---

## Build Output Structure

After `npm run build`, the `dist/` folder contains:

```
dist/
├── manifest.json                  # Extension manifest
├── popup/
│   └── popup.html                # Popup HTML (served at /popup/popup.html)
├── src/
│   ├── content/
│   │   └── index.js              # Content script (injected into pages)
│   └── background/
│       └── service-worker.js      # Service worker
├── assets/
│   ├── index-[hash].js           # Popup JavaScript chunk
│   ├── index-[hash].css          # Tailwind CSS
│   └── ...                        # Other chunks
```

### Code Splitting
- @crxjs automatically splits code
- Each entry point (popup, content, service worker) is separate
- Chunks shared between entries are deduplicated

---

## File Size Optimization

### Before Build
```
src/popup/App.jsx          ~5 KB
src/content/index.js       ~12 KB
src/utils/color.js         ~4 KB
node_modules/              ~500+ MB (not bundled)
```

### After Build (dist/)
```
popup HTML                 ~0.5 KB
JavaScript chunks          ~50 KB (minified + gzipped)
CSS                        ~20 KB (minified + gzipped)
Total extension size       ~70 KB
```

---

## Development Tips

### Enable Source Maps
Add to vite.config.js:
```javascript
build: {
  sourcemap: true  // Include source maps for debugging
}
```

### Faster Builds
```javascript
build: {
  target: 'ES2020',  // Skip unnecessary transpilation
  minify: 'esbuild'  // Faster minification
}
```

### Watch Mode (instead of dev server)
```bash
npm run build -- --watch
```

---

## Extension Permissions Reference

### Full Permission List (for future use)

| Permission | Use Case |
|-----------|----------|
| `activeTab` | Detect active tab |
| `scripting` | Inject content scripts |
| `storage` | Persistent data storage |
| `clipboardWrite` | Copy to clipboard |
| `clipboardRead` | Paste from clipboard |
| `notifications` | Show desktop notifications |
| `tabs` | Access tab information |

---

## Chrome Web Store Requirements

When publishing, you'll need:
- **Icons**: 128x128 PNG (for Web Store)
- **Screenshots**: 1280x800 or 640x400 PNG
- **Description**: 4000 char max
- **Privacy Policy**: Required if collecting user data
- **License**: MIT, Apache, GPL, etc.

---

## Development Checklist

- [ ] `npm install` dependencies
- [ ] `npm run build` compiles successfully
- [ ] `chrome://extensions/` loads extension
- [ ] Popup UI opens and is functional
- [ ] Toggle switch works
- [ ] Opacity slider works
- [ ] Canvas overlay appears on websites
- [ ] Colors are correct (blue/orange/red)
- [ ] State persists after reload
- [ ] No console errors
- [ ] Performance is acceptable

---

## Common Configuration Issues

### Q: Extension doesn't load in Chrome
**A**: Check manifest.json syntax with `npm run build`

### Q: Content script not injecting
**A**: Verify `matches: ["<all_urls>"]` in manifest.json

### Q: Popup UI broken
**A**: Check that `popup.html` links are correct

### Q: Tailwind classes not working
**A**: Ensure `tailwind.config.js` content path is correct

### Q: HMR not working in dev mode
**A**: @crxjs should handle it automatically. Reload extension if stuck.

---

**Reference**: [Chrome Extension Manifest V3](https://developer.chrome.com/docs/extensions/mv3/)
