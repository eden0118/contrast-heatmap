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
 * Full page height to capture all content
 */
function createCanvasOverlay() {
  if (canvas) return;

  canvas = document.createElement('canvas');
  canvas.id = 'contrast-heatmap-overlay';

  // Set canvas to cover the entire page, not just viewport
  const scrollHeight = Math.max(
    document.documentElement.scrollHeight,
    document.body.scrollHeight,
    window.innerHeight
  );
  const scrollWidth = Math.max(
    document.documentElement.scrollWidth,
    document.body.scrollWidth,
    window.innerWidth
  );

  canvas.width = scrollWidth;
  canvas.height = scrollHeight;

  Object.assign(canvas.style, {
    position: 'absolute',
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
 * Check if an element is visible in the viewport
 * @param {DOMRect} rect - The bounding rect of the element (in viewport coordinates)
 * @returns {boolean} True if visible in viewport
 */
function isElementInViewport(rect) {
  return (
    rect.top < window.innerHeight &&
    rect.bottom > 0 &&
    rect.left < window.innerWidth &&
    rect.right > 0
  );
}

/**
 * Scan DOM for text nodes and draw contrast issues on canvas
 * Only marks elements visible in the current viewport
 */
function scanForContrastIssues() {
  if (!canvas || !ctx) return;

  // Get current scroll position first
  const scrollX = window.scrollX || window.pageXOffset;
  const scrollY = window.scrollY || window.pageYOffset;

  // Update canvas size to match full document
  const scrollHeight = Math.max(
    document.documentElement.scrollHeight,
    document.body.scrollHeight,
    window.innerHeight
  );
  const scrollWidth = Math.max(
    document.documentElement.scrollWidth,
    document.body.scrollWidth,
    window.innerWidth
  );

  // Setting width/height resets the canvas (clears it)
  canvas.width = scrollWidth;
  canvas.height = scrollHeight;

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

        // Skip elements not in viewport
        if (!isElementInViewport(rect)) continue;

        // Convert viewport coordinates to document coordinates
        const docLeft = rect.left + scrollX;
        const docTop = rect.top + scrollY;

        // Create unique key for this rect to avoid duplicates
        const rectKey = `${Math.round(docLeft)}-${Math.round(docTop)}-${Math.round(rect.width)}-${Math.round(rect.height)}`;
        if (drawnRects.has(rectKey)) continue;
        drawnRects.add(rectKey);

        // Get colors
        const fgColor = parseColor(window.getComputedStyle(parentElement).color);
        const bgColor = getEffectiveBackgroundColor(parentElement);

        // Calculate contrast
        const ratio = calculateContrastRatio(fgColor, bgColor);
        const fontSize = getFontSize(parentElement);
        const level = getWCAGLevel(ratio, fontSize);

        // Draw on canvas using document coordinates
        const color = getHeatmapColor(level, opacity);
        ctx.fillStyle = color;
        ctx.fillRect(docLeft, docTop, rect.width, rect.height);
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

  // Add scroll listener to rescan when scrolling
  window.addEventListener('scroll', handleScroll, { passive: true });
}

/**
 * Handle scroll event - rescan when page scrolls
 */
let scrollTimeout;
function handleScroll() {
  clearTimeout(scrollTimeout);
  scrollTimeout = setTimeout(() => {
    if (isEnabled) {
      scanForContrastIssues();
    }
  }, 100); // Debounce scroll events
}

/**
 * Disable the heatmap overlay
 */
function disableHeatmap() {
  if (canvas) {
    canvas.style.display = 'none';
  }
  // Remove scroll listener when disabling
  window.removeEventListener('scroll', handleScroll);
  isEnabled = false;
}

/**
 * Handle window resize
 */
function handleResize() {
  if (canvas) {
    // Update canvas to match full document size
    const scrollHeight = Math.max(
      document.documentElement.scrollHeight,
      document.body.scrollHeight,
      window.innerHeight
    );
    const scrollWidth = Math.max(
      document.documentElement.scrollWidth,
      document.body.scrollWidth,
      window.innerWidth
    );

    canvas.width = scrollWidth;
    canvas.height = scrollHeight;

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
