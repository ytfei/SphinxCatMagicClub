// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const { ethers } = require("hardhat");
const utils = hre.ethers.utils;
require("dotenv").config();


const CONTRACT_ADDRESS = "0x818dd1c4224236eE4b7a649F02d73c15263f48f7"

async function main() {
    const SphinxCat = await ethers.getContractFactory("SphinxCat");
    const cat = await SphinxCat.attach(CONTRACT_ADDRESS);

    console.log(`begin to reserveMint: ${CONTRACT_ADDRESS} ${new Date()}`)

    const [owner, addr1] = await ethers.getSigners();
    const reserveTx = await cat.reserveMint(10, owner.address);
    await reserveTx.wait();

    console.log(`end: ${CONTRACT_ADDRESS} ${new Date()}`)
}


// module.exports.deploy = deploy;

// We recommend this pattern to be able to use async/await everywhere
// // and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
