const { expect, assert } = require("chai");
const { ethers } = require("hardhat");
const { merkleTree } = require("../scripts/merkletree_util")


const TIME_START_MYSTREY = parseInt(Date.now() / 1000) - 10
const TIME_UNCOVER_MYSTREY = TIME_START_MYSTREY + 10 * 60 // 十分钟后盲盒自动开启

const BigNumber = ethers.BigNumber

describe("SphinxCat", function () {

  beforeEach(async function () {
    console.log("setup contracts", merkleTree.getHexRoot())

    const SphinxCat = await ethers.getContractFactory("SphinxCat");
    const sphinxCat = await SphinxCat.deploy(BigNumber.from(TIME_START_MYSTREY), BigNumber.from(TIME_UNCOVER_MYSTREY), merkleTree.getRoot());

    console.log(`HexRoot = ${merkleTree.getHexRoot()}`)

    await sphinxCat.deployed();

    this.contract = sphinxCat
  })

  it("SphinxCat should be deployed and setup peroperly", async function () {
    // 检查合约设置的属性是否正常
    expect(await this.contract.timeStartMintMystery()).to.equal(TIME_START_MYSTREY);
    expect(await this.contract.merkleRoot()).to.equal(ethers.utils.hexlify(merkleTree.getRoot()));

    const baseURIMystrey = "ipfs://bafybeie7xixwavdqxlnyxj7r3m2o6cp5faksqzjwfkdffwdnlk7gguj7k4/"
    const baseURIReal = "ipfs://bafybeie7xixwavdqxlnyxj7r3m2o6cp5faksqzjwfkdffwdnlk7gguj7k4/"

    const [owner, addr1] = await ethers.getSigners();
    console.log("Account balance before mint =", ethers.utils.formatEther(await owner.getBalance()));

    // 初始化合约参数
    const baseURITx = await this.contract.setBaseURI(baseURIMystrey, baseURIReal);
    await baseURITx.wait();

    quantity = 3
    for (i = 0; i < quantity; i++) {
      assert.equal(await mintNFT(owner, this.contract), i + 1);
    }

    console.log("Account balance after mint =", ethers.utils.formatEther(await owner.getBalance()));
    console.log("Contract balance after mint =", ethers.utils.formatEther(await getContractBalance(this.contract)));

    // 判定：合约最后的价格与期望收到价格是一致的
    // 在 3000个左右，这个逻辑会有问题
    const price = await this.contract.getCurrentPrice();
    assert.isTrue(price.mul(quantity).eq(await getContractBalance(this.contract)));

    // 将账户的代币提现出来
    const withdrawTx = await this.contract.withdrawMoney();
    await withdrawTx.wait();
    console.log("Contract balance after withdraw =", ethers.utils.formatEther(await getContractBalance(this.contract)));
    console.log("Account balance after withdraw =", ethers.utils.formatEther(await owner.getBalance()));

    // 判定：铸造的数量
    const totalSupply = await this.contract.totalSupply();
    assert.equal(totalSupply.toNumber(), quantity);

    const addr = await this.contract.ownerOf(BigNumber.from(0));
    assert.equal(addr, owner.address);

    assert.equal(await this.contract.tokenURI(0), baseURIMystrey + "0")
  });
});

async function mintNFT(owner, contract) {
  const price = await contract.getCurrentPrice();

  // mint one NFT
  const options = { value: price };
  const mintTx = await contract.publicSaleMint(1, options);
  await mintTx.wait();

  const balance = await contract.balanceOf(owner.address);
  return balance.toNumber();
}

async function getContractBalance(contract) {
  return await ethers.provider.getBalance(contract.address);
}
