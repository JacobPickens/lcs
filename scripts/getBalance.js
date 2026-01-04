async function getBalance(cb) {
    var myHeaders = new Headers();
    myHeaders.append("Authorization", "");
    myHeaders.append("Content-Type", "application/json");

    var requestOptions = {
        method: "GET",
        headers: myHeaders,
        redirect: "follow"
    };


    let response = await fetch("https://api.localcoinswap.com/api/v2/wallets/balance/BTC/", requestOptions);
    let raw = await response.text();
    let json = await JSON.parse(raw);
    let btc = await parseFloat(json.crypto_balance);
    let fiat = await roundToDollars(await parseFloat(json.fiat_balance));
    return {crypto: btc, fiat: fiat};
}

async function roundToDollars(number) {
    return Math.round(number * 100) / 100;
}

module.exports = getBalance;