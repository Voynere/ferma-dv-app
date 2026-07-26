@echo off
echo Cleaning all caches...

echo.
echo [1/6] Removing node_modules...
if exist node_modules rmdir /s /q node_modules

echo.
echo [2/6] Removing package-lock.json...
if exist package-lock.json del /f /q package-lock.json

echo.
echo [3/6] Cleaning Metro cache...
if exist %LOCALAPPDATA%\Temp\metro-* rmdir /s /q %LOCALAPPDATA%\Temp\metro-*
if exist %LOCALAPPDATA%\Temp\haste-map-* rmdir /s /q %LOCALAPPDATA%\Temp\haste-map-*

echo.
echo [4/6] Cleaning Android build...
cd android
call gradlew clean
cd ..

echo.
echo [5/6] Removing Android build folders...
if exist android\app\build rmdir /s /q android\app\build
if exist android\build rmdir /s /q android\build

echo.
echo [6/6] Installing dependencies...
call npm install --legacy-peer-deps

echo.
echo ========================================
echo All caches cleared! Now run:
echo npx react-native run-android
echo ========================================
pause

