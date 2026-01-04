var getBalance = require("./getBalance");

async function getBTCPrice() {
    let price = await getBalance();
    let btcPrice = await roundToDollars(price.fiat/price.crypto);
    return btcPrice;
}

async function roundToDollars(number) {
    return Math.round(number * 100) / 100;
}


module.exports = getBTCPrice;