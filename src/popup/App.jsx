import React, { useState, useEffect } from 'react';
import './App.css';

export default function App() {
  const [isEnabled, setIsEnabled] = useState(false);
  const [opacity, setOpacity] = useState(0.3);
  const [loading, setLoading] = useState(true);

  // Load initial state from storage
  useEffect(() => {
    chrome.storage.local.get(['enabled', 'opacity'], (result) => {
      if (result.enabled !== undefined) {
        setIsEnabled(result.enabled);
      }
      if (result.opacity !== undefined) {
        setOpacity(result.opacity);
      }
      setLoading(false);
    });
  }, []);

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
      <div className="p-4 text-center text-gray-600">
        Loading...
      </div>
    );
  }

  return (
    <div className="w-80 p-6 bg-white">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900 mb-2">
          Contrast Heatmap
        </h1>
        <p className="text-sm text-gray-600">
          Scan the page for text contrast issues
        </p>
      </div>

      {/* Toggle Switch */}
      <div className="mb-6 flex items-center justify-between">
        <label className="text-sm font-medium text-gray-700">
          Enable Scanner
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
        <label className="text-sm font-medium text-gray-700 mb-2 block">
          Heatmap Opacity
        </label>
        <input
          type="range"
          min="0.1"
          max="0.8"
          step="0.1"
          value={opacity}
          onChange={handleOpacityChange}
          disabled={!isEnabled}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
        />
        <p className="text-xs text-gray-500 mt-2">
          {Math.round(opacity * 100)}% opacity
        </p>
      </div>

      {/* Legend */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">
          WCAG Levels
        </h3>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded" style={{ backgroundColor: '#3B82F6' }}></div>
            <span className="text-xs text-gray-700">Fail (Ratio &lt; 4.5:1)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded" style={{ backgroundColor: '#FB923C' }}></div>
            <span className="text-xs text-gray-700">AA (4.5:1 - 6.9:1)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded" style={{ backgroundColor: '#EF4444' }}></div>
            <span className="text-xs text-gray-700">AAA (7:1+)</span>
          </div>
        </div>
      </div>

      {/* Info */}
      <p className="text-xs text-gray-500 mt-6 text-center">
        Scans visible text for WCAG 2.0 contrast compliance
      </p>
    </div>
  );
}
