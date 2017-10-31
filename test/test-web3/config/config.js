var options = { // default
    address: undefined,
    abiPath: undefined,
    binPath: undefined,
    sourcePath: undefined,
    from: undefined
}

// victor [

const spawnSync = require('child_process').spawnSync;

var machine = spawnSync('uname', ['-n']).stdout.toString().trim();
console.log('config machine:', machine);

if (machine == 'srv-dev') {
    options = {
        address: '0x631086e57bbf0fF6FE3Ce02B705DCa076a71072c',
        abiPath: '../../bin/OurOracle.abi',
        binPath: '../../bin/OurOracle.bin',
        sourcePath: '../../smartcontract.sol',
        from: '0x32A3AA73A5eC44CE70ddf0D9372aA52bA793871E'
    };
}

// victor ]

module.exports = options;
