// Global variables
$tabsList = [];
$user = null;

// Initialize
initializeFirebase();

// Scan tabs
function scanTabs(callback) {
    $tabsList = [];
    // Get the list of all tabs
    chrome.windows.getAll({ populate: true }, function(windows) {
        // For each window
        windows.forEach(function(window) {
            // For each tab
            window.tabs.forEach(function(tab) {
                // Check if the tab has a playable video
                chrome.tabs.sendMessage(tab.id, {cmd : "checkForVideo"}, function(response) {
                    // If it has, add it to the list
                    if (parseInt(response) > 0) {
                        $tabsList.push(tab);
                    }
                });
            });
        });

        setTimeout(() => {
            // Sort tabs
            $tabsList.sort(compare);
            // Return callback
            callback();
        }, 1000);
    });
}

// Sort by tab position in browser
function compare(a,b) {
  if (a.index < b.index)
    return -1;
  if (a.index > b.index)
    return 1;
  return 0;
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
    var code = `
    var video = document.getElementsByTagName(\"video\")[0];
    if (video.paused) {
        video.play();
    } else {
        video.pause();
    }
    `;

    chrome.tabs.executeScript(id, { code: code }, null);
}

// Remove tab
function closeTab(id) {
    chrome.tabs.remove(parseInt(id));
}

// Open new tab
function newTab(url) {
    chrome.tabs.create({ url: url });
}

// Seek video
function seekVideo(id, seconds) {
    console.log(id, seconds, "seek")
    var code = `
    var video = document.getElementsByTagName(\"video\")[0];
    video.currentTime += ` + seconds + `;
    `;

    chrome.tabs.executeScript(id, { code: code }, null);
}

// Initialize Firebase
function initializeFirebase() {
    var config = {
        apiKey: "AIzaSyDn-CWzNRnQM5TvjKMIiho_zwpFivRaBNQ",
        authDomain: "browsercast-1550137004565.firebaseapp.com",
        databaseURL: "https://browsercast-1550137004565.firebaseio.com",
        projectId: "browsercast-1550137004565",
        storageBucket: "browsercast-1550137004565.appspot.com",
        messagingSenderId: "209745942759"
    };

    firebase.initializeApp(config);
}

// Google sign in
function googleSignin() {
    var provider = new firebase.auth.GoogleAuthProvider();
    
    firebase.auth().signInWithPopup(provider).then(function(result) {
        // This gives you a Google Access Token. You can use it to access the Google API.
        var token = result.credential.accessToken;
        // The signed-in user info.
        var user = result.user;
        $user = user;
        
        // Inform the popup
        chrome.runtime.sendMessage({
            cmd: "googleSignin",
            data: {
                user: user
            }
        });
    }).catch(function(error) {
        console.log(error)
        return false;
    });
}

// Google sign out
function googleSignout() {
    firebase.auth().signOut().then(function() {
        $user = null;

      }).catch(function(error) {
        // An error happened.
      });
}

// Receiving messages from popup
chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        if (request.cmd == "googleSignin") {
            if ($user != null) {
                // Return user
                sendResponse($user);
            } else {
                // Sign in user
                sendResponse(googleSignin());
            }
        } else if (request.cmd == "googleSignout") {
            googleSignout();
        }
    }
);