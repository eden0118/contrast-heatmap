/**
 * Parse color string (HEX, RGB, RGBA) to RGB object
 * @param {string} colorString - Color string (hex, rgb, or rgba)
 * @returns {{r: number, g: number, b: number}} RGB object with values 0-255
 */
export function parseColor(colorString) {
  const color = colorString.trim().toLowerCase();

  // Handle hex colors (#RGB, #RRGGBB)
  if (color.startsWith('#')) {
    return parseHex(color);
  }

  // Handle rgb/rgba
  if (color.startsWith('rgb')) {
    return parseRgb(color);
  }

  // Default to transparent (return white as fallback)
  return { r: 255, g: 255, b: 255 };
}

/**
 * Parse hex color string
 * @param {string} hex - Hex color (#RGB or #RRGGBB)
 * @returns {{r: number, g: number, b: number}}
 */
function parseHex(hex) {
  let h = hex.replace('#', '');

  // Handle short hex (#RGB)
  if (h.length === 3) {
    h = h
      .split('')
      .map(x => x + x)
      .join('');
  }

  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);

  return { r, g, b };
}

/**
 * Parse RGB/RGBA color string
 * @param {string} rgb - RGB/RGBA color string
 * @returns {{r: number, g: number, b: number}}
 */
function parseRgb(rgb) {
  const match = rgb.match(/\d+/g);
  if (!match || match.length < 3) {
    return { r: 255, g: 255, b: 255 };
  }

  return {
    r: parseInt(match[0], 10),
    g: parseInt(match[1], 10),
    b: parseInt(match[2], 10)
  };
}

/**
 * Calculate relative luminance according to WCAG 2.0
 * @param {{r: number, g: number, b: number}} rgb - RGB color object
 * @returns {number} Luminance value (0-1)
 */
export function calculateLuminance(rgb) {
  const [r, g, b] = [rgb.r / 255, rgb.g / 255, rgb.b / 255];

  const [rs, gs, bs] = [r, g, b].map(c => {
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });

  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

/**
 * Calculate WCAG 2.0 contrast ratio
 * @param {{r: number, g: number, b: number}} foreground - Foreground color
 * @param {{r: number, g: number, b: number}} background - Background color
 * @returns {number} Contrast ratio (1-21)
 */
export function calculateContrastRatio(foreground, background) {
  const lum1 = calculateLuminance(foreground);
  const lum2 = calculateLuminance(background);

  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);

  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Determine WCAG level based on contrast ratio
 * @param {number} ratio - Contrast ratio
 * @param {string} size - 'large' (18pt+) or 'normal' (default)
 * @returns {string} 'fail', 'aa', or 'aaa'
 */
export function getWCAGLevel(ratio, size = 'normal') {
  if (size === 'large') {
    if (ratio >= 3) return 'aaa';
    if (ratio >= 3) return 'aa';
  } else {
    if (ratio >= 7) return 'aaa';
    if (ratio >= 4.5) return 'aa';
  }
  return 'fail';
}

/**
 * Get color for heatmap visualization
 * Red = Issues, Yellow = Needs Attention, Blue = AAA Compliant
 * @param {string} level - 'fail', 'aa', or 'aaa'
 * @param {number} opacity - Opacity value (0-1)
 * @returns {string} RGBA color string
 */
export function getHeatmapColor(level, opacity = 0.3) {
  const colors = {
    fail: 'rgba(239, 68, 68, ',       // Red - Issues
    aa: 'rgba(234, 179, 8, ',         // Yellow - Needs Attention
    aaa: 'rgba(59, 130, 246, '        // Blue - AAA Compliant
  };

  return (colors[level] || colors.fail) + opacity + ')';
}
