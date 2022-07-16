// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const hre = require("hardhat");
const { connect } = require('./common.js')

require("dotenv").config();

async function main() {
  // Hardhat always runs the compile task when running scripts with its command
  // line interface.
  //
  // If this script is run directly using `node` you may want to call compile
  // manually to make sure everything is compiled
  // await hre.run('compile');

  // We get the contract to deploy

  const sphinxCat = await connect('0xa4d8B326c0ed2D65989BC2bBe283D141528e8706')

  const TIME_START_MYSTREY = parseInt(new Date().getTime() / 1000) - 10
  const TIME_UNCOVER_MYSTREY = TIME_START_MYSTREY + 24 * 60 * 60 * 20
  const setTimeTx = await sphinxCat.setTime(TIME_START_MYSTREY, TIME_UNCOVER_MYSTREY);
  await setTimeTx.wait()
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
