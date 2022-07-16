const { ethers } = require("hardhat");
const hre = require("hardhat");
const utils = hre.ethers.utils;
const { merkleTree } = require("./old/merkletree_util")
require("dotenv").config();

async function connect(contractAddress) {
    const SphinxCat = await hre.ethers.getContractFactory("SphinxCat");

    // '0xa4d8B326c0ed2D65989BC2bBe283D141528e8706'
    const sphinxCat = await SphinxCat.attach(contractAddress);

    return sphinxCat
}

module.exports = { connect }