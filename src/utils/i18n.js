/**
 * Internationalization (i18n) configuration
 * Supports Chinese and English
 */

export const translations = {
  en: {
    // Popup UI
    title: 'Contrast Heatmap',
    description: 'Scan the page for text contrast issues using APCA',
    enableScanner: 'Enable Scanner',
    heatmapOpacity: 'Heatmap Opacity',
    loading: 'Loading...',
    opacityLabel: '% opacity',

    // Color Guide
    colorGuide: 'Color Guide',
    issuesLabel: 'Fail - Lc < 30 (Insufficient)',
    aaLabel: 'AA - Lc 45-59 (Standard)',
    aaaLabel: 'AAA - Lc ≥ 60 (Enhanced)',

    // Footer
    footer: 'Scans visible text using APCA (Advanced Perceptual Contrast Algorithm)',

    // Language selector
    language: 'Language',

    // Theme selector
    theme: 'Theme',
    lightMode: 'Light',
    darkMode: 'Dark'
  },
  zh: {
    // Popup UI
    title: '對比度熱力圖',
    description: '使用 APCA 規範掃描網頁中的文字對比度問題',
    enableScanner: '啟用掃描器',
    heatmapOpacity: '熱力圖透明度',
    loading: '載入中...',
    opacityLabel: '% 透明度',

    // Color Guide
    colorGuide: '顏色說明',
    issuesLabel: '不符合 - Lc < 30 (不足)',
    aaLabel: 'AA - Lc 45-59 (標準)',
    aaaLabel: 'AAA - Lc ≥ 60 (增強)',

    // Footer
    footer: '使用 APCA (Advanced Perceptual Contrast Algorithm) 掃描可見文字',

    // Language selector
    language: '語言',

    // Theme selector
    theme: '主題',
    lightMode: '淺色',
    darkMode: '深色'
  }
};

/**
 * Get current language from storage or browser
 * @returns {Promise<string>} Language code ('en' or 'zh')
 */
export async function getCurrentLanguage() {
  return new Promise((resolve) => {
    chrome.storage.local.get(['language'], (result) => {
      if (result.language) {
        resolve(result.language);
      } else {
        // Detect browser language
        const browserLang = navigator.language.startsWith('zh') ? 'zh' : 'en';
        resolve(browserLang);
      }
    });
  });
}

/**
 * Set language preference
 * @param {string} language - Language code ('en' or 'zh')
 */
export function setLanguage(language) {
  chrome.storage.local.set({ language });
}

/**
 * Get current theme from storage or system preference
 * @returns {Promise<string>} Theme ('light' or 'dark')
 */
export async function getCurrentTheme() {
  return new Promise((resolve) => {
    chrome.storage.local.get(['theme'], (result) => {
      if (result.theme) {
        resolve(result.theme);
      } else {
        // Detect system theme preference
        const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        resolve(isDark ? 'dark' : 'light');
      }
    });
  });
}

/**
 * Set theme preference
 * @param {string} theme - Theme ('light' or 'dark')
 */
export function setTheme(theme) {
  chrome.storage.local.set({ theme });
}

/**
 * Get translation string
 * @param {string} language - Language code
 * @param {string} key - Translation key
 * @returns {string} Translated text
 */
export function t(language, key) {
  return translations[language]?.[key] || translations.en[key] || key;
}
