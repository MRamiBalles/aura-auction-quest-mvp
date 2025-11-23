import { ethers } from "hardhat";
import fs from "fs";
import path from "path";

/**
 * Deployment Script for Polygon Amoy Testnet
 * 
 * Deploys all contracts in correct order:
 * 1. AuraToken (ERC-20)
 * 2. AuraNFT (ERC-721)
 * 3. Marketplace
 * 4. AuctionHouse
 * 5. Staking
 * 
 * Saves deployment addresses to JSON file
 */

async function main() {
    console.log("🚀 Starting Polygon Amoy Testnet Deployment");
    console.log("=".repeat(60));

    const [deployer] = await ethers.getSigners();

    console.log("\n📍 Deploying from address:", deployer.address);
    console.log("💰 Account balance:",
        ethers.formatEther(await ethers.provider.getBalance(deployer.address)),
        "MATIC"
    );

    // Confirm deployment
    console.log("\n⏸️  Deployment will start in 5 seconds...");
    console.log("⚠️  Press Ctrl+C to cancel");
    await new Promise(resolve => setTimeout(resolve, 5000));

    const deployedAddresses: any = {
        network: "polygon-amoy",
        chainId: 80002,
        deployer: deployer.address,
        timestamp: new Date().toISOString(),
        contracts: {}
    };

    // ========================================
    // 1. Deploy AuraToken (ERC-20)
    // ========================================
    console.log("\n\n1️⃣  Deploying AuraToken...");
    const AuraToken = await ethers.getContractFactory("AuraToken");
    const auraToken = await AuraToken.deploy();
    await auraToken.waitForDeployment();

    const auraTokenAddress = await auraToken.getAddress();
    deployedAddresses.contracts.AuraToken = auraTokenAddress;

    console.log("✅ AuraToken deployed to:", auraTokenAddress);

    // Wait for confirmations
    console.log("⏳ Waiting for 2 block confirmations...");
    await auraToken.deploymentTransaction()?.wait(2);

    // ========================================
    // 2. Deploy AuraNFT (ERC-721)
    // ========================================
    console.log("\n\n2️⃣  Deploying AuraNFT...");
    const AuraNFT = await ethers.getContractFactory("AuraNFT");
    const auraNFT = await AuraNFT.deploy();
    await auraNFT.waitForDeployment();

    const auraNFTAddress = await auraNFT.getAddress();
    deployedAddresses.contracts.AuraNFT = auraNFTAddress;

    console.log("✅ AuraNFT deployed to:", auraNFTAddress);
    await auraNFT.deploymentTransaction()?.wait(2);

    // ========================================
    // 3. Deploy Marketplace
    // ========================================
    console.log("\n\n3️⃣  Deploying Marketplace...");
    const Marketplace = await ethers.getContractFactory("Marketplace");
    const marketplace = await Marketplace.deploy();
    await marketplace.waitForDeployment();

    const marketplaceAddress = await marketplace.getAddress();
    deployedAddresses.contracts.Marketplace = marketplaceAddress;

    console.log("✅ Marketplace deployed to:", marketplaceAddress);
    await marketplace.deploymentTransaction()?.wait(2);

    // ========================================
    // 4. Deploy AuctionHouse
    // ========================================
    console.log("\n\n4️⃣  Deploying AuctionHouse...");
    const AuctionHouse = await ethers.getContractFactory("AuctionHouse");
    const auctionHouse = await AuctionHouse.deploy();
    await auctionHouse.waitForDeployment();

    const auctionHouseAddress = await auctionHouse.getAddress();
    deployedAddresses.contracts.AuctionHouse = auctionHouseAddress;

    console.log("✅ AuctionHouse deployed to:", auctionHouseAddress);
    await auctionHouse.deploymentTransaction()?.wait(2);

    // ========================================
    // 5. Deploy Staking
    // ========================================
    console.log("\n\n5️⃣  Deploying Staking...");
    const Staking = await ethers.getContractFactory("Staking");
    const staking = await Staking.deploy(auraTokenAddress);
    await staking.waitForDeployment();

    const stakingAddress = await staking.getAddress();
    deployedAddresses.contracts.Staking = stakingAddress;

    console.log("✅ Staking deployed to:", stakingAddress);
    await staking.deploymentTransaction()?.wait(2);

    // ========================================
    // Post-Deployment Configuration
    // ========================================
    console.log("\n\n📋 Post-Deployment Configuration");
    console.log("=".repeat(60));

    // Fund staking contract with rewards
    console.log("\n💰 Funding Staking contract with reward pool...");
    const rewardAmount = ethers.parseEther("1000000"); // 1M AURA for rewards

    await auraToken.mint(deployer.address, rewardAmount);
    await auraToken.approve(stakingAddress, rewardAmount);
    await staking.fundRewards(rewardAmount);

    console.log("✅ Staking funded with", ethers.formatEther(rewardAmount), "AURA");

    // Mint some test NFTs
    console.log("\n🎨 Minting test NFTs...");
    for (let i = 0; i < 5; i++) {
        await auraNFT.mint(deployer.address);
    }
    console.log("✅ Minted 5 test NFTs to deployer");

    // Mint test tokens to deployer
    console.log("\n🪙 Minting test tokens...");
    await auraToken.mint(deployer.address, ethers.parseEther("10000"));
    console.log("✅ Minted 10,000 AURA to deployer");

    // ========================================
    // Save Deployment Info
    // ========================================
    const deploymentsDir = path.join(__dirname, "../deployments");
    if (!fs.existsSync(deploymentsDir)) {
        fs.mkdirSync(deploymentsDir, { recursive: true });
    }

    const filename = `amoy-testnet-${Date.now()}.json`;
    const filepath = path.join(deploymentsDir, filename);

    fs.writeFileSync(filepath, JSON.stringify(deployedAddresses, null, 2));

    // Also save as "latest"
    const latestPath = path.join(deploymentsDir, "amoy-testnet-latest.json");
    fs.writeFileSync(latestPath, JSON.stringify(deployedAddresses, null, 2));

    // ========================================
    // Summary
    // ========================================
    console.log("\n\n🎉 DEPLOYMENT COMPLETE!");
    console.log("=".repeat(60));
    console.log("\n📊 Deployment Summary:");
    console.log("Network:", deployedAddresses.network);
    console.log("Chain ID:", deployedAddresses.chainId);
    console.log("Deployer:", deployedAddresses.deployer);
    console.log("\n📝 Contract Addresses:");
    console.log("  AuraToken:", auraTokenAddress);
    console.log("  AuraNFT:", auraNFTAddress);
    console.log("  Marketplace:", marketplaceAddress);
    console.log("  AuctionHouse:", auctionHouseAddress);
    console.log("  Staking:", stakingAddress);

    console.log("\n💾 Deployment info saved to:");
    console.log("  ", filepath);
    console.log("  ", latestPath);

    // ========================================
    // Verification Instructions
    // ========================================
    console.log("\n\n🔍 Next Steps - Contract Verification:");
    console.log("=".repeat(60));
    console.log("\nRun these commands to verify on PolygonScan:");
    console.log("");
    console.log(`npx hardhat verify --network amoy ${auraTokenAddress}`);
    console.log(`npx hardhat verify --network amoy ${auraNFTAddress}`);
    console.log(`npx hardhat verify --network amoy ${marketplaceAddress}`);
    console.log(`npx hardhat verify --network amoy ${auctionHouseAddress}`);
    console.log(`npx hardhat verify --network amoy ${stakingAddress} ${auraTokenAddress}`);

    console.log("\n\n📱 Frontend Configuration:");
    console.log("=".repeat(60));
    console.log("\nAdd these addresses to your frontend config:");
    console.log(`
export const CONTRACTS = {
  AuraToken: "${auraTokenAddress}",
  AuraNFT: "${auraNFTAddress}",
  Marketplace: "${marketplaceAddress}",
  AuctionHouse: "${auctionHouseAddress}",
  Staking: "${stakingAddress}",
};

export const NETWORK = {
  name: "Polygon Amoy Testnet",
  chainId: 80002,
  rpcUrl: "https://rpc-amoy.polygon.technology/",
  blockExplorer: "https://amoy.polygonscan.com/",
};
  `);

    console.log("\n\n🧪 Testing:");
    console.log("=".repeat(60));
    console.log("\n1. Add Polygon Amoy to MetaMask:");
    console.log("   Network Name: Polygon Amoy Testnet");
    console.log("   RPC URL: https://rpc-amoy.polygon.technology/");
    console.log("   Chain ID: 80002");
    console.log("   Currency: MATIC");
    console.log("   Block Explorer: https://amoy.polygonscan.com/");

    console.log("\n2. Get testnet MATIC:");
    console.log("   https://faucet.polygon.technology/");

    console.log("\n3. Interact with contracts:");
    console.log("   - View on PolygonScan:");
    console.log("     https://amoy.polygonscan.com/address/" + marketplaceAddress);

    console.log("\n\n✅ Deployment script completed successfully!");
}

// Execute deployment
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("\n\n❌ DEPLOYMENT FAILED");
        console.error("=".repeat(60));
        console.error(error);
        process.exit(1);
    });
