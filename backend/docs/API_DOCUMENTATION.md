# Backend API Documentation

## Base URL
```
http://localhost:3000/api
```

All endpoints require JWT authentication via `Authorization: Bearer <token>` header.

---

## 🛒 Marketplace API

### GET /marketplace/listings
Get all active marketplace listings.

**Query Parameters:**
- `activeOnly` (optional): boolean, default `true`

**Response:**
```json
[
  {
    "id": 1,
    "seller": "0x1234...5678",
    "nftContract": "0xNFT_CONTRACT_ADDRESS",
    "tokenId": 101,
    "price": 100.5,
    "active": true,
    "createdAt": "2025-11-23T10:00:00.000Z"
  }
]
```

### POST /marketplace/list
Create a new marketplace listing.

**Request Body:**
```json
{
  "address": "0x1234...5678",
  "nftContract": "0xNFT_CONTRACT_ADDRESS",
  "tokenId": 101,
  "price": 100.5,
  "signature": "0xabc123...",
  "message": "List NFT at 1234567890"
}
```

### POST /marketplace/buy
Purchase an NFT from marketplace.

**Request Body:**
```json
{
  "address": "0xBUYER_ADDRESS",
  "listingId": 1,
  "amount": 100.5,
  "signature": "0xabc123...",
  "message": "Buy listing 1 at 1234567890"
}
```

### DELETE /marketplace/cancel/:id
Cancel your own listing.

**Request Body:**
```json
{
  "address": "0x1234...5678",
  "signature": "0xabc123...",
  "message": "Cancel listing 1 at 1234567890"
}
```

---

## 👥 Social API - Complete Documentation

See full documentation for all social endpoints (leaderboard, friends, guilds) in the project files.
