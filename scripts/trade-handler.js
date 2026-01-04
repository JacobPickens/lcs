const AUTH_TOKEN = "";

async function getTradeStatus(uuid) {
    var myHeaders = new Headers();
    myHeaders.append("Authorization", AUTH_TOKEN);
    myHeaders.append("Content-Type", "application/json");


    var requestOptions = {
        method: "GET",
        headers: myHeaders,
        redirect: "follow"
    };


    let data = fetch("https://api.localcoinswap.com/api/v2/trades/" + uuid + "/", requestOptions);
    return data.status;
}

async function getTradeMessages(uuid) {
    var myHeaders = new Headers();
    myHeaders.append("Authorization", AUTH_TOKEN);
    myHeaders.append("Content-Type", "application/json");


    var requestOptions = {
        method: "GET",
        headers: myHeaders,
        redirect: "follow"
    };

    let data = await fetch("https://api.localcoinswap.com/api/v2/trades/message/list/" + uuid + "/", requestOptions)
    return data;
}

async function run(activeTrades) {
    for (let uuid of activeTrades) {
        // Get trade status
        let status = await getTradeStatus(uuid);
        // Get trade messages
        let messages = await getTradeMessages(uuid);

        console.log("Status: " + status);
        console.log("Messages: " + messages);
    }
}

module.exports = run;