# MEMORIA DESCRIPTIVA - SOLICITUD DE PATENTE (BORRADOR)

**TÍTULO DE LA INVENCIÓN:**
MÉTODO DE AUTENTICACIÓN Y FIRMA DE TRANSACCIONES DIGITALES BASADO EN PATRONES BIOCINÉTICOS DEL USUARIO (BIO-KINETIC AUTH)

## 1. SECTOR DE LA TÉCNICA
Ciberseguridad, carteras digitales (wallets) y biometría comportamental.

## 2. ESTADO DE LA TÉCNICA
La seguridad en wallets actuales depende de contraseñas o biometría estática (huella, cara). Si un atacante roba el dispositivo y el PIN, puede vaciar la cuenta. No existen sistemas que validen la identidad de forma continua y pasiva durante el uso.

## 3. DESCRIPCIÓN DE LA INVENCIÓN
La invención propone utilizar el ritmo biocinético (patrón de marcha, micro-temblores de la mano, ritmo cardíaco vía smartwatch) como una "llave privada dinámica".
El sistema monitoriza pasivamente estos valores. Cuando el usuario intenta firmar una transacción:
1. El sistema compara la biometría actual con el perfil histórico local.
2. Si coincide (>95% confianza), genera una firma parcial que desbloquea la clave privada real (mediante criptografía de umbral o MPC).
3. Si el dispositivo lo usa otra persona, el patrón cinético no coincide y la transacción falla, aunque tengan el PIN.

## 4. REIVINDICACIONES

1. **Método de seguridad para carteras digitales**, caracterizado por utilizar un flujo continuo de datos biocinéticos del usuario para derivar dinámicamente un token de autorización temporal necesario para firmar transacciones criptográficas.

2. **Dispositivo según la reivindicación 1**, configurado para denegar la firma de transacciones si el patrón de ritmo cardíaco o cadencia de paso detectado difiere del modelo base del usuario propietario en un porcentaje predeterminado.
