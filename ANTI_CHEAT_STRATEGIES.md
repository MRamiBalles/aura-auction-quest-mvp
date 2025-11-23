# AuraAuction Quest: Anti-Cheat & Fair Play Strategy

**Objective:** Protect the "Millionaire" economy from exploitation by bots, spoofers, and emulators.
**Philosophy:** "Trust but Verify" (Client is always compromised; Server is truth).

---

## 1. The Threat Landscape
In a Move-to-Earn (M2E) economy with high-value NFT auctions, the incentives for cheating are massive. We must defend against:
1.  **GPS Spoofing:** Fake location data to "teleport" to crystals.
2.  **Device Farming:** One person controlling 50 phones/emulators.
3.  **Bot Automation:** Scripts playing PvP or bidding in auctions.
4.  **Man-in-the-Middle (MitM):** Intercepting and modifying API traffic.

---

## 2. Layer 1: Device Integrity (The Gatekeeper)
Before a user can even log in, we verify the device is a legitimate, unmodified physical phone.

### A. Attestation APIs
*   **Android:** Google Play Integrity API (Verdict: `MEETS_DEVICE_INTEGRITY`).
*   **iOS:** Apple App Attest / DeviceCheck.
*   **Action:** If attestation fails (Rooted, Jailbroken, Emulator), the app runs in "Ghost Mode" (can play, but earns 0 rewards).

### B. Sensor Fusion Checks
Real movement creates "noise" across multiple sensors. Bots are too perfect.
*   **Correlation:** GPS movement must match Accelerometer/Gyroscope data.
    *   *Check:* If GPS moves 100m but Accelerometer shows `0.0` variance -> **BAN**.
*   **Magnetometer:** Compass direction must align with GPS bearing changes.

---

## 3. Layer 2: Location Verification (The Watchdog)
Preventing "Couch Potato" farming.

### A. Speed & Teleportation
*   **Speed Limit:** Max 25 km/h (Running/Cycling). Anything faster disables earning for 5 mins.
*   **Teleport:** Distance / Time > 1000 km/h -> **Soft Ban** (24h).

### B. GPS Fuzzing Detection
*   **The "Perfect Line":** Real GPS drifts. If a user moves in a perfectly straight line or stays at *exact* coordinates (e.g., `40.123456, -74.123456`) for 10 mins -> **Flag**.
*   **Altitude Check:** GPS altitude should vary slightly. Constant `0` or fixed altitude indicates spoofing software.

### C. AR "Proof of Presence"
*   **Visual Anchors:** To claim a "Legendary" crystal, user must scan a specific local landmark (e.g., Statue, Building).
*   **ML Validation:** Server verifies the uploaded image feature points match the expected landmark.

---

## 4. Layer 3: Behavioral Analysis (The Detective)
Using Statistics to catch what code misses.

### A. The "God Mode" Pattern
*   **PvP Win Rate:** If user wins >90% of duels with reaction times <100ms -> **Flag**.
*   **Auction Sniping:** Bids consistently placed at `0.01s` remaining -> **Captcha Challenge**.

### B. Graph Analysis (Sybil Attacks)
*   **Wallet Clustering:** If 10 accounts send assets to 1 "Master Wallet" -> **Ban Cluster**.
*   **Device Fingerprinting:** Same Device ID logging into multiple accounts -> **Limit to 1 active**.

---

## 5. Punishment System: The "Shadowban"
Don't ban instantly (it tells cheat devs what triggered it). Use **Shadowbans**.

| Infraction Level | Penalty | User Experience |
| :--- | :--- | :--- |
| **Level 1 (Suspicious)** | "Bad Luck" Mode | Crystals spawn but always "flee" or break on capture. |
| **Level 2 (Confirmed)** | "Ghost" Mode | Can play, see auctions, but bids always fail ("Network Error"). |
| **Level 3 (Critical)** | "Blacklist" | Account locked. Assets frozen. IP banned. |

---

## 6. Implementation Roadmap
1.  **Phase 3 (Beta):** Implement Google Play Integrity / App Attest.
2.  **Phase 4 (Launch):** Deploy Server-side Speed & Sensor Fusion checks.
3.  **Phase 5 (Post-Launch):** Activate ML-based Behavioral Analysis.
