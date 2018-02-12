
<h1 align="center">
	<img width="400" src="http://librebank.com/img/logo-black.svg" alt="LibreBank Logo">
	<br>
	<br>
</h1>
## LibreBank LightNode
LibreBank Oracle node - used to fetch and push ETH rates to LibreBank emission contracts

## Requirements
1. NodeJS v. 7.4+ (https://nodejs.org/en/)
2. Build essentials package to your OS (needed for building some deps) For Debian-based linux you need intall build-essential package by apt. For Windows: latest Visual Studio C++ compiler.
2. Any Ethereum node with WebSocket supports. We prefer geth (https://github.com/ethereum/go-ethereum/wiki/geth).
3. Some Ether used to push data  to smart-contract.

## Getting Started
Simple clone this repo and install deps using npm
```
git clone https://github.com/LibreCash/oracle-lightnode
cd oracle-lightnode
npm install
```
## Run node
### LightNode startup
```
node cli/lightnode-cli.js
```
## Masternode startup
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