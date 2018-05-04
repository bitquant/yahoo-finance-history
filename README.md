# yahoo-finance-history
Historical price history data from Yahoo Finance including dividends and splits

## Install
```
$ npm install yahoo-finance-history --save
```

## Usage
```javascript
var yahoo = require("yahoo-finance-history");

(async () => {
    try {
        let data = await yahoo.getPriceHistory("MSFT");

        // Raw history data returned by Yahoo Finance in CSV format
        const priceHistory = data.priceHistory;
        const dividendHistory = data.dividendHistory;
        const splitHistory = data.splitHistory;

        for (const price of priceHistory.split("\n").sort().reverse()) {
            console.log(price);
        }

        for (const dividend of dividendHistory.split("\n").sort().reverse()) {
            console.log(dividend);
        }

        for (const split of splitHistory.split("\n").sort().reverse()) {
            console.log(split);
        }
    }
    catch (ex) {
        console.log('got error:' + ex);
    }
})();
```

## License
MIT license; see [LICENSE](./LICENSE).
