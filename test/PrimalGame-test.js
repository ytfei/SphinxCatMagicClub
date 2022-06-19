const { expect, assert } = require("chai");
const { ethers } = require("hardhat");
const { merkleTree } = require("../scripts/merkletree_util")


const TIME_START_MYSTREY = parseInt(Date.now() / 1000) - 10
const TIME_UNCOVER_MYSTREY = TIME_START_MYSTREY + 10 * 60

const BigNumber = ethers.BigNumber

describe("SphinxCat", function () {

  beforeEach(async function () {
    console.log("setup contracts", merkleTree.getHexRoot())

    const SphinxCat = await ethers.getContractFactory("SphinxCat");
    const sphinxCat = await SphinxCat.deploy(BigNumber.from(TIME_START_MYSTREY), BigNumber.from(TIME_UNCOVER_MYSTREY), merkleTree.getRoot());
    await sphinxCat.deployed();

    this.contract = sphinxCat
  })

  it("SphinxCat should be deployed and setup peroperly", async function () {
    expect(await this.contract.timeStartMintMystery()).to.equal(TIME_START_MYSTREY);
    expect(await this.contract.merkleRoot()).to.equal(ethers.utils.hexlify(merkleTree.getRoot()));

    const baseURIMystrey = "ipfs://baseURIMystrey/"
    const baseURIReal = "ipfs://baseURIReal/"

    const [owner, addr1] = await ethers.getSigners();
    console.log("Account balance =", ethers.utils.formatEther(await owner.getBalance()));

    const baseURITx = await this.contract.setBaseURI(baseURIMystrey, baseURIReal);
    await baseURITx.wait();

    // begin public sale
    const beginSaleTx = await this.contract.setPublicSaleStatus(true);
    await beginSaleTx.wait();

    // mint one NFT
    const options = { value: ethers.utils.parseEther("0.2") };
    const mintTx = await this.contract.publicSaleMint(1, options);
    await mintTx.wait();

    assert.equal(await this.contract.tokenURI(1), baseURIMystrey + "1")

    // expect(await primal.greet()).to.equal("Hello, world!");

    // const setGreetingTx = await greeter.setGreeting("Hola, mundo!");

    // // wait until the transaction is mined
    // await setGreetingTx.wait();

    // expect(await greeter.greet()).to.equal("Hola, mundo!");
  });
});
