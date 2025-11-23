# AuraAuction Quest: Plan del Ciclo de Vida de Desarrollo de Software (SDLC)

**Metodología:** Ágil / Iterativa con Entregables "Basados en Hitos".
**Objetivo:** Despliegue rápido del MVP seguido de una expansión escalable y segura.

---

## Fase 1: Planificación y Prototipado (Hecho / En Progreso)
*   **Objetivo:** Validar el bucle central y la identidad visual.
*   **Entregables:**
    *   [x] Estudio de Mercado y Estrategia.
    *   [x] Wireframes UI/UX (Prototipo Lovable).
    *   [x] Análisis de Viabilidad Técnica.
*   **Tecnología:** React Native (Expo), Figma.

## Fase 2: Desarrollo del MVP (La Build "Alpha") - Meses 1-3
*   **Objetivo:** Una versión jugable "Testnet" para los primeros usuarios (1,000 usuarios).
*   **Características Principales:**
    1.  **Escáner AR v1:** Superposición básica de cámara usando Three.js/Expo AR. Detectar "marcadores" en el mundo real.
    2.  **Motor de Geo-Localización:** Integración de Mapbox para exploración con "Niebla de Guerra".
    3.  **Integración de Billetera:** Web3Auth (Login Social) + Polygon Amoy Testnet.
    4.  **Casa de Subastas:** Sistema de pujas básico (Firebase Realtime DB).
*   **Arquitectura:**
    *   *Frontend:* React Native + TypeScript.
    *   *Backend:* Node.js (NestJS) para lógica del juego.
    *   *BD:* MongoDB (Datos de usuario), Redis (Tablas de clasificación/Subastas).
    *   *Blockchain:* Polygon (Bajas tarifas de gas, alta velocidad).

## Fase 3: La "Beta" y Ajuste de Economía - Meses 4-6
*   **Objetivo:** Pruebas de estrés de la economía y sistemas anti-trampas.
*   **Áreas de Enfoque:**
    *   **Capa Anti-Trampas:** Implementar análisis de movimiento basado en ML (acelerómetro + varianza GPS).
        *   *Ver Detalle Técnico:* [Estrategias Anti-Trampas](./ANTI_CHEAT_STRATEGIES.md)
    *   **Motor PvP:** Duelos en tiempo real basados en WebSocket.
    *   **Pasarela Fiat:** Integración de Stripe/PayPal para usuarios no cripto.
*   **Seguridad:** Auditoría de Contratos Inteligentes (CertiK/Hacken). **Paso crítico antes de Mainnet.**
    *   *Ver Arquitectura Segura:* [Arquitectura Backend](./BACKEND_ARCHITECTURE.md)

## Fase 4: Lanzamiento Global (Mainnet) - Mes 7+
*   **Objetivo:** Adquisición de Usuarios y Generación de Ingresos.
*   **Estrategia de Lanzamiento:**
    *   "Genesis Drop" de 10,000 Sneakers/Escáneres NFT.
    *   Blitz de Marketing con Influencers (Nichos Fitness + Cripto).
*   **Escalabilidad:**
    *   Migrar a Serverless (AWS Lambda) para picos de subastas.
    *   Implementar Sharding para el Mundo del Juego (Servidores Regionales).

---

## Diagrama de Arquitectura Técnica (Conceptual)

```mermaid
graph TD
    User[App Móvil (React Native)]
    
    subgraph "Edge / CDN"
        Assets[Modelos 3D / Activos AR]
    end
    
    subgraph "Backend del Juego (Node.js)"
        API[API REST/GraphQL]
        Socket[Servidor WebSocket (PvP/Subastas)]
        Engine[Lógica del Juego / Anti-Trampas]
    end
    
    subgraph "Capa de Datos"
        DB[(MongoDB - Usuarios)]
        Cache[(Redis - Estado en Vivo)]
    end
    
    subgraph "Capa Blockchain (Polygon)"
        Wallet[Web3Auth / WalletConnect]
        Contracts[Contratos Inteligentes (NFTs, Token)]
    end
    
    User --> API
    User --> Socket
    User --> Assets
    API --> DB
    Socket --> Cache
    API --> Engine
    Engine --> Contracts
```

---

## Estrategia de Garantía de Calidad (QA)

### 1. Pruebas Automatizadas
*   **Pruebas Unitarias:** Jest para todos los cálculos de lógica del juego (ganancias, daño, XP).
*   **Pruebas E2E:** Detox/Appium para flujos críticos (Onboarding -> Escaneo -> Subasta -> Retiro).

### 2. Seguridad "Red Team"
*   **Pruebas de Exploits:** Contratar jugadores "white hat" para intentar suplantar GPS, automatizar clics o explotar temporizadores de subastas.
*   **Auditorías de Contratos:** Tolerancia cero para ataques de reentrada o bugs de desbordamiento.

### 3. Pruebas de Aceptación del Usuario (UAT)
*   **Alpha Cerrada:** 100 usuarios (Amigos y Familia). Enfoque en el "Factor Diversión".
*   **Beta Abierta:** 5,000 usuarios. Enfoque en Carga del Servidor y Equilibrio de la Economía.

---

## Hoja de Ruta hacia el Estatus "Millonario"
1.  **Q1 2026:** Lanzamiento MVP en Testnet.
2.  **Q2 2026:** Beta con incentivos "Play-to-Airdrop".
3.  **Q3 2026:** Lanzamiento Mainnet + TGE del Token (Evento de Generación de Token).
4.  **Q4 2026:** Asociaciones de Marca y Eventos Globales.
