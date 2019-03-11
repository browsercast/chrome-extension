// Received request from background script
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
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
            var width = element.width == "" ? parseInt(element.style.width.replace(/[^0-9.]/g, "")) : element.width.replace(/[^0-9.]/g, "");
            var height = element.height == "" ? parseInt(element.style.height.replace(/[^0-9.]/g, "")) : element.height.replace(/[^0-9.]/g, "");
            if(width >= 100 && height >= 100 && (element.src.toLowerCase().indexOf("javascript:") === -1)) {
                finalIframes.push({width: width, height: height, source: element.src});
            }
        }
    }

    return finalIframes;
}