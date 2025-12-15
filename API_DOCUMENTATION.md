# Aura World API Documentation

Base URL: `/api` (Production) | `http://localhost:3000` (Development)

## Authentication

### Login
Authenticates a user via Web3 signature.

- **Endpoint**: `POST /auth/login`
- **Body**:
  ```json
  {
    "address": "0x...",
    "signature": "0x...",
    "message": "Login to AuraAuction Quest..."
  }
  ```
- **Response**: `200 OK` with JWT access token.

---

## Game Mechanics

### Claim Reward (AR Hunt)
Validates movement and awards a crystal if anti-cheat checks pass.

- **Endpoint**: `POST /game/claim`
- **Body**:
  ```json
  {
    "address": "0x...",
    "signature": "0x...",
    "message": "Claim reward...",
    "prevLat": 40.7128,
    "prevLon": -74.0060,
    "prevTime": 1678900000000,
    "currLat": 40.7129,
    "currLon": -74.0061,
    "currTime": 1678900005000
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "reward": {
      "itemId": 123456789,
      "type": "crystal",
      "rarity": "legendary",
      "value": 100
    }
  }
  ```

### Resolve PvP Duel
Determines the winner of a PvP duel and awards loot.

- **Endpoint**: `POST /game/pvp/resolve`
- **Body**:
  ```json
  {
    "address": "0x...",
    "signature": "0x...",
    "message": "Resolve PvP...",
    "opponentAddress": "0x..."
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "winner": "player",
    "reward": { ... }
  }
  ```

---

## Marketplace

### Get Listings
Fetch active NFT listings.

- **Endpoint**: `GET /marketplace/listings`
- **Query Params**: `activeOnly=true` (default)
- **Response**: Array of listing objects.

### Get Listing Details
- **Endpoint**: `GET /marketplace/listings/:id`

### Create Listing
List an NFT for sale.

- **Endpoint**: `POST /marketplace/list`
- **Auth**: Required (JWT)
- **Body**:
  ```json
  {
    "address": "0x...",
    "nftContract": "0x...",
    "tokenId": 1,
    "price": "0.5",
    "signature": "0x...",
    "message": "List NFT..."
  }
  ```

### Buy Listing
Purchase a listed NFT.

- **Endpoint**: `POST /marketplace/buy`
- **Auth**: Required (JWT)
- **Body**:
  ```json
  {
    "address": "0x...",
    "listingId": 123,
    "amount": "0.5",
    "signature": "0x...",
    "message": "Buy NFT..."
  }
  ```

### Cancel Listing
- **Endpoint**: `DELETE /marketplace/cancel/:id`
- **Auth**: Required (JWT)

---

## Social Features

### Leaderboard
- **Endpoint**: `GET /social/leaderboard/:period`
- **Params**: `period` ('daily', 'weekly', 'alltime')
- **Query**: `limit` (default 100)

### User Rank
- **Endpoint**: `GET /social/leaderboard/:period/rank/:address`

### Friends
- **Get Friends**: `GET /social/friends/:address`
- **Get Pending**: `GET /social/friends/:address/pending`
- **Add Friend**: `POST /social/friends/add`
- **Accept Friend**: `POST /social/friends/accept`
- **Reject Friend**: `DELETE /social/friends/reject/:id`

### Guilds
- **List Guilds**: `GET /social/guilds`
- **Get Guild**: `GET /social/guilds/:id`
- **Get User Guild**: `GET /social/guilds/user/:address`
- **Create Guild**: `POST /social/guilds/create`
- **Join Guild**: `POST /social/guilds/join`
- **Leave Guild**: `DELETE /social/guilds/leave`
