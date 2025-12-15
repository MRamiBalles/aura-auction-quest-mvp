# MEMORIA DESCRIPTIVA - SOLICITUD DE PATENTE (BORRADOR)

**TÍTULO DE LA INVENCIÓN:**
MÉTODO DE RAREZA DINÁMICA DEMOGRÁFICA PARA ACTIVOS VIRTUALES GEOLOCALIZADOS BASADO EN DENSIDAD DE USUARIOS EN TIEMPO REAL

## 1. SECTOR DE LA TÉCNICA
Economía de videojuegos MMO, Geolocalización y Big Data.

## 2. ESTADO DE LA TÉCNICA
En los juegos actuales, la probabilidad de encontrar un objeto raro (drop rate) es fija (ej. 0.1%). En eventos masivos físicos, esto provoca una inflación de objetos porque hay miles de personas "tirando los dados".

## 3. DESCRIPCIÓN DE LA INVENCIÓN
La invención propone un algoritmo de "Escasez Adaptativa Local".
1. El sistema calcula la densidad de jugadores activos en un radio geográfico (celda S2).
2. El contrato inteligente ajusta inversamente la probabilidad de generación de activos valiosos.
   - Si Densidad > Umbral Alto -> Drop Rate disminuye exponencialmente.
   - Si Densidad < Umbral Bajo -> Drop Rate aumenta (incentivo para dispersarse).
3. Esto mantiene estable la oferta monetaria del juego independientemente de la afluencia de jugadores, protegiendo la economía.

## 4. REIVINDICACIONES

1. **Método de control de inflación para economías virtuales**, caracterizado por ajustar dinámicamente la probabilidad de generación de nuevos activos digitales en una ubicación geográfica en función inversa al número de dispositivos de usuarios detectados simultáneamente en dicha ubicación, manteniendo constante la tasa de emisión global por unidad de tiempo.
