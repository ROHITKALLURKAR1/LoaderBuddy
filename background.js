// Function to check active downloads, adjust power state, and update the badge
function checkDownloads() {
  chrome.storage.local.get(['extensionEnabled'], (data) => {
    // If user turned the extension OFF in the popup, clear everything and reset power
    if (data.extensionEnabled === false) {
      chrome.power.releaseKeepAwake();
      chrome.action.setBadgeText({ text: "" }); // Clears the badge
      return;
    }

    chrome.downloads.search({ state: 'in_progress' }, (results) => {
      const activeCount = results.length;

      if (activeCount > 0) {
        // Keep the screen fully awake
        chrome.power.requestKeepAwake('display');
        
        // Update the badge with the count of active downloads
        chrome.action.setBadgeText({ text: activeCount.toString() });
        chrome.action.setBadgeBackgroundColor({ color: '#2563eb' }); // Premium blue color matching your UI
        console.log(`Downloads in progress: ${activeCount}. Screen kept awake.`);
      } else {
        // Return the screen power management to normal settings
        chrome.power.releaseKeepAwake();
        chrome.action.setBadgeText({ text: "" }); // Clears the badge when done
        console.log("No active downloads. Screen settings restored and badge cleared.");
      }
    });
  });
}

// Listen for download events
chrome.downloads.onCreated.addListener(checkDownloads);
chrome.downloads.onErased.addListener(checkDownloads);

// Listen for download changes (updates, pauses, completions)
chrome.downloads.onChanged.addListener((delta) => {
  checkDownloads();

  // Trigger a desktop notification if a download successfully finishes
  if (delta.state && delta.state.current === 'complete') {
    chrome.downloads.search({ id: delta.id }, (results) => {
      if (results && results.length > 0) {
        const filename = results.filename.split('\\').pop().split('/').pop();
        
        chrome.notifications.create({
          type: 'basic',
          iconUrl: 'icon.png', // Uses your custom PNG icon
          title: 'Download Complete!',
          message: `"${filename}" has finished downloading. Your screen can now safely sleep.`,
          priority: 2
        });
      }
    });
  }
});

// Watch for changes when the user toggles the switch in the popup UI
chrome.storage.onChanged.addListener((changes) => {
  if (changes.extensionEnabled) {
    checkDownloads();
  }
});
