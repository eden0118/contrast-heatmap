import {
  parseColor,
  calculateContrastRatio,
  getWCAGLevel,
  getHeatmapColor
} from '../utils/color.js';

let isEnabled = false;
let canvas = null;
let ctx = null;
let opacity = 0.3;

/**
 * Recursively get the effective background color of an element
 * Traverses up the DOM tree if the background is transparent
 * @param {Element} element - DOM element to check
 * @returns {{r: number, g: number, b: number}} RGB color object
 */
function getEffectiveBackgroundColor(element) {
  let currentElement = element;

  while (currentElement && currentElement !== document.documentElement) {
    const computedStyle = window.getComputedStyle(currentElement);
    const backgroundColor = computedStyle.backgroundColor;

    // Check if background is not transparent
    if (backgroundColor && backgroundColor !== 'rgba(0, 0, 0, 0)' && backgroundColor !== 'transparent') {
      return parseColor(backgroundColor);
    }

    currentElement = currentElement.parentElement;
  }

  // Default to white if no opaque background found
  return { r: 255, g: 255, b: 255 };
}

/**
 * Create and inject the canvas overlay
 */
function createCanvasOverlay() {
  if (canvas) return;

  canvas = document.createElement('canvas');
  canvas.id = 'contrast-heatmap-overlay';
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  Object.assign(canvas.style, {
    position: 'fixed',
    top: '0',
    left: '0',
    zIndex: '99999',
    pointerEvents: 'none',
    display: 'none'
  });

  document.body.appendChild(canvas);
  ctx = canvas.getContext('2d');
}

/**
 * Get font size in points (18pt = 14px approximately)
 * @param {Element} element - DOM element
 * @returns {string} 'large' or 'normal'
 */
function getFontSize(element) {
  const computedStyle = window.getComputedStyle(element);
  const fontSize = parseFloat(computedStyle.fontSize);
  // 18pt ≈ 24px
  return fontSize >= 24 ? 'large' : 'normal';
}

/**
 * Scan DOM for text nodes and draw contrast issues on canvas
 */
function scanForContrastIssues() {
  if (!canvas || !ctx) return;

  // Clear previous drawings
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Create tree walker to find text nodes
  const walker = document.createTreeWalker(
    document.body,
    NodeFilter.SHOW_TEXT,
    null,
    false
  );

  let textNode;
  const drawnRects = new Set();

  while ((textNode = walker.nextNode())) {
    // Skip empty or whitespace-only nodes
    if (!textNode.textContent.trim()) continue;

    const parentElement = textNode.parentElement;
    if (!parentElement) continue;

    // Skip hidden elements
    if (window.getComputedStyle(parentElement).display === 'none') continue;

    const range = document.createRange();
    range.selectNodeContents(textNode);

    try {
      const rects = range.getClientRects();

      for (const rect of rects) {
        if (rect.width === 0 || rect.height === 0) continue;

        // Create unique key for this rect to avoid duplicates
        const rectKey = `${Math.round(rect.left)}-${Math.round(rect.top)}-${Math.round(rect.width)}-${Math.round(rect.height)}`;
        if (drawnRects.has(rectKey)) continue;
        drawnRects.add(rectKey);

        // Get colors
        const fgColor = parseColor(window.getComputedStyle(parentElement).color);
        const bgColor = getEffectiveBackgroundColor(parentElement);

        // Calculate contrast
        const ratio = calculateContrastRatio(fgColor, bgColor);
        const fontSize = getFontSize(parentElement);
        const level = getWCAGLevel(ratio, fontSize);

        // Draw on canvas
        const color = getHeatmapColor(level, opacity);
        ctx.fillStyle = color;
        ctx.fillRect(rect.left, rect.top, rect.width, rect.height);
      }
    } catch (e) {
      // Skip ranges that can't be measured
      continue;
    }
  }
}

/**
 * Enable the heatmap overlay
 */
function enableHeatmap() {
  if (!canvas) {
    createCanvasOverlay();
  }
  canvas.style.display = 'block';
  scanForContrastIssues();
  isEnabled = true;
}

/**
 * Disable the heatmap overlay
 */
function disableHeatmap() {
  if (canvas) {
    canvas.style.display = 'none';
  }
  isEnabled = false;
}

/**
 * Handle window resize
 */
function handleResize() {
  if (canvas) {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    if (isEnabled) {
      scanForContrastIssues();
    }
  }
}

/**
 * Listen for messages from the popup
 */
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'ENABLE_HEATMAP') {
    enableHeatmap();
    sendResponse({ status: 'enabled' });
  } else if (message.type === 'DISABLE_HEATMAP') {
    disableHeatmap();
    sendResponse({ status: 'disabled' });
  } else if (message.type === 'UPDATE_OPACITY') {
    opacity = message.opacity;
    if (isEnabled) {
      scanForContrastIssues();
    }
    sendResponse({ status: 'updated' });
  } else if (message.type === 'GET_STATUS') {
    sendResponse({ isEnabled });
  }
});

// Initialize canvas on page load
createCanvasOverlay();

// Handle window resize
window.addEventListener('resize', handleResize, { passive: true });

// Re-scan on DOM changes (with debouncing)
let rescanTimeout;
const observer = new MutationObserver(() => {
  clearTimeout(rescanTimeout);
  rescanTimeout = setTimeout(() => {
    if (isEnabled) {
      scanForContrastIssues();
    }
  }, 500);
});

observer.observe(document.body, {
  childList: true,
  subtree: true,
  characterData: false
});

// Request current state from storage
chrome.storage.local.get(['enabled', 'opacity'], (result) => {
  if (result.enabled) {
    enableHeatmap();
  }
  if (result.opacity !== undefined) {
    opacity = result.opacity;
  }
});
