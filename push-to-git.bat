@echo off
setlocal
echo ========================================================
echo   ARIA - Synchronizing Latest Commits to GitHub
echo   Target: https://github.com/rajratanpcu/ARIA
echo ========================================================
echo.

cd /d "%~dp0"

echo Current Status & Recent Commits:
git log --oneline -n 8
echo.

git remote get-url origin >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo Setting remote origin to https://github.com/rajratanpcu/ARIA.git...
    git remote add origin https://github.com/rajratanpcu/ARIA.git
)

echo Remote set to: https://github.com/rajratanpcu/ARIA.git
echo.
echo Pushing latest commits to origin/main...
echo.

git push -u origin main

if %ERRORLEVEL% equ 0 (
    echo.
    echo ========================================================
    echo   [SUCCESS] All 8 commits synchronized to GitHub!
    echo   Repository: https://github.com/rajratanpcu/ARIA
    echo ========================================================
) else (
    echo.
    echo ========================================================
    echo   [ACTION REQUIRED] GitHub Authentication Needed
    echo ========================================================
    echo   1. If prompted for username, enter: rajratanpcu
    echo   2. If prompted for password, enter your Personal Access Token (PAT)
    echo      (Generate one with 'repo' scope at: https://github.com/settings/tokens)
    echo.
    echo   Alternatively, if you use GitHub CLI:
    echo      gh auth login
    echo      git push -u origin main
)

pause
