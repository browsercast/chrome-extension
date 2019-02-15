// Global Variables
$user = null;

// Initialize
qrcode();
googleSignin();


// Generate QR Code using API
function qrcode() {
    document.getElementById("qrcode").src = 'https://chart.googleapis.com/chart?chs=250x250&cht=qr&chl=' + localStorage.getItem("qrcode"); 
}

// Google sign in
function googleSignin() {
    chrome.runtime.sendMessage({
        cmd: "googleSignin"
    }, function (data) {
        console.log(data)
        if (data != null) {
            loginStateChanged(data);
        }
    });
}

// Google sign out
function googleSignout() {
    chrome.runtime.sendMessage({
        cmd: "googleSignout"
    });
}

// login state changed
function loginStateChanged(user) {
    $user = user;

    if (user != null) {
        // Update UI
        document.getElementById("socialLoginStatus").innerHTML = "Connected as " + user.displayName + " ";
        document.getElementById("googleSignin").innerHTML = "Logout";
        
        // Update event listeners
        document.getElementById("googleSignin").removeEventListener("click", googleSignin);
        document.getElementById("googleSignin").addEventListener("click", googleSignout);
    } else {
        // Update UI
        document.getElementById("socialLoginStatus").innerHTML = "";
        document.getElementById("googleSignin").innerHTML = "Connect with Google";

        // Update event listeners
        document.getElementById("googleSignin").removeEventListener("click", googleSignout);
        document.getElementById("googleSignin").addEventListener("click", googleSignin);
    }

    console.log('User state change detected from the Chrome Extension:', user);
};

// Receiving messages from background
chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        if (request.cmd == "googleSignin") {
            loginStateChanged(request.data.user);
        }
    }
);

document.getElementById("googleSignin").addEventListener("click", googleSignin);