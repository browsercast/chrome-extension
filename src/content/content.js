// Received request from background script
chrome.runtime.onMessage.addListener(function name(request, sender, sendResponse) {
    switch (request.cmd) {
        case "checkForVideo":
            sendResponse(checkForVideo());
            break;
    
        default:
            break;
    }
    
});

// Check if there are any videos in the page
function checkForVideo() {
    var videoCount = document.getElementsByTagName("video").length;
    //var iframe = document.getElementsByTagName("iframe")[0];

    if (videoCount > 0) {
        // Video found
        return videoCount;
    } else {
        // FixMe check for video within iframe
    }

    return videoCount;
}