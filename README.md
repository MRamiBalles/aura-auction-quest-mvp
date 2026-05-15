# Aura Auction Quest

**Sovereign Gamified Auction Platform**

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-B73BFE?style=for-the-badge&logo=vite&logoColor=FFD62E)](https://vitejs.dev/)

Aura Auction Quest is an interactive platform bridging real-time bidding systems with RPG (Role-Playing Game) progression logic. It provides concurrent state management for bids alongside persistent user progression and inventory tracking.

## Architecture & Features

- **Real-Time Auction Engine**: Low-latency bidding system with deterministic countdown management.
- **Quest & Progression Module**: Daily/weekly objective tracking that hooks into core user engagement loops.
- **Virtual Economy**: Internal ledger for currency and inventory tracking, ensuring atomic transactions during auctions.
- **Frontend Infrastructure**: React 18 with Vite for optimized build pipelines and HMR. Strongly typed with TypeScript to enforce domain models.

## Quickstart

### Prerequisites
- Node.js 18+
- npm or pnpm

### Setup
```bash
git clone https://github.com/MRamiBalles/aura-auction-quest-mvp.git
cd aura-auction-quest-mvp
npm install
npm run dev
```

The application runs locally on `http://localhost:5173`.

## Tech Stack

- **Core**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS
- **State Management**: Context API / Zustand
- **CI/CD**: GitHub Actions

## Contributing

This is a Minimum Viable Product (MVP) aimed at validating the core auction and gamification loops.
Standard PR workflows apply:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/module-name`)
3. Commit changes (`git commit -am 'feat: implement module-name'`)
4. Push to branch (`git push origin feature/module-name`)
5. Open a Pull Request

---
**Author**: Manuel Ramírez Ballesteros
