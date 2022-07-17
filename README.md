# Hardhat Project

This project demonstrates a basic Hardhat use case. It comes with a sample contract, a test for that contract, a sample script that deploys that contract, and an example of a task implementation, which simply lists the available accounts.

Try running some of the following tasks:

```shell
npx hardhat accounts
npx hardhat compile
npx hardhat clean
npx hardhat test
npx hardhat node
node scripts/sample-script.js
npx hardhat help
```

# API

## 应用程序接口

标准NFT ERC721接口请参考 [OpenZepplin ERC721接口](https://docs.openzeppelin.com/contracts/3.x/api/token/erc721)

```javascript
// 可以开始铸造/购买盲盒的时间（Linux 时间戳，秒）
public function timeStartMintMystery() return uint256;

// 盲盒自动打开的时间（Linux 时间戳，秒）
public function timeUncoverNFT() return uint256;

// 判断用户是否在白名单中
// @param proof 根据用户地址计算得到的hash数组
// @return bool 是否在白名单中
function isInAllowList(bytes32[] memory proof) return bool;

// 是否可以铸造:
// 判断是否可以铸造的条件是当前是否对外开售，并且依然有可铸造的余额
// @return bool 
function isMintable() return bool;

// 白名单用户购买
// @param quantity 购买盲盒的数量
// @param proof merkle hash 值
function allowListMint(uint256 quantity, bytes32[] memory proof);

// 当前用户还能铸造的NFT数量
// @return int 五个以内
function amountMintable() return int;

// 购买盲盒（普通用户购买）
// @param quantity 购买盲盒的数量
function publicSaleMint(uint256 quantity);

// 查询当前的价格（普通用户购买），这个价格是浮动的，随着已经铸造的数量变化。公开发售价格区间： 0.06 eth （1～1000），0.08 eth（1001～3000），0.1 eth（3001～6000）
// TODO: 问题：如果允许用户购买多个，那么用户在同时购买 1000,1001 是时候，用哪个价格？现在默认使用 1000时获得的价格。
// @return 当前的价格（注意价格单位 GWei，需要转换为 ether 显示)
function getCurrentPrice() uint256;

// 总共铸造了多少NFT 
// @return 已经铸造的NFT数量
function totalSupply() uint256;

// NFT总数量
// @return NFT总数量
function getCollectionSize() uint256;
```

## 管理端接口

> 前端不需要实现

```javascript
// 变更管理员
function transferOwnership(address newOwner);

// 提取合约余额
function withdrawMoney();

// 设置公开发售的阶段性价格
function setPrice(uint256 _stageOnePrice, uint256 _stageTwoPrice);

// 设置 MerkleRoot
function setRoot(bytes32 root);

```
# 联调

合约部署网络：以太坊 Goerli 测试网
合约部署地址：0xa4d8B326c0ed2D65989BC2bBe283D141528e8706

