# Aura World (MVP)

> **Move-to-Earn AR Game** - Walk, hunt NFTs, battle players, and earn crypto.

[![License](https://img.shields.io/badge/License-Proprietary-red.svg)](LICENSE)
[![Blockchain](https://img.shields.io/badge/Blockchain-Polygon-purple.svg)](https://polygon.technology/)
[![Status](https://img.shields.io/badge/Status-MVP-blue.svg)]()

---

## 👨‍💻 Creador

**Manuel Ramírez Ballesteros**  
📧 Email: ramiballes96@gmail.com  
💰 PayPal/Donaciones: [ramiballes96@gmail.com](https://paypal.me/ramiballes96)

> ¿Te gusta el proyecto? ¡Considera hacer una donación para apoyar el desarrollo del MVP! Cada contribución ayuda a acelerar el lanzamiento. 🚀

---

## 🌟 Características

- **AR Crystal Hunting**: Encuentra y colecciona cristales en el mundo real usando tu cámara.
- **Economía Blockchain**: Mintea los cristales capturados como NFTs en Polygon Amoy Testnet.
- **Sistema Anti-Cheat**: Verificación GPS en servidor para prevenir spoofing y teletransporte.
- **Integración Wallet**: Conecta con MetaMask para gestionar tu inventario y tokens.
- **PvP Duels**: Batalla contra otros jugadores en tiempo real.
- **Live Auctions**: Sistema de subastas con protección anti-sniping.
- **Multi-idioma**: Soporte para Inglés, Español y Japonés.

---

## 🛠️ Tech Stack

| Capa | Tecnologías |
|------|-------------|
| **Frontend** | React, Vite, Tailwind CSS, Framer Motion, i18next |
| **Backend** | NestJS, MongoDB (Mongoose), JWT Auth |
| **Blockchain** | Hardhat, Solidity 0.8.20, Ethers.js v6 |
| **AR** | Native HTML5 Camera & Geolocation APIs |
| **Monitoring** | Sentry SDK v8 |

---

## 🚀 Quick Start

### Prerequisites
- Node.js v18+
- npm or yarn
- MongoDB (local o Atlas URI)
- MetaMask Browser Extension

### 1. Frontend
```bash
npm install
npm run dev
```
*Disponible en `http://localhost:8080`*

### 2. Backend
```bash
cd backend
npm install
npm run start:dev
```
*API en `http://localhost:3000`*

### 3. Smart Contracts
```bash
# Crear .env con PRIVATE_KEY
npx hardhat run scripts/deploy.ts --network amoy
```

---

## 🛡️ Sistema Anti-Cheat (Sensor Fusion Architecture)
Arquitectura "Trust Sandwich" robusta contra ataques de inyección de señal (GPS Spoofing).

```mermaid
graph TD;
    A[GPS Signal] --> B{Sensor Fusion Engine};
    C[IMU / Accelerometer] --> B;
    B -- "Correlation Check > 0.9" --> D[Valid Move];
    B -- "Mismatch (Teleport)" --> E[Flag Anomaly];
    D --> F[Sign Transaction (Play Integrity API)];
    E --> G[Shadowban / Revert];
```

### 🧬 Detección de Anomalías (Human vs. Bot Behavior)
| Signal Metric | Human Player (Organic) | GPS Spoofer / Bot (Synthetic) | Detection Action |
| :--- | :--- | :--- | :--- |
| **Accelerometer Variance** | High Noise (>0.5g) | Zero / Perfectly Smooth | **Flag Account** |
| **Speed Consistency** | Variable (Stop-Start) | Constant (30.0 km/h) | **Soft Ban** |
| **Altitude Delta** | Natural Fluctuation | Flat (0m change) | **Reject Transaction** |

| Regla | Límite | Detection Method |
|-------|--------| :--- |
| **Max Speed** | 30 km/h | Time-Distance Delta |
| **Jump Detection** | 500m | Kalman Filter Smoothing |
| **Device Integrity** | Hardware | Google Play Attestation |

---

## 📊 Roadmap 2026

- **Q1**: Beta cerrada, Safari Zone Events
- **Q2**: Lanzamiento público, Battle Pass
- **Q3**: B2B SaaS SDK, Corporate Wellness
- **Q4**: Aura Dating, Landlords System

---

## 🤝 Contribuir

¿Quieres contribuir al proyecto?

1. Fork el repositorio
2. Crea una branch (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add AmazingFeature'`)
4. Push a la branch (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

O simplemente contacta a **ramiballes96@gmail.com** para discutir ideas.

---

## 📜 Licencia

Este proyecto es un prototipo MVP. Todos los derechos reservados.  
© 2024-2025 Manuel Ramírez Ballesteros

---

<p align="center">
  <strong>Hecho con ❤️ por Manuel Ramírez Ballesteros</strong><br>
  <a href="mailto:ramiballes96@gmail.com">ramiballes96@gmail.com</a>
</p>
