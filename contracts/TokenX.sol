// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./ERC20.sol";
  
contract TokenX is ERC20 {
    uint256 public constant INITIAL_SUPPLY = 100000 * 10 ** 18;
    address public admin;
    uint public hardCap;
      
    constructor() ERC20('Xtoken', 'FUN') {
        _mint(msg.sender, INITIAL_SUPPLY);
        hardCap = INITIAL_SUPPLY;
        admin = msg.sender;
    }
      
    function mint(uint amount)public {
        hardCap += amount;
        require(hardCap <= 10 * 10 ** 18, 'cannot mint more than 10B tokens');
        require(msg.sender == admin, 'only admin');
        _mint(msg.sender, amount);
    }

    function burn(uint amount) public {
        require(msg.sender == admin, 'only admin');
        _burn(msg.sender, amount);
    }
}