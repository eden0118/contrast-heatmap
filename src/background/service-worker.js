/**
 * Background Service Worker for Contrast Heatmap Extension
 * Handles initialization and global events
 */

// Initialize extension on install
chrome.runtime.onInstalled.addListener(() => {
  // Set default storage values
  chrome.storage.local.get(['enabled', 'opacity'], (result) => {
    if (result.enabled === undefined) {
      chrome.storage.local.set({
        enabled: false,
        opacity: 0.3
      });
    }
  });
});

// Listen for any global messages if needed in the future
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  // Handle any global messages here
});
