const { app, BrowserWindow, session } = require("electron");
const { exec } = require("child_process");
const path = require("path");

let mainWindow;

app.whenReady().then(() => {
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            nodeIntegration: false, // Security best practice
            contextIsolation: true,
            sandbox: true
        }
    });

    // Monitor all network requests
    session.defaultSession.webRequest.onBeforeRequest((details, callback) => {
        const url = details.url;
        console.log(`Checking URL: ${url}`);

        checkURLSecurity(url, (isBlocked) => {
            if (isBlocked) {
                console.log(`🚨 Blocked: ${url}`);
                callback({ cancel: true }); // Stop website from loading
            } else {
                callback({}); // Allow access
            }
        });
    });

    // Open a default website (Google) on startup
    mainWindow.loadURL("https://www.google.com");
});

// Function to check if the URL is malicious
function checkURLSecurity(url, callback) {
    const scriptPath = path.join(__dirname, "auto_scanner.js");

    exec(`node "${scriptPath}" "${url}"`, (error, stdout) => {
        if (error) {
            console.error("Error running security check:", error);
            return callback(false);
        }

        const result = stdout.trim();
        console.log(`Scan result: ${result}`);

        if (result.includes("⚠️") || result.includes("Suspicious") || result.includes("Phishing")) {
            return callback(true);
        }

        callback(false);
    });
}
