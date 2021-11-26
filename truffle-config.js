const path = require("path");
require('dotenv').config({path: './.env'});
const HDWalletProvider = require("@truffle/hdwallet-provider");
const MetaMaskAccountIndex = 0

module.exports = {
  // See <http://truffleframework.com/docs/advanced/configuration>
  // to customize your Truffle configuration!
  contracts_build_directory: path.join(__dirname, "client/src/contracts"),
  networks: {
    develop: {
      host: "127.0.0.1",
      port: 8545 ,
      network_id: "*"
    },
    ganache_local: {
      provider: function() {
          return new HDWalletProvider(process.env.MNEMONIC, "http://127.0.0.1:7545", MetaMaskAccountIndex )
      },
      network_id: 1337
    },
    ropsten_infura: {
      provider: function() {
        return new HDWalletProvider(process.env.MNEMONIC, `https://ropsten.infura.io/v3/${process.env.REACT_APP_INFURA_APIKEY}`, MetaMaskAccountIndex)
      },
      network_id: 3
    },
    testnet: {
      provider: () => new HDWalletProvider(process.env.MNEMONIC, `https://data-seed-prebsc-1-s1.binance.org:8545`),
      network_id: 97,
      confirmations: 10,
      timeoutBlocks: 200,
      skipDryRun: true
    } ,
  },
  compilers:{
    solc: {
      version: "^0.8.0"
    }
  }

};
