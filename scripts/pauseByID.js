async function pauseByID(data) {
    var myHeaders = new Headers();
    myHeaders.append("Authorization", "");
    myHeaders.append("Content-Type", "application/json");


    var raw = await JSON.stringify({ "is_active": false });

    var requestOptions = {
        method: "PATCH",
        headers: myHeaders,
        body: raw,
        redirect: "follow"
    };


    await fetch("https://api.localcoinswap.com/api/v2/offers/" + data + "/", requestOptions)
        .then(response => response.text())
        .then(result => {})
        .catch(error => console.log("error", error));
}

module.exports = pauseByID;