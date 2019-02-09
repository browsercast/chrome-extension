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
    // Return number of videos
    return document.getElementsByTagName("video").length;
}