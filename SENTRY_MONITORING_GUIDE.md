# 📊 Sentry Monitoring - Implementation Guide

Complete guide for implementing and using Sentry monitoring in AuraAuction Quest.

---

## 🚀 Quick Start

### 1. Sign Up for Sentry

1. Go to https://sentry.io/
2. Create account (free tier: 5k events/month)
3. Create new project:
   - **Backend**: Node.js / NestJS
   - **Frontend**: React
4. Copy your DSN (Data Source Name)

---

## 🔧 Installation

### Backend (NestJS)

```bash
cd backend
npm install --save @sentry/node @sentry/profiling-node
```

### Frontend (React)

```bash
cd frontend
npm install --save @sentry/react @sentry/tracing
```

---

## ⚙️ Configuration

### 1. Environment Variables

**Backend** (`.env`):
```bash
# Sentry
SENTRY_DSN=https://your-dsn@sentry.io/project-id
NODE_ENV=production

# Optional: Release tracking
SENTRY_RELEASE=aura-quest-backend@1.0.0
```

**Frontend** (`.env`):
```bash
# Sentry
VITE_SENTRY_DSN=https://your-dsn@sentry.io/project-id
VITE_ENV=production

# Optional
VITE_SENTRY_RELEASE=aura-quest-frontend@1.0.0
```

### 2. Backend Integration

**app.module.ts**:
```typescript
import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { SentryModule } from './sentry/sentry.module';
import { SentryInterceptor } from './sentry/sentry.interceptor';

@Module({
  imports: [
    SentryModule, // ← Add this
    // ... other modules
  ],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: SentryInterceptor, // ← Add this
    },
  ],
})
export class AppModule {}
```

### 3. Frontend Integration

**main.tsx**:
```typescript
import React from 'react';
import ReactDOM from 'react-dom/client';
import { initSentry } from './utils/sentry';
import App from './App';

// Initialize Sentry FIRST
initSentry();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

**App.tsx** (with Error Boundary):
```typescript
import { SentryErrorBoundary } from './utils/sentry';

function App() {
  return (
    <SentryErrorBoundary
      fallback={(error) => (
        <div>
          <h1>Something went wrong</h1>
          <p>{error.message}</p>
        </div>
      )}
    >
      {/* Your app content */}
    </SentryErrorBoundary>
  );
}
```

---

## 📝 Usage Examples

### Backend - Tracking Security Events

**auth.service.ts**:
```typescript
import { SentryWeb3Utils } from '../sentry/sentry.module';

async validateWeb3Signature(address: string, signature: string, message: string) {
  try {
    const recoveredAddress = ethers.verifyMessage(message, signature);
    const isValid = recoveredAddress.toLowerCase() === address.toLowerCase();
    
    if (!isValid) {
      // Log security event
      SentryWeb3Utils.logSecurityEvent('signature_failed', {
        address,
        endpoint: 'auth/login',
        reason: 'Signature verification failed',
      });
    }
    
    return isValid;
  } catch (error) {
    // Error automatically captured by Sentry interceptor
    throw error;
  }
}
```

**game.controller.ts** (Anti-Cheat):
```typescript
import { SentryWeb3Utils } from '../sentry/sentry.module';

async claimReward(@Body() data: ClaimRewardDto) {
  // Validate movement
  const movementValid = this.antiCheatService.validateMovement(...);
  
  if (!movementValid.valid) {
    // Log cheat detection
    SentryWeb3Utils.logSecurityEvent('cheat_detected', {
      address: data.address,
      endpoint: 'game/claim',
      reason: movementValid.reason,
      metadata: {
        speed: movementValid.speed,
        distance: movementValid.distance,
      },
    });
    
    throw new BadRequestException('Cheating detected');
  }
  
  // Continue with reward claim...
}
```

**marketplace.service.ts** (Contract Interaction):
```typescript
import { SentryWeb3Utils } from '../sentry/sentry.module';

async buyItem(listingId: number, buyer: string) {
  const transaction = SentryWeb3Utils.startTransaction(
    'marketplace.buyItem',
    'blockchain'
  );
  
  try {
    // ... buy logic
    
    SentryWeb3Utils.logContractInteraction(
      'marketplace',
      'buyItem',
      true,
      { listingId, buyer }
    );
    
    transaction.setStatus('ok');
  } catch (error) {
    SentryWeb3Utils.logContractInteraction(
      'marketplace',
      'buyItem',
      false,
      { listingId, buyer, error: error.message }
    );
    
    transaction.setStatus('internal_error');
    throw error;
  } finally {
    transaction.finish();
  }
}
```

### Frontend - Tracking User Actions

**Web3Context.tsx** (Wallet Connection):
```typescript
import { SentryWeb3 } from '../utils/sentry';

const connectWallet = async () => {
  try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const accounts = await provider.send('eth_requestAccounts', []);
    const address = accounts[0];
    
    // Track successful connection
    SentryWeb3.trackWalletConnection(address, true);
    SentryWeb3.setUserContext(address);
    
    setAccount(address);
  } catch (error) {
    // Track failed connection
    SentryWeb3.trackWalletConnection('', false, error);
    console.error('Wallet connection failed', error);
  }
};

const disconnectWallet = () => {
  SentryWeb3.clearUserContext();
  setAccount(null);
};
```

**MarketplaceView.tsx** (Transactions):
```typescript
import { SentryWeb3 } from '../utils/sentry';

const buyNFT = async (listingId: number) => {
  try {
    // Buy NFT
    const tx = await marketplace.buyItem(listingId, { value: price });
    const receipt = await tx.wait();
    
    // Track successful transaction
    SentryWeb3.trackTransaction(
      'marketplace',
      'buyItem',
      receipt.transactionHash
    );
    
    console.log('Purchase successful!');
  } catch (error) {
    // Track failed transaction
    SentryWeb3.trackTransaction(
      'marketplace',
      'buyItem',
      undefined,
      error
    );
    
    console.error('Purchase failed', error);
  }
};
```

**API Calls**:
```typescript
import { SentryWeb3 } from '../utils/sentry';

const claimReward = async (data: ClaimRewardData) => {
  try {
    const response = await fetch(`${API_URL}/game/claim`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    // Track API error
    SentryWeb3.trackAPIError('/game/claim', error);
    throw error;
  }
};
```

---

## 🔍 Monitoring Dashboard

### Key Metrics to Watch

**Errors**:
- Error rate (errors/minute)
- Most common errors
- Affected users
- Geographic distribution

**Performance**:
- Average response time
- P95/P99 response times
- Slowest endpoints
- Database query times

**Security**:
- Failed signature attempts
- Cheat detection events
- Rate limit violations
- Unauthorized access attempts

### Setting Up Alerts

**Sentry Dashboard → Alerts → Create Alert**:

**1. Critical Errors**:
```yaml
Alert: Critical Error
Condition: Error count > 10 in 1 hour
Severity: Critical
Notify: Email + Slack
Filter: level:error AND tags.type:critical
```

**2. Security Events**:
```yaml
Alert: Security Incident
Condition: Event count > 5 in 5 minutes
Severity: High
Notify: Email + SMS
Filter: tags.category:security OR tags.type:anti-cheat
```

**3. Performance Degradation**:
```yaml
Alert: Slow Response Time
Condition: P95 > 1000ms for 5 minutes
Severity: Medium
Notify: Email
Filter: transaction.op:http.server
```

**4. Smart Contract Errors**:
```yaml
Alert: Contract Interaction Failed
Condition: Error count > 3 in 10 minutes
Severity: High
Notify: Email + Slack
Filter: tags.type:transaction AND tags.contract:*
```

---

## 📊 Custom Dashboards

### Security Dashboard

**Widgets**:
1. **Failed Signatures** (Time Series)
   - Filter: `category:security AND message:*signature*`
   
2. **Cheat Attempts** (Bar Chart)
   - Filter: `tags.type:anti-cheat`
   - Group by: reason
   
3. **Top Attackers** (Table)
   - Filter: `category:security`
   - Group by: user.id
   - Sort by: count DESC

4. **Geographic Distribution** (Map)
   - Filter: `level:warning OR level:error`
   - Group by: geo.country_code

### Performance Dashboard

**Widgets**:
1. **Response Times** (Time Series)
   - Metric: P50, P95, P99
   - Group by: transaction.name
   
2. **Slowest Endpoints** (Table)
   - Metric: Average duration
   - Group by: transaction.name
   - Sort by: duration DESC
   
3. **Error Rate** (Time Series)
   - Metric: Errors / Total requests
   
4. **Throughput** (Time Series)
   - Metric: Requests per second

---

## 🚨 Incident Response

### When Alert Fires

**1. Acknowledge** (within 5 minutes):
```bash
# In Sentry dashboard
Click alert → Mark as reviewed
```

**2. Assess Severity**:
- Critical: Affecting all users or funds
- High: Affecting many users
- Medium: Affecting some users
- Low: Minor issue

**3. Investigate**:
- Check error details in Sentry
- Review session replay (if available)
- Check breadcrumbs for context
- Identify affected users

**4. Mitigate**:
- Deploy hotfix if code issue
- Restart service if transient
- Rate limit if under attack
- Communicate with users

**5. Document**:
- Create post-mortem
- Update runbook
- Add monitoring if needed

---

## 🔒 Privacy & Security

### Data Scrubbing

Sentry is configured to automatically scrub:
- ✅ Wallet private keys
- ✅ Mnemonics
- ✅ Signatures (full)
- ✅ Authorization headers
- ✅ Cookie values
- ✅ Full wallet addresses (anonymized to first 10 chars)

### What Gets Sent

**Error Events**:
- Error message
- Stack trace
- Request URL
- HTTP method
- User ID (anonymized address)
- Timestamp
- Environment (production/staging)

**Performance Data**:
- Transaction duration
- SQL queries (scrubbed)
- HTTP requests
- No sensitive user data

### GDPR Compliance

Sentry is GDPR compliant:
- Data retention: 90 days (configurable)
- User deletion: Available via API
- Data export: Available on request
- Data processing agreement: Included

---

## 💰 Cost Estimates

### Free Tier
- 5,000 errors/month
- 10,000 performance units/month
- 1 project
- 1 team member

**Suitable for**: Initial launch, testing

### Team Plan ($26/month)
- 50,000 errors/month
- 100,000 performance units/month
- Unlimited projects
- Unlimited team members
- 90-day retention

**Suitable for**: Small-medium deployment

### Business Plan ($80/month)
- 500,000 errors/month
- 1,000,000 performance units/month
- Advanced features
- Priority support

**Suitable for**: Production with high traffic

---

## 🧪 Testing Sentry Integration

### Test Error Capture

**Backend**:
```bash
curl http://localhost:3000/api/test-sentry-error
```

**Frontend**:
```typescript
// Add test button
<button onClick={() => {
  throw new Error('Test Sentry Error');
}}>
  Test Sentry
</button>
```

### Verify in Sentry

1. Go to Sentry dashboard
2. Projects → Your Project
3. Issues → Should see test error
4. Click error → Verify details captured

---

## 📚 Additional Resources

- **Sentry Documentation**: https://docs.sentry.io/
- **NestJS Integration**: https://docs.sentry.io/platforms/node/guides/nestjs/
- **React Integration**: https://docs.sentry.io/platforms/javascript/guides/react/
- **Performance Monitoring**: https://docs.sentry.io/product/performance/
- **Best Practices**: https://docs.sentry.io/product/best-practices/

---

## ✅ Checklist

Before going to production:

- [ ] Sentry account created
- [ ] DSN configured in environment variables
- [ ] Backend integration complete
- [ ] Frontend integration complete
- [ ] Error boundary implemented
- [ ] Custom security logging added
- [ ] Alerts configured
- [ ] Dashboard customized
- [ ] Test errors sent successfully
- [ ] Team members invited
- [ ] Privacy settings reviewed

---

**Monitoring Status**: 🟢 Ready for Production

**Last Updated**: 2025-11-23
