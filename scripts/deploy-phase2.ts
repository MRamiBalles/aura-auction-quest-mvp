import { ethers } from "hardhat";

async function main() {
    console.log("🚀 Starting Phase 2 Contract Deployment...\n");

    const [deployer] = await ethers.getSigners();
    console.log("Deploying contracts with account:", deployer.address);
    console.log("Account balance:", (await deployer.provider.getBalance(deployer.address)).toString());

    // Deploy Marketplace
    console.log("\n📦 Deploying Marketplace...");
    const Marketplace = await ethers.getContractFactory("Marketplace");
    const marketplace = await Marketplace.deploy();
    await marketplace.waitForDeployment();
    const marketplaceAddress = await marketplace.getAddress();
    console.log("✅ Marketplace deployed to:", marketplaceAddress);

    // Deploy AuctionHouse
    console.log("\n🔨 Deploying AuctionHouse...");
    const AuctionHouse = await ethers.getContractFactory("AuctionHouse");
    const auctionHouse = await AuctionHouse.deploy();
    await auctionHouse.waitForDeployment();
    const auctionHouseAddress = await auctionHouse.getAddress();
    console.log("✅ AuctionHouse deployed to:", auctionHouseAddress);

    // Get AuraToken address (should be deployed from Phase 1)
    // For testnet, replace with your actual deployed AuraToken address
    const AURA_TOKEN_ADDRESS = process.env.AURA_TOKEN_ADDRESS || "0x0000000000000000000000000000000000000000";

    if (AURA_TOKEN_ADDRESS === "0x0000000000000000000000000000000000000000") {
        console.warn("\n⚠️  Warning: AURA_TOKEN_ADDRESS not set in .env");
        console.warn("Please deploy AuraToken first and set AURA_TOKEN_ADDRESS in .env");
        console.warn("Skipping Staking contract deployment...");
    } else {
        // Deploy Staking
        console.log("\n💰 Deploying Staking...");
        const Staking = await ethers.getContractFactory("Staking");
        const staking = await Staking.deploy(AURA_TOKEN_ADDRESS);
        await staking.waitForDeployment();
        const stakingAddress = await staking.getAddress();
        console.log("✅ Staking deployed to:", stakingAddress);
    }

    console.log("\n🎉 Phase 2 Deployment Complete!\n");
    console.log("Contract Addresses:");
    console.log("-------------------");
    console.log("Marketplace:", marketplaceAddress);
    console.log("AuctionHouse:", auctionHouseAddress);
    if (AURA_TOKEN_ADDRESS !== "0x0000000000000000000000000000000000000000") {
        const Staking = await ethers.getContractFactory("Staking");
        const staking = Staking.attach(AURA_TOKEN_ADDRESS); // This is just for logging
        console.log("Staking:", await staking.getAddress());
    }

    console.log("\n📝 Next Steps:");
    console.log("1. Update frontend config with contract addresses");
    console.log("2. Approve Marketplace/AuctionHouse for your NFTs");
    console.log("3. Test marketplace listing and auction creation");
    console.log("4. Verify contracts on block explorer");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
