contrast-heatmap/
│
├── 📄 manifest.json (Manifest V3 configuration)
├── 📄 package.json (Dependencies & scripts)
├── 📄 vite.config.js (Vite + @crxjs/vite-plugin)
├── 📄 tailwind.config.js (Tailwind CSS config)
├── 📄 postcss.config.js (PostCSS for Tailwind)
├── 📄 tsconfig.json (TypeScript config for IDE support)
├── 📄 tsconfig.node.json (Build tool TypeScript config)
├── 📄 .gitignore (Git ignore rules)
├── 📄 README.md (Project documentation)
├── 📄 SETUP.md (Development guide)
│
├── 📁 src/ (Source code)
│   │
│   ├── 📁 popup/ (React popup UI)
│   │   ├── 📄 App.jsx (Main React component)
│   │   ├── 📄 App.css (Tailwind CSS import + base styles)
│   │   ├── 📄 main.jsx (React entry point)
│   │   └── 📄 popup.html (HTML template)
│   │
│   ├── 📁 content/ (Content script)
│   │   └── 📄 index.js (DOM scanner & canvas overlay)
│   │       ├── getEffectiveBackgroundColor(element)
│   │       ├── createCanvasOverlay()
│   │       ├── scanForContrastIssues()
│   │       ├── enableHeatmap() / disableHeatmap()
│   │       └── Message listeners (ENABLE, DISABLE, UPDATE_OPACITY)
│   │
│   ├── 📁 background/ (Service worker)
│   │   └── 📄 service-worker.js (Initialization & global events)
│   │
│   └── 📁 utils/ (Utility functions)
│       └── 📄 color.js (WCAG calculations)
│           ├── parseColor(colorString) → {r, g, b}
│           ├── calculateLuminance({r, g, b}) → number
│           ├── calculateContrastRatio(fg, bg) → number
│           ├── getWCAGLevel(ratio, size) → 'fail' | 'aa' | 'aaa'
│           └── getHeatmapColor(level, opacity) → 'rgba(...)'
│
├── 📁 public/ (Static assets)
│   └── 📁 icons/ (Extension icons - add later)
│       ├── icon-16.png
│       ├── icon-48.png
│       └── icon-128.png
│
└── 📁 dist/ (Build output - created by: npm run build)
    ├── manifest.json
    ├── popup/
    ├── src/
    └── [bundled chunks & assets]


═══════════════════════════════════════════════════════════════════════════════

KEY FEATURES:

✅ Manifest V3 compliant
✅ @crxjs/vite-plugin for HMR & bundling
✅ React 18 for popup UI
✅ Tailwind CSS for styling
✅ Standalone content script (no React overhead)
✅ WCAG 2.0 contrast calculation
✅ Canvas overlay with heatmap colors
✅ DOM TreeWalker for efficient scanning
✅ Recursive background color detection
✅ MutationObserver for dynamic content
✅ chrome.storage.local persistence
✅ Message passing for popup ↔ content sync

═══════════════════════════════════════════════════════════════════════════════

HEATMAP COLOR SCHEME:

🔵 Blue (#3B82F6)     = FAIL (Contrast < 4.5:1)
🟠 Orange (#FB923C)   = AA   (Contrast 4.5:1 - 6.9:1)
🔴 Red (#EF4444)      = AAA  (Contrast 7:1+)

═══════════════════════════════════════════════════════════════════════════════

DEVELOPMENT COMMANDS:

npm install             # Install dependencies
npm run dev             # Start Vite dev server with HMR
npm run build           # Build for production (creates dist/)
npm run preview         # Preview production build
npm run lint            # Run ESLint (if configured)

═══════════════════════════════════════════════════════════════════════════════
