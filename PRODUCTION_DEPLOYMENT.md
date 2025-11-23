# 🚀 Production Deployment Guide - AuraAuction Quest

**Complete guide for deploying to production (mainnet)**

---

## 📋 Pre-Deployment Checklist

### Critical Requirements (MUST BE COMPLETE)
- [x] Backend security audit passed (5/5 stars) ✅
- [x] All frontend components tested ✅
- [x] Mobile app (11/11 screens) complete ✅
- [ ] Smart contract audit completed ⚠️ **REQUIRED**
- [ ] Load testing completed
- [ ] Disaster recovery plan ready
- [ ] Bug bounty program set up (optional but recommended)

### Security Requirements
- [x] DTO validation implemented
- [x] Rate limiting configured
- [x] Web3 signatures verified
- [x] Role management (separate collection)
- [x] Anti-cheat GPS validation
- [ ] Error tracking configured (Sentry)
- [ ] Security monitoring alerts

---

## 🔐 Phase 1: Smart Contract Deployment (Mainnet)

**⚠️ CRITICAL: Only deploy AFTER professional audit**

### Step 1: Pre-Deployment Preparation

**Required:**
1. Professional audit completed (OpenZeppelin/ConsenSys/Trail of Bits)
2. All audit findings addressed
3. Re-audit if critical changes made
4. Legal review completed
5. Insurance obtained (optional but recommended)

### Step 2: Environment Setup

**Create `.env.production`:**
```bash
# Network
NETWORK=polygon
RPC_URL=https://polygon-rpc.com
CHAIN_ID=137

# Deployment Wallet (SECURE THIS!)
PRIVATE_KEY=your_deployment_wallet_private_key_HERE

# Contract Addresses (will be filled after deployment)
AURA_TOKEN_ADDRESS=
AURA_NFT_ADDRESS=
MARKETPLACE_ADDRESS=
AUCTION_HOUSE_ADDRESS=
STAKING_ADDRESS=

# Verification
POLYGONSCAN_API_KEY=your_polygonscan_api_key

# Owner Wallet (receives fees)
OWNER_ADDRESS=your_owner_wallet_address
```

**⚠️ SECURITY:**
- Never commit `.env.production` to git
- Use hardware wallet for owner address
- Keep private keys in secure vault (1Password, LastPass)

### Step 3: Deploy Smart Contracts

**Deployment Script:**
```typescript
// scripts/deploy-mainnet.ts
import { ethers } from "hardhat";

async function main() {
  console.log("🚀 Starting MAINNET deployment...");
  
  // PAUSE: Manual confirmation required
  const confirmation = await promptUser("Are you SURE you want to deploy to MAINNET? (yes/no)");
  if (confirmation !== "yes") {
    console.log("❌ Deployment cancelled");
    return;
  }

  const [deployer] = await ethers.getSigners();
  console.log("Deploying with account:", deployer.address);
  console.log("Account balance:", ethers.formatEther(await deployer.provider.getBalance(deployer.address)));

  // 1. Deploy AuraToken
  console.log("\n1️⃣ Deploying AuraToken...");
  const AuraToken = await ethers.getContractFactory("AuraToken");
  const auraToken = await AuraToken.deploy();
  await auraToken.waitForDeployment();
  console.log("✅ AuraToken deployed:", await auraToken.getAddress());

  // 2. Deploy AuraNFT
  console.log("\n2️⃣ Deploying AuraNFT...");
  const AuraNFT = await ethers.getContractFactory("AuraNFT");
  const auraNFT = await AuraNFT.deploy();
  await auraNFT.waitForDeployment();
  console.log("✅ AuraNFT deployed:", await auraNFT.getAddress());

  // 3. Deploy Marketplace
  console.log("\n3️⃣ Deploying Marketplace...");
  const Marketplace = await ethers.getContractFactory("Marketplace");
  const marketplace = await Marketplace.deploy(await auraNFT.getAddress());
  await marketplace.waitForDeployment();
  console.log("✅ Marketplace deployed:", await marketplace.getAddress());

  // 4. Deploy AuctionHouse
  console.log("\n4️⃣ Deploying AuctionHouse...");
  const AuctionHouse = await ethers.getContractFactory("AuctionHouse");
  const auctionHouse = await AuctionHouse.deploy();
  await auctionHouse.waitForDeployment();
  console.log("✅ AuctionHouse deployed:", await auctionHouse.getAddress());

  // 5. Deploy Staking
  console.log("\n5️⃣ Deploying Staking...");
  const Staking = await ethers.getContractFactory("Staking");
  const staking = await Staking.deploy(await auraToken.getAddress());
  await staking.waitForDeployment();
  console.log("✅ Staking deployed:", await staking.getAddress());

  // 6. Verify on Polygonscan
  console.log("\n6️⃣ Waiting for confirmations before verification...");
  await new Promise(resolve => setTimeout(resolve, 60000)); // Wait 1 minute

  console.log("Verifying contracts on Polygonscan...");
  await verify(await auraToken.getAddress(), []);
  await verify(await auraNFT.getAddress(), []);
  await verify(await marketplace.getAddress(), [await auraNFT.getAddress()]);
  await verify(await auctionHouse.getAddress(), []);
  await verify(await staking.getAddress(), [await auraToken.getAddress()]);

  // 7. Save addresses
  console.log("\n7️⃣ Saving contract addresses...");
  const addresses = {
    AuraToken: await auraToken.getAddress(),
    AuraNFT: await auraNFT.getAddress(),
    Marketplace: await marketplace.getAddress(),
    AuctionHouse: await auctionHouse.getAddress(),
    Staking: await staking.getAddress(),
    deployer: deployer.address,
    network: "polygon-mainnet",
    timestamp: new Date().toISOString()
  };

  fs.writeFileSync("deployed-addresses-mainnet.json", JSON.stringify(addresses, null, 2));
  console.log("✅ Addresses saved to deployed-addresses-mainnet.json");

  console.log("\n🎉 MAINNET DEPLOYMENT COMPLETE!");
  console.log("\n⚠️  IMPORTANT NEXT STEPS:");
  console.log("1. Update backend .env with new contract addresses");
  console.log("2. Update frontend config with new addresses");
  console.log("3. Update mobile app config");
  console.log("4. Test all contract interactions on mainnet");
  console.log("5. Monitor contracts for 24-48 hours before public launch");
}

async function verify(address: string, constructorArgs: any[]) {
  try {
    await run("verify:verify", {
      address: address,
      constructorArguments: constructorArgs,
    });
    console.log(`✅ Verified ${address}`);
  } catch (error: any) {
    if (error.message.includes("Already Verified")) {
      console.log(`ℹ️  ${address} already verified`);
    } else {
      console.error(`❌ Verification failed for ${address}:`, error.message);
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
```

**Deploy to Mainnet:**
```bash
# DRY RUN (test without actual deployment)
npx hardhat run scripts/deploy-mainnet.ts --network polygon

# ACTUAL DEPLOYMENT (requires manual confirmation)
npx hardhat run scripts/deploy-mainnet.ts --network polygon

# Estimated cost: 0.5-1 MATIC (~$0.40-$0.80)
```

### Step 4: Post-Deployment Verification

**Checklist:**
- [ ] All contracts verified on Polygonscan
- [ ] Owner address is correct
- [ ] Platform fees are set correctly (2.5%)
- [ ] Staking APY configured (12% base, 17% max)
- [ ] Test small transactions before announcing

---

## 🖥️ Phase 2: Backend Deployment (Cloud Server)

### Option A: DigitalOcean (Recommended)

**1. Create Droplet:**
- Size: Basic ($12/month)
- CPU: 2 vCPUs
- RAM: 2 GB
- Storage: 50 GB SSD
- OS: Ubuntu 22.04 LTS

**2. Initial Server Setup:**
```bash
# SSH into server
ssh root@your_server_ip

# Update system
apt update && apt upgrade -y

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
apt install -y nodejs

# Install MongoDB
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
apt update
apt install -y mongodb-org
systemctl start mongod
systemctl enable mongod

# Install Redis
apt install -y redis-server
systemctl enable redis-server

# Install PM2 (process manager)
npm install -g pm2

# Install Nginx (reverse proxy)
apt install -y nginx
systemctl enable nginx
```

**3. Deploy Backend Code:**
```bash
# Create app directory
mkdir -p /var/www/aura-quest-backend
cd /var/www/aura-quest-backend

# Clone repository (or upload files)
git clone https://github.com/YOUR_USERNAME/aura-auction-quest-mvp.git .

# Install dependencies
cd backend
npm install --production

# Create production .env
nano .env
```

**Production `.env`:**
```bash
NODE_ENV=production
PORT=3000

# MongoDB
MONGODB_URI=mongodb://localhost:27017/aura-quest

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT
JWT_SECRET=your_super_secure_random_secret_here_minimum_32_characters

# Smart Contracts
AURA_TOKEN_ADDRESS=0xYOUR_DEPLOYED_TOKEN_ADDRESS
AURA_NFT_ADDRESS=0xYOUR_DEPLOYED_NFT_ADDRESS
MARKETPLACE_ADDRESS=0xYOUR_DEPLOYED_MARKETPLACE_ADDRESS
AUCTION_HOUSE_ADDRESS=0xYOUR_DEPLOYED_AUCTION_ADDRESS
STAKING_ADDRESS=0xYOUR_DEPLOYED_STAKING_ADDRESS

# Blockchain
RPC_URL=https://polygon-rpc.com
CHAIN_ID=137
PRIVATE_KEY=your_backend_wallet_private_key

# CORS
ALLOWED_ORIGINS=https://auraquest.com,https://www.auraquest.com

# Sentry (error tracking)
SENTRY_DSN=your_sentry_dsn_here

# Rate Limiting
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=100
```

**4. Build and Start:**
```bash
# Build TypeScript
npm run build

# Start with PM2
pm2 start dist/main.js --name aura-quest-backend
pm2 save
pm2 startup
```

**5. Configure Nginx:**
```nginx
# /etc/nginx/sites-available/aura-quest-api
server {
    listen 80;
    server_name api.auraquest.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Enable site
ln -s /etc/nginx/sites-available/aura-quest-api /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx

# Install SSL certificate (Let's Encrypt)
apt install -y certbot python3-certbot-nginx
certbot --nginx -d api.auraquest.com
```

### Option B: AWS / Google Cloud

**Similar setup using:**
- AWS EC2 / Google Compute Engine
- AWS RDS / Google Cloud SQL for MongoDB
- AWS ElastiCache / Google Memorystore for Redis
- AWS Load Balancer / Google Cloud Load Balancing

**Estimated Cost: $50-100/month**

---

## 🌐 Phase 3: Frontend Deployment (Vercel - Recommended)

**1. Prepare Frontend:**
```bash
cd ../src

# Update contract addresses
# Edit src/config/contracts.ts
export const CONTRACTS = {
  AuraToken: "0xYOUR_DEPLOYED_TOKEN_ADDRESS",
  AuraNFT: "0xYOUR_DEPLOYED_NFT_ADDRESS",
  Marketplace: "0xYOUR_DEPLOYED_MARKETPLACE_ADDRESS",
  AuctionHouse: "0xYOUR_DEPLOYED_AUCTION_ADDRESS",
  Staking: "0xYOUR_DEPLOYED_STAKING_ADDRESS",
};

export const API_URL = "https://api.auraquest.com";
```

**2. Deploy to Vercel:**
```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
vercel --prod
```

**3. Configure Environment Variables** (in Vercel dashboard):
```
VITE_API_URL=https://api.auraquest.com
VITE_CHAIN_ID=137
VITE_NETWORK=polygon
VITE_SENTRY_DSN=your_sentry_dsn
```

**4. Custom Domain:**
- Add domain in Vercel dashboard
- Update DNS records:
  - `A` record: `@` → Vercel IP
  - `AAAA` record: `@` → Vercel IPv6
  - Or `CNAME`: `www` → `cname.vercel-dns.com`

**Estimated Cost: $0/month (free tier) or $20/month (Pro)**

---

## 📱 Phase 4: Mobile App Deployment

### iOS App Store

**1. Prerequisites:**
- Apple Developer Account ($99/year)
- Mac computer with Xcode
- App Store Connect access

**2. Build for iOS:**
```bash
cd mobile

# Install EAS CLI
npm install -g eas-cli

# Login to Expo
eas login

# Configure build
eas build:configure

# Build for iOS
eas build --platform ios --profile production
```

**3. Create App Store Listing:**
- Name: "Aura Quest - AR NFT Game"
- Subtitle: "Explore, Collect, Compete in AR"
- Category: Games > Adventure
- Age Rating: 12+ (In-App Purchases, Mild Violence)
- Screenshots: 6.5" iPhone (5 required)
- Description: (4000 characters max)

**4. Submit for Review:**
```bash
# Submit to App Store
eas submit --platform ios
```

**Review Time: 1-7 days**

### Android Play Store

**1. Prerequisites:**
- Google Play Developer Account ($25 one-time)
- Play Console access

**2. Build for Android:**
```bash
# Build for Android
eas build --platform android --profile production
```

**3. Create Play Store Listing:**
- Title: "Aura Quest - AR NFT Blockchain Game"
- Short description: (80 characters)
- Full description: (4000 characters)
- Category: Adventure
- Content rating: PEGI 12
- Screenshots: 2-8 required

**4. Submit:**
```bash
# Submit to Play Store
eas submit --platform android
```

**Review Time: 1-3 days (usually faster than iOS)**

---

## 📊 Phase 5: Monitoring & Maintenance

### Sentry (Error Tracking)

**Setup:**
```bash
npm install @sentry/node @sentry/react
```

**Backend Integration:**
```typescript
// backend/src/main.ts
import * as Sentry from "@sentry/node";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: "production",
  tracesSampleRate: 0.1,
});
```

**Frontend Integration:**
```typescript
// src/main.tsx
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: "production",
});
```

### Uptime Monitoring

**UptimeRobot (Free):**
- Monitor: `https://api.auraquest.com/health`
- Monitor: `https://auraquest.com`
- Alert: Email/SMS on downtime

### Smart Contract Monitoring

**Tenderly:**
- Monitor all contract interactions
- Alert on large transactions
- Track gas usage
- Simulate transactions

### Analytics

**Google Analytics 4:**
- Track user flows
- Monitor conversion rates
- Identify bottlenecks

**Blockchain Analytics:**
- Dune Analytics dashboard
- Track marketplace volume
- Monitor staking participation

---

## 🔐 Phase 6: Security Hardening (Production)

### Cloudflare (DDoS Protection)

**Setup:**
1. Sign up for Cloudflare (free tier sufficient)
2. Point domain nameservers to Cloudflare
3. Enable:
   - DDoS protection
   - Rate limiting
   - Bot protection
   - SSL/TLS (Full Strict)

### Security Headers

**Nginx Configuration:**
```nginx
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline';" always;
```

### Database Backups

**Automated Daily Backups:**
```bash
# Create backup script
nano /root/backup-mongo.sh
```

```bash
#!/bin/bash
BACKUP_DIR="/backups/mongodb"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR
mongodump --out $BACKUP_DIR/$TIMESTAMP
tar -czf $BACKUP_DIR/backup_$TIMESTAMP.tar.gz $BACKUP_DIR/$TIMESTAMP
rm -rf $BACKUP_DIR/$TIMESTAMP

# Keep only last 7 days
find $BACKUP_DIR -name "backup_*.tar.gz" -mtime +7 -delete
```

```bash
chmod +x /root/backup-mongo.sh

# Add to crontab (daily at 3 AM)
crontab -e
0 3 * * * /root/backup-mongo.sh
```

---

## 📋 Launch Day Checklist

### 24 Hours Before Launch

- [ ] All systems tested on production
- [ ] Backups configured and tested
- [ ] Monitoring alerts configured
- [ ] Team notified and on standby
- [ ] Social media posts scheduled
- [ ] Press release ready

### Launch Day

- [ ] Monitor all systems
- [ ] Watch for errors in Sentry
- [ ] Check server load
- [ ] Monitor blockchain interactions
- [ ] Respond to user issues quickly
- [ ] Post launch announcement

### After Launch

- [ ] Monitor for 48 hours continuously
- [ ] Collect user feedback
- [ ] Address critical bugs immediately
- [ ] Plan first update
- [ ] Analyze metrics

---

## 💰 Estimated Production Costs

### Monthly Recurring:
- Backend Server (DigitalOcean): $12
- MongoDB Database: $0 (self-hosted)
- Redis Cache: $0 (self-hosted)
- Frontend (Vercel Pro): $20
- Domain (.com): $1/month ($12/year)
- SSL Certificates: $0 (Let's Encrypt)
- Monitoring (UptimeRobot): $0 (free tier)
- Error Tracking (Sentry): $0 (free tier up to 5k events)

**Total Monthly: ~$33/month**

### One-Time:
- Smart Contract Audit: $10,000 - $30,000 ⚠️ **REQUIRED**
- Apple Developer: $99/year
- Google Play Developer: $25 (one-time)
- Smart Contract Deployment: ~$1 (gas fees)

### Optional:
- Penetration Testing: $5,000 - $10,000
- Bug Bounty Program: $1,000 - $5,000
- Marketing/Launch: Variable

---

## 🎯 Success Metrics

### Week 1:
- [ ] 1,000+ app downloads
- [ ] 100+ active wallets
- [ ] 50+ NFTs traded
- [ ] Zero critical bugs
- [ ] 99.9% uptime

### Month 1:
- [ ] 10,000+ app downloads
- [ ] 1,000+ active wallets
- [ ] $10,000+ trading volume
- [ ] 100+ guild members
- [ ] 4.0+ app store rating

---

**📞 Emergency Contacts:**
- Tech Lead: [Your contact]
- DevOps: [Your contact]
- Smart Contract Auditor: [Auditor contact]

**🚨 Emergency Procedures:**
Document in separate `INCIDENT_RESPONSE.md`
