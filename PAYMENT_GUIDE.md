# 💰 Sistema de Pagos y Monetización - Aura Quest

## 🎯 ¿Dónde Recibo el Dinero?

Cuando un usuario paga en el juego, el dinero va a **smart contracts** en la blockchain. Tú, como dueño de la plataforma, recibes comisiones (fees) automáticamente.

---

## 💵 Fuentes de Ingresos

### 1. **Marketplace Fee (2.5%)**
**Smart Contract**: `Marketplace.sol`

Cuando alguien compra un NFT:
```solidity
// Ejemplo: NFT vendido por 100 MATIC
100 MATIC del comprador
  ├─ 2.5 MATIC (2.5%) → TU WALLET (owner())
  └─ 97.5 MATIC (97.5%) → Vendedor
```

**Dónde va el dinero**:
```solidity
// Marketplace.sol línea ~80
function buyItem(uint256 listingId) external payable {
    // ... código de validación ...
    
    uint256 fee = (listing.price * platformFee) / FEE_DENOMINATOR;
    uint256 sellerProceeds = listing.price - fee;
    
    // AQUÍ: Envía fee a TI (owner del contrato)
    (bool successFee, ) = payable(owner()).call{value: fee}("");
    require(successFee, "Fee payment failed");
}
```

**Tu wallet = `owner()`** = La wallet que **desplegó** el smart contract.

---

### 2. **Auction Fee (2.5%)**
**Smart Contract**: `AuctionHouse.sol`

Cuando finaliza una subasta:
```solidity
// Ejemplo: Subasta ganada con bid de 500 MATIC
500 MATIC del ganador
  ├─ 12.5 MATIC (2.5%) → TU WALLET (owner())
  └─ 487.5 MATIC (97.5%) → Vendedor original
```

**Código**:
```solidity
// AuctionHouse.sol línea ~120
function finalizeAuction(uint256 auctionId) external {
    // ... código de validación ...
    
    uint256 fee = (auction.currentBid * platformFee) / FEE_DENOMINATOR;
    
    // AQUÍ: Envía fee a TI
    if (fee > 0) {
        (bool successFee, ) = payable(owner()).call{value: fee}("");
        require(successFee, "Fee payment failed");
    }
}
```

---

### 3. **Fees Acumulados en Contratos**
**Smart Contract**: `Marketplace.sol` tiene función `withdrawFees()`

Si los fees se acumulan en el contrato:
```solidity
// Marketplace.sol
function withdrawFees() external onlyOwner {
    uint256 balance = address(this).balance;
    (bool success, ) = payable(owner()).call{value: balance}("");
    require(success, "Withdrawal failed");
}
```

**Para retirar fees acumulados**:
```bash
# Desde terminal con Hardhat
npx hardhat run scripts/withdraw-fees.ts --network polygon
```

---

## 🔑 Configuración: ¿Cuál es TU Wallet?

### Paso 1: Identificar Owner Wallet

**La wallet owner() es la que DESPLEGÓ el contrato**.

Cuando ejecutaste:
```bash
npx hardhat run scripts/deploy-phase2.ts --network polygon
```

La wallet configurada en `hardhat.config.ts` fue la que desplegó:
```typescript
// hardhat.config.ts
const config: HardhatUserConfig = {
  networks: {
    polygon: {
      url: "https://polygon-rpc.com",
      accounts: [process.env.PRIVATE_KEY!]  // <-- ESTA WALLET
    }
  }
};
```

**Esa wallet es el `owner()` de todos los contratos.**

---

### Paso 2: Verificar Owner Actual

**Opción A: Desde Hardhat Console**
```bash
npx hardhat console --network polygon
```

```javascript
const Marketplace = await ethers.getContractFactory("Marketplace");
const marketplace = Marketplace.attach("0xTU_MARKETPLACE_ADDRESS");
const owner = await marketplace.owner();
console.log("Owner wallet:", owner);
```

**Opción B: Desde Polygonscan**
1. Ve a https://polygonscan.com/address/0xTU_MARKETPLACE_ADDRESS
2. Click "Read Contract"
3. Busca función `owner()`
4. Verás la dirección

---

### Paso 3: Cambiar Owner (Si es necesario)

Si quieres cambiar a otra wallet:

**Script**: `scripts/transfer-ownership.ts`
```typescript
import { ethers } from "hardhat";

async function main() {
    const NEW_OWNER = "0xTU_NUEVA_WALLET";
    
    const Marketplace = await ethers.getContractFactory("Marketplace");
    const marketplace = Marketplace.attach("0xMARKETPLACE_ADDRESS");
    
    console.log("Transferring ownership to:", NEW_OWNER);
    const tx = await marketplace.transferOwnership(NEW_OWNER);
    await tx.wait();
    
    console.log("✅ Ownership transferred!");
}

main();
```

**Ejecutar**:
```bash
npx hardhat run scripts/transfer-ownership.ts --network polygon
```

---

## 💳 Recibir Pagos: Flujo Completo

### Escenario: Usuario compra NFT por 100 MATIC

**1. Usuario aprueba transacción en MetaMask**
```
MetaMask muestra:
  - Función: buyItem
  - Costo: 100 MATIC + gas (~0.01 MATIC)
  - Total: 100.01 MATIC
```

**2. Transacción se procesa**
```
Blockchain (Polygon)
  ↓
Smart Contract Marketplace.sol
  ↓ buyItem(listingId)
  ↓ Calcula fee: 100 × 2.5% = 2.5 MATIC
  ↓
División de fondos:
  ├─ 2.5 MATIC → owner() (TÚ)
  └─ 97.5 MATIC → seller (vendedor)
```

**3. Fondos llegan a tu wallet INSTANTÁNEAMENTE**
```
Tu Wallet (owner)
  Balance antes: 50 MATIC
  + Fee recibido: 2.5 MATIC
  ─────────────────────
  Balance después: 52.5 MATIC
```

**NO NECESITAS HACER NADA**. El dinero llega automáticamente a tu wallet.

---

## 📊 Ver Tus Ganancias

### Opción 1: MetaMask

1. Abre MetaMask
2. Selecciona Polygon Network
3. Tu balance muestra MATIC total (incluyendo fees)

**No puedes distinguir fees de otros fondos**. Todo es MATIC en tu wallet.

---

### Opción 2: Polygonscan

https://polygonscan.com/address/0xTU_WALLET

**Pestaña "Internal Txns"**:
```
From: Marketplace Contract
To: Tu Wallet
Value: 2.5 MATIC
Method: Fee Transfer

From: AuctionHouse Contract
To: Tu Wallet
Value: 12.5 MATIC
Method: Fee Transfer
```

---

### Opción 3: Dashboard Personalizado

**Crear script de monitoreo**:
```typescript
// scripts/monitor-earnings.ts
import { ethers } from "ethers";

async function main() {
    const provider = new ethers.JsonRpcProvider("https://polygon-rpc.com");
    const OWNER_WALLET = "0xTU_WALLET";
    
    // Obtener balance actual
    const balance = await provider.getBalance(OWNER_WALLET);
    console.log("Balance actual:", ethers.formatEther(balance), "MATIC");
    
    // Filtrar transacciones de fees
    const marketplace = new ethers.Contract(
        "0xMARKETPLACE_ADDRESS",
        ["event ItemSold(uint256 indexed listingId, address indexed buyer, uint256 price)"],
        provider
    );
    
    // Escuchar ventas
    const filter = marketplace.filters.ItemSold();
    const events = await marketplace.queryFilter(filter, -10000); // últimos 10k bloques
    
    let totalFees = 0;
    events.forEach(event => {
        const fee = (event.args.price * 250n) / 10000n; // 2.5%
        totalFees += Number(ethers.formatEther(fee));
    });
    
    console.log("Total fees ganados:", totalFees, "MATIC");
    console.log("≈ $", totalFees * 0.8, "USD"); // Aproximado
}

main();
```

**Ejecutar**:
```bash
npx hardhat run scripts/monitor-earnings.ts --network polygon
```

---

## 🏦 Retirar Fondos (Convertir a Dinero Real)

### Paso 1: De Wallet a Exchange

**Opciones populares**:
- Binance
- Coinbase
- Kraken
- Crypto.com

**Proceso**:
1. Crea cuenta en exchange
2. Obtén tu dirección de depósito MATIC (Polygon Network)
3. En MetaMask:
   ```
   Send → MATIC
   To: [Dirección del exchange]
   Amount: 100 MATIC
   Network: Polygon
   ```
4. Confirma transacción (gas ~0.01 MATIC)
5. MATIC llega al exchange en 2-5 minutos

---

### Paso 2: Vender MATIC por USD/EUR

**En el exchange**:
```
1. Ve a "Trade" o "Vender"
2. Selecciona: MATIC → USD/EUR
3. Precio actual: ~$0.80 por MATIC
4. Vende 100 MATIC = $80
5. USD/EUR quedan en tu cuenta del exchange
```

---

### Paso 3: Retirar a Cuenta Bancaria

**En el exchange**:
```
1. Ve a "Withdraw" o "Retirar"
2. Selecciona: Transferencia bancaria / SEPA
3. Ingresa datos bancarios (IBAN)
4. Amount: $80
5. Fee: ~$1-2
6. Recibes $78 en tu banco en 1-3 días
```

---

## 💡 Ejemplo Real de Earnings

### Escenario: Mes 1 de Operación

**Actividad del marketplace**:
```
20 ventas en Marketplace
  - Promedio: 50 MATIC por venta
  - Total volumen: 1,000 MATIC
  - Tu fee (2.5%): 25 MATIC

5 subastas finalizadas
  - Promedio: 200 MATIC por subasta
  - Total volumen: 1,000 MATIC
  - Tu fee (2.5%): 25 MATIC
  
─────────────────────────
TOTAL FEES: 50 MATIC
≈ $40 USD (a $0.80 por MATIC)
```

**Costos a deducir**:
```
- Gas fees (deployment): ~5 MATIC
- Backend hosting: $50/mes
- MongoDB: $0 (Free tier)
─────────────────────────
PROFIT: $40 - $50 = -$10 (primer mes)
```

**Proyección Mes 6**:
```
200 ventas/mes
Total fees: 500 MATIC = $400
Backend costs: $50
─────────────────────────
PROFIT: $350/mes
```

---

## 📝 Configuración de Fees (Cambiar Porcentaje)

### Cambiar de 2.5% a 5%

**Script**: `scripts/update-fees.ts`
```typescript
import { ethers } from "hardhat";

async function main() {
    const marketplace = await ethers.getContractAt(
        "Marketplace",
        "0xMARKETPLACE_ADDRESS"
    );
    
    const newFee = 500; // 5% (500 / 10000)
    
    console.log("Updating platform fee to 5%...");
    const tx = await marketplace.updatePlatformFee(newFee);
    await tx.wait();
    
    console.log("✅ Fee updated!");
}

main();
```

**Límites**:
```solidity
// Marketplace.sol tiene límite de 5% máximo
require(newFee <= 500, "Fee cannot exceed 5%");
```

---

## 🔐 Seguridad: Protege Tu Wallet Owner

### ⚠️ NUNCA compartas:
- Private key de tu wallet owner
- Seed phrase (12/24 palabras)
- Archivo keystore

### ✅ Buenas prácticas:

**1. Hardware Wallet**
- Ledger Nano S/X
- Trezor
- Mantén owner wallet en hardware wallet

**2. Multisig Wallet (Avanzado)**
```
Usar Gnosis Safe:
  - 3 wallets requieren firma
  - 2 de 3 deben aprobar para retirar fondos
  - Previene robos si 1 wallet se compromete
```

**3. Monitoring**
```typescript
// Alerta si fondos salen de owner wallet
const provider = new ethers.JsonRpcProvider("https://polygon-rpc.com");

provider.on(OWNER_WALLET, (balance) => {
    if (balance < THRESHOLD) {
        sendAlert("⚠️ Owner wallet balance low!");
    }
});
```

---

## 📊 Dashboard de Earnings (Futuro)

**Crear panel admin en tu app**:

```typescript
// AdminDashboard.tsx
const AdminDashboard = () => {
    const [totalFees, setTotalFees] = useState(0);
    const [todayFees, setTodayFees] = useState(0);
    const [volumeMATIC, setVolumeMATIC] = useState(0);
    
    useEffect(() => {
        // Fetch de backend
        const stats = await api.admin.getEarnings();
        setTotalFees(stats.totalFees);
        setTodayFees(stats.todayFees);
        setVolumeMATIC(stats.volume);
    }, []);
    
    return (
        <div>
            <h1>Earnings Dashboard</h1>
            <StatCard title="Total Fees" value={`${totalFees} MATIC`} />
            <StatCard title="Today" value={`${todayFees} MATIC`} />
            <StatCard title="Volume" value={`${volumeMATIC} MATIC`} />
        </div>
    );
};
```

---

## 🎯 Resumen Rápido

**P: ¿Dónde va el dinero cuando alguien paga?**  
**R:** A tu wallet de owner automáticamente (2.5% de cada venta/subasta).

**P: ¿Cómo sé cuál es mi wallet owner?**  
**R:** La que usaste para desplegar contratos (en `hardhat.config.ts`).

**P: ¿Cuándo recibo el dinero?**  
**R:** Instantáneamente (mismo bloque de la transacción).

**P: ¿Necesito hacer algo para recibir?**  
**R:** NO. Los smart contracts envían automáticamente.

**P: ¿Cómo retiro a dinero real?**  
**R:** Wallet → Exchange (Binance/Coinbase) → Vender MATIC → Banco.

**P: ¿Puedo cambiar el fee del 2.5%?**  
**R:** Sí, hasta 5% máximo con `updatePlatformFee()`.

---

## 📞 Próximos Pasos

1. **Verifica tu owner wallet**:
   ```bash
   npx hardhat console --network polygon
   > const m = await ethers.getContractAt("Marketplace", "0x...")
   > await m.owner()
   ```

2. **Monitorea transacciones**:
   - https://polygonscan.com/address/TU_WALLET

3. **Configura alertas**:
   - Script monitor-earnings.ts
   - Alertas por email/Telegram

4. **Considera hardware wallet**:
   - Para seguridad de fondos

¿Quieres que cree el script de monitoreo completo o el admin dashboard?
