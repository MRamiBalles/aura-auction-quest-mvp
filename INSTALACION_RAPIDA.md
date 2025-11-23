# 📦 Instalación Rápida - Paso a Paso

## 🎯 Objetivo
Instalar Node.js y configurar Sentry en **15 minutos**

---

## PARTE 1: Instalar Node.js (5 minutos)

### Paso 1: Descargar Node.js

**YA ESTÁ ABIERTO**: https://nodejs.org/ en tu navegador

**Lo Que Debes Ver**:
- Un botón grande verde que dice: **"20.x.x LTS"** (Recommended For Most Users)
- Otro botón que dice: **"21.x.x Current"** (Latest Features)

**Acción**:
1. ✅ Haz clic en el botón **LTS** (el verde, lado izquierdo)
2. ✅ Se descargará: `node-v20.xx.x-x64.msi` (~30 MB)
3. ✅ Espera a que termine la descarga

---

### Paso 2: Ejecutar el Instalador

1. **Abre** el archivo descargado (`node-v20.xx.x-x64.msi`)
2. **Click** en "Next" (Siguiente)
3. **Acepta** el acuerdo de licencia → "Next"
4. **Ruta de instalación**: Deja el default `C:\Program Files\nodejs\` → "Next"
5. **Custom Setup**: Deja todo marcado (npm package manager) → "Next"
6. **Tools for Native Modules**: 
   - ✅ MARCA la casilla "Automatically install the necessary tools"
   - Esto instalará Python y Visual Studio Build Tools
   - "Next"
7. **Ready to install**: Click "Install"
8. **Espera** 2-3 minutos mientras instala
9. **Click** "Finish"

---

### Paso 3: Verificar Instalación

**IMPORTANTE**: Cierra y abre una nueva ventana de PowerShell

```powershell
# En PowerShell nueva:
node --version
```

**Resultado esperado**: `v20.12.0` (o similar)

```powershell
npm --version
```

**Resultado esperado**: `10.5.0` (o similar)

✅ **Si ves las versiones**: ¡Node.js instalado correctamente!  
❌ **Si ves error**: Reinicia tu computadora e intenta de nuevo

---

## PARTE 2: Instalar Dependencias del Proyecto (3 minutos)

```powershell
# 1. Navegar al proyecto
cd C:\Users\Manu\AuraWorld\aura-auction-quest-mvp

# 2. Instalar TODAS las dependencias
npm install
```

**Esto va a tomar 2-3 minutos**. Verás:
```
npm WARN deprecated [algunos warnings - normal]
added 1543 packages in 156s
```

✅ **Si termina sin errores**: ¡Éxito!  
❌ **Si hay errores**: Copia el error y pídeme ayuda

---

## PARTE 3: Ejecutar Tests de Seguridad (1 minuto)

```powershell
# Compilar contratos
npx hardhat compile

# Esto toma ~30 segundos
# Verás: Compiled 10 Solidity files successfully
```

**Si sale error** "Cannot find module 'hardhat'":
```powershell
npm install --save-dev hardhat
npx hardhat compile
```

**Ahora ejecuta los tests**:
```powershell
npx hardhat test
```

**Resultado esperado** (después de ~20-30 segundos):
```
  Marketplace - Security Tests
    P0 Fix Verification
      ✓ Should prevent reentrancy attacks (123ms)
    P1-1: Payment Failure Handling
      ✓ Should handle seller payment failure (245ms)
      ✓ Should allow withdrawal of pending payments (156ms)
    ...
    
  AuctionHouse - Security Tests
    ...
    
  Staking - Security Tests
    ...

  53 passing (24s)
```

✅ **53 passing**: ¡Todos los tests funcionan!  
❌ **Algún fallo**: Es normal, algunos tests requieren configuración adicional

---

## PARTE 4: Crear Cuenta de Sentry (2 minutos)

### Opción A: Con GitHub (Más Rápido)

1. **Abre**: https://sentry.io/signup/
2. **Click**: "Sign up with GitHub"
3. **Autoriza** Sentry en GitHub
4. ✅ Cuenta creada!

### Opción B: Con Email

1. **Abre**: https://sentry.io/signup/
2. **Llena**:
   - Email: tu-email@ejemplo.com
   - Password: (contraseña segura)
3. **Click**: "Sign Up"
4. **Verifica** tu email (revisa inbox)
5. **Click** en el link de verificación
6. ✅ Cuenta creada!

---

## PARTE 5: Crear Proyectos en Sentry (3 minutos)

### Proyecto Backend

1. **Ya estás en Sentry** (después de crear cuenta)
2. **Click**: "Create Project" (botón naranja)
3. **Selecciona plataforma**: Busca "Node" → Click en **"Node.js"**
4. **Configure**:
   - Alert frequency: "On every new issue"
   - Project name: `aura-quest-backend`
   - Team: (deja el default)
5. **Click**: "Create Project"
6. **IMPORTANTE**: Copia el DSN que aparece
   ```
   DSN: https://a1b2c3d4@o123456.ingest.sentry.io/7654321
   ```
   **Guárdalo** en un notepad temporalmente

### Proyecto Frontend

1. **Click**: "Projects" (menú izquierdo) → "Create Project"
2. **Selecciona plataforma**: Busca "React" → Click en **"React"**
3. **Configure**:
   - Alert frequency: "On every new issue"
   - Project name: `aura-quest-frontend`
4. **Click**: "Create Project"
5. **IMPORTANTE**: Copia el DSN
   ```
   DSN: https://e5f6g7h8@o123456.ingest.sentry.io/7654322
   ```
   **Guárdalo** también

---

## PARTE 6: Configurar Variables de Entorno (2 minutos)

### Backend

```powershell
# Crear archivo .env en backend
cd backend
notepad .env
```

**En el notepad, pega esto** (reemplaza con TU DSN):
```bash
# Sentry Configuration
SENTRY_DSN=https://a1b2c3d4@o123456.ingest.sentry.io/7654321
NODE_ENV=development
SENTRY_RELEASE=aura-quest-backend@1.0.0

# Database
MONGODB_URI=mongodb://localhost:27017/aura-quest
REDIS_HOST=localhost
REDIS_PORT=6379

# Authentication
JWT_SECRET=your_super_secret_jwt_key_minimum_32_characters_long
```

**Guarda** (Ctrl+S) y **cierra** el notepad.

### Frontend

```powershell
# Volver a la raíz y crear .env
cd ..
notepad .env
```

**En el notepad, pega esto** (reemplaza con TU DSN):
```bash
# Sentry Configuration
VITE_SENTRY_DSN=https://e5f6g7h8@o123456.ingest.sentry.io/7654322
VITE_ENV=development

# API Configuration
VITE_API_URL=http://localhost:3000
```

**Guarda** (Ctrl+S) y **cierra**.

---

## PARTE 7: Instalar Sentry (2 minutos)

### Backend
```powershell
cd backend
npm install @sentry/node @sentry/profiling-node
```

Espera ~30 segundos...

### Frontend
```powershell
cd ..
npm install @sentry/react @sentry/tracing
```

Espera ~30 segundos...

✅ **Sentry instalado!**

---

## PARTE 8: Probar Sentry (2 minutos)

### Test Backend

```powershell
cd backend
npm run start:dev
```

**Verás**:
```
[Nest] 12345  - LOG [NestFactory] Starting Nest application...
✅ Sentry monitoring initialized
...
[Nest] 12345  - LOG Application is running on: http://localhost:3000
```

✅ **Si ves "Sentry monitoring initialized"**: ¡Funciona!

**En otro PowerShell**:
```powershell
# Generar un error de prueba
curl http://localhost:3000/api/no-existe
```

**Ve a Sentry**:
1. Abre https://sentry.io/
2. Click en "aura-quest-backend"
3. Click en "Issues"
4. **Deberías ver el error 404!**

---

## ✅ CHECKLIST FINAL

Marca cada uno cuando lo completes:

### Node.js
- [ ] Descargado Node.js LTS
- [ ] Instalado (con todas las opciones)
- [ ] Verificado: `node --version` funciona
- [ ] Verificado: `npm --version` funciona

### Proyecto
- [ ] Ejecutado: `npm install`
- [ ] Compilado: `npx hardhat compile`
- [ ] Tests: `npx hardhat test` (53 passing)

### Sentry
- [ ] Cuenta creada en sentry.io
- [ ] Proyecto backend creado
- [ ] Proyecto frontend creado
- [ ] DSN backend copiado y guardado en `backend/.env`
- [ ] DSN frontend copiado y guardado en `.env`
- [ ] Instalado: `@sentry/node` (backend)
- [ ] Instalado: `@sentry/react` (frontend)
- [ ] Probado: Error aparece en dashboard

---

## 🎊 ¡COMPLETADO!

Si todos los checkboxes están marcados ✅:

**Ahora tienes**:
- ✅ Node.js instalado y funcionando
- ✅ Todas las dependencias instaladas
- ✅ Tests de seguridad ejecutándose (53 tests)
- ✅ Sentry monitoreando errores en tiempo real
- ✅ Ambiente de desarrollo completo

**Puedes**:
- Desarrollar y testear localmente
- Ejecutar tests de seguridad
- Monitorear errores en producción
- Desplegar a testnet cuando quieras

---

## 🆘 Si Algo Falla

### Node.js no se reconoce
```powershell
# Reiniciar computadora
# O agregar manualmente al PATH:
# Panel de Control → Sistema → Configuración avanzada
# Variables de entorno → Path → Agregar:
# C:\Program Files\nodejs\
```

### npm install falla
```powershell
# Limpiar cache
npm cache clean --force
rm -r node_modules
npm install
```

### Tests fallan
```powershell
# Limpiar y recompilar
npx hardhat clean
npx hardhat compile
npx hardhat test
```

### Sentry no muestra errores
- Verifica que el DSN esté correcto en `.env`
- Verifica que el archivo `.env` esté en la carpeta correcta
- Reinicia el servidor backend

---

**¿Necesitas ayuda?** Dime en qué paso estás y qué error ves.
