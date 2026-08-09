@echo off
echo === Build + Deploy ===
echo.

echo [1/4] Cleaning...
if exist .next rmdir /s /q .next
if exist out rmdir /s /q out

echo [2/4] Building...
call npm run build
if %errorlevel% neq 0 (
    echo Build FAILED
    pause
    exit /b 1
)

echo [3/4] Committing...
git add out app/ public/
git commit -m "Build update %date% %time%"

echo [4/4] Pushing...
git push origin main

echo.
echo === Done ===
pause
