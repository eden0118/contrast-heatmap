/**
 * Internationalization (i18n) configuration
 * Supports Chinese and English
 */

export const translations = {
  en: {
    // Popup UI
    title: 'Contrast Heatmap',
    description: 'Scan the page for text contrast issues',
    enableScanner: 'Enable Scanner',
    heatmapOpacity: 'Heatmap Opacity',
    loading: 'Loading...',
    opacityLabel: '% opacity',

    // Color Guide
    colorGuide: 'Color Guide',
    issuesLabel: 'Issues - Needs work',
    aaLabel: 'Attention - AA standard',
    aaaLabel: 'AAA - Fully compliant',

    // Footer
    footer: 'Scans visible text for WCAG 2.0 contrast compliance',

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
    description: '掃描網頁中的文字對比度問題',
    enableScanner: '啟用掃描器',
    heatmapOpacity: '熱力圖透明度',
    loading: '載入中...',
    opacityLabel: '% 透明度',

    // Color Guide
    colorGuide: '顏色說明',
    issuesLabel: '有問題 - 需要修改',
    aaLabel: '需要注意 - AA 標準',
    aaaLabel: 'AAA - 完全合規',

    // Footer
    footer: '掃描頁面中的可見文字以檢查 WCAG 2.0 對比度合規性',

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
