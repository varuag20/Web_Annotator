// Listens for keyboard commands registered in the manifest
chrome.commands.onCommand.addListener(command => {
  // If the "highlight_text" command is triggered
  if (command === "highlight_text") {
    // Query for the active tab
    chrome.tabs.query({ active: true }, tab => {
      // Execute the script to highlight text on the active tab
      chrome.tabs.executeScript(tab.id, { file: "injection_script.js" }, _ => {
        // Check for errors during script injection
        let e = chrome.runtime.lastError;
        if (e !== undefined) {
          console.log(tabId, _, e);
        }
      });
      // Execute the script to handle comments on the active tab
      chrome.tabs.executeScript(tab.id, { file: "comment_script.js" }, _ => {
        // Check for errors during script injection
        let e = chrome.runtime.lastError;
        if (e !== undefined) {
          console.log(tabId, _, e);
        }
      });
      // Insert the CSS file to style highlights on the active tab
      chrome.tabs.insertCSS(tab.id, { file: "style.css" }, _ => {
        // Check for errors during CSS injection
        let e = chrome.runtime.lastError;
        if (e !== undefined) {
          console.log(tabId, _, e);
        }
      });
    });
  }
  // If the "clear_storage" command is triggered
  if (command === "clear_storage") {
    // Query for the active tab
    chrome.tabs.query({ active: true }, tab => {
      // Execute the script to clear storage on the active tab
      chrome.tabs.executeScript(tab.id, { file: "clear_storage.js" });
    });
  }
});
