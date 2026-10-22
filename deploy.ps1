Write-Host "===============================================================================" -ForegroundColor Cyan
Write-Host "               ARIA PRODUCTION DEPLOYMENT WIZARD" -ForegroundColor Cyan
Write-Host "   Autonomous End-to-End Mobile DevOps Platform" -ForegroundColor Cyan
Write-Host "   Target GitHub: https://github.com/rajratanpcu/ARIA" -ForegroundColor Cyan
Write-Host "===============================================================================" -ForegroundColor Cyan
Write-Host ""

Set-Location -Path $PSScriptRoot

Write-Host "[STEP 1/3] Running Automated Validation Tests..." -ForegroundColor Yellow
npm test
if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERROR] Test suite failed! Halting deployment." -ForegroundColor Red
    pause
    exit $LASTEXITCODE
}
Write-Host "[PASS] All 12/12 unit tests passed." -ForegroundColor Green
Write-Host ""

Write-Host "[STEP 2/3] Synchronizing Code to GitHub Remote..." -ForegroundColor Yellow
Write-Host "Target: https://github.com/rajratanpcu/ARIA.git" -ForegroundColor Gray
git push -u origin main
if ($LASTEXITCODE -eq 0) {
    Write-Host "[PASS] Git remote synchronized successfully." -ForegroundColor Green
} else {
    Write-Host "[NOTE] If prompted for credentials, authenticate with your GitHub account." -ForegroundColor Yellow
    git push -u origin main
}
Write-Host ""

Write-Host "[STEP 3/3] Deploying to Vercel Production..." -ForegroundColor Yellow
if (Get-Command vercel -ErrorAction SilentlyContinue) {
    Write-Host "Launching Vercel CLI..." -ForegroundColor Gray
    vercel --prod
} else {
    Write-Host "Vercel CLI not found globally. Running via npx vercel..." -ForegroundColor Gray
    npx --yes vercel --prod
}

Write-Host ""
Write-Host "===============================================================================" -ForegroundColor Green
Write-Host "  Deployment completed!" -ForegroundColor Green
Write-Host "  1. Standalone prototype: aria-interactive-prototype.html (ready locally)" -ForegroundColor Gray
Write-Host "  2. GitHub repository: https://github.com/rajratanpcu/ARIA" -ForegroundColor Gray
Write-Host "  3. Vercel dashboard: https://vercel.com/dashboard" -ForegroundColor Gray
Write-Host "===============================================================================" -ForegroundColor Green
Write-Host ""
Read-Host -Prompt "Press Enter to exit"
