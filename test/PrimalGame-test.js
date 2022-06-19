const { expect } = require("chai");
const { ethers } = require("hardhat");
const { merkleTree } = require("../scripts/merkletree_util")


const TIME_START_MYSTREY = parseInt(Date.now() / 1000)
const TIME_UNCOVER_MYSTREY = TIME_START_MYSTREY + 10 * 60

const BigNumber = ethers.BigNumber

describe("PrimalGame", function () {

  beforeEach(function () {
    console.log("Hello, world!", merkleTree.getHexRoot())
  })

  it("PrimalGame should be deployed", async function () {
    const PrimalGame = await ethers.getContractFactory("PrimalGame");
    const primal = await PrimalGame.deploy(BigNumber.from(TIME_START_MYSTREY), BigNumber.from(TIME_UNCOVER_MYSTREY), merkleTree.getRoot());
    await primal.deployed();

    // expect(await greeter.greet()).to.equal("Hello, world!");

    // const setGreetingTx = await greeter.setGreeting("Hola, mundo!");

    // // wait until the transaction is mined
    // await setGreetingTx.wait();

    // expect(await greeter.greet()).to.equal("Hola, mundo!");
  });
});
