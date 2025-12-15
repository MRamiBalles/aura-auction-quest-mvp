# MEMORIA DESCRIPTIVA - SOLICITUD DE PATENTE (BORRADOR)

**TÍTULO DE LA INVENCIÓN:**
SISTEMA Y MÉTODO HÍBRIDO DE VALIDACIÓN ANTI-SPOOFING PARA JUEGOS BASADOS EN GEOLOCALIZACIÓN Y ACTIVOS DIGITALES EN BLOCKCHAIN

## 1. SECTOR DE LA TÉCNICA
La presente invención se encuadra en el sector de los videojuegos de realidad aumentada (AR) y sistemas de registro distribuido (Blockchain), específicamente en métodos de seguridad para validar la presencia física de un usuario en coordenadas geográficas específicas antes de permitir transacciones de activos digitales.

## 2. ESTADO DE LA TÉCNICA (ANTECEDENTES)
Los juegos actuales "Move-to-Earn" o de realidad aumentada (como Pokémon GO o STEPN) sufren de vulnerabilidades críticas donde los usuarios utilizan falsificadores de GPS ("GPS Spoofing") para simular movimiento sin desplazamiento físico real.
Las soluciones actuales se basan en:
1. Análisis de servidor centralizado (propenso a falsos positivos).
2. Datos de GPS del sistema operativo (fácilmente manipulables en Android/iOS).

No existe una solución que vincule criptográficamente la biometría/sensores físicos del dispositivo con una transacción en una blockchain pública de manera inmutable.

## 3. DESCRIPCIÓN DE LA INVENCIÓN (PROBLEMA Y SOLUCIÓN)
La invención propone un sistema denominado "Trust Sandwich" que resuelve el problema del spoofing mediante una validación de tres capas interconectadas:

1. **Capa Física (Cliente):** Recolección simultánea de coordenadas GPS, datos de acelerómetro y redes Wi-Fi circundantes.
2. **Capa de Autoridad (Backend):** Un oráculo centralizado que verifica la viabilidad física del desplazamiento (velocidad < 30km/h, no teletransporte) y genera una firma criptográfica ECDSA de un solo uso con expiración corta (Time-To-Live).
3. **Capa de Liquidación (Blockchain):** Un contrato inteligente que solo permite la acuñación (minting) del activo si recibe la firma válida de la Capa de Autoridad junto con el pago del usuario.

## 4. DESCRIPCIÓN DE LOS DIBUJOS
*(Aquí se adjuntarían diagramas de flujo del sistema)*
- Fig 1: Diagrama de flujo de la solicitud de firma.
- Fig 2: Esquema de validación on-chain.

## 5. REALIZACIÓN PREFERENTE DE LA INVENCIÓN
El sistema se implementa mediante un controlador de backend (`LandlordsController`) que recibe coordenadas `(lat, long)` y `userAddress`.
El controlador verifica:
- Distancia Haversine vs última posición conocida.
- Tiempo transcurrido (para calcular velocidad).
Si es válido, firma con clave privada `PK_VALIDATOR` un hash `H(user, lat, long, timestamp)`.
El usuario envía esta firma al contrato inteligente `LandRegistry.sol`.
El contrato recupera la dirección del firmante usando `ecrecover`. Si `signer == VALIDATOR_ADDRESS`, ejecuta la transacción.

## 6. REIVINDICACIONES (LO QUE SE PROTEGE)

1. **Sistema de validación de geolocalización** para activos digitales, caracterizado por comprender:
   a) un dispositivo móvil configurado para capturar coordenadas GPS;
   b) un servidor validador configurado para recibir dichas coordenadas y generar una firma digital criptográfica que incluye una marca de tiempo de expiración;
   c) un contrato inteligente distribuido (blockchain) configurado para verificar dicha firma digital antes de cambiar el estado de propiedad de un activo virtual asociado a esas coordenadas.

2. **Sistema según la reivindicación 1**, donde la firma digital incluye la dirección pública del usuario solicitante para prevenir ataques de repetición ("replay attacks").

3. **Método de prevención de fraude** que comprende comparar los datos del acelerómetro del dispositivo con la velocidad de desplazamiento calculada por GPS antes de emitir la firma de validación.
