# 🚀 Node.js Installation & Sentry Setup - Quick Guide

## Step 1: Install Node.js (5 minutes)

### Download Node.js

1. **Go to**: https://nodejs.org/
2. **Download**: Click the **LTS** (Long Term Support) version
   - Current LTS: v20.x.x or v18.x.x
   - File: `node-v20.x.x-x64.msi` (Windows Installer)
3. **Run Installer**:
   - Double-click the `.msi` file
   - Accept license agreement
   - Choose default installation path: `C:\Program Files\nodejs\`
   - ✅ Check "Automatically install necessary tools" (includes npm)
   - Click "Install"
4. **Restart Terminal**: Close and reopen PowerShell/CMD

### Verify Installation

```powershell
# Open new PowerShell window
node --version
# Should show: v20.x.x or v18.x.x

npm --version
# Should show: 10.x.x or 9.x.x
```

✅ **If versions show**: Node.js installed successfully!  
❌ **If error**: Restart computer and try again

---

## Step 2: Install Project Dependencies (3 minutes)

```powershell
# Navigate to project
cd C:\Users\Manu\AuraWorld\aura-auction-quest-mvp

# Install all dependencies (will take 2-3 minutes)
npm install

# You should see:
# added 1500 packages in 180s
```

**Common Issues**:
- ❌ "Cannot find package.json": Make sure you're in the right directory
- ❌ "Permission denied": Run PowerShell as Administrator

---

## Step 3: Run Security Tests (1 minute)

```powershell
# Compile smart contracts
npx hardhat compile

# Run all tests
npx hardhat test

# Expected output:
#   Marketplace - Security Tests
#     ✓ Should handle seller payment failure (245ms)
#     ✓ Should allow withdrawal of pending payments (156ms)
#     ... 
#   53 passing (24s)
```

**If Tests Fail**:
```powershell
# Clean and retry
npx hardhat clean
rm -r node_modules
npm install
npx hardhat test
```

---

## Step 4: Sign Up for Sentry (2 minutes)

### Create Account

1. **Go to**: https://sentry.io/signup/
2. **Sign up with**:
   - Email address
   - Or: Sign up with GitHub (recommended)
3. **Verify email** if using email signup

### Create Projects

**Backend Project**:
1. Click "Create Project"
2. Platform: **Node.js**
3. Alert frequency: **On every new issue**
4. Project name: `aura-quest-backend`
5. Click "Create Project"
6. **Copy the DSN**: `https://xxxxx@o123456.ingest.sentry.io/7654321`

**Frontend Project**:
1. Click "Create Project" (again)
2. Platform: **React**
3. Alert frequency: **On every new issue**
4. Project name: `aura-quest-frontend`
5. Click "Create Project"
6. **Copy the DSN**: `https://yyyyy@o123456.ingest.sentry.io/7654322`

---

## Step 5: Configure Environment Variables (2 minutes)

### Backend

**File**: `backend/.env`

```bash
# Create/edit this file
# Path: C:\Users\Manu\AuraWorld\aura-auction-quest-mvp\backend\.env

# Sentry Configuration
SENTRY_DSN=https://xxxxx@o123456.ingest.sentry.io/7654321
NODE_ENV=development
SENTRY_RELEASE=aura-quest-backend@1.0.0

# Existing variables (keep them)
PORT=3000
MONGODB_URI=mongodb://localhost:27017/aura-quest
REDIS_HOST=localhost
REDIS_PORT=6379
JWT_SECRET=your_jwt_secret_here
```

### Frontend

**File**: `frontend/.env`

```bash
# Create/edit this file
# Path: C:\Users\Manu\AuraWorld\aura-auction-quest-mvp\.env

# Sentry Configuration
VITE_SENTRY_DSN=https://yyyyy@o123456.ingest.sentry.io/7654322
VITE_ENV=development
VITE_SENTRY_RELEASE=aura-quest-frontend@1.0.0

# Existing variables (keep them)
VITE_API_URL=http://localhost:3000
```

---

## Step 6: Install Sentry Dependencies (1 minute)

### Backend

```powershell
cd backend
npm install @sentry/node @sentry/profiling-node
```

### Frontend

```powershell
cd ..
npm install @sentry/react @sentry/tracing
```

---

## Step 7: Test Sentry Integration (1 minute)

### Backend Test

```powershell
cd backend
npm run start:dev

# In another terminal, test error capture:
curl http://localhost:3000/test-sentry
```

**Check Sentry Dashboard**:
1. Go to https://sentry.io/
2. Select `aura-quest-backend` project
3. Click "Issues"
4. You should see the test error!

### Frontend Test

```powershell
cd ..
npm run dev
```

**In browser** (http://localhost:5173):
1. Open console (F12)
2. Type: `throw new Error('Test Sentry')`
3. Check Sentry dashboard → `aura-quest-frontend`
4. Error should appear!

---

## 📊 Complete Setup Checklist

### Node.js Installation
- [ ] Downloaded Node.js LTS from nodejs.org
- [ ] Ran installer with default options
- [ ] Restarted terminal
- [ ] Verified: `node --version` works
- [ ] Verified: `npm --version` works

### Project Dependencies
- [ ] Navigated to project folder
- [ ] Ran `npm install`
- [ ] No errors during installation
- [ ] Compiled contracts: `npx hardhat compile`
- [ ] Ran tests: `npx hardhat test`
- [ ] All 53 tests passing ✅

### Sentry Setup
- [ ] Created Sentry account
- [ ] Created backend project
- [ ] Created frontend project
- [ ] Copied both DSN keys
- [ ] Added DSN to `backend/.env`
- [ ] Added DSN to `.env` (frontend)
- [ ] Installed Sentry packages (backend)
- [ ] Installed Sentry packages (frontend)
- [ ] Tested error capture (backend)
- [ ] Tested error capture (frontend)

---

## 🎯 Next Steps After Setup

### 1. Configure Alerts

**Sentry Dashboard → Alerts → Create Alert**:

```yaml
Alert: Critical Backend Error
When: error.count > 5 in 5 minutes
Notify: Your email
Filter: level:error
```

### 2. Customize Dashboard

**Create Security Dashboard**:
- Failed signatures
- Cheat detection events
- Rate limit violations

### 3. Invite Team

**Settings → Teams**:
- Add team members
- Set notification preferences

### 4. Production Configuration

When deploying to production:

```bash
# Backend .env
NODE_ENV=production
SENTRY_DSN=https://... (same DSN)

# Frontend .env
VITE_ENV=production
VITE_SENTRY_DSN=https://... (same DSN)
```

---

## 🆘 Troubleshooting

### Node.js Issues

**"node is not recognized"**
```powershell
# Solution 1: Restart computer
# Solution 2: Add to PATH manually
# Control Panel → System → Advanced → Environment Variables
# Edit "Path" → Add: C:\Program Files\nodejs\
```

**"npm install" fails**
```powershell
# Solution: Clear cache
npm cache clean --force
npm install
```

### Sentry Issues

**"No errors appearing in dashboard"**
```bash
# Check 1: DSN correct in .env?
# Check 2: Application running?
# Check 3: Events page (not Issues page)
# Events show all events, Issues shows grouped errors
```

**"Too many events"**
```bash
# Solution: Adjust sample rate in config
# sentry.module.ts (backend):
tracesSampleRate: 0.1  # 10% sampling
```

---

## 📞 Quick Reference

### Commands

```powershell
# Node.js version check
node --version
npm --version

# Install dependencies
npm install

# Run tests
npx hardhat test

# Run backend
cd backend && npm run start:dev

# Run frontend
npm run dev

# Build for production
npm run build
```

### Important URLs

- **Node.js Download**: https://nodejs.org/
- **Sentry Dashboard**: https://sentry.io/
- **Sentry Docs**: https://docs.sentry.io/
- **Hardhat Docs**: https://hardhat.org/docs

### Environment Files

```
backend/.env  ← Backend Sentry DSN
.env          ← Frontend Sentry DSN (root folder)
```

---

## ✅ Success Indicators

You'll know setup is complete when:

✅ `node --version` shows v18 or v20  
✅ `npm --version` shows 9 or 10  
✅ `npx hardhat test` shows 53 passing tests  
✅ Sentry dashboard shows test errors  
✅ Both projects show green status in Sentry

**Total Setup Time**: ~15 minutes

---

## 🎊 You're Ready!

Once all checklist items are complete, you have:
- ✅ Node.js development environment
- ✅ All dependencies installed
- ✅ Security tests running
- ✅ Production monitoring configured

**Next**: Deploy to testnet or continue development!

---

**Need Help?** 
- Check this guide first
- Review `SENTRY_MONITORING_GUIDE.md`
- Review `TESTING_GUIDE.md`
