import React, { Component } from 'react'
import Web3 from 'web3'
import Token from '../contracts/TokenX.json'
import Swap from '../contracts/Swap.json'
import Navbar from './Navbar'
import Main from './Main'
import LoadWallet from './LoadWallet'
import './App.css'



class App extends Component {

  constructor(props) {
    super(props)    
    this.handleClick = this.handleClick.bind(this);
    this.state = {
      account: '', //contract deployer account[0]
      token: {}, //Deployed instance of FUN contract in ROPSTEN
      ethSwap: {}, //Deployed instance of Swap contract in ROPSTEN
      ethBalance: '0',
      tokenBalance: '0',
      loading: true,
      walletLoaded: false,
      txState : '',
      web3Socket: {},
      ethSwapWebSocket: {},
      lastReceivedEvent: { 'Event' : 'no event'}      
    }
  }

  async loadWallet() {    
    this.setState({ loading: true })
    await this.loadWeb3()
    await this.loadBlockchainData()    
    await this.loadEthSwapWebSocket();    

    //subscribe to event TokenPurchased 
    await this.state.ethSwapWebSocket.events.TokensPurchased({})
    .on('data', async (event) =>{
        let amount = event.returnValues._value.toString()
        window.alert('FUN Token purchased: ' + window.web3.utils.fromWei(amount, 'Ether'))
        console.log('FUN TokenPurchase tx confirmed \n')
        console.log('From account: ', event.returnValues._from.toString())        
        console.log('Amount in FUN: ', window.web3.utils.fromWei(amount, 'Ether') )
        this.setState({ lastReceivedEvent : event.returnValues})
        console.log(event.returnValues) 
        return amount
    })
    .on('error', (error) => {
      this.setState({ lastReceivedEvent : error})
      console.log(error);
    })
    
    //subscribe to event TokenSold
    await this.state.ethSwapWebSocket.events.TokensSold({})
    .on('data', async (event) =>{
        let amount = event.returnValues._value.toString()
        window.alert('FUN Token Sold: ' + window.web3.utils.fromWei(amount, 'Ether'))
        console.log('FUN TokenPurchase tx confirmed \n')
        console.log('From account: ', event.returnValues._from.toString())        
        console.log('Amount in FUN: ', window.web3.utils.fromWei(amount, 'Ether') )
        this.setState({ lastReceivedEvent : event.returnValues})
        console.log(event.returnValues)        
    })
    .on('error', (error) => {
      this.setState({ lastReceivedEvent : error});
      console.log(error);
    }) 

    this.setState({ loading: false });   

  }

  //Load Swap instance via infura webSocket API
  async loadEthSwapWebSocket(){
    const URL = `wss://ropsten.infura.io/ws/v3/38cb7abff6e14d6cbaea96888a7a3477`
    let web3Socket = new Web3(new Web3.providers.WebsocketProvider(URL));
    
    if (web3Socket){      
      const web3 = window.web3
      const networkId =  await web3.eth.net.getId()
      const ethSwapWebSocketData = Swap.networks[networkId]
      if(ethSwapWebSocketData) {
        const ethSwapWebSocket = await new web3Socket.eth.Contract(Swap.abi, ethSwapWebSocketData.address)
        this.setState({ ethSwapWebSocket })
      } else {
        window.alert('Swap contract not deployed to detected network.')
      }    
    } else{
      window.alert('Could not establish web socket connection to infura')
    }     
  }

  //Load Swap and FUN token instances via Metamask web3
  async loadBlockchainData() {
    const web3 = window.web3  
    const accounts = await web3.eth.getAccounts()
    this.setState({ account: accounts[0] })
    console.log(this.state.account)
    
    
    const ethBalance = await web3.eth.getBalance(this.state.account)
    this.setState({ ethBalance })

    // Load FUN Token
    const networkId =  await web3.eth.net.getId()
    const tokenData = Token.networks[networkId]
    if(tokenData) {
      const token = new web3.eth.Contract(Token.abi, tokenData.address)
      this.setState({ token })
      let tokenBalance = await token.methods.balanceOf(this.state.account).call()
      this.setState({ tokenBalance: tokenBalance.toString() })
      console.log("FUN Token address: ", tokenData.address)
    } else {
      window.alert('Token contract not deployed to detected network.')
    }

    // Load Swap
    const ethSwapData = await Swap.networks[networkId]
    if(ethSwapData) {
      const ethSwap = new web3.eth.Contract(Swap.abi, ethSwapData.address)
      this.setState({ ethSwap })
      console.log('ethSwap.options.address:' + this.state.ethSwap.options.address)      
    } else {
      window.alert('Swap contract not deployed to detected network.')
    }    
  }  
  
  async loadWeb3() {
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum);
      //window.web3 = new Web3("http://localhost:8545")
      //window.web3 = new Web3(new Web3.providers.WebsocketProvider('ws://localhost:8545'))
      await window.ethereum.enable();
      await window.ethereum.on('accountsChanged', async () => {
        const accounts = await window.web3.eth.getAccounts();            
        this.setState({ account: accounts[0] })       
      })
      this.setState({walletLoaded : true});      
    }
    else {
      window.alert('Non-Ethereum browser detected. You should consider trying MetaMask!')
      this.setState({walletLoaded : false});      
    }
    
  } 

  buyTokens = async (etherAmount) => {
    this.setState({ loading: true })
    await this.state.ethSwap.methods.buyTokens().send({ value: etherAmount, from: this.state.account })
      .on('transactionHash', (hash) => {
        this.setState({ txState: 'onTxHash' })
      })
      .on('confirmation', async (confirmationNumber, receipt) =>{        
        this.setState({ txState: 'onConfirmation' })
        const web3 = window.web3  
        const ethBalance = await web3.eth.getBalance(this.state.account)        
        let tokenBalance = await this.state.token.methods.balanceOf(this.state.account).call()
        this.setState({ 
          ethBalance : ethBalance ,
          tokenBalance: tokenBalance.toString() ,           
         })
        console.log("BuyTokens.on.Confirmation: ConfirmationNumber: " + confirmationNumber + " -> Receip.events: " + JSON.stringify(receipt))
      })
    this.setState({
      txState: '',
      loading: false
      })    
  }
  
  resetBuy = async () =>{
    //console.log("this.state.ethSwap.address: " + this.state.ethSwap.address)
    
    this.setState({ loading: true })
    await this.state.token.methods.approve(this.state.ethSwap.options.address, 1000000000).send({ from: this.state.account })
    await this.state.token.methods.approve(this.state.account ,1000000000).send({from: this.state.account})
    //await this.state.ethSwap.methods.resetBuy().send({ from: this.state.account })
    .on('transactionHash', async (hash) => {
      this.setState({ txState: 'onTxHash' })
      let amount = this.state.ethSwap.methods.getAmount().call()
      await window.web3.utils.fromWei( window.web3.utils.toBN(amount).toString(), 'Ether')
      await this.state.ethSwap.methods.resetBuy(amount).send({  from: this.state.account })        
      .on('transactionHash', (hash) => {
        this.setState({ txState: 'onTxHash' })
        })
      .on('confirmation', async (confirmationNumber, receipt) =>{      
        this.setState({ txState: 'onConfirmation' })
        const web3 = window.web3  
        const ethBalance = await web3.eth.getBalance(this.state.account)
        let tokenBalance = await this.state.token.methods.balanceOf(this.state.account).call()
        this.setState({ 
          ethBalance : ethBalance ,
          tokenBalance: tokenBalance.toString() ,             
        })
        console.log("SellTokens.on.Confirmation: ConfirmationNumber: " + confirmationNumber + " -> Receip.events: " + JSON.stringify(receipt))
      })
  this.setState({
    loading: false ,
    txState: '' })        
  })
  }

  sellTokens = async (tokenAmount) => {
    console.log("this.state.ethSwap.address: " + this.state.ethSwap.address)
    this.setState({ loading: true })
    await this.state.token.methods.approve(this.state.ethSwap.options.address, tokenAmount).send({ from: this.state.account })
    .on('transactionHash', async (hash) => {
        this.setState({ txState: 'onTxHash' })
        await this.state.ethSwap.methods.sellTokens(tokenAmount).send({ from: this.state.account })        
        .on('transactionHash', (hash) => {
          this.setState({ txState: 'onTxHash' })
          })
        .on('confirmation', async (confirmationNumber, receipt) =>{      
          this.setState({ txState: 'onConfirmation' })
          const web3 = window.web3  
          const ethBalance = await web3.eth.getBalance(this.state.account)
          let tokenBalance = await this.state.token.methods.balanceOf(this.state.account).call()
          this.setState({ 
            ethBalance : ethBalance ,
            tokenBalance: tokenBalance.toString() ,             
          })
          console.log("SellTokens.on.Confirmation: ConfirmationNumber: " + confirmationNumber + " -> Receip.events: " + JSON.stringify(receipt))
        })
    this.setState({
      loading: false ,
      txState: '' })        
    })
  }

  async handleClick(){       
      if (!this.state.walletLoaded) {
          await this.loadWallet();
      } else {            
        this.setState({walletLoaded : false}); ;
      }      
      console.log('TypeOf: ', typeof this.state.lastReceivedEvent)
  }


  render() {
    let content;    
    if (this.state.walletLoaded){
      if(this.state.loading) {
        let txStatus;
        switch(this.state.txState){
          case 'onTxHash':
            txStatus = 'Transaction Hash received from Deployed network...';
            break;
          case 'onConfirmation':
            txStatus = 'Confirmation received from Deployed network...';
            
            break;
          case 'onReceipt':
            txStatus = 'Tx receipt received from Deployed network. See console logs...';
            break;
          case 'onError':
            txStatus = 'Tx error received from Deployed network. Tx reverted...';
            break;
          default :
            txStatus = '' ;
        }
        content = <div>
          <p id="loader" className="text-center">Loading...</p>
          <br/>
          <p className='tx'>{txStatus}</p>
        </div>
      }else {
        const events = this.state.lastReceivedEvent;
        content = 
        <div className="row" style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center"
              }}
        >
          <div className="col-md-6">
            <Main
              ethBalance={this.state.ethBalance}
              tokenBalance={this.state.tokenBalance}
              buyTokens={this.buyTokens}
              resetBuy={this.resetBuy}
              sellTokens={this.sellTokens}
            />            
          </div>          
          <div className="col-md-6" >
            <LoadWallet handleClick={this.handleClick} walletLoaded={this.state.walletLoaded} />  
            <br/>
            Last event received from Network:
            <ul>
            {Object.keys(events).map((event, index) => <li key={index}>{event} : {events[event]}</li>)}
            </ul>           
          </div>
        </div>  
      }
    }
    else {
      content = <div style={{ alignItems: "center" }}>
        <div className="container" >
        <h3>Welcome</h3>
         <ul>
         <li><h5>Click the button below to connect Metamask wallet.</h5></li>
         <li><h5>Don't forget to select "Ropsten Test Network" in Metamask App.</h5></li>                      
         <li><h5>If you don??t own Ether on Ropsten you can request it for free at https://faucet.ropsten.be/.</h5></li>        
        </ul>   
        <LoadWallet handleClick={this.handleClick} walletLoaded={this.state.walletLoaded} />
        </div>
      </div>

    }

    return (
      <div>
        <Navbar account={this.state.account}/>
        <div className="container-fluid mt-5">
          <div className="row">
            <main role="main" className="col-lg-12 ml-auto mr-auto" style={{ maxWidth: '1000px' }}>
              <div className="content mr-auto ml-auto">
                <a
                  href="Chris_Lytrokapis"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                </a>

                {content}
                
              </div>
            </main>
          </div>
        </div>
      </div>
    );
  }
}

export default App;