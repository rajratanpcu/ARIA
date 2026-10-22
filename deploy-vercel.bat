@echo off
setlocal
echo ========================================================
echo   ARIA - Vercel Production Deployment Helper
echo ========================================================
echo.
echo Checking for Vercel CLI...

where vercel >nul 2>&1
if %ERRORLEVEL% equ 0 (
    echo Vercel CLI found. Initiating production deployment...
    echo.
    vercel --prod
) else (
    echo Vercel CLI not installed globally. Using npx vercel...
    echo.
    npx --yes vercel --prod
)

if %ERRORLEVEL% equ 0 (
    echo.
    echo ========================================================
    echo   [SUCCESS] Deployment successfully initiated!
    echo ========================================================
) else (
    echo.
    echo Deployment encountered an error or was cancelled.
    echo Please see DEPLOY_VERCEL.md for alternative deployment methods.
)

pause
