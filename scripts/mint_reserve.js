// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const { ethers } = require("hardhat");
const utils = hre.ethers.utils;
const { connect, log_gas_price } = require('./common.js')

require("dotenv").config();

async function main() {
  // Hardhat always runs the compile task when running scripts with its command
  // line interface.
  //
  // If this script is run directly using `node` you may want to call compile
  // manually to make sure everything is compiled
  // await hre.run('compile');

  // We get the contract to deploy

  // const sphinxCat = await connect('0x705f217469A48948Da3b2C131Fb057012F2a36e0');
  const sphinxCat = await connect();

  const[owner, addr1] = await ethers.getSigners();

  console.log(`owner: ${owner.address}`);

  const mintNumber = ethers.BigNumber.from('5')
  const reserveMintTx = await sphinxCat.reserveMint(mintNumber, owner.address);

  const reserveMintTxReceipt = await reserveMintTx.wait()
  log_gas_price(reserveMintTxReceipt)
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
