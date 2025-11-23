# Aura Quest Mobile - React Native App

React Native mobile application for Aura Quest - AR NFT Hunting Game.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)
- iOS Simulator (Mac only) or Android Studio

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm start

# Run on iOS
npm run ios

# Run on Android
npm run android
```

## 📱 Features

- **WalletConnect Integration** - Mobile wallet authentication
- **AR Crystal Hunt** - Camera-based AR gameplay
- **GPS Tracking** - Real-world location integration
- **NFT Marketplace** - Buy, sell, and trade items
- **PvP Duels** - Challenge other players
- **Staking** - Earn passive rewards
- **Social Features** - Guilds, friends, leaderboards

## 🏗️ Project Structure

```
mobile/
├── App.tsx                 # Main app entry
├── app.json               # Expo configuration
├── src/
│   ├── screens/          # Screen components
│   │   ├── AuthScreen.tsx
│   │   ├── HomeScreen.tsx
│   │   ├── ARHuntScreen.tsx
│   │   ├── InventoryScreen.tsx
│   │   └── ...
│   ├── contexts/         # React contexts
│   │   ├── Web3Context.tsx
│   │   ├── SoundContext.tsx
│   │   └── InventoryContext.tsx
│   ├── components/       # Reusable components
│   └── utils/           # Helper functions
└── assets/              # Images, fonts, etc.
```

## 🔧 Configuration

### Deep Linking
The app uses the custom scheme `auraquest://` for deep linking with WalletConnect.

### Permissions

**iOS (Info.plist):**
- Camera access
- Location (when in use)
- Location (always) for background tracking

**Android (AndroidManifest.xml):**
- CAMERA
- ACCESS_FINE_LOCATION
- ACCESS_BACKGROUND_LOCATION

## 📦 Building

### Development Build
```bash
eas build --profile development --platform ios
eas build --profile development --platform android
```

### Production Build
```bash
eas build --profile production --platform ios
eas build --profile production --platform android
```

## 🧪 Testing

```bash
npm test
```

## 📄 License

MIT
