// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const { ethers } = require("hardhat");
const utils = hre.ethers.utils;
const { connect, log_gas_price } = require('./common.js')
const { merkleTree } = require('./old/merkletree_util')
const keccak256 = require('keccak256')

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

  const [owner, addr1] = await ethers.getSigners();

  const proof = merkleTree.getHexProof(keccak256(owner.address))

  console.log(`owner: ${owner.address}， proof: ${proof}`);

  const isInAllowList = await sphinxCat.isInAllowList(proof);
  console.log(`user ${owner.address} is in allow list ${isInAllowList}`)

  if (isInAllowList) {
    const mintNumber = ethers.BigNumber.from('5')

    const allowListMintTx = await sphinxCat.allowListMint(mintNumber, proof);
    const allowListMintTxReceipt = await allowListMintTx.wait();

    log_gas_price(allowListMintTxReceipt);

    const rest = await sphinxCat.amountMintable();
    console.log(`The rest for current user ${owner.address} to mint is ${rest}`);
  }

  // const reserveMintTxReceipt = await reserveMintTx.wait()
  // log_gas_price(reserveMintTxReceipt)
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
