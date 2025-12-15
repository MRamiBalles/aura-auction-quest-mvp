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

## 🛡️ Sistema Anti-Cheat

Arquitectura "Trust Sandwich":
1. **Cliente** → Reporta posición GPS
2. **Backend** → Valida velocidad/distancia, firma el movimiento
3. **Blockchain** → Solo acepta movimientos firmados

| Regla | Límite |
|-------|--------|
| Max Speed | 30 km/h |
| Max Teleport | 500m |

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
