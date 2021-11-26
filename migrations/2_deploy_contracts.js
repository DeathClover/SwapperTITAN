var Swap = artifacts.require("Swap.sol");
var TokenX = artifacts.require("TokenX.sol")
const _totalSupply = '100000'

module.exports = async (deployer) => {

  await deployer.deploy(TokenX);
  const token = await TokenX.deployed();

  await deployer.deploy(Swap, token.address);
  const swap = await Swap.deployed();

  await token.transfer(swap.address, _totalSupply);
  var balance = await token.balanceOf(swap.address);
  console.log('--> 2_contractMigrations: balanceOf(Swap):', balance.toString());

};
