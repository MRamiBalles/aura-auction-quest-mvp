# 🎮 Guía Completa del Juego - Aura Quest

## 📖 ¿Qué es Aura Quest?

Aura Quest es un juego de realidad aumentada (AR) donde **buscas cristales NFT en el mundo real** usando tu móvil. Caminas por tu ciudad, encuentras cristales, los capturas, los vendes, luchas contra otros jugadores, y ganas dinero real en criptomonedas.

---

## 🚀 Flujo Completo del Juego (De Principio a Fin)

### 1️⃣ **INICIO: Conecta tu Wallet**
**Pantalla**: `AuthScreen`

**¿Qué haces?**
- Abres la app
- Pulsas "Connect Wallet"
- Se abre MetaMask/Trust Wallet
- Apruebas la conexión
- Firmas un mensaje para autenticarte

**¿Qué pasa detrás?**
```
Frontend (AuthScreen)
  ↓ WalletConnect
Mobile Wallet (MetaMask)
  ↓ Firma mensaje
Backend (/auth/login)
  ↓ Verifica firma
  ↓ Crea/obtiene usuario en MongoDB
  ↓ Genera JWT token
  ↓ Devuelve: { token, user }
Frontend
  ↓ Guarda token en AsyncStorage
  ↓ Navega a HomeScreen
```

**Resultado**: Estás autenticado. Tu wallet address = tu ID de usuario.

---

### 2️⃣ **DASHBOARD: Pantalla Principal**
**Pantalla**: `HomeScreen`

**¿Qué ves?**
- **Arriba**: Tu dirección wallet (0x1234...5678)
- **Stats**: Nivel 15, 23 NFTs, 42 Victorias
- **Menú Grid**: 9 opciones (AR Hunt, PvP, Inventory, etc.)

**¿De dónde vienen estos datos?**
```typescript
// Al cargar HomeScreen
useEffect(() => {
  // Backend GET /users/me
  const userData = await api.users.getProfile(account);
  
  setLevel(userData.level);        // Calculado por XP
  setNFTs(userData.inventory.length); // Conteo de items
  setWins(userData.pvpWins);       // Victorias guardadas
}, []);
```

**Backend (MongoDB)**:
```json
{
  "_id": "mongoId",
  "address": "0x1234...5678",
  "level": 15,
  "xp": 3250,
  "inventory": [
    { "id": 1, "type": "Crystal", "rarity": "legendary" },
    { "id": 2, "type": "Shard", "rarity": "epic" }
  ],
  "pvpWins": 42,
  "pvpLosses": 12
}
```

**Flujo de Navegación**:
```
HomeScreen (Dashboard)
  │
  ├─ AR Hunt → Buscar cristales en el mundo real
  ├─ PvP Duel → Desafiar a otro jugador
  ├─ Inventory → Ver tus NFTs
  ├─ Marketplace → Comprar/vender NFTs
  ├─ Auctions → Pujar por items raros
  ├─ Staking → Poner tokens a trabajar (ganar interés)
  ├─ Leaderboard → Ver top jugadores
  ├─ Guilds → Unirte a un clan
  └─ Friends → Añadir amigos y retarlos
```

---

### 3️⃣ **AR HUNT: Buscar Cristales**
**Pantalla**: `ARHuntScreen`

**¿Cómo funciona?**

**Paso 1: Permisos**
```
App solicita:
  1. Permiso de cámara → Para AR
  2. Permiso de ubicación → Para GPS
```

**Paso 2: Cámara se activa**
- Ves el mundo real a través de la cámara
- Arriba: GPS coords (40.7128, -74.0060)
- En pantalla: Cristales flotantes (💎)

**Paso 3: Spawn de Cristal**
```typescript
// Cuando pulsas "Spawn Crystal" o automático cada 30 segundos
const spawnCrystal = () => {
  // Backend GET /game/nearby?lat=40.7128&lon=-74.0060&radius=100
  const nearbyCrystals = await api.game.getNearby(location);
  
  // Frontend dibuja cristales en posiciones random
  setCrystals([{
    id: 1,
    x: 150,  // Píxeles en pantalla
    y: 300,
    dist: 50, // Metros de distancia real
    rarity: 'legendary'
  }]);
};
```

**Paso 4: Capturar Cristal**
```
Usuario toca cristal (💎)
  ↓
Frontend pide firma a wallet
  ↓ signer.signMessage("Claim reward at 1234567890")
Wallet firma
  ↓ signature = "0xabc123..."
Frontend envía al backend
  ↓ POST /game/claim
  {
    address: "0x1234...",
    signature: "0xabc...",
    message: "Claim reward at...",
    prevLat: 40.7128,  // Posición anterior
    prevLon: -74.0060,
    prevTime: 1234567890,
    currLat: 40.7130,  // Posición actual
    currLon: -74.0062,
    currTime: 1234567900
  }
Backend valida
  ↓ 1. Verifica firma (es tu wallet?)
  ↓ 2. Anti-cheat: velocidad = distancia/tiempo
  ↓    - Si > 30 km/h → RECHAZA (estás en coche!)
  ↓ 3. Genera recompensa (random rarity)
  ↓ 4. Añade a inventory en MongoDB
  ↓ 5. Devuelve: { success: true, reward: {...} }
Frontend recibe respuesta
  ↓ Muestra "Crystal collected!"
  ↓ Elimina cristal de pantalla
  ↓ Actualiza inventory localmente
```

**Resultado**: Tienes un nuevo NFT en tu inventario.

**Backend (Anti-Cheat)**:
```typescript
// anticheat.service.ts
validateMovement(prevLat, prevLon, prevTime, currLat, currLon, currTime) {
  const distance = calculateDistance(prevLat, prevLon, currLat, currLon);
  const timeDiff = (currTime - prevTime) / 1000; // segundos
  const speed = (distance / timeDiff) * 3.6; // km/h
  
  if (speed > 30) {
    return false; // CHEATER!
  }
  return true;
}
```

---

### 4️⃣ **INVENTORY: Ver tus NFTs**
**Pantalla**: `InventoryScreen`

**¿Qué ves?**
- **Stats Bar**: 4 items totales, 710 AURA de valor
- **Lista**: 
  - Legendary Crystal (500 AURA)
  - Epic Shard (150 AURA)
  - Rare Core (50 AURA)
  - Common Fragment (10 AURA)

**¿De dónde vienen?**
```typescript
useEffect(() => {
  // Backend GET /users/me
  const profile = await api.users.getProfile(account);
  setInventory(profile.inventory);
}, []);
```

**Backend MongoDB**:
```json
{
  "inventory": [
    {
      "id": 1,
      "type": "Crystal",
      "rarity": "legendary",
      "value": 500,
      "timestamp": 1700000000000,
      "capturedAt": { "lat": 40.7128, "lon": -74.0060 }
    }
  ]
}
```

**Acciones**:
- **Ver**: Simplemente miras
- **Vender**: Pulsas "Sell" → Te lleva a Marketplace

---

### 5️⃣ **PVP DUEL: Luchar contra Otro Jugador**
**Pantalla**: `PvPDuelScreen`

**Flujo Completo**:

```
1. MATCHMAKING (2 segundos)
   - Backend busca oponente random
   - O puedes desafiar a un amigo

2. DUEL (10-30 segundos)
   - Barras de progreso suben
   - Tú: Random +0-3% cada 100ms
   - Oponente: Random +0-2.5% cada 100ms
   - Primero en 100% = GANA localmente

3. RESOLVING (1-2 segundos)
   - Si ganaste localmente, firmas mensaje
   - Backend POST /game/pvp/resolve
   - IMPORTANTE: Backend decide ganador real!
   - Puede ser diferente si detecta trampas

4. RESULT
   - Si ganaste: +500 XP, +50 AURA, nuevo NFT
   - Si perdiste: +10 XP (consolación)

Backend valida:
  ↓ Verifica firma
  ↓ Chequea logs anti-cheat
  ↓ Determina ganador REAL (no confía en cliente)
  ↓ Asigna recompensa
  ↓ Guarda en MongoDB
```

**¿Por qué firma?**
Para probar que eres tú y no un bot/hacker. El backend SIEMPRE decide quién ganó.

---

### 6️⃣ **MARKETPLACE: Comprar/Vender NFTs**
**Pantalla**: `MarketplaceScreen`

**¿Cómo funciona?**

**Para Listar (Vender)**:
```
1. Vas a Inventory
2. Pulsas "Sell" en un item
3. Te lleva a Marketplace
4. Pones precio (ej: 100 MATIC)
5. Firmas transacción en wallet
6. Smart Contract Marketplace.sol:
   - listItem(tokenId, 100 MATIC)
   - NFT se transfiere al contrato
   - Aparece en Marketplace
```

**Para Comprar**:
```
1. Ves grid de NFTs a la venta
2. Filtras por rarity/precio
3. Pulsas "Buy Now" en uno
4. Firmas transacción
5. Smart Contract:
   - buyItem(listingId) + 100 MATIC
   - 2.5% fee → Plataforma (2.5 MATIC)
   - 97.5 MATIC → Vendedor
   - NFT → Tu wallet
6. Backend detecta evento ItemSold
7. Actualiza inventarios en MongoDB
```

**Backend (Event Listener)**:
```typescript
// Escucha eventos del smart contract
marketplace.on('ItemSold', (listingId, buyer, price) => {
  // Actualizar MongoDB
  await userModel.updateOne(
    { address: buyer },
    { $push: { inventory: nftData } }
  );
});
```

---

### 7️⃣ **STAKING: Ganar Dinero Pasivo**
**Pantalla**: `StakingScreen`

**¿Cómo funciona?**

```
1. Tienes 1000 AURA tokens
2. Decides hacer stake de 500 AURA
3. Smart Contract Staking.sol:
   - stake(500 AURA)
   - Tokens bloqueados en contrato
   
4. APY = 12% base
5. Si esperas >30 días: +5% bonus = 17% total

6. Cada segundo:
   - Rewards acumulan
   - Formula: (500 × 0.17 × segundos) / (365 días × 10000)

7. Después de 30 días:
   - Rewards = ~21 AURA
   - Pulsas "Claim Rewards"
   - Firmas transacción
   - 21 AURA → Tu wallet

8. Puedes unstake en cualquier momento
   - unstake(500)
   - Recuperas 500 + rewards
```

**Real-Time Updates**:
```typescript
useEffect(() => {
  // Cada 10 segundos
  const interval = setInterval(async () => {
    const staking = new ethers.Contract(STAKING_ADDRESS, ABI, provider);
    const rewards = await staking.calculateRewards(account);
    setPendingRewards(ethers.formatEther(rewards));
  }, 10000);
}, []);
```

---

### 8️⃣ **AUCTIONS: Pujar por Items Raros**
**Pantalla**: `AuctionScreen`

**Flujo**:
```
1. Usuario A lista NFT en subasta
   - createAuction(tokenId, 100 MATIC start, 24h duration)
   
2. Usuario B ve la subasta
   - Countdown: 23h 45m 12s
   - Current bid: 100 MATIC
   
3. Usuario B puja
   - placeBid(auctionId) + 150 MATIC
   - Smart contract:
     * Valida: 150 > 100 + 0.5% = OK
     * Reembolsa 100 MATIC a anterior pujador
     * Guarda nueva puja
   - Anti-sniping: Si quedan <5min, +5min al timer
   
4. Timer llega a 0
5. Usuario C (último pujador) gana
   - finalizeAuction(auctionId)
   - NFT → Usuario C
   - 150 MATIC:
     * 2.5% (3.75) → Plataforma
     * 97.5% (146.25) → Usuario A (vendedor)
```

**Countdown en Tiempo Real**:
```typescript
useEffect(() => {
  const interval = setInterval(() => {
    const now = Date.now();
    const remaining = auction.endTime - now;
    setTimeLeft(formatTime(remaining));
  }, 1000);
}, []);
```

---

### 9️⃣ **LEADERBOARD: Rankings Globales**
**Pantalla**: `LeaderboardScreen`

**¿Cómo se calcula el score?**
```typescript
// Backend calcula cada hora
score = (XP × 1.0) + (PvP Wins × 50) + (NFTs × 10) + (Crystals × 5)

Ejemplo:
  XP: 3250
  PvP Wins: 42 → 42 × 50 = 2100
  NFTs: 23 → 23 × 10 = 230
  Crystals: 89 → 89 × 5 = 445
  ─────────────────────
  TOTAL: 6025 puntos
```

**Premios**:
```
Semanal:
  1º: 1000 AURA
  2º: 500 AURA
  3º: 250 AURA
  
Mensual:
  1º: 5000 AURA
  2º: 2500 AURA
  3º: 1000 AURA
```

**Backend (Cron Job)**:
```typescript
// Cada hora
@Cron('0 * * * *')
async updateLeaderboard() {
  const users = await this.userModel.find();
  
  for (const user of users) {
    const score = calculateScore(user);
    await this.leaderboardModel.updateOne(
      { address: user.address, period: 'weekly' },
      { score, rank: 0 },  // Rank se calcula después
      { upsert: true }
    );
  }
  
  // Ordenar y asignar ranks
  const entries = await this.leaderboardModel
    .find({ period: 'weekly' })
    .sort({ score: -1 });
    
  entries.forEach((entry, index) => {
    entry.rank = index + 1;
    entry.save();
  });
}
```

---

### 🔟 **GUILDS: Clanes y Territorios**
**Pantalla**: `GuildsScreen`

**Creación**:
```
1. Pulsas "Create Guild"
2. Nombre: "Crystal Hunters"
3. Descripción: "Elite AR hunters"
4. Backend POST /social/guilds/create
5. MongoDB:
   {
     name: "Crystal Hunters",
     founder: "0x1234...",
     members: ["0x1234..."],
     level: 1,
     territory: []
   }
```

**Unirse**:
```
1. Ves lista de guilds
2. Pulsas "Join Guild"
3. Backend POST /social/guilds/:id/join
4. Te añade a members array
```

**Territorios** (futuro):
```
- Guild captura un área GPS (40.7128, -74.0060, 1000m radius)
- Todos los cristales capturados ahí → 10% al guild fund
- Guild puede upgradear territorio con fondos
```

---

### 1️⃣1️⃣  **FRIENDS: Sistema Social**
**Pantalla**: `FriendsScreen`

**Añadir Amigo**:
```
1. Ingresas wallet: 0x5678...
2. POST /social/friends/add
3. MongoDB crea:
   {
     user: "0x1234...",  // Tú
     friend: "0x5678...", // Él
     status: "pending"
   }
4. Él ve notificación
5. Acepta: status = "accepted"
```

**Desafiar**:
```
1. Pulsas "Challenge" en amigo
2. Envía notificación push
3. Si acepta → PvP Duel directo
```

---

## 🔄 Flujo de Datos Completo

### Sincronización Frontend ↔ Backend

**Cuando capturas cristal**:
```
Mobile App (ARHuntScreen)
  ↓ POST /game/claim + signature
Backend (NestJS)
  ↓ Valida firma
  ↓ Anti-cheat checks
  ↓ MongoDB.updateOne({ address }, { $push: { inventory: crystal } })
  ↓ Response: { success: true, reward: crystal }
Mobile App
  ↓ Actualiza estado local
  ↓ setInventory([...inventory, crystal])
```

**Sincronización periódica**:
```typescript
// En cada pantalla
useEffect(() => {
  const refreshData = async () => {
    const profile = await api.users.getProfile(account);
    setLevel(profile.level);
    setInventory(profile.inventory);
    setWins(profile.pvpWins);
  };
  
  refreshData(); // Al montar
  const interval = setInterval(refreshData, 30000); // Cada 30s
  
  return () => clearInterval(interval);
}, [account]);
```

---

## 💾 Arquitectura de Datos

### Frontend (React Native)
```
AsyncStorage (persistente)
  ├─ auth_token: "jwt..."
  ├─ user_address: "0x1234..."
  └─ cached_profile: { level, inventory, ... }

React State (temporal)
  ├─ inventory: NFTItem[]
  ├─ location: { lat, lon }
  ├─ friends: Friend[]
  └─ leaderboard: Entry[]
```

### Backend (NestJS + MongoDB)
```
MongoDB Collections:
  ├─ users
  │   ├─ address (primary)
  │   ├─ level, xp
  │   ├─ inventory: NFTItem[]
  │   ├─ pvpWins, pvpLosses
  │   └─ createdAt
  │
  ├─ roles
  │   ├─ address
  │   └─ role: "user" | "admin"
  │
  ├─ guilds
  │   ├─ name
  │   ├─ members: address[]
  │   └─ territory: { lat, lon, radius }[]
  │
  ├─ friendships
  │   ├─ user, friend
  │   └─ status: "pending" | "accepted"
  │
  └─ leaderboard_entries
      ├─ address, score, rank
      └─ period: "weekly" | "monthly"

Redis (cache):
  ├─ player:0x1234:location: { lat, lon, timestamp }
  └─ rate_limit:0x1234:claim: { count, resetTime }
```

### Blockchain (Polygon)
```
Smart Contracts:
  ├─ AuraToken (ERC-20)
  │   └─ balances[address] = 1000 AURA
  │
  ├─ AuraNFT (ERC-721)
  │   └─ ownerOf[tokenId] = address
  │
  ├─ Marketplace
  │   └─ listings[listingId] = { seller, price, ... }
  │
  ├─ AuctionHouse
  │   └─ auctions[auctionId] = { currentBid, endTime, ... }
  │
  └─ Staking
      └─ stakes[address] = { amount, startTime, ... }
```

---

## 🎯 Puntos Clave para Entender

### 1. **Backend es la Fuente de Verdad**
- Frontend NUNCA decide si capturaste cristal
- Frontend NUNCA decide si ganaste PvP
- TODO se valida en backend

### 2. **Smart Contracts para Dinero**
- MongoDB para datos de juego (XP, inventory)
- Blockchain para assets con valor (NFTs, tokens)

### 3. **Firmas para Todo**
- Cada acción importante requiere firma wallet
- Firma = prueba que eres el dueño de esa wallet

### 4. **Actualización en Tiempo Real**
- Polling cada 30s para datos
- WebSockets para eventos en vivo (futuro)
- Smart contract events para transacciones

### 5. **Modo Offline**
- Puedes ver inventory sin internet
- NO puedes capturar cristales (requiere backend)
- NO puedes hacer trades (requiere blockchain)

---

## 📱 Tutorial In-App (Próximo)

Cuando abras la app por primera vez:
```
1. Welcome Screen
   "Bienvenido a Aura Quest"
   
2. Connecta Wallet
   "Conecta tu wallet para comenzar"
   
3. AR Tutorial
   "Mueve tu cámara para encontrar cristales"
   [Cristal aparece]
   "Toca el cristal para capturarlo"
   
4. Firma
   "Firma el mensaje para reclamar tu recompensa"
   
5. Inventory
   "Aquí están tus NFTs"
   
6. Marketplace
   "Puedes vender tus items aquí"
   
7. ¡Listo!
   "¡Ahora explora y diviértete!"
```

---

¿Alguna parte específica que quieras que profundice más?
