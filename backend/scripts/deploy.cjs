const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);
  
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", hre.ethers.formatEther(balance));

  // Get the contract factory
  const TuklasArtMarketplace = await hre.ethers.getContractFactory("TuklasArtMarketplace");

  // Define the admin wallet address - using the same address as in the contract
  const adminWallet = "0x784a2430a204cCB93Fb9010008435e0A3cCA5675";

  // Deploy the contract WITH the admin wallet address parameter
  console.log("Deploying TuklasArtMarketplace...");
  const tuklasArtMarketplace = await TuklasArtMarketplace.deploy(adminWallet);

  await tuklasArtMarketplace.waitForDeployment();

  const deployedAddress = await tuklasArtMarketplace.getAddress();
  console.log("TuklasArtMarketplace deployed to:", deployedAddress);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });