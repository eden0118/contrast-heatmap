# Contrast Heatmap - Installation & Quick Start

## ⚡ Quick Start (3 Steps)

### 1️⃣ Install Dependencies
```bash
cd /Users/eden/Code/contrast-heatmap
npm install
```

### 2️⃣ Build the Extension
```bash
npm run build
```

This creates the `dist/` folder with the compiled extension.

### 3️⃣ Load into Chrome

1. Open `chrome://extensions/`
2. Toggle **Developer mode** (top-right)
3. Click **Load unpacked**
4. Select the `dist/` folder
5. Extension appears in your toolbar! 🎉

---

## 🔧 Development Mode

For live development with HMR:

```bash
npm run dev
```

This starts Vite in watch mode. Changes to files automatically reload in Chrome.

---

## 📁 What Was Created

### Configuration Files
- `manifest.json` - Manifest V3 extension config
- `vite.config.js` - Vite + @crxjs/vite-plugin setup
- `tailwind.config.js` - Tailwind CSS configuration
- `postcss.config.js` - PostCSS for Tailwind
- `package.json` - Dependencies and scripts

### Source Code
```
src/
├── content/index.js          # DOM scanner & canvas overlay
├── popup/
│   ├── App.jsx               # React popup UI
│   ├── App.css               # Tailwind styles
│   ├── main.jsx              # React entry point
│   └── popup.html            # HTML template
├── background/service-worker.js  # Service worker
└── utils/color.js            # WCAG calculations
```

### Documentation
- `README.md` - Project overview
- `SETUP.md` - Detailed setup guide
- `CODE_REFERENCE.md` - Function reference & examples
- `PROJECT_STRUCTURE.md` - Visual file structure
- This file! 📄

---

## 🎨 Features Included

✅ **Manifest V3 Compliant**
- activeTab, scripting, storage permissions
- Content script & service worker

✅ **React Popup UI**
- Toggle switch to enable/disable
- Opacity slider (0.1 - 0.8)
- WCAG level legend
- State persistence with chrome.storage.local

✅ **High-Performance Content Script**
- DOM TreeWalker for efficient text scanning
- Recursive background color detection
- Full-screen canvas overlay (z-index: 99999)
- MutationObserver for dynamic content
- Window resize handler

✅ **WCAG 2.0 Contrast Calculation**
- Luminance calculation per spec
- Contrast ratio computation
- AA/AAA level determination
- Large text support (18pt+)

✅ **Visual Heatmap**
- 🔵 Blue: Fail (< 4.5:1)
- 🟠 Orange: AA (4.5:1 - 6.9:1)
- 🔴 Red: AAA (7:1+)
- Adjustable opacity

✅ **Tailwind CSS**
- Full utility class support
- PostCSS integration
- Custom color palette

✅ **Vite Build Tool**
- Lightning-fast dev server
- HMR for hot reloading
- @crxjs/vite-plugin for Manifest V3

---

## 🚀 Next Steps

### Add Icons (Optional)
Create these image files and place in `public/icons/`:
- `icon-16.png` (16×16)
- `icon-48.png` (48×48)
- `icon-128.png` (128×128)

They'll be bundled in `dist/` automatically.

### Customize Popup UI
Edit `src/popup/App.jsx` to:
- Add more settings
- Change layout/styling
- Add export functionality

### Extend Content Script
Edit `src/content/index.js` to:
- Filter specific elements
- Export contrast reports
- Add more visualization options

### Deploy to Chrome Web Store
1. Test thoroughly
2. Run `npm run build`
3. Create developer account at [Chrome Web Store](https://chrome.google.com/webstore)
4. Submit the `dist/` folder

---

## 📊 How It Works

### Scanning Flow
1. **TreeWalk**: Traverse DOM text nodes
2. **Extract Colors**: Foreground & background
3. **Calculate**: WCAG luminance & contrast ratio
4. **Draw**: Colored rectangle on canvas
5. **Display**: Overlay on webpage

### State Flow
```
Popup UI (React)
    ↓
chrome.storage.local
    ↓
chrome.runtime.sendMessage
    ↓
Content Script (index.js)
    ↓
Canvas Overlay (visual feedback)
```

---

## 🐛 Troubleshooting

### Extension Not Loading?
```bash
npm run build  # Rebuild
# Reload extension in chrome://extensions/
```

### Heatmap Not Showing?
1. Open DevTools (F12) on the webpage
2. Check Console for errors
3. Verify content script is running:
   ```javascript
   console.log('Content script loaded');
   ```

### Canvas Overlay Issues?
- Check z-index (should be 99999)
- Verify pointer-events: none (doesn't block clicks)
- Test opacity slider in popup

### Colors Wrong?
- Edit color values in `src/utils/color.js`
- Or in `tailwind.config.js`

---

## 📚 Documentation Files

| File | Purpose |
|------|---------|
| `README.md` | Project overview & features |
| `SETUP.md` | Detailed development guide |
| `CODE_REFERENCE.md` | Function reference & examples |
| `PROJECT_STRUCTURE.md` | Visual file structure |
| `QUICKSTART.md` | This file! |

---

## 💡 Tips & Tricks

### View Popup Console
- Right-click extension popup
- Select "Inspect"
- Opens DevTools for popup UI

### View Content Script Console
- Open webpage DevTools (F12)
- Check Console tab
- Content script logs appear here

### View Service Worker Logs
- Go to `chrome://extensions/`
- Find "Contrast Heatmap"
- Click "Details"
- Under "Inspect views" click on service worker

### Clear Storage (Reset Settings)
```javascript
// In any console
chrome.storage.local.clear();
```

### Test on Local Websites
Run a local server:
```bash
python3 -m http.server 8000
```
Visit `http://localhost:8000` to test the extension.

---

## 📞 Getting Help

- **Chrome Extension Docs**: https://developer.chrome.com/docs/extensions/
- **WCAG 2.0 Reference**: https://www.w3.org/WAI/WCAG21/
- **Vite Docs**: https://vitejs.dev/
- **React Docs**: https://react.dev/

---

## ✨ You're All Set!

Your Contrast Heatmap extension is ready to use. Start with:

```bash
npm run dev
```

Then load the extension in Chrome and start scanning for contrast issues! 🎉

---

**Happy coding!** 🚀
