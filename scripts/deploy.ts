import { ethers } from "hardhat";

async function main() {
    console.log("🚀 Starting Aura World Deployment...");

    // 1. Deploy AuraToken
    const AuraToken = await ethers.getContractFactory("AuraToken");
    const token = await AuraToken.deploy();
    await token.waitForDeployment();
    const tokenAddress = await token.getAddress();
    console.log(`✅ AuraToken deployed to: ${tokenAddress}`);

    // 2. Deploy AuraNFT
    const AuraNFT = await ethers.getContractFactory("AuraNFT");
    const nft = await AuraNFT.deploy();
    await nft.waitForDeployment();
    const nftAddress = await nft.getAddress();
    console.log(`✅ AuraNFT deployed to: ${nftAddress}`);

    // 3. Deploy Marketplace
    const Marketplace = await ethers.getContractFactory("AuraMarketplace");
    const marketplace = await Marketplace.deploy(tokenAddress, nftAddress);
    await marketplace.waitForDeployment();
    const marketplaceAddress = await marketplace.getAddress();
    console.log(`✅ Marketplace deployed to: ${marketplaceAddress}`);

    console.log("\n📜 Deployment Summary:");
    console.log("-----------------------------------");
    console.log(`Token:       ${tokenAddress}`);
    console.log(`NFT:         ${nftAddress}`);
    console.log(`Marketplace: ${marketplaceAddress}`);
    console.log("-----------------------------------");
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
