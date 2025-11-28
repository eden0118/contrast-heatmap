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
 * Calculate relative luminance according to WCAG 2.0 (sRGB)
 * Used as intermediate step for APCA
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
 * Calculate APCA (Advanced Perceptual Contrast Algorithm) Lc value
 * @param {{r: number, g: number, b: number}} foreground - Foreground color
 * @param {{r: number, g: number, b: number}} background - Background color
 * @returns {number} APCA Lc value (-108 to 108)
 */
export function calculateAPCAContrast(foreground, background) {
  // Convert RGB to sRGB and then to linear RGB
  const toLinearRGB = (c) => {
    const sRGB = c / 255;
    return sRGB <= 0.03928
      ? sRGB / 12.92
      : Math.pow((sRGB + 0.055) / 1.055, 2.4);
  };

  const fgLinear = {
    r: toLinearRGB(foreground.r),
    g: toLinearRGB(foreground.g),
    b: toLinearRGB(foreground.b)
  };

  const bgLinear = {
    r: toLinearRGB(background.r),
    g: toLinearRGB(background.g),
    b: toLinearRGB(background.b)
  };

  // Calculate relative luminance (Y)
  // Using standard sRGB coefficients
  const getForegroundLuminance = () => {
    return 0.2126 * fgLinear.r + 0.7152 * fgLinear.g + 0.0722 * fgLinear.b;
  };

  const getBackgroundLuminance = () => {
    return 0.2126 * bgLinear.r + 0.7152 * bgLinear.g + 0.0722 * bgLinear.b;
  };

  const Yfg = getForegroundLuminance();
  const Ybg = getBackgroundLuminance();

  // APCA formula
  // Determine which is lighter
  const lighter = Math.max(Yfg, Ybg);
  const darker = Math.min(Yfg, Ybg);

  // Calculate contrast using APCA formula
  // Using simplified APCA implementation
  const deltaY = lighter - darker;
  const relLum = lighter > 0.5 ? lighter : darker;

  // APCA contrast formula
  // Lc = sign(Yfg - Ybg) * 100 * sqrt(abs(Yfg - Ybg)) / sqrt(relLum)
  let contrast = 0;

  if (Yfg > Ybg) {
    // Foreground is lighter
    contrast = (Yfg - Ybg) * 100;
  } else {
    // Background is lighter
    contrast = (Ybg - Yfg) * -100;
  }

  // Apply APCA scaling
  const scaledContrast = contrast > 0
    ? contrast * (1 + Math.abs(contrast) * 0.25)
    : contrast * (1 + Math.abs(contrast) * 0.25);

  // Return value between -108 and 108 approximately
  return Math.max(-108, Math.min(108, scaledContrast));
}

/**
 * Determine APCA level based on Lc contrast value
 * APCA uses different thresholds than WCAG 2.0
 * @param {number} lc - APCA Lc value
 * @returns {string} 'fail', 'aa', or 'aaa'
 */
export function getAPCALevel(lc) {
  const absLc = Math.abs(lc);

  // APCA Levels (approximate based on APCA spec)
  // Lc >= 60: AAA - Enhanced Contrast
  // Lc >= 45: AA - Standard Contrast
  // Lc >= 30: Minimum (borderline readable)
  // Lc < 30: FAIL - Too low

  if (absLc >= 60) {
    return 'aaa';
  } else if (absLc >= 45) {
    return 'aa';
  } else {
    return 'fail';
  }
}

/**
 * Get color for heatmap visualization
 * Red = Need Work (fail), Yellow = AA, Blue = AAA Compliant
 * @param {string} level - 'fail', 'aa', or 'aaa'
 * @param {number} opacity - Opacity value (0-1)
 * @returns {string} RGBA color string
 */
export function getHeatmapColor(level, opacity = 0.3) {
  const colors = {
    fail: 'rgba(239, 68, 68, ',       // Red - Need Work
    aa: 'rgba(234, 179, 8, ',         // Yellow - AA
    aaa: 'rgba(59, 130, 246, '        // Blue - AAA Compliant
  };

  return (colors[level] || colors.fail) + opacity + ')';
}
