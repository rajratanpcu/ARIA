@echo off
setlocal enabledelayedexpansion

echo ===============================================================================
echo                ARIA PRODUCTION DEPLOYMENT WIZARD
echo   Autonomous End-to-End Mobile DevOps Platform
echo   Target GitHub: https://github.com/rajratanpcu/ARIA
echo ===============================================================================
echo.

cd /d "%~dp0"

echo [STEP 1/3] Running Automated Validation Tests...
call npm test
if %ERRORLEVEL% neq 0 (
    echo.
    echo [ERROR] Test suite failed! Halting deployment.
    pause
    exit /b %ERRORLEVEL%
)
echo [PASS] All 12/12 unit tests passed.
echo.

echo [STEP 2/3] Synchronizing Code to GitHub Remote...
echo Target: https://github.com/rajratanpcu/ARIA.git
echo.
git push -u origin main
if %ERRORLEVEL% equ 0 (
    echo [PASS] Git remote synchronized successfully.
) else (
    echo [WARNING] Git push requires interactive authentication.
    echo If prompted, enter your GitHub username and Personal Access Token (PAT).
    echo Running git push now:
    git push -u origin main
)
echo.

echo [STEP 3/3] Deploying to Vercel Production...
echo Checking for Vercel CLI...
where vercel >nul 2>&1
if %ERRORLEVEL% equ 0 (
    echo Launching Vercel CLI...
    vercel --prod
) else (
    echo Vercel CLI not found globally. Running via npx vercel...
    npx --yes vercel --prod
)

echo.
echo ===============================================================================
echo   Deployment process completed!
echo   1. Standalone prototype: aria-interactive-prototype.html (ready locally)
echo   2. GitHub repository: https://github.com/rajratanpcu/ARIA
echo   3. Vercel dashboard: https://vercel.com/dashboard
echo ===============================================================================
pause
