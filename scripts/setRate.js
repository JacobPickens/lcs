const getBTCPrice = require("./get-btc-price");

async function setRate(percent, uuid) {
    var myHeaders = new Headers();
    myHeaders.append("Authorization", "");
    myHeaders.append("Content-Type", "application/json");

    let btcPrice = await getBTCPrice();
    var raw = await JSON.stringify({ "pricing_type": "ADVANCED", "pricing_expression": "market.bitfinex.btcusd.ask*"+parseFloat(percent)});

    var requestOptions = {
        method: "PATCH",
        headers: myHeaders,
        body: raw,
        redirect: "follow"
    };

    console.log(("Setting rate for " + uuid).green);
    console.log(("    Rate: " + percent + "%").white);
    await fetch("https://api.localcoinswap.com/api/v2/offers/" + uuid + "/", requestOptions)
        .then(response => response.text())
        .then(result => { console.log(result)})
        .catch(error => console.log("error", error));
}

module.exports = setRate;