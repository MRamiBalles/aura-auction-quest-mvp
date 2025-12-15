/**
 * Aura World - Complete Contract Deployment Script
 * 
 * Deploys ALL contracts to Polygon Amoy testnet:
 * - Core: AuraToken, AuraNFT, Marketplace, AuctionHouse
 * - Premium: PremiumSubscription, BattlePass
 * - Landlords: LandRegistry
 * - Social: ReferralSystem, GuildSystem
 * - Events: SafariZoneNFT
 * - Account Abstraction: SmartAccountFactory, AuraPaymaster
 * 
 * Usage:
 *   npx hardhat run scripts/deploy.ts --network amoy
 * 
 * @author Manuel Ramírez Ballesteros
 * @version 2.0.0 - Full deployment
 */
import { ethers } from "hardhat";
import * as fs from "fs";

interface DeployedContracts {
    [key: string]: string;
}

async function main() {
    const [deployer] = await ethers.getSigners();
    console.log("🚀 Starting Aura World Full Deployment...");
    console.log(`📍 Deployer: ${deployer.address}`);
    console.log(`💰 Balance: ${ethers.formatEther(await ethers.provider.getBalance(deployer.address))} MATIC\n`);

    const deployed: DeployedContracts = {};

    // ========== CORE CONTRACTS ==========
    console.log("📦 Deploying Core Contracts...");

    // 1. AuraToken
    const AuraToken = await ethers.getContractFactory("AuraToken");
    const token = await AuraToken.deploy();
    await token.waitForDeployment();
    deployed.AuraToken = await token.getAddress();
    console.log(`  ✅ AuraToken: ${deployed.AuraToken}`);

    // 2. AuraNFT
    const AuraNFT = await ethers.getContractFactory("AuraNFT");
    const nft = await AuraNFT.deploy();
    await nft.waitForDeployment();
    deployed.AuraNFT = await nft.getAddress();
    console.log(`  ✅ AuraNFT: ${deployed.AuraNFT}`);

    // 3. Marketplace
    const Marketplace = await ethers.getContractFactory("Marketplace");
    const marketplace = await Marketplace.deploy(deployed.AuraToken, deployed.AuraNFT);
    await marketplace.waitForDeployment();
    deployed.Marketplace = await marketplace.getAddress();
    console.log(`  ✅ Marketplace: ${deployed.Marketplace}`);

    // 4. AuctionHouse
    const AuctionHouse = await ethers.getContractFactory("AuctionHouse");
    const auction = await AuctionHouse.deploy(deployed.AuraNFT, deployed.AuraToken);
    await auction.waitForDeployment();
    deployed.AuctionHouse = await auction.getAddress();
    console.log(`  ✅ AuctionHouse: ${deployed.AuctionHouse}`);

    // ========== PREMIUM CONTRACTS ==========
    console.log("\n💎 Deploying Premium Contracts...");

    // 5. PremiumSubscription (Ghost Mode)
    const PremiumSubscription = await ethers.getContractFactory("PremiumSubscription");
    const premium = await PremiumSubscription.deploy();
    await premium.waitForDeployment();
    deployed.PremiumSubscription = await premium.getAddress();
    console.log(`  ✅ PremiumSubscription: ${deployed.PremiumSubscription}`);

    // 6. BattlePass
    const BattlePass = await ethers.getContractFactory("BattlePass");
    const battlePass = await BattlePass.deploy(deployed.AuraToken);
    await battlePass.waitForDeployment();
    deployed.BattlePass = await battlePass.getAddress();
    console.log(`  ✅ BattlePass: ${deployed.BattlePass}`);

    // ========== LANDLORDS CONTRACTS ==========
    console.log("\n🏠 Deploying Landlords Contracts...");

    // 7. LandRegistry (requires backend validator address)
    const backendValidator = process.env.BACKEND_VALIDATOR_ADDRESS || deployer.address;
    const LandRegistry = await ethers.getContractFactory("LandRegistry");
    const land = await LandRegistry.deploy(backendValidator);
    await land.waitForDeployment();
    deployed.LandRegistry = await land.getAddress();
    console.log(`  ✅ LandRegistry: ${deployed.LandRegistry}`);
    console.log(`     Backend Validator: ${backendValidator}`);

    // ========== SOCIAL CONTRACTS ==========
    console.log("\n👥 Deploying Social Contracts...");

    // 8. ReferralSystem
    const ReferralSystem = await ethers.getContractFactory("ReferralSystem");
    const referral = await ReferralSystem.deploy(deployed.AuraToken);
    await referral.waitForDeployment();
    deployed.ReferralSystem = await referral.getAddress();
    console.log(`  ✅ ReferralSystem: ${deployed.ReferralSystem}`);

    // 9. GuildSystem
    const GuildSystem = await ethers.getContractFactory("GuildSystem");
    const guild = await GuildSystem.deploy(deployed.AuraNFT, deployed.AuraToken);
    await guild.waitForDeployment();
    deployed.GuildSystem = await guild.getAddress();
    console.log(`  ✅ GuildSystem: ${deployed.GuildSystem}`);

    // ========== EVENTS CONTRACTS ==========
    console.log("\n🎪 Deploying Events Contracts...");

    // 10. SafariZoneNFT
    const SafariZoneNFT = await ethers.getContractFactory("SafariZoneNFT");
    const safari = await SafariZoneNFT.deploy(backendValidator);
    await safari.waitForDeployment();
    deployed.SafariZoneNFT = await safari.getAddress();
    console.log(`  ✅ SafariZoneNFT: ${deployed.SafariZoneNFT}`);

    // ========== ACCOUNT ABSTRACTION ==========
    console.log("\n🔐 Deploying Account Abstraction Contracts...");

    // 11. SmartAccountFactory
    const SmartAccountFactory = await ethers.getContractFactory("SmartAccountFactory");
    const factory = await SmartAccountFactory.deploy();
    await factory.waitForDeployment();
    deployed.SmartAccountFactory = await factory.getAddress();
    console.log(`  ✅ SmartAccountFactory: ${deployed.SmartAccountFactory}`);

    // 12. AuraPaymaster (EntryPoint address for Polygon)
    const ENTRY_POINT = "0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789"; // ERC-4337 EntryPoint
    const AuraPaymaster = await ethers.getContractFactory("AuraPaymaster");
    const paymaster = await AuraPaymaster.deploy(ENTRY_POINT);
    await paymaster.waitForDeployment();
    deployed.AuraPaymaster = await paymaster.getAddress();
    console.log(`  ✅ AuraPaymaster: ${deployed.AuraPaymaster}`);

    // ========== TOKENOMICS ==========
    console.log("\n🔥 Deploying Tokenomics Contracts...");

    // 13. BurnManager
    const BurnManager = await ethers.getContractFactory("BurnManager");
    const burnManager = await BurnManager.deploy(deployed.AuraToken);
    await burnManager.waitForDeployment();
    deployed.BurnManager = await burnManager.getAddress();
    console.log(`  ✅ BurnManager: ${deployed.BurnManager}`);

    // ========== POST-DEPLOYMENT SETUP ==========
    console.log("\n⚙️ Post-deployment configuration...");

    // Grant minter role to contracts that need it
    // (Uncomment when AuraToken has the addMinter function)
    // await token.addMinter(deployed.ReferralSystem);
    // await token.addMinter(deployed.BattlePass);
    // console.log("  ✅ Minter roles granted");

    // ========== DEPLOYMENT SUMMARY ==========
    console.log("\n" + "=".repeat(50));
    console.log("📜 DEPLOYMENT SUMMARY - Aura World");
    console.log("=".repeat(50));
    console.log("\n🔗 Core:");
    console.log(`   AuraToken:          ${deployed.AuraToken}`);
    console.log(`   AuraNFT:            ${deployed.AuraNFT}`);
    console.log(`   Marketplace:        ${deployed.Marketplace}`);
    console.log(`   AuctionHouse:       ${deployed.AuctionHouse}`);
    console.log("\n💎 Premium:");
    console.log(`   PremiumSubscription: ${deployed.PremiumSubscription}`);
    console.log(`   BattlePass:         ${deployed.BattlePass}`);
    console.log("\n🏠 Landlords:");
    console.log(`   LandRegistry:       ${deployed.LandRegistry}`);
    console.log("\n👥 Social:");
    console.log(`   ReferralSystem:     ${deployed.ReferralSystem}`);
    console.log(`   GuildSystem:        ${deployed.GuildSystem}`);
    console.log("\n🎪 Events:");
    console.log(`   SafariZoneNFT:      ${deployed.SafariZoneNFT}`);
    console.log("\n🔐 Account Abstraction:");
    console.log(`   SmartAccountFactory: ${deployed.SmartAccountFactory}`);
    console.log(`   AuraPaymaster:      ${deployed.AuraPaymaster}`);
    console.log("\n🔥 Tokenomics:");
    console.log(`   BurnManager:        ${deployed.BurnManager}`);
    console.log("=".repeat(50));

    // ========== SAVE TO FILE ==========
    const network = (await ethers.provider.getNetwork()).name;
    const filename = `deployments/${network}-${Date.now()}.json`;

    // Ensure deployments directory exists
    if (!fs.existsSync('deployments')) {
        fs.mkdirSync('deployments');
    }

    fs.writeFileSync(filename, JSON.stringify({
        network,
        deployer: deployer.address,
        timestamp: new Date().toISOString(),
        contracts: deployed,
    }, null, 2));
    console.log(`\n💾 Saved to: ${filename}`);

    // ========== ENV FILE HELPER ==========
    console.log("\n📋 Add to your .env file:");
    console.log("-----------------------------------");
    console.log(`VITE_AURA_TOKEN_ADDRESS=${deployed.AuraToken}`);
    console.log(`VITE_AURA_NFT_ADDRESS=${deployed.AuraNFT}`);
    console.log(`VITE_MARKETPLACE_ADDRESS=${deployed.Marketplace}`);
    console.log(`VITE_AUCTION_ADDRESS=${deployed.AuctionHouse}`);
    console.log(`VITE_PREMIUM_CONTRACT_ADDRESS=${deployed.PremiumSubscription}`);
    console.log(`VITE_LAND_CONTRACT_ADDRESS=${deployed.LandRegistry}`);
    console.log(`VITE_REFERRAL_ADDRESS=${deployed.ReferralSystem}`);
    console.log(`VITE_GUILD_ADDRESS=${deployed.GuildSystem}`);
    console.log("-----------------------------------");

    console.log("\n✅ Deployment complete! 🎉");
}

main().catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exitCode = 1;
});
