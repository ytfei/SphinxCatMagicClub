// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const hre = require("hardhat");
const { connect, log_gas_price } = require('./common.js')

require("dotenv").config();

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

  // Date日期中的month是从0开始编号的
  const begin = new Date(2022, 6, 20, 7, 0, 0); // 有时区信息
  const beginInSec = begin.getTime() / 1000; // 秒
  const beginInSecUTC = beginInSec - begin.getTimezoneOffset() * 60;

  const TIME_START_MYSTREY = beginInSecUTC
  const TIME_UNCOVER_MYSTREY = TIME_START_MYSTREY + 6 * 60 * 60 * 1

  const setTimeTx = await sphinxCat.setTime(TIME_START_MYSTREY, TIME_UNCOVER_MYSTREY);
  const setTimeTxReceipt = await setTimeTx.wait()
  log_gas_price(setTimeTxReceipt)
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
