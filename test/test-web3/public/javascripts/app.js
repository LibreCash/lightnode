App = {
    account: null,

    init: function() {
        App.initWeb3();
    },
    initWeb3: function() {
        web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:8545'));

        web3.eth.getAccounts(function(error, accounts) {
            if (error) {
              console.log(error);
              return
            }
          
            App.account = accounts[0];
        });

    },
    onClickDeploy: function() {
        var abi = JSON.parse(document.getElementById('abi').innerText);
        var address = document.getElementById('address').innerText;
        var bin = document.getElementById('bin').innerText;
        var from = document.getElementById('from').innerText;

        if (!App.account) {
            console.log('App.account is not defined');
            return
        }

        contract = new web3.eth.Contract(abiArray,address);

        contract.deploy({data: bin})
        /*    .estimateGas(function(err, gas){
                console.log(gas);
            })*/
            .send({
                from: from,
                gas: 300000,
            }, function(error, transactionHash){
                console.log(transactionHash, contract);
            });
    }
}

App.init();
