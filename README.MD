
!!!!!!!!!!Swapp dapp only for testing purposes!!!!!!!!!!
!!!!!!!!!!I didn't provide full security in the smart contracts .They are NOT for production as they are!!!!!!!

Created By Christos Lytrokapis for the Titan job interview . 

Instructions:
    You have two choices A and B !

    A) The smart contracts are already deployed in Ropsten network .
        So be conected to Ropsten Network!
        Open the Swap Project:  

            Setup
            Clone Repository

            $ git clone https://github.com/DeathClover/SwapperTITAN.git
    
            1) open command line press:'$ cd .\client\ ' 
            2) Install Dependencies:
                $ npm install
            3) $ npm run start
            4) press connect wallet 
            5) you can start swapping with the FUN token !
            Browser will launch on http://localhost:3000/.
    
    B) If You want to deploy from the start the project .
        *Be aware of the packages that i use like truffle,dotenv,hdwalletprovider,node.js,bootstrap,
        identicon.js.
        *In the truffle-config.js file i have already added binance testnet,ropsten,ganache and local feel free to add more.
        *Be aware that you need to change the .env file to the mnemonic of your account.
            1) open command line type 'truffle migrate --reset --network {choose the network you want to deploy, the names are in the truffle-config.js file } 
            2) open command line press 'cd .\client\ '
            3)  'npm run start'
            4) press connect wallet
            !* The next steps exists because we need some token pool inside our swap app
            5) open Console with f12 
            6) copy the address of the token
            7) add it in you metamask account
            8) open again console and copy the ethSwap address
            9) send tokens from you account(because the account that did the deployment has all the tokens) 
            to the Swap app address.
            10) also send some ether to the Swap contract address.
            11) You can start swapping using other accounts also.
        
    Ropsten Faucet : https://faucet.dimensions.network/
