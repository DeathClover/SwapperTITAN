// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import './TokenX.sol';
import "./Safemath.sol";

contract Swap {
    
    using SafeMath for uint256;
    
    enum State {Pending,ResetSwap,SwapDone}
    State public state;
    
    string public name = "Swap Like A TITAN";
    TokenX public token;
    uint public rate = 1000; //redepmtion rate: tokens to receive for 1 ether
    
    uint tokenAmount;
    uint ammount;
    uint locktime;
    mapping(uint => address) public stored;
    uint store;
    uint256 private constant _TIMELOCK = 10 seconds;

    constructor (TokenX _token)  {
        token = _token;
    }

    event TokensPurchased (address indexed _from, address indexed _token, uint256 _value, uint _rate);
    event TokensSold (address indexed _from, address indexed _token, uint256 _value, uint _rate);
    event buyFailure(address indexed _from, uint256 _value);

    function buyTokens () public payable {
        tokenAmount = rate.mul(msg.value) ; 
        ammount = tokenAmount;
        //require that Swap exchange has enough tokens to proceed with swap
        //require(token.balanceOf(address(this)) >= tokenAmount);
        
        //for the reset function
        store = msg.value;
        locktime = block.timestamp + _TIMELOCK;
        state = State.Pending;
        
        //transfer tokens to investor
        //(bool success,) = address(token).call{ value: tokenAmount}(abi.encodeWithSignature("transfer(address,uint256)", "call transfer", 123)) ;
        bool success = token.transfer(msg.sender, tokenAmount);
        if (success){
            emit TokensPurchased(msg.sender, address(token), tokenAmount, rate);
        }
        else{
            emit buyFailure(msg.sender, tokenAmount);
        }

    }

    function getAmount() public view returns(uint){
        return ammount;
    }

    function sellTokens(uint _amount) public {
        require(token.balanceOf(msg.sender) >= _amount);
        uint etherAmount = _amount.div(rate);
        require (address(this).balance >= etherAmount);
        token.transferFrom(msg.sender , address(this),  _amount);
        payable(msg.sender).transfer(etherAmount);
        emit TokensSold (msg.sender, address(token), _amount, rate);
    }
    
    
    function resetBuy(uint _amount) public {
        require(state == State.Pending , "You cann't withdrawMoney");
        ammount = _amount;
        if (block.timestamp < locktime){
            //sellTokens(ammount);
            require(token.balanceOf(msg.sender) >= ammount);
            uint etherAmount = ammount.div(rate);
            require (address(this).balance >= etherAmount);
            token.transferFrom(msg.sender , address(this),  ammount);
            payable(msg.sender).transfer(etherAmount);
            emit buyFailure(msg.sender, tokenAmount);
            state = State.ResetSwap;
            
        }else{
            state = State.SwapDone;
        }
    }

    function getBalance() public view returns(uint) {
        return address(this).balance;
    }

    receive() external payable{
        //i should have done it for owner only 
    }
    
}