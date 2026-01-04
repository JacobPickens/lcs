const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');
const execSync = require('child_process').execSync;

const AUTH_TOKEN = "";


const user = "cminer001@proton.me";
const pass = "";
const authy = process.argv.slice(2);

async function killChromium() {
    try {
        const stdout = execSync("taskkill /F /IM chrome.exe").toString();
    } catch (error) { }
}

async function delay(time) {
    return new Promise(function (resolve) {
        setTimeout(resolve, time)
    });
}


(async () => {
    if (!authy) return console.log("No authy code.");
    console.log(authy);

    killChromium();

    const userDataDir = path.join(__dirname, 'userDataDir');

    // Ensure the directory exists (mandatory for newer Puppeteer versions)
    if (!fs.existsSync(userDataDir)) {
        fs.mkdirSync(userDataDir, { recursive: true });
    }

    const browser = await puppeteer.launch({
        headless: true,
        userDataDir: "./chrome/user-data-dir",
        args: ["--no-sandbox"],
    });

    page = await browser.newPage();
    try {
        // Turn off notification requestsd
        const context = browser.defaultBrowserContext();
        context.overridePermissions("https://localcoinswap.com", ["geolocation", "notifications"]);

        await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/84.0.4147.125 Safari/537.36');

        await page.goto("https://localcoinswap.com/login/");
        await page.waitForSelector("#username", { timeout: 20000 });

        await page.type("#username", user);
        await delay(500);
        await page.click("#__next > div > div > div > div > form > button");
        console.log("Username entered.");

        await page.waitForSelector("#password", { timeout: 20000 });
        await page.type("#password", pass);
        console.log("Password entered.");

        await delay(1000);
        await page.click("#__next > div > div > div > div > form > button");
        await page.waitForSelector("#otp");

        await page.type("#otp", authy);
        console.log("Authy entered.");
        await delay(1000);
        await page.click("#__next > div > div > div > div > form > button");

        await delay(5000);
        console.log("Logged in.");
        
        await browser.close();
    } catch (e) {
        await page.screenshot({ path: 'error.png' });
        console.log("Login failed.");
        await browser.close();

        console.log(e);
    }
})();
