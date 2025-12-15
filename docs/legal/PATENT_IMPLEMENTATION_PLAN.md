# IMPLIMENTACIÓN TÉCNICA DE PATENTES (GAP ANALYSIS)

Este documento detalla la brecha entre las patentes solicitadas y el código actual, y define la hoja de ruta para implementar la tecnología mínima viable (MVP) que soporte las reivindicaciones legales.

## 1. Bio-Kinetic Auth (Prioridad ALTA)
**Estado:** No iniciado.
**Requerimiento Legal:** Demostrar que se usan datos del sensor para autorizar.
**Plan de Código:**
- Crear `BioAuthService` en frontend.
- Definir interfaz `BiometricSignature`.
- Integrar hook en `Web3Context` (simulado por ahora).

## 2. Spatial Consensus (Prioridad MEDIA)
**Estado:** No iniciado.
**Requerimiento Legal:** Demostrar comunicación P2P para validar coordenadas.
**Plan de Código:**
- Crear estructura de datos `SpatialVote`.
- Definir lógica de `ConsensusEngine`.

## 3. Environmental NFTs (Prioridad MEDIA)
**Estado:** No iniciado.
**Requerimiento Legal:** Demostrar conexión Oráculo -> Atributo NFT.
**Plan de Código:**
- Definir interfaz smart contract `IWeatherOracle`.
- Crear lógica de adaptación en `AuraNFT.sol` (stub).

## 4. Crowd-Sourced Rarity (Prioridad BAJA)
**Estado:** Diseño conceptual.
**Requerimiento Legal:** Algoritmo de ajuste de probabilidad por densidad.
**Plan de Código:**
- Implementar función de cálculo de densidad en `LandlordsController`.

---

## ESTRATEGIA DE "STUBBING"
Para que la patente sea válida bajo "Constructive Reduction to Practice", no necesitamos el código final perfecto, pero sí una descripción detallada y estructuras de datos que demuestren que *sabemos cómo hacerlo*.

Implementaremos las **Interfaces y Tipos** en el código fuente hoy mismo.
