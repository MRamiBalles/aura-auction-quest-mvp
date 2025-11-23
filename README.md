# AuraAuction Quest (MVP)

A location-based AR treasure hunt game with a secure blockchain economy and anti-cheat protection.

## 🌟 Features

*   **AR Crystal Hunting**: Find and collect crystals in the real world using your camera.
*   **Blockchain Economy**: Mint captured crystals as NFTs on the Polygon Amoy Testnet.
*   **Anti-Cheat System**: Server-side GPS verification to prevent spoofing and teleportation.
*   **Wallet Integration**: Connect with MetaMask to manage your inventory and tokens.

---

## 🛠️ Tech Stack

*   **Frontend**: React, Vite, Tailwind CSS, Framer Motion
*   **Backend**: NestJS, MongoDB (Mongoose)
*   **Blockchain**: Hardhat, Solidity, Ethers.js
*   **AR**: Native HTML5 Camera & Geolocation APIs

---

## 🚀 Getting Started

### 1. Prerequisites

*   Node.js (v18+)
*   npm or yarn
*   MongoDB (running locally or Atlas URI)
*   MetaMask Browser Extension

### 2. Backend Setup (Secure API)

The backend handles authentication and anti-cheat validation.

```bash
cd backend
npm install
npm run start:dev
```

*The server will start on `http://localhost:3000`.*

### 3. Smart Contracts (Blockchain)

Deploy the contracts to the Polygon Amoy Testnet.

1.  Create a `.env` file in the root directory:
    ```env
    PRIVATE_KEY=your_wallet_private_key
    ```
2.  Deploy contracts:
    ```bash
    npx hardhat run scripts/deploy.ts --network amoy
    ```
3.  Copy the deployed addresses into your frontend config (if applicable).

### 4. Frontend Setup (Game Client)

Run the React application.

```bash
# Install dependencies
npm install

# Start the development server
npm run dev
```

*The game will be available at `http://localhost:8080`.*

---

## 🛡️ Anti-Cheat System

The game implements a "Trust Sandwich" architecture:
1.  **Client**: Reports GPS position to Backend.
2.  **Backend**: Calculates speed and distance. If valid, it signs the move.
3.  **Blockchain**: (Future) Only accepts signed moves for minting.

**Current Rules:**
*   Max Speed: **30 km/h**
*   Max Teleport Distance: **500m**

---

## 📜 License

This project is an MVP prototype. All rights reserved.
