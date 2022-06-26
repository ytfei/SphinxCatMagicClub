// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const hre = require("hardhat");
const utils = hre.ethers.utils;
const { merkleTree } = require("../scripts/merkletree_util")
require("dotenv").config();

const TIME_START_MYSTREY = parseInt(Date.now() / 1000) - 10
const TIME_UNCOVER_MYSTREY = TIME_START_MYSTREY + 24 * 60 * 60

const BigNumber = ethers.BigNumber

// deploy resources
async function deploy() {
  const SphinxCat = await hre.ethers.getContractFactory("SphinxCat");
  const cat = await SphinxCat.deploy(BigNumber.from(TIME_START_MYSTREY), BigNumber.from(TIME_UNCOVER_MYSTREY), merkleTree.getRoot());

  await cat.deployed();

  const beginSaleTx = await cat.setPublicSaleStatus(true);
  await beginSaleTx.wait();

  console.log(`SphinxCat is deployed successfully [${cat.address}]`);

  return cat
}

async function main() {
  await deploy()
}

// module.exports.deploy = deploy;

// We recommend this pattern to be able to use async/await everywhere
// // and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
