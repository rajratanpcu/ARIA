@echo off
setlocal
echo ========================================================
echo   ARIA - Pushing to GitHub (rajratanpcu/ARIA)
echo ========================================================
echo.

git remote get-url origin >nul 2>&1
if %ERRORLEVEL% neq 0 (
    git remote add origin https://github.com/rajratanpcu/ARIA.git
)

echo Remote set to: https://github.com/rajratanpcu/ARIA.git
echo.
echo Pushing branch 'main' to origin...
echo.

git push -u origin main

if %ERRORLEVEL% equ 0 (
    echo.
    echo ========================================================
    echo   [SUCCESS] Code successfully pushed to GitHub!
    echo   Repo: https://github.com/rajratanpcu/ARIA
    echo ========================================================
) else (
    echo.
    echo If GitHub prompts for credentials:
    echo 1. Username: rajratanpcu
    echo 2. Password: use your GitHub Personal Access Token (PAT)
    echo    (Create one at: https://github.com/settings/tokens)
)

pause
