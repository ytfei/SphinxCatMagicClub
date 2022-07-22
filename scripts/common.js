const { ethers } = require("hardhat");
const hre = require("hardhat");
const utils = hre.ethers.utils;
const { merkleTree } = require("./old/merkletree_util")
require("dotenv").config();

// const DEFAULT_CONTRACT_ADDRESS = "0x550490411d752810a82Be3D437aa7D59E5B36456" // ganache
const DEFAULT_CONTRACT_ADDRESS = "0xcf301544b10b41E62f986CA88157c9533d7E9487" // mumbai
// const DEFAULT_CONTRACT_ADDRESS = "0x5122D08F01400C8370228B6aF5e7E2E77f36Cecc" // goerli

async function connect(contractAddress) {
    const SphinxCat = await hre.ethers.getContractFactory("SphinxCat");

    if (contractAddress === undefined || contractAddress == null) {
        console.log(`using default contract address: ${DEFAULT_CONTRACT_ADDRESS}`)
        contractAddress = DEFAULT_CONTRACT_ADDRESS;
    }

    // '0xa4d8B326c0ed2D65989BC2bBe283D141528e8706'
    const sphinxCat = await SphinxCat.attach(contractAddress);

    return sphinxCat
}

function log_gas_price(receipt) {
    // console.log(receipt)

    const used = receipt.gasUsed
    const price = receipt.effectiveGasPrice

    const fee = utils.formatEther(used.mul(price))

    console.log(`Gas used = ${used}, Gas price = ${price}, Gas fee: ${fee} ether`)
}

module.exports = { connect, log_gas_price }