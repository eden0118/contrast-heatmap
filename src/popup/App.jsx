import React, { useState, useEffect } from 'react';
import './App.css';
import { getCurrentLanguage, setLanguage, t, getCurrentTheme, setTheme } from '../utils/i18n.js';

export default function App() {
  const [isEnabled, setIsEnabled] = useState(false);
  const [opacity, setOpacity] = useState(0.3);
  const [loading, setLoading] = useState(true);
  const [language, setLanguageState] = useState('en');
  const [theme, setThemeState] = useState('light');

  // Load initial state from storage
  useEffect(() => {
    const loadSettings = async () => {
      const lang = await getCurrentLanguage();
      const themeMode = await getCurrentTheme();
      setLanguageState(lang);
      setThemeState(themeMode);

      chrome.storage.local.get(['enabled', 'opacity'], (result) => {
        if (result.enabled !== undefined) {
          setIsEnabled(result.enabled);
        }
        if (result.opacity !== undefined) {
          setOpacity(result.opacity);
        }
        setLoading(false);
      });
    };

    loadSettings();
  }, []);

  // Handle language change
  const handleLanguageChange = (e) => {
    const newLanguage = e.target.value;
    setLanguageState(newLanguage);
    setLanguage(newLanguage);
  };

  // Handle theme change
  const handleThemeChange = (e) => {
    const newTheme = e.target.value;
    setThemeState(newTheme);
    setTheme(newTheme);
  };

  // Handle toggle switch
  const handleToggle = (e) => {
    const newState = e.target.checked;
    setIsEnabled(newState);

    // Save to storage
    chrome.storage.local.set({ enabled: newState });

    // Send message to content script
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        const messageType = newState ? 'ENABLE_HEATMAP' : 'DISABLE_HEATMAP';
        chrome.tabs.sendMessage(tabs[0].id, { type: messageType }).catch(() => {
          // Silently handle if content script not yet loaded
        });
      }
    });
  };

  // Handle opacity change
  const handleOpacityChange = (e) => {
    const newOpacity = parseFloat(e.target.value);
    setOpacity(newOpacity);

    // Save to storage
    chrome.storage.local.set({ opacity: newOpacity });

    // Send message to content script
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        chrome.tabs.sendMessage(tabs[0].id, {
          type: 'UPDATE_OPACITY',
          opacity: newOpacity
        }).catch(() => {
          // Silently handle if content script not yet loaded
        });
      }
    });
  };

  if (loading) {
    return (
      <div className={`p-4 text-center ${theme === 'dark' ? 'dark' : ''}`}>
        <div className="text-gray-600 dark:text-gray-400">
          {t(language, 'loading')}
        </div>
      </div>
    );
  }

  return (
    <div className={`${theme === 'dark' ? 'dark' : ''}`}>
      <div className="w-80 p-6 bg-white dark:bg-gray-900 transition-colors">
        {/* Settings Header */}
        <div className="mb-4 flex items-center justify-between gap-2">
          {/* Language Selector */}
          <div className="flex items-center gap-1">
            <label className="text-xs text-gray-600 dark:text-gray-400">
              {t(language, 'language')}:
            </label>
            <select
              value={language}
              onChange={handleLanguageChange}
              className="text-xs px-2 py-1 border border-gray-300 dark:border-gray-600 rounded cursor-pointer bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            >
              <option value="en">English</option>
              <option value="zh">中文</option>
            </select>
          </div>

          {/* Theme Selector */}
          <div className="flex items-center gap-1">
            <label className="text-xs text-gray-600 dark:text-gray-400">
              {t(language, 'theme')}:
            </label>
            <select
              value={theme}
              onChange={handleThemeChange}
              className="text-xs px-2 py-1 border border-gray-300 dark:border-gray-600 rounded cursor-pointer bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            >
              <option value="light">{t(language, 'lightMode')}</option>
              <option value="dark">{t(language, 'darkMode')}</option>
            </select>
          </div>
        </div>

        <div className="mb-6">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            {t(language, 'title')}
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {t(language, 'description')}
          </p>
        </div>

        {/* Toggle Switch */}
        <div className="mb-6 flex items-center justify-between">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {t(language, 'enableScanner')}
          </label>
          <input
            type="checkbox"
            checked={isEnabled}
            onChange={handleToggle}
            className="w-5 h-5 accent-blue-500 cursor-pointer"
          />
        </div>

        {/* Opacity Slider */}
        <div className="mb-4">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
            {t(language, 'heatmapOpacity')}
          </label>
          <input
            type="range"
            min="0.1"
            max="0.8"
            step="0.1"
            value={opacity}
            onChange={handleOpacityChange}
            disabled={!isEnabled}
            className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            {Math.round(opacity * 100)}{t(language, 'opacityLabel')}
          </p>
        </div>

        {/* Legend */}
        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
            {t(language, 'colorGuide')}
          </h3>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded" style={{ backgroundColor: '#EF4444' }}></div>
              <span className="text-xs text-gray-700 dark:text-gray-300">{t(language, 'issuesLabel')}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded" style={{ backgroundColor: '#EAB308' }}></div>
              <span className="text-xs text-gray-700 dark:text-gray-300">{t(language, 'aaLabel')}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded" style={{ backgroundColor: '#3B82F6' }}></div>
              <span className="text-xs text-gray-700 dark:text-gray-300">{t(language, 'aaaLabel')}</span>
            </div>
          </div>
        </div>

        {/* Info */}
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-6 text-center">
          {t(language, 'footer')}
        </p>
      </div>
    </div>
  );
}
