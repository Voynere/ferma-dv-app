#!/bin/bash
echo "🧹 Full project cleanup..."

echo ""
echo "[1/5] Stopping Metro and processes..."
pkill -f "react-native" || true
pkill -f "metro" || true

echo ""
echo "[2/5] Cleaning Metro cache..."
rm -rf $TMPDIR/metro-* 2>/dev/null || true
rm -rf $TMPDIR/haste-map-* 2>/dev/null || true
rm -rf $TMPDIR/react-* 2>/dev/null || true

echo ""
echo "[3/5] Cleaning Gradle..."
cd android
./gradlew clean
cd ..

echo ""
echo "[4/5] Cleaning watchman..."
watchman watch-del-all 2>/dev/null || echo "Watchman not installed, skipping..."

echo ""
echo "[5/5] Done! Now run:"
echo "  npx react-native start --reset-cache"
echo "  (in new terminal) npx react-native run-android"

