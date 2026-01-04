const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');
const execSync = require('child_process').execSync;

const AUTH_TOKEN = "";


function getTrades() {
    var myHeaders = new Headers();
    myHeaders.append("Authorization", AUTH_TOKEN);
    myHeaders.append("Content-Type", "application/json");


    var requestOptions = {
        method: "GET",
        headers: myHeaders,
        redirect: "follow"
    };


    fetch("https://api.localcoinswap.com/api/v2/trades/list?stage=live\&trade_type=sell", requestOptions)
        .then(response => response.text())
        .then(result => {
            var trades = JSON.parse(result);
            console.log(trades);
            sortTrades(trades.results);
        })
        .catch(error => console.log("error", error));
}

// Takes a uuid and accepts the trade
function sortTrades(offers) {
    var myHeaders = new Headers();
    myHeaders.append("Authorization", AUTH_TOKEN);
    myHeaders.append("Content-Type", "application/json");


    var raw = JSON.stringify({ "status": "ACCEPTED" });

    var requestOptions = {
        method: "PATCH",
        headers: myHeaders,
        body: raw,
        redirect: "follow"
    };

    var uuids = [];
    for (let i = 0; i < offers.length; i++) {
        if (offers[i].status != "CREATED") continue; // Skip all non-new trades

        console.log("    New order detected. UUID: " + offers[i].uuid);
        uuids.push(offers[i].uuid);
    }

    if (uuids.length > 0) acceptTrades(uuids);
    else {
        console.log("No new trades found.");
        end();
    }
}

async function acceptTrades(uuids) {
    let page = await browser.newPage();
    try {
        // Turn off notification requestsd
        const context = browser.defaultBrowserContext();
        context.overridePermissions("https://localcoinswap.com", ["geolocation", "notifications"]);

        await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/84.0.4147.125 Safari/537.36');
        await page.goto("https://localcoinswap.com/");
        await delay(2000);
        if(page.ur)
        
        for (let uuid of uuids) {
            console.log("\nAccepting trade " + uuid);
            await page.goto("https://localcoinswap.com/contract/" + uuid + "/");
            await page.waitForSelector("button.btn.btn-green.btn-sm");

            await delay(1500);
            await page.click("button.btn.btn-green.btn-sm");

            await delay(1000);
            await page.click("body > div.dialog-overlay > div > footer > div > button");
            console.log("\n    done. " + uuid);
        }

        console.log("Success! Closing browser.");
        await browser.close();
    } catch (e) {
        await page.screenshot({ path: 'error.png' });
        await browser.close();
        console.log(e);
    }
}

async function end() {
    await killChromium();
    setTimeout(getTrades, 15000);
}

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

getTrades();