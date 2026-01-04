const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');
const { setInterval } = require("timers/promises");
const tradeHandler = require("./scripts/trade-handler");
const colors = require("colors");

const pauseByID = require("./scripts/pauseByID");
const resumeByID = require("./scripts/resumeByID");
const setTradeLimits = require("./scripts/setTradeLimits");
const getBalance = require("./scripts/getBalance");
const getBTCPrice = require("./scripts/get-btc-price");
const setRate = require("./scripts/setRate");

const AUTH_TOKEN = "";
const ALLOWED_UUIDS = ["9d97234a-74fd-4a58-897e-5814eb71cbc1", "6aba771d-8d7d-421c-9aeb-0d36a42c687f", "03c24c01-83b0-4645-8010-4fdc01bb41f4", "e37c766b-9352-4282-9b2a-27b039e46a8a", "6e148a2e-9e3e-4258-ba56-ae239de75254", "dc314c87-5a82-4424-a8df-f5406e3ac662", "e572f8fd-0f8a-49a4-b19a-7a49729baed9", "b3594f73-dff1-43b0-a7f2-7988f3415af9"];

var browser, page;

var activeTrades = []; // has trade objects that consist of { contract, offerID, status }

const user = "cminer001@proton.me";
const pass = "&GczPR*jq7Uy%7Gu@Ze%Nu6bMC4w#upJYBB2S*uT2G5&guPV9Hcd%cpv%s*r";
const altCommand = process.argv.slice(2)[0];

async function getTrades() {
    console.log(colors.green("Fetching trades..."));
    var myHeaders = new Headers();
    myHeaders.append("Authorization", AUTH_TOKEN);
    myHeaders.append("Content-Type", "application/json");


    var requestOptions = {
        method: "GET",
        headers: myHeaders,
        redirect: "follow"
    };


    const response = await fetch("https://api.localcoinswap.com/api/v2/trades/list?stage=live\&trade_type=sell", requestOptions)

    // Check if the request was successful (fetch doesn't reject on HTTP errors like 404)
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    // Await the parsing of the response body as JSON
    const data = await response.json();
    console.log(colors.yellow("    " + data.results.length + " trades") + colors.white(" found in the following states:"));
    await sortTrades(data.results);
}

// Takes a uuid and accepts the trade
async function sortTrades(offers) {
    for (let i = 0; i < offers.length; i++) {
        tradeObj = {
            contract: offers[i].uuid,
            offerID: offers[i].offer.uuid,
            status: offers[i].status
        }
        console.log(colors.gray("         - " + tradeObj.status));
        activeTrades.push(tradeObj);
    }

    for (let trade of activeTrades) {
        let allowed = await isAllowedOfferID(trade.offerID);
        if (!allowed) continue;
        else console.log(colors.green("    UUID: " + trade.contract));

        if (trade.status == "CREATED") {
            console.log(colors.green("Attempting to accept trade."));
            await acceptTrades([trade.contract]);
        }
    }
}

async function acceptTrades(uuids) {
    try {
        let url = "https://localcoinswap.com/contract/" + uuid;
        console.log(colors.white("    " + url + "\n\n"));
        await page.goto(url);
        await page.waitForSelector("#__next > div > div.full-height.bg-backgrounds-200.dark\\:bg-ocean-900 > section > div > div.container.mx-auto > div > div.w-full.md\\:w-1\\/2.flex.flex-col > div.joyride-trade-timeline.bg-white.dark\\:bg-ocean-800.rounded-lg.p-4.flex.flex-col.items-center > div > div > div > div:nth-child(3) > div.flex.flex-col.ml-3.p-2.md\\:p-3.bg-bone-200.dark\\:bg-ocean-900.rounded-lg > div.flex.flex-col.gap-2 > div.flex.flex-row.flex-wrap.gap-2.items-center > button.btn.btn-green.btn-sm");

        await delay(1500);
        await page.click("#__next > div > div.full-height.bg-backgrounds-200.dark\\:bg-ocean-900 > section > div > div.container.mx-auto > div > div.w-full.md\\:w-1\\/2.flex.flex-col > div.joyride-trade-timeline.bg-white.dark\\:bg-ocean-800.rounded-lg.p-4.flex.flex-col.items-center > div > div > div > div:nth-child(3) > div.flex.flex-col.ml-3.p-2.md\\:p-3.bg-bone-200.dark\\:bg-ocean-900.rounded-lg > div.flex.flex-col.gap-2 > div.flex.flex-row.flex-wrap.gap-2.items-center > button.btn.btn-green.btn-sm");

        await delay(500);
        await page.click("#__next > div > div.full-height.bg-backgrounds-200.dark\\:bg-ocean-900 > section > div > div.container.mx-auto > div > div.w-full.md\\:w-1\\/2.flex.flex-col > div.joyride-trade-timeline.bg-white.dark\\:bg-ocean-800.rounded-lg.p-4.flex.flex-col.items-center > div > div > div > div:nth-child(3) > div.flex.flex-col.ml-3.p-2.md\\:p-3.bg-bone-200.dark\\:bg-ocean-900.rounded-lg > div.flex.flex-col.gap-2 > div.flex.flex-row.flex-wrap.gap-2.items-center > button.btn.btn-green.btn-sm");


        await delay(1000);
        await page.click("body > div.dialog-overlay > div > footer > div > button");

        console.log(colors.green("    accepted."));
        await page.goto("https://localcoinswap.com/dashboard");
    } catch (e) {
        console.log(colors.red("    error."));
        console.log(colors.error(e) + "\n\n ");
    }
}

async function openOffers() {
    for (let uuid of ALLOWED_UUIDS) {
        let results = await resumeByID(uuid);
    }
}

async function closeOffers() {
    for (let uuid of ALLOWED_UUIDS) {
        let results = await pauseByID(uuid);
    }
}

async function setAllLimits(min, max) {
    for (let uuid of ALLOWED_UUIDS) {
        let results = await setTradeLimits(min, max, uuid);
    }
}

async function setAllRates(percent) {
    for (let uuid of ALLOWED_UUIDS) {
        let results = await setRate(percent, uuid);
    }
}

async function isAllowedOfferID(id) {
    if (ALLOWED_UUIDS.includes(id)) return true;
    else return false;
}

async function delay(time) {
    return new Promise(function (resolve) {
        setTimeout(resolve, time)
    });
}

async function gotoAuthPage(url, page) {
    await page.setExtraHTTPHeaders({
        "Authorization": AUTH_TOKEN,
        "Content-Type": "application/json"
    });

    await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/84.0.4147.125 Safari/537.36');
    await page.goto(url);
}

async function launchBrowser() {
    // check if browser is running
    if (!browser || !browser.isConnected()) {
        browser = await puppeteer.launch({
            executablePath: "./chrome/linux-145.0.7615.0/chrome-linux64/chrome",
            headless: true,
            args: ["--no-sandbox"],
        });
        page = await browser.newPage();

        const context = browser.defaultBrowserContext();
        context.overridePermissions("https://localcoinswap.com", ["geolocation", "notifications"]);
    } else console.log("browser already running");
}

const getScreenshots = async (page, opts = { ms: 250 }) => {
    let count = 0;
    // Use for await...of with setInterval to run the loop asynchronously
    for await (const startTime of setInterval(opts.ms)) {
        const screenshotBuffer = await page.screenshot({ path: "./public/images/ss/screenshot-${count}.png" }); // Capture as buffer
        const filename = `./public/images/ss/screenshot-${count}.png`;
        await fs.writeFileSync(filename, screenshotBuffer); // Write to file asynchronously
        count++;
    }
}

async function checkAltCommands() {
    if (altCommand == "close") {
        console.log("Closing offers to the public...".red);
        await closeOffers();
        console.log("    Done.".gray)
        return true;
    } else if (altCommand == "open") {
        console.log("Opening offers to the public...".green);
        await openOffers();
        console.log("    Done.".gray)
        return true;
    } else if(altCommand == "setLimits") {
        let args = process.argv.slice(3)[0];
        if(!args) {
            console.log(colors.red("    This script needs a range formatted like this: 50-1000"));
            return true;
        }
        console.log(args);
        let range = args.split("-");
        setAllLimits(range[0], range[1]);
        return;
    } else if(altCommand == "balance") {
        let balance =await getBalance();
        let btc = await getBTCPrice();
        console.log((balance.crypto + " BTC").yellow);
        console.log(("$" + balance.fiat).green);
        console.log("\n(1 BTC = $" + btc + ")".white);
        return true;
    } else if(altCommand == "setRate") {
        let rate = process.argv.slice(3)[0];
        if(!rate) {
            console.log(colors.red("    This script needs a float value."));
            return true;
        }
        await setAllRates(await parseFloat(rate));
        return true;
    }

    return false;
}

(async () => {
    if(await checkAltCommands()) return;

    await fs.rmSync("./public/images/ss", { recursive: true, force: true });

    // Recreate the empty directory if desired
    await fs.mkdirSync("./public/images/ss", { recursive: true })

    console.log("Opening offers to the public...".green);
    await openOffers();

    await launchBrowser();
    await gotoAuthPage("https://localcoinswap.com/dashboard", page);
    console.log("Starting screenshot loop (non-blocking)...".green);
    console.log("    http://50.21.181.222/".blue);

    // Start the non-blocking loop function
    getScreenshots(page, { ms: 1000 });

    console.log("\nStarting monitoring loop...".green);
    while (true) {
        await getTrades();
        //await tradeHandler(activeTrades);
        await delay(15000);
    }
})();