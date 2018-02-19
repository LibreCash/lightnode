
<h1 align="center">
	<img width="300" src="http://librebank.com/img/logo-black.svg" alt="LibreBank Logo">
	<br>
	<br>
</h1>

# LibreBank Oracle Lightnode
LibreBank Lightnode - oracle node used to fetch and push ETH rates to LibreBank emission & exchanger contracts.

## Requirements
1. NodeJS v. 7.4+ (https://nodejs.org/en/)
2. Build essentials package to your OS (needed for building some deps) For Debian-based linux you need intall build-essential package by apt. For Windows: latest Visual Studio C++ compiler.
3. Any Ethereum node with WebSocket supports. We prefer geth (https://github.com/ethereum/go-ethereum/wiki/geth).
4. Some Ether used to push data  to smart-contract.
5. MongoDB 3.0.12+

## Getting Started
1. Simple clone this repo and install deps using npm
```
git clone --recursive https://github.com/LibreCash/oracle-lightnode
cd oracle-lightnode
npm install
```
2. Configurate. 
Change configuration params at `config/default.json` file.

3. Run ETH node in Websocket RPC mode.
For geth you can use this command

For Mainnet:
```
geth --ws --wsapi db,eth,net,web3,personal --wsorigins *
```

For Rinkeby testnet:

```
geth --rinkeby --ws --wsapi db,eth,net,web3,personal --wsorigins *
```

4. Run node

## Run node
### LightNode startup
```
node cli/lightnode-cli.js
```
## Configuring
After installation procedure you need to configure some parameters in `config/config.json`. 

## Documentation 
Project documentation located at `docs` subfolder.

## Contiributing
If you want to help us get better - create issue and PR.

## License
Code released under the GPL licence.
