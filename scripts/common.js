const { ethers } = require("hardhat");
const hre = require("hardhat");
const utils = hre.ethers.utils;
const { merkleTree } = require("./old/merkletree_util")
require("dotenv").config();

const DEFAULT_CONTRACT_ADDRESS = "0x45551c3668cAB1eD2CD82951ebCf53b195206CB6" // ganache
// const DEFAULT_CONTRACT_ADDRESS = "0xBbc7d5cFE25827e4893aB792280c6Ee367cF1732" // goerli

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