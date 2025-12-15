# MEMORIA DESCRIPTIVA - SOLICITUD DE PATENTE (BORRADOR)

**TÍTULO DE LA INVENCIÓN:**
MÉTODO PARA LA GESTIÓN Y RECLAMACIÓN DE ACTIVOS INMOBILIARIOS VIRTUALES VINCULADOS A COORDENADAS GPS MEDIANTE VALIDACIÓN DE PRESENCIA FÍSICA

## 1. SECTOR DE LA TÉCNICA
Sector del entretenimiento digital, realidad aumentada y gestión de derechos digitales sobre blockchain, específicamente en la adquisición de activos virtuales geolocalizados.

## 2. ESTADO DE LA TÉCNICA
Existen plataformas (como Atlas Earth o Upland) que permiten comprar parcelas virtuales sobre mapas reales. Sin embargo, estas adquisiciones son puramente especulativas y pasivas; el usuario puede comprar terrenos en Nueva York estando físicamente en Madrid. Esto desconecta el valor digital de la actividad económica o física real de la ubicación.

## 3. DESCRIPCIÓN DE LA INVENCIÓN
La invención propone un sistema "Active Landlord" que obliga a que la "Reclamación" (Claim) o "Mantenimiento" de una parcela virtual solo pueda realizarse estando físicamente presente en las coordenadas GPS correspondientes.

El sistema comprende:
1. Un módulo de geolocalización en el dispositivo cliente.
2. Un módulo criptográfico que genera una prueba de presencia (Proof of Presence) firmada.
3. Un contrato inteligente que rechaza cualquier transacción de compra/reclamo si no incluye dicha prueba firmada con una marca de tiempo reciente (ej. < 5 minutos).

Esto evita la especulación remota y fomenta una economía local real, donde los propietarios virtuales deben ser residentes o visitantes reales de la zona.

## 4. REIVINDICACIONES

1. **Método de asignación de propiedad virtual**, caracterizado porque la ejecución de la transferencia de propiedad en la cadena de bloques está condicionada algorítmicamente a la recepción de una prueba criptográfica de presencia física del usuario en las coordenadas geográficas asociadas al activo virtual en el momento de la solicitud.

2. **Método según la reivindicación 1**, donde el activo virtual requiere una "renovación de presencia" periódica por parte del propietario para mantener sus derechos de usufructo o recaudación de impuestos virtuales.
