# Aura World: Secure Backend Architecture (Phase 4 Design)

**Status:** Planning / Design
**Target:** Production-Ready Secure Environment
**Stack:** Node.js (NestJS), Polygon (L2), MongoDB, Redis

---

## 1. High-Level Security Architecture
The backend acts as the "Trust Anchor" for the entire ecosystem. It bridges the gap between the insecure client (React Native/Web) and the immutable blockchain (Polygon).

### The "Trust Sandwich" Model
1.  **Client Layer (Untrusted):** Sends signed requests (GPS data, game actions).
2.  **API Gateway (Guard):** Rate limiting, DDoS protection, JWT verification.
3.  **Game Engine (Validator):** Validates logic (speed checks, cooldowns, inventory).
4.  **Blockchain Relay (Signer):** The *only* entity with private keys to mint/reward.

---

## 2. Core Components & Tech Stack

| Component | Technology | Purpose |
| :--- | :--- | :--- |
| **API Framework** | **NestJS** (TypeScript) | Modular, testable, enterprise-grade structure. |
| **Database** | **MongoDB** (Atlas) | Flexible schema for user profiles and game state. |
| **Caching/PubSub** | **Redis** | Real-time auction updates and PvP state sync. |
| **Blockchain Lib** | **Ethers.js + OpenZeppelin** | Smart contract interaction and security standards. |
| **Auth Provider** | **Web3Auth / Firebase** | Hybrid social + wallet login. |

---

## 3. Secure API Endpoints (Key Flows)

### A. AR Hunt Verification (`POST /api/v1/hunt/claim`)
**Objective:** Prevent GPS spoofing and bot farming.
*   **Input:** `{ user_id, gps_coords, accelerometer_log, timestamp, signed_hash }`
*   **Validation Logic:**
    1.  **Speed Check:** Distance / Time < 20km/h (Human running speed).
    2.  **Teleport Check:** Last known location vs. current location.
    3.  **Cooldown:** Has user claimed this specific crystal ID recently?
*   **Output:** Updates internal balance (Off-chain ledger) to save gas.

### B. PvP Duel Resolution (`POST /api/v1/pvp/resolve`)
**Objective:** Ensure fair play in battles.
*   **Mechanism:** WebSocket (Socket.io) connection.
*   **Flow:**
    1.  Server matches Player A and B.
    2.  Server sends "Challenge" (e.g., "Tap sequence").
    3.  Players send inputs.
    4.  **Server calculates winner** (Client is display-only).
    5.  Server awards XP/Tokens to DB.

### C. Auction Bidding (`POST /api/v1/auction/bid`)
**Objective:** Prevent sniper bots and bid manipulation.
*   **Input:** `{ auction_id, bid_amount, signature }`
*   **Logic:**
    1.  Check user balance (DB + On-chain).
    2.  Lock funds (Escrow).
    3.  Extend timer by 30s if bid is < 1 min remaining (Anti-sniping).
    4.  Broadcast new high bid via Redis PubSub.

### D. Withdrawal / Minting (`POST /api/v1/wallet/withdraw`)
**Objective:** The "Cash Out" moment.
*   **Security:** **Hot/Cold Wallet System**.
    *   *Hot Wallet:* Automated, holds small amount for daily payouts.
    *   *Cold Wallet:* Manual refill only, holds 95% of treasury.
*   **Flow:**
    1.  User requests withdrawal.
    2.  Risk Engine checks for anomalies (sudden 1000% balance spike).
    3.  If Safe: Server signs transaction -> Relayer -> Polygon.

---

## 4. Database Schema (Simplified)

### `Users` Collection
```json
{
  "_id": "uuid",
  "wallet_address": "0x123...",
  "email": "user@example.com",
  "role": "user", // vs "admin"
  "stats": {
    "level": 5,
    "total_steps": 50000
  },
  "security": {
    "last_login_ip": "192.168.1.1",
    "ban_status": false
  }
}
```

### `Assets` Collection (NFT Metadata)
```json
{
  "_id": "nft_uuid",
  "owner_id": "user_uuid",
  "type": "crystal",
  "rarity": "legendary",
  "attributes": { "power": 9000 },
  "mint_status": "pending" // pending -> minted
}
```

---

## 5. Security Protocols (The "Millionaire" Fort)

1.  **Rate Limiting:** Throttling per IP and Wallet Address to prevent spam.
2.  **Signature Verification:** Every critical request must be signed by the user's private key (`ecrecover`).
3.  **Sanity Checks:** "Impossible Travel" detection (e.g., User in London, then Tokyo 5 mins later).
4.  **Admin Dashboard:** "God Mode" to freeze economy in case of exploit.

---

## 6. Deployment Strategy
*   **Infrastructure:** AWS (Elastic Beanstalk) or Google Cloud Run (Containerized).
*   **CI/CD:** GitHub Actions running automated tests before deployment.
*   **Monitoring:** Datadog / Sentry for real-time anomaly detection.

---

## 7. Next Steps for Implementation
1.  Initialize NestJS project structure.
2.  Set up MongoDB Atlas cluster (Free Tier for Dev).
3.  Implement JWT Auth Strategy.
4.  Build the "AR Hunt" validation endpoint first.
