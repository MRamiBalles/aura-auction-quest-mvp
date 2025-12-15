# MEMORIA DESCRIPTIVA - SOLICITUD DE PATENTE (BORRADOR)

**TÍTULO DE LA INVENCIÓN:**
SISTEMA DE CONSENSO ESPACIAL DESCENTRALIZADO PARA LA PERSISTENCIA DE OBJETOS DE REALIDAD AUMENTADA MEDIANTE VALIDACIÓN ENTRE PARES (P2P)

## 1. SECTOR DE LA TÉCNICA
Realidad Aumentada (AR), redes Mesh y Computación Distribuida.

## 2. ESTADO DE LA TÉCNICA
Los sistemas actuales de "AR Cloud" (como Google Cloud Anchors o Niantic Lightship) dependen de servidores centralizados para guardar y servir los mapas de puntos 3D. Esto presenta problemas de privacidad y dependencia de un único proveedor.

## 3. DESCRIPCIÓN DE LA INVENCIÓN
La invención propone un protocolo donde los dispositivos móviles en una misma ubicación física crean una red malla (mesh) temporal local (vía Bluetooth/UWB).
1. Un dispositivo propone la posición de un objeto virtual.
2. Los dispositivos cercanos actúan como "testigos", verificando visualmente (vía cámara compartida o características de puntos comunes) la posición.
3. Se alcanza un "consenso local" sobre la coordenada exacta.
4. Este consenso se escribe en la blockchain, anclando el objeto sin pasar por un servidor central de mapas.

## 4. REIVINDICACIONES

1. **Método de anclaje espacial distribuido**, caracterizado por establecer una red de comunicación directa entre dispositivos coubicados para validar y acordar las coordenadas tridimensionales relativas de un objeto virtual mediante un algoritmo de consenso entre pares, sin intermediación de un servidor central de mapeo.
