# Production Deployment Guide

**Note**: This guide assumes you have a working Node.js environment. Since the current environment lacks Node.js, please run these steps in your local terminal or CI/CD pipeline.

## 1. Prerequisites
- Node.js v18+ installed
- MongoDB database (Atlas or self-hosted)
- Redis server (for rate limiting & caching)
- Polygon RPC URL (Alchemy/Infura)

## 2. Environment Setup
Create a `.env` file in the root directory:

```env
# Backend
PORT=3000
MONGODB_URI=mongodb+srv://...
REDIS_HOST=localhost
REDIS_PORT=6379
JWT_SECRET=your-secure-secret
POLYGON_RPC_URL=https://polygon-mainnet.g.alchemy.com/v2/...
PRIVATE_KEY=0x... # Deployer wallet private key

# Frontend
VITE_API_URL=https://api.yourdomain.com
VITE_SENTRY_DSN=https://...
```

## 3. Build & Deploy

### Backend (NestJS)
1.  **Install Dependencies**:
    ```bash
    cd backend
    npm install
    ```
2.  **Build**:
    ```bash
    npm run build
    ```
3.  **Start**:
    ```bash
    npm run start:prod
    ```
    *Use PM2 for process management in production:* `pm2 start dist/main.js --name aura-backend`

### Frontend (React/Vite)
1.  **Install Dependencies**:
    ```bash
    npm install
    ```
2.  **Build**:
    ```bash
    npm run build
    ```
3.  **Deploy**:
    *   Upload the `dist` folder to a static host like **Vercel**, **Netlify**, or **AWS S3**.
    *   Ensure all routes redirect to `index.html` (SPA configuration).

## 4. Smart Contracts
1.  **Deploy Contracts**:
    ```bash
    npx hardhat run scripts/deploy.ts --network polygon
    ```
2.  **Verify Contracts**:
    ```bash
    npx hardhat verify --network polygon <CONTRACT_ADDRESS> <CONSTRUCTOR_ARGS>
    ```

## 5. Post-Deployment Checks
- [ ] Verify API health check: `GET /api/health`
- [ ] Test login flow with a real wallet.
- [ ] Verify Sentry is capturing errors.
- [ ] Check MongoDB connection.
