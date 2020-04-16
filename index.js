'use strict';
var setCookie = require('set-cookie-parser');

var getPriceHistory = async (symbol) => {

    // Convert symbols like BRK.B to BRK-B to make yahoo happy
    symbol = symbol.replace(/\./g, "-");

    var options = { headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.14; rv:75.0) Gecko/20100101 Firefox/75.0'
    }};

    // First get the cookie and crumb we need
    var response = await fetch(`https://finance.yahoo.com/quote/${symbol}/history?p=${symbol}`, options);
    if (response.status !== 200) {
        throw new Error(`failed to fetch yahoo finance: ${response.status}`);
    }
    var cookieHeader = response.headers.get('set-cookie');
    var cookiesSet = setCookie.parse(setCookie.splitCookiesString(cookieHeader));
    options.headers['Cookie'] = getRequestCookie(cookiesSet);

    // Search for the crumb in the response data
    var responseBody = await response.text();
    var crumbMatch = responseBody.match(/("CrumbStore":{[^}]+})/);
    var crumbObject = JSON.parse("{" + crumbMatch[1] + "}");

    // Setup query timestamps
    let startEpoch = -2147483648;
    let endEpoch = Math.round(new Date().getTime() / 1000);

    // Grab the history data
    let baseUrl = "https://query1.finance.yahoo.com/v7/finance/download/"
    var args = `${symbol}?period1=${startEpoch}&period2=${endEpoch}&interval=1d&events=history&crumb=${crumbObject.CrumbStore.crumb}`;
    var priceHistoryResponse = await fetch(baseUrl + args, options);
    if (priceHistoryResponse.status !== 200) {
        throw new Error(`failed to fetch price history: ${priceHistoryResponse.status}`)
    }
    var priceHistory = await priceHistoryResponse.text();

    // Grab the dividend data
    args = `${symbol}?period1=${startEpoch}&period2=${endEpoch}&interval=1d&events=div&crumb=${crumbObject.CrumbStore.crumb}`
    var dividendHistoryResponse = await fetch(baseUrl + args, options);
    if (dividendHistoryResponse.status !== 200) {
        throw new Error(`failed to fetch dividend history: ${dividendHistoryResponse.status}`)
    }
    var dividendHistory = await await dividendHistoryResponse.text();

    // Grab the split data
    args = `${symbol}?period1=${startEpoch}&period2=${endEpoch}&interval=1d&events=split&crumb=${crumbObject.CrumbStore.crumb}`
    var splitHistoryResponse = await fetch(baseUrl + args, options);
    if (splitHistoryResponse.status !== 200) {
        throw new Error(`failed to fetch split history: ${splitHistoryResponse.status}`)
    }
    var splitHistory = await await splitHistoryResponse.text();

    return { priceHistory, dividendHistory, splitHistory };
};

function getRequestCookie(cookies) {
    return cookies.reduce((result, current) => {
        if (result.length > 0) {
            result += '; ';
        }
        result += `${current.name}=${current.value}`
        return result;
    }, '');
}

exports.getPriceHistory = getPriceHistory;
