# Security Testing Guide - AuraAuction Quest

## 🔒 End-to-End Security Testing Procedures

This guide walks through comprehensive security testing with real MetaMask wallet, GPS tracking, and backend validation.

---

## Pre-Test Checklist

- [ ] Backend running (`npm run start:dev` in backend/)
- [ ] MongoDB running and connected
- [ ] Redis running (optional but recommended)
- [ ] Frontend running (`npm run dev`)
- [ ] MetaMask installed and configured
- [ ] Test wallet has MATIC for gas fees (Polygon Amoy testnet)
- [ ] GPS/Location services enabled in browser

---

## Test 1: Web3 Authentication

### Objective
Verify that signature-based authentication works correctly and prevents unauthorized access.

### Steps
1. **Open Application**: Navigate to `http://localhost:5173`
2. **Connect Wallet**: Click "Connect Wallet" button
3. **Sign Message**: MetaMask should prompt for signature
4. **Verify JWT**: Open DevTools → Application → Local Storage → Check for `auth_token`

### Expected Results
- ✅ Signature request appears in MetaMask
- ✅ JWT token stored after signing
- ✅ User redirected to main game view
- ✅ Backend logs show successful authentication

### Security Checks
- [ ] Reject signature → no token created
- [ ] Invalid signature → backend returns 401
- [ ] Expired JWT → refresh required

---

## Test 2: AR Hunt with GPS Validation

### Objective
Test crystal capture with anti-cheat GPS validation.

### Steps
1. **Enable Location**: Allow browser location access
2. **Navigate to AR Hunt**: Click "AR Hunt" button
3. **Wait for GPS Lock**: Verify lat/long displayed in top-left
4. **Spawn Crystal**: Click refresh button
5. **Capture Crystal**:
   - Click on crystal
   - Approve MetaMask signature
   - Wait for backend validation

### Expected Results
- ✅ GPS coordinates displayed
- ✅ Crystal spawns with distance indicator
- ✅ Signature prompt on capture
- ✅ Backend validates movement speed (<30km/h)
- ✅ Crystal added to inventory
- ✅ Success toast notification

### Anti-Cheat Testing
**Test Speed Limit:**
1. Manually modify GPS coords in DevTools console:
   ```javascript
   // This should FAIL backend validation
   navigator.geolocation.getCurrentPosition = (success) => {
     success({
       coords: { latitude: 40.0, longitude: -74.0 },
       timestamp: Date.now()
     });
   };
   ```
2. Try to capture crystal
3. **Expected**: Backend rejects with "Cheating Detected: Too fast"

---

## Test 3: PvP Duel Backend Integration

### Objective
Verify PvP duel resolution uses backend validation and real signatures.

### Steps
1. **Start PvP Duel**: Click "PvP Duel" from main menu
2. **Wait for Matchmaking**: 2-second simulation
3. **Complete Duel**: Let progress bars reach 100%
4. **Sign Verification**:
   - If player wins locally, MetaMask prompts for signature
   - Backend receives signature + message
   - Server determines actual winner (could differ from client)
5. **Claim Reward**: If verified winner, reward added to inventory

### Expected Results
- ✅ Signature prompt appears when player reaches 100% first
- ✅ Backend validates signature
- ✅ Server-side win determination (not client-side)
- ✅ Reward only if backend confirms win
- ✅ No reward if signature rejected

### Security Checks
**Verify Backend Authority:**
1. Open `game.controller.ts` line 67: Check `isPlayerWinner = Math.random()`
2. This proves client can't force wins
3. Try rejecting signature → duel forfeited

**Check PvPDuel.tsx Integration:**
```typescript
// Line 72-80: Verify this code exists
const result = await api.game.resolvePvP({
  address: account,
  signature,
  message
});
```

---

## Test 4: Rate Limiting Protection

### Objective
Verify rate limiting prevents DoS attacks on critical endpoints.

### Steps

**Test 1: /game/claim Rate Limit (5 req/min)**
1. Open DevTools → Console
2. Run rapid-fire requests:
   ```javascript
   for(let i = 0; i < 10; i++) {
     fetch('http://localhost:3000/game/claim', {
       method: 'POST',
       headers: { 'Content-Type': 'application/json' },
       body: JSON.stringify({
         address: '0xYourAddress',
         signature: 'test',
         message: 'test',
         currLat: 0, currLon: 0, currTime: Date.now(),
         prevLat: 0, prevLon: 0, prevTime: Date.now()
       })
     }).then(r => r.json()).then(console.log);
   }
   ```
3. **Expected**: First 5 succeed, remaining return 429 Too Many Requests

**Test 2: /game/pvp/resolve Rate Limit (3 req/min)**
1. Similar test with `/game/pvp/resolve`
2. **Expected**: First 3 succeed, rest return 429

### Expected Results
- ✅ Rate limits enforced per wallet address
- ✅ Status 429 with `retryAfter` in response
- ✅ Headers include `X-RateLimit-Remaining`
- ✅ Limits reset after 60 seconds

---

## Test 5: Signature Replay Attack Prevention

### Objective
Ensure old signatures cannot be reused.

### Steps
1. **Capture Crystal**: Complete normal capture flow
2. **Copy Signature**: From DevTools Network tab, copy the signature from request
3. **Replay Attack**: Send same signature again manually:
   ```javascript
   fetch('http://localhost:3000/game/claim', {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({ /* same data */ })
   });
   ```
4. **Expected**: Backend rejects (message timestamp too old)

### Expected Results
- ✅ Signature must be fresh (<5 minutes)
- ✅ Same signature can't claim multiple rewards
- ✅ Backend logs show "Invalid Signature" or "Timestamp expired"

---

## Test 6: Inventory Synchronization

### Objective
Verify inventory state matches database.

### Steps
1. **Capture Multiple Crystals**: Collect 3-5 crystals
2. **Check Frontend Inventory**: View inventory in UI
3. **Check Database**:
   ```bash
   # Connect to MongoDB
   mongosh
   use aura-quest
   db.users.findOne({ address: "0xYourAddress" })
   ```
4. **Compare**: Frontend items should match DB `inventory` array

### Expected Results
- ✅ All captured crystals in DB
- ✅ Frontend displays all items
- ✅ Item properties (rarity, value, timestamp) correct
- ✅ No phantom items

---

## Test 7: Full Flow Integration Test

### Complete User Journey
1. **Connect Wallet** → Authenticate
2. **Complete Tutorial** → Close tutorial overlay
3. **AR Hunt** → Capture 2 crystals with GPS validation
4. **PvP Duel** → Win and claim reward
5. **Marketplace** → List one crystal for sale
6. **Staking** → Stake 100 AURA tokens
7. **Leaderboard** → Check rank

### Success Criteria
- ✅ All steps complete without errors
- ✅ All signature prompts work correctly
- ✅ All backend validations pass
- ✅ No console errors
- ✅ Inventory state consistent
- ✅ Leaderboard updates with score

---

## Security Scorecard

After completing all tests, fill out:

| Component | Status | Notes |
|-----------|--------|-------|
| Web3 Auth | ✅ / ❌ | |
| GPS Validation | ✅ / ❌ | |
| Anti-Cheat (Speed) | ✅ / ❌ | |
| PvP Backend Verify | ✅ / ❌ | |
| Rate Limiting | ✅ / ❌ | |
| Signature Replay | ✅ / ❌ | |
| Inventory Sync | ✅ / ❌ | |

**Overall Security Rating**: ___ / 7

---

## Common Issues & Solutions

### Issue: GPS Not Working
**Solution**: 
- Chrome: Allow location permission in site settings
- Firefox: Check `about:permissions`
- Use HTTPS (required for geolocation API)

### Issue: MetaMask Not Popping Up
**Solution**:
- Check MetaMask is unlocked
- Try refreshing page
- Clear browser cache

### Issue: Rate Limit Not Working
**Solution**:
- Verify middleware properly applied in `game.module.ts`
- Check backend logs for middleware execution
- Ensure different addresses/IPs for testing

### Issue: Backend Rejects Valid Signature
**Solution**:
- Verify message format matches: `Claim reward at ${timestamp}`
- Check clock sync (NTP)
- Inspect `auth.service.ts` validateWeb3Signature function

---

## Production Deployment Checklist

Before mainnet launch:
- [ ] All 7 tests pass with ✅
- [ ] Smart contracts audited by third party
- [ ] Rate limits tuned based on user testing
- [ ] Error logging (Sentry/LogRocket) configured
- [ ] Monitoring alerts set up (Datadog/Grafana)
- [ ] Database backups automated
- [ ] DDoS protection enabled (Cloudflare)
- [ ] Security headers configured (CORS, CSP, HSTS)
- [ ] Secrets moved to environment variables
- [ ] Bug bounty program launched

---

## Emergency Procedures

### If Exploit Detected:
1. **Pause Contracts**: Call `pause()` on Marketplace/AuctionHouse
2. **Rate Limit to 0**: Temporarily block all game endpoints
3. **Notify Community**: Post on Discord/Twitter
4. **Investigate**: Review logs, identify exploit vector
5. **Patch & Redeploy**: Fix vulnerability, deploy update
6. **Resume Carefully**: Unpause with monitoring

### Contact
- Security Issues: security@auraquest.io
- Bug Bounty: bugbounty@auraquest.io
