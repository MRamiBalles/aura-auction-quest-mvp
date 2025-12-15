# MEMORIA DESCRIPTIVA - SOLICITUD DE PATENTE (BORRADOR)

**TÍTULO DE LA INVENCIÓN:**
SISTEMA DE GENERACIÓN DE PRUEBA DE MOVIMIENTO (PROOF-OF-MOVEMENT) SOBRE CADENA DE BLOQUES MEDIANTE FUSIÓN DE SENSORES BIOMÉTRICOS Y GPS

## 1. SECTOR DE LA TÉCNICA
Blockchain, IoT (Internet of Things) y algoritmos de validación de actividad física para aplicaciones "Move-to-Earn".

## 2. ESTADO DE LA TÉCNICA
Las aplicaciones actuales de Fitness confían en el podómetro del sistema operativo. Estos datos son fácilmente inyectables mediante software de depuración. No existe un estándar para registrar este esfuerzo físico de manera inmutable y verificable por terceros sin confiar en un servidor central.

## 3. DESCRIPCIÓN DE LA INVENCIÓN
La invención convierte datos brutos de sensores (acelerómetro, giroscopio, magnetómetro) en un "Hash de Movimiento" único.
El sistema:
1. Captura una ventana de tiempo de datos de sensores.
2. Aplica un algoritmo de análisis de patrones (gait analysis) localmente para extraer una "huella de movimiento".
3. Genera un hash criptográfico de esta huella junto con datos GPS.
4. Envía este hash a un contrato inteligente verificador.

Esto permite que un contrato inteligente valide que "se ha realizado trabajo físico" (Proof of Work físico) antes de liberar tokens, sin necesidad de transmitir datos biométricos privados, solo el hash de validación.

## 4. REIVINDICACIONES

1. **Método para certificar actividad física en una red distribuida**, que comprende: capturar datos inerciales de un dispositivo móvil; procesar dichos datos para extraer un vector de características de movimiento humano; generar un hash criptográfico a partir de dicho vector; y registrar dicho hash en un libro mayor distribuido como prueba de trabajo físico.

2. **Sistema según la reivindicación 1**, donde el contrato inteligente ajusta la recompensa emitida en función de la entropía o complejidad del hash de movimiento recibido, recompensando mayor esfuerzo físico detectado.
