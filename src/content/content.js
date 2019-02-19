// Received request from background script
chrome.runtime.onMessage.addListener(function name(request, sender, sendResponse) {
    switch (request.cmd) {
        case "checkForVideo":
            sendResponse(checkForVideo());
            break;
        case "checkForIframes":
            sendResponse({iframes: checkForIframes()});
            break;
        default:
            break;
    }
    
});

// Check if there are any videos in the page
function checkForVideo() {
    var videoCount = document.getElementsByTagName("video").length;

    if (videoCount > 0) {
        // Video found
        return videoCount;
    } else {
        // FixMe check for video within iframe
    }

    return videoCount;
}

// Check if there are any iframes in the page
function checkForIframes() {
    var iframes = document.getElementsByTagName("iframe");
    var finalIframes = [];
    
    for (const key in iframes) {
        if (iframes.hasOwnProperty(key)) {
            const element = iframes[key];
            if(element.width > 200 && element.height > 200) {
                finalIframes.push({width: element.width, height: element.height, source: element.src});
            }
        }
    }

    return finalIframes;
}