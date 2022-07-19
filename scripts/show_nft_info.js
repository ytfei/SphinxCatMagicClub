// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const { ethers } = require("hardhat");
const { connect, log_gas_price } = require('./common.js')

const { merkleTree } = require('./old/merkletree_util')
const keccak256 = require('keccak256')

require("dotenv").config();

// 查询NFT的所有信息
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

  const timeStartMintMystery = await sphinxCat.timeStartMintMystery();
  const timeUncoverNFT = await sphinxCat.timeUncoverNFT();
  // const isMintable = await sphinxCat.isMintable();
  const amountMintable = await sphinxCat.amountMintable();
  const getCurrentPrice = await sphinxCat.getCurrentPrice();
  const totalSupply = await sphinxCat.totalSupply();
  const getCollectionSize = await sphinxCat.getCollectionSize();

  const proof = merkleTree.getHexProof(keccak256(owner.address))
  // const proof = merkleTree.getHexProof(keccak256('0x2F6458727f03d3550df11DE70937AAb87D706281'))
  console.log(`proof: ${proof}`)

  const isInAllowList = await sphinxCat.isInAllowList(proof) // 用户是否在白名单中

  const reservedMintAmount = await sphinxCat.reservedMintAmount() // 保留的NFT数量（用于社区活动），只能由管理员铸造
  
  const PUBLIC_SALE_AMOUNT = await sphinxCat.PUBLIC_SALE_AMOUNT() // 公开销售的总额（固定值）
  const amountForPublicSale = await sphinxCat.amountForPublicSale() // 公开销售的数量（余额）

  const allowListMintAmount = await sphinxCat.allowListMintAmount() // 白名单销售数量（余额）

  const name = await sphinxCat.name()
  const symbol = await sphinxCat.symbol()

  console.log(`
  == NFT ${name} (${symbol})
  timeStartMintMystery: ${new Date(timeStartMintMystery * 1000)}
  timeUncoverNFT: ${new Date(timeUncoverNFT * 1000)}
  totalSupply: ${totalSupply}
  getCollectionSize: ${getCollectionSize}

  == reserved
  reservedMintAmount: ${reservedMintAmount}

  == allow list
  isInAllowList: ${isInAllowList}
  amountMintable(for current user[allow list]): ${amountMintable}
  allowListMintAmount: ${allowListMintAmount}
  
  == public sale
  amountForPublicSale: ${amountForPublicSale}/${PUBLIC_SALE_AMOUNT}
  getCurrentPrice: ${ethers.utils.formatEther(getCurrentPrice)} ether
  `)

  const numberMinted = await sphinxCat.numberMinted(owner.address);
  if (numberMinted > 0) {
    console.log(`There are ${numberMinted} NFT for user ${owner.address}: `)

    for (let i = 0; i < numberMinted; i++) {
      const tokenId = await sphinxCat.tokenOfOwnerByIndex(owner.address, i);
      const tokenURI = await sphinxCat.tokenURI(tokenId)

      console.log(`- ${symbol} #${tokenId}, ${tokenURI}`)
    }
  } else {
    console.log(`No NFT available for user ${owner.address}`)
  }

}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
