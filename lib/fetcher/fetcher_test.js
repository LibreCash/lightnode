var Fetcher = require('./fetcher.js');

function test() {
    let curFetcher = new Fetcher();
    //console.log(curFetcher.getExchanges());
    curFetcher.fetchAll().then(console.log);
}

//test();

function test2(){
    let curFetcher = new Fetcher();
    curFetcher.fetch(`https://gist.githubusercontent.com/decodedbrain/b20708d3dc0f1198e8bb1069b25b0a4f/raw/a8e3ec5d44a8ad86360e128b6b7c775ccb32639a/test`).then(console.log)
}

test2();