@echo off
title AuraAuction Quest - Dependency Installer
color 0A

echo ===================================================
echo   AuraAuction Quest - Dependency Installer
echo ===================================================
echo.

REM Check if npm is installed
where npm >nul 2>nul
if %errorlevel% neq 0 (
    color 0C
    echo [ERROR] npm is not installed or not in your PATH.
    echo Please install Node.js from https://nodejs.org/
    echo.
    pause
    exit /b
)

echo [1/2] Installing Critical Dependencies (ethers, sentry)...
call npm install ethers@^6.13.0 @sentry/react @sentry/tracing

if %errorlevel% neq 0 (
    color 0C
    echo [ERROR] Failed to install critical dependencies.
    pause
    exit /b
)

echo.
echo [2/2] Installing Testing Dependencies...
call npm install -D vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event

if %errorlevel% neq 0 (
    echo [WARNING] Failed to install testing dependencies. You can try again later.
)

echo.
echo ===================================================
echo   SUCCESS! All dependencies installed.
echo   You can now run the application.
echo ===================================================
echo.
pause
