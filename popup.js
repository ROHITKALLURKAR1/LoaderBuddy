document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.getElementById('toggleStatus');

  // Load the current saved setting (defaults to true/enabled)
  chrome.storage.local.get({ extensionEnabled: true }, (data) => {
    toggle.checked = data.extensionEnabled;
  });

  // Save the new setting whenever the user clicks the toggle switch
  toggle.addEventListener('change', () => {
    chrome.storage.local.set({ extensionEnabled: toggle.checked });
  });
});
