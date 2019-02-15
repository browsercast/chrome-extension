// Global variables
$socket = null;
$remotePeer = null;
// $serverUrl = 'https://browsercast-messaging-broker.herokuapp.com';
$serverUrl = 'https://video-pc-app.herokuapp.com';

// Trigger the connect for the host
connect();

// Handle the commands from the app
function actionHandler(data) {
    console.log(data)
    switch (data.payload.cmd) {
        // Update list of tabs
        case "tabsListUpdate":
            sendTabsUpdateMessage();
            break;
        // Close a tab
        case "closeTab":
            closeTab(data.payload.params.id);
            break;
        // Change a tab
        case "changeTab":
            changeTab(data.payload.params.id);
            sendTabsUpdateMessage();
            break;
        // Play a video
        case "playTab":
            playTab(data.payload.params.id);
            break;
        // Open a new tab
        case "newTab":
            newTab(data.payload.params.url);
            break;
        // Seek a video
        case "seekVideo":
            seekVideo(data.payload.params.id, data.payload.params.seconds);
            break;

        default:
            break;
    }
}

// Connect the extension to the socket server
function connect() {
    // Open socket
    $socket = io($serverUrl);

    // Trigger when the connection was made
    $socket.on('connect', function(data) {

    });

    // Trigger when another user joined
    $socket.on('join', function(data) {
        // Inform server
        $socket.emit("joined-id", data);

        // Save the peer id to directly send him commands
        $remotePeer = data;
    });

    // Get the extension's peer id
    $socket.on('peer-id', function(data) {
        localStorage.setItem("qrcode", data);
    });

    // Trigger when a command was received
    $socket.on('receive', function(data) {
        // Handle the command
        actionHandler(data);
    });

    // Trigger when the app disconnected
    $socket.on('user-disconnected', function(data) {
        // Handle the command
    });
}

// Send connected user id
function sendUserId(id) {
    // Inform server
    $socket.emit("joined-id-social", id);
}

// Send a command to the socket
function sendCommand(payload) {
    $socket.emit("send", { id: $remotePeer, payload: payload });
}

// Send the list of tabs
function sendTabsUpdateMessage() {
    // Scan the tabs (update list)
    scanTabs(function() {
        // Send to the app
        sendCommand({ cmd: "tabsListUpdate", params: { tabsList: getTabsList() } });
    });
}

// Send the new active tab id
function sendCurrentTabUpdate(id) {
    // Send to the app
    sendCommand({ cmd: "currentTabUpdate", params: { id: id } });
}

// Send the tab id of the tab which had changed the sound
function sendAudibleUpdate(id, audible) {
    // Send to the app
    sendCommand({ cmd: "audibleUpdate", params: { id : id, audible : audible } });
}

