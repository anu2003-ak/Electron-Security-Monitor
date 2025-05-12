const { execSync } = require("child_process");
const path = require("path");

const urlToScan = process.argv[2];

const scripts = [
    "check_blacklist.js",
    "check_ssl.js",
    "detect_hidden_iframes.js",
    "detect_js_execution.js",
    "detect_phishing_urls.js",
    "detect_wasm.js"
];

function scanWebsite(url) {
    console.log(`🔍 Scanning: ${url}`);
    let isThreat = false;

    for (let script of scripts) {
        const scriptPath = path.join(__dirname, script);
        try {
            const output = execSync(`node "${scriptPath}" "${url}"`).toString().trim();
            console.log(`${script} output:`, output);

            if (output.includes("⚠️") || output.includes("Suspicious") || output.includes("Phishing")) {
                isThreat = true;
            }
        } catch (err) {
            console.error(`Error executing ${script}:`, err.message);
        }
    }

    console.log(isThreat ? "⚠️ Block this site!" : "✅ Safe site.");
    return isThreat;
}

const isBlocked = scanWebsite(urlToScan);
if (isBlocked) {
    console.log("BLOCKED");
} else {
    console.log("SAFE");
}
