const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);
  
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", ethers.formatEther(balance));

  // Get the contract factory
  const TuklasArtMarketplace = await ethers.getContractFactory("TuklasArtMarketplace");

  // Deploy the contract
  console.log("Deploying TuklasArtMarketplace...");
  const tuklasArtMarketplace = await TuklasArtMarketplace.deploy();

  // Wait for the contract deployment transaction to be mined
  await tuklasArtMarketplace.waitForDeployment();

  console.log("TuklasArtMarketplace deployed to:", await tuklasArtMarketplace.getAddress());
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });