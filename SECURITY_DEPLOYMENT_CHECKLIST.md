# Security & Production Deployment Checklist

This checklist ensures AuraAuction Quest is secure and ready for production.

## 1. Environment Variables Validation
Ensure these variables are set in your production environment (e.g., `.env`, Vercel, Docker).

- [ ] **`NODE_ENV=production`**: Enables production optimizations and disables debug logs.
- [ ] **`JWT_SECRET`**: Must be a high-entropy random string (min 32 chars).
- [ ] **`MONGODB_URI`**: Use a secure connection string with SSL enabled (`mongodb+srv://...`).
- [ ] **`REDIS_HOST` / `REDIS_PASSWORD`**: Ensure Redis is password-protected and not exposed to the public internet.
- [ ] **`PRIVATE_KEY`**: The deployer wallet key. **NEVER** commit this to Git.
- [ ] **`VITE_SENTRY_DSN`**: The private DSN for error tracking.

## 2. Security Headers (Helmet/Nginx)
Configure your web server or NestJS app (using `helmet`) to send these headers:

- [ ] **`Content-Security-Policy` (CSP)**:
  ```http
  default-src 'self';
  script-src 'self' 'unsafe-inline' https://*.sentry.io;
  connect-src 'self' https://*.sentry.io https://polygon-rpc.com;
  img-src 'self' data: https:;
  ```
- [ ] **`Strict-Transport-Security` (HSTS)**: `max-age=31536000; includeSubDomains`
- [ ] **`X-Frame-Options`**: `DENY` (Prevents clickjacking)
- [ ] **`X-Content-Type-Options`**: `nosniff`
- [ ] **`Referrer-Policy`**: `strict-origin-when-cross-origin`

## 3. Rate Limiting Verification
Verify `ThrottlerModule` (NestJS) or Nginx rate limiting is active.

- [ ] **Global Limit**: Max 100 requests / minute per IP.
- [ ] **Auth Endpoints**: Max 5 login attempts / minute.
- [ ] **Marketplace Actions**: Max 10 listings/buys / minute.
- [ ] **Redis Backend**: Ensure rate limiter uses Redis, not memory (for multi-instance scaling).

## 4. Database Security Hardening
- [ ] **Network Isolation**: Whitelist only your application server IPs in MongoDB Atlas.
- [ ] **Least Privilege**: Create a database user with *only* `readWrite` access to the `aura_db` (no admin rights).
- [ ] **Encryption**: Ensure "Encryption at Rest" is enabled in MongoDB.
- [ ] **Backups**: Enable automated daily backups with point-in-time recovery.

## 5. Smart Contract Security
- [ ] **Ownership**: Transfer ownership of contracts to a Multi-Sig Wallet (e.g., Gnosis Safe), not a single private key.
- [ ] **Verification**: Verify contract source code on PolygonScan.
- [ ] **Emergency Stop**: Ensure `pause()` functionality works and is accessible by the owner.

## 6. Monitoring & Logging
- [ ] **Sentry**: Verify errors are appearing in the dashboard.
- [ ] **Alerts**: Set up email/Slack alerts for "New Issue" and "High Rate of Errors".
- [ ] **Audit Logs**: Ensure critical actions (admin changes, large transfers) are logged to a persistent store.
