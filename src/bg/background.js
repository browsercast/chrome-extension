// Global variables
$tabsList = [];

// Scan tabs
function scanTabs(callback) {
    $tabsList = [];
    // Get the list of all tabs
    chrome.windows.getAll({ populate: true }, function(windows) {
        // For each window
        windows.forEach(function(window) {
            // For each tab
            window.tabs.forEach(function(tab) {
                // Match the domain name
                var matches = tab.url.match(/^https?\:\/\/([^\/?#]+)(?:[\/?#]|$)/i);
                var domain = matches && matches[1];

                // Only show Youtube tabs
                if (domain == "www.youtube.com" && tab.url != "https://www.youtube.com/") {
                    $tabsList.push(tab);
                }
            });
        });

        callback();
    });
}

// Check and remove tab
function checkRemoveTab(id) {
    for (var key in $tabsList) {
        var element = $tabsList[key];

        if (element.id == id) {
            $tabsList.splice(key, 1);
            break;
        }
    }
}

// Check and add tab
function checkAddTab(tab) {
    var found = false;

    for (var key in $tabsList) {
        var element = $tabsList[key];

        if (element.id == tab.id) {
            found = true;
            break;
        }
    }

    // If the tab doesn't exist, add it
    if (!found) {
        $tabsList.push(tab);
    }
}

// Get the tabs list
function getTabsList() {
    return $tabsList;
}

// Switch tab
function changeTab(id) {
    chrome.tabs.update(parseInt(id), { active: true });
}

// Play video
function playTab(id) {
    chrome.tabs.executeScript(id, { code: "document.getElementsByClassName(\"ytp-play-button\")[0].click();" }, null);
}

// Remove tab
function closeTab(id) {
    chrome.tabs.remove(parseInt(id));
}

// Open new tab
function newTab(url) {
    chrome.tabs.create({ url: url });
}