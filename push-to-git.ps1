Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "  ARIA - Pushing to GitHub (rajratanpcu/ARIA)" -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host ""

$remote = git remote get-url origin 2>$null
if (-not $remote) {
    git remote add origin https://github.com/rajratanpcu/ARIA.git
    Write-Host "[OK] Added remote origin: https://github.com/rajratanpcu/ARIA.git" -ForegroundColor Green
} else {
    Write-Host "Remote origin: $remote" -ForegroundColor Yellow
}

Write-Host "`nPushing branch 'main' to origin..." -ForegroundColor Cyan
git push -u origin main

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n========================================================" -ForegroundColor Green
    Write-Host "  [SUCCESS] Code successfully pushed to GitHub!" -ForegroundColor Green
    Write-Host "  Repository: https://github.com/rajratanpcu/ARIA" -ForegroundColor Green
    Write-Host "========================================================" -ForegroundColor Green
} else {
    Write-Host "`n[NOTICE] Push failed or authentication was required." -ForegroundColor Red
    Write-Host "If Git asks for credentials, use a Personal Access Token (PAT) with repo scope."
    Write-Host "Create a token at: https://github.com/settings/tokens"
}

Write-Host "`nPress any key to close..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
