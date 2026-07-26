@echo off
echo Restarting app with full cache clear...

echo.
echo [1/3] Stopping Metro and app...
taskkill /F /IM node.exe 2>nul
adb shell am force-stop com.fermancli

echo.
echo [2/3] Clearing Metro cache...
rmdir /s /q %LOCALAPPDATA%\Temp\metro-* 2>nul
rmdir /s /q %LOCALAPPDATA%\Temp\haste-map-* 2>nul
rmdir /s /q %LOCALAPPDATA%\Temp\react-* 2>nul

echo.
echo [3/3] Starting Metro with reset cache...
start cmd /k "npx react-native start --reset-cache"

timeout /t 5

echo.
echo Now run: npx react-native run-android
pause

