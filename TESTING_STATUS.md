# Testing Status & Guide

**Current Status**: ⚠️ Blocked by Environment
The automated test suite (`npx hardhat test`) cannot be executed in the current environment due to missing Node.js runtime.

However, the test files are present and ready for execution in a proper environment.

## Test Suite Coverage

### Smart Contracts (`test/`)
- **Marketplace.test.ts**: Covers listing, buying, cancelling, and fee logic.
- **AuraToken.test.ts**: Covers minting, burning, and transfer logic.
- **NFT.test.ts**: Covers minting, metadata, and royalty logic.

### Backend (`backend/test/`)
- **Auth**: Signature validation tests.
- **Game**: Anti-cheat validation logic tests.

## How to Run Tests
Once you have installed Node.js (see `INSTALL_DEPENDENCIES.bat`), run:

1.  **Smart Contract Tests**:
    ```bash
    npx hardhat test
    ```

2.  **Backend Tests**:
    ```bash
    cd backend
    npm run test
    ```

3.  **Frontend Tests**:
    ```bash
    npm run test
    ```

## Manual Verification Checklist
Since automated tests couldn't run, please manually verify:
- [ ] **Wallet Connection**: Connect MetaMask successfully.
- [ ] **AR Hunt**: Camera permission prompt appears.
- [ ] **Marketplace**: Listings load (mock data).
- [ ] **Navigation**: All tabs (Map, Hunt, PvP, Market, Wallet) work without crashing.
