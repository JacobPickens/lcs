async function setTradeLimits(min, max, uuid) {
    var myHeaders = new Headers();
    myHeaders.append("Authorization", "");
    myHeaders.append("Content-Type", "application/json");


    var raw = await JSON.stringify({ "min_trade_size": parseInt(min), "max_trade_size": parseInt(max) });

    var requestOptions = {
        method: "PATCH",
        headers: myHeaders,
        body: raw,
        redirect: "follow"
    };

    console.log(("Setting trade limits for " + uuid).green);
    console.log(("    Min: " + min + "    Max: " + max).white);
    await fetch("https://api.localcoinswap.com/api/v2/offers/" + uuid + "/", requestOptions)
        .then(response => response.text())
        .then(result => {})
        .catch(error => console.log("error", error));
}

module.exports = setTradeLimits;