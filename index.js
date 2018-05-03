'use strict';

const request = require('request-promise-native').defaults({timeout: 9999});

var getPriceHistory = async (symbol) => {

    // Convert symbols like BRK.B to BRK-B to make yahoo happy
    symbol = symbol.replace(/\./g, "-");

    var options = {
        uri: "https://finance.yahoo.com/quote/" + symbol + "/history?p=" + symbol,
        headers: {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.11; rv:45.0) Gecko/20100101 Firefox/45.0'
        },
        jar: request.jar()
    };
    // First get the cookie and crumb we need
    var responseBody = await request(options);

    // Search for the crumb in the response data
    var crumbMatch = responseBody.match(/("CrumbStore":{[^}]+})/);
    var crumbObject = JSON.parse("{" + crumbMatch + "}");

    // Setup query timestamps
    let startEpoch = -2147483648;
    let endEpoch = Math.round(new Date().getTime() / 1000);

    // Grab the history data
    let baseUrl = "https://query1.finance.yahoo.com/v7/finance/download/"
    var args = `${symbol}?period1=${startEpoch}&period2=${endEpoch}&interval=1d&events=history&crumb=${crumbObject.CrumbStore.crumb}`
    options.uri = baseUrl + args;
    var priceHistory = await request(options);

    // Grab the dividend data
    args = `${symbol}?period1=${startEpoch}&period2=${endEpoch}&interval=1d&events=div&crumb=${crumbObject.CrumbStore.crumb}`
    options.uri = baseUrl + args;
    var dividendHistory = await request(options);

    // Grab the split data
    args = `${symbol}?period1=${startEpoch}&period2=${endEpoch}&interval=1d&events=split&crumb=${crumbObject.CrumbStore.crumb}`
    options.uri = baseUrl + args;
    var splitHistory = await request(options);

    return { priceHistory, dividendHistory, splitHistory };
};

exports.getPriceHistory = getPriceHistory;

/*
(async () => {
    try {
        let data = await getPriceHistory("MSFT");
        console.log(data);
    }
    catch (ex) {
        console.log('got error:' + ex);
    }
})();
*/
