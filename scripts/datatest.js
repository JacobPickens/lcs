const puppeteer = require('puppeteer');
const fs = require('fs');

const AUTH_TOKEN = "";


const getScreenshots = async (page, opts = { ms: 250 }) => {
    let count = 0;
    // Use for await...of with setInterval to run the loop asynchronously
    for await (const startTime of setInterval(getScreenshots, opts.ms)) {
        const screenshotBuffer = await page.screenshot({ path: "./public/images/ss/screenshot-${count}.png" }); // Capture as buffer
        const filename = `./public/images/ss/screenshot-${count}.png`;
        await fs.writeFileSync(filename, screenshotBuffer); // Write to file asynchronously
        count++;
    }
}

async function delay(time) {
    return new Promise(function (resolve) {
        setTimeout(resolve, time)
    });
}

(async () => {
    await fs.rmSync("./public/images/ss", { recursive: true, force: true });

    // Recreate the empty directory if desired
    await fs.mkdirSync("./public/images/ss", { recursive: true })

    const browser = await puppeteer.launch({
        executablePath: "./chrome/linux-145.0.7615.0/chrome-linux64/chrome",
        //userDataDir: "./chrome/user-data-dir",
        headless: true,
        args: ["--no-sandbox"],
    });
    const page = await browser.newPage();

    const context = browser.defaultBrowserContext();
    context.overridePermissions("https://localcoinswap.com", ["geolocation", "notifications"]);

    await page.setExtraHTTPHeaders({
        "Authorization": AUTH_TOKEN,
        "Content-Type": "application/json"
    });

    await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/84.0.4147.125 Safari/537.36');
    await page.goto("https://localcoinswap.com/dashboard");

    let count = 0;
    while (true) {
        await page.screenshot({ path: "./public/images/ss/screenshot-" + count + ".png" });
        count++;
        await delay(1000);
    }
})();