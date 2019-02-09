// Check for tab updates such as, page changed, page loaded, audible
chrome.tabs.onUpdated.addListener(function(tabID, changeInfo, tab) {
    if (changeInfo.status == "complete") {
        // Check if tab has video
        chrome.tabs.sendMessage(tab.id, {cmd : "checkForVideo"}, function(response) {
            // If there is a video
            if (parseInt(response) > 0) {
                // Check if tab exists, if not, add it
                checkAddTab(tab);
                // Inform the app that a new tab was added
                sendTabsUpdateMessage();
            }
        });
    } else if (changeInfo.audible != null) {
        // If there is a sound change for a tab
        // Inform the app that one of the tabs has changed sound on/off
        sendAudibleUpdate(tabID, changeInfo.audible);
    }
});

// Trigger when a tab was closed
chrome.tabs.onRemoved.addListener(function(tabID) {
    // Remove it from our list
    checkRemoveTab(tabID);
    // Inform the app that a tab was closed
    sendTabsUpdateMessage();
});

// Trigger when a tab was changed
chrome.tabs.onActivated.addListener(function(activeInfo) {
    // Inform the app that the tab was changed
    sendCurrentTabUpdate(activeInfo.tabId);
});