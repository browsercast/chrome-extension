// Global variables
$tabsList = [];
$iframesList = [];
$user = null;

// Initialize
initializeFirebase();

// Scan tabs
function scanTabs(callback) {
    $tabsList = [];
    $iframesList = [];
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
                    } else {
                        chrome.tabs.sendMessage(tab.id, {cmd : "checkForIframes"}, function(res) {
                            // If it has, add it to the list
                            if (res != undefined) {
                                for (let i = 0; i < res.iframes.length; i++) {
                                    const element = res.iframes[i];

                                    element.tab_id = tab.id;
                                    element.tab_title = tab.title;

                                    $iframesList.push(element);
                                }
                            }
                        });
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
    return {tabs: $tabsList, iframes: $iframesList};
}

// Switch tab
function changeTab(id) {
    chrome.tabs.update(parseInt(id), { active: true });
}

// Play video
function playTab(id) {
    var code = `
    var video = document.getElementsByTagName("video")[0];

    if (video.paused) {
        video.play();
    } else {
        video.pause();
    }

    if(window.location.hostname == "www.youtube.com"){
        // YouTube website
        var ytplayerapi = document.getElementById("player-api");
        var playercontainer = document.getElementById("player-container");
    
        if(playercontainer){
            var regularhtmlplayer = document.getElementsByClassName('browsercast')[0];
            var stefanyoutubecontrols = document.getElementsByClassName('ytp-chrome-bottom')[0];
            if(regularhtmlplayer){
                playercontainer.classList.remove("browsercast");
                document.getElementsByTagName('video')[0].classList.remove("browsercast");
                videowindow = false;
            } else {
                if(document.getElementsByTagName('video')[0].paused == false){
                playercontainer.classList.add('browsercast');
                document.getElementsByTagName('video')[0].classList.add('browsercast');
                stefanyoutubecontrols.style.cssText = "width:100% !important";
                videowindow = true;
                }
            }
        }
        else if(ytplayerapi){
            var regularhtmlplayer = document.getElementsByClassName('browsercast')[0];
            var stefanyoutubecontrols = document.getElementsByClassName('ytp-chrome-bottom')[0];
            if(regularhtmlplayer){
                ytplayerapi.classList.remove("browsercast");
                document.getElementsByTagName('video')[0].classList.remove("browsercast");
                videowindow = false;
            } else {
                if(document.getElementsByTagName('video')[0].paused == false){
                ytplayerapi.classList.add('browsercast');
                document.getElementsByTagName('video')[0].classList.add('browsercast');
                stefanyoutubecontrols.style.width = "98%";
                videowindow = true;
                }
            }
        }
    }
    `;

    var css = `
    .browsercast {
        position: fixed !important;
        top: 0px !important;
        left: 0px !important;
        right: 0px !important;
        bottom: 0px !important;
        width: 100% !important;
        height: 100% !important;
        z-index: 50000 !important;
    }
    `;
    
    chrome.tabs.insertCSS(id, { code: css }, null);
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
    var code = `
    var video = document.getElementsByTagName(\"video\")[0];
    video.currentTime += ` + seconds + `;
    `;

    chrome.tabs.executeScript(id, { code: code }, null);
}

// Seek video
function changeVolume(id, volume) {
    var code = `
    var video = document.getElementsByTagName(\"video\")[0];
    video.volume = ` + volume + `;
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
        disconnectSocket();
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