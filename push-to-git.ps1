Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "  ARIA - Synchronizing Latest Commits to GitHub" -ForegroundColor Cyan
Write-Host "  Target: https://github.com/rajratanpcu/ARIA" -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host ""

Set-Location -Path $PSScriptRoot

Write-Host "Current Status & Recent Commits to Sync:" -ForegroundColor Yellow
git log --oneline -n 8

$remote = git remote get-url origin 2>$null
if (-not $remote) {
    git remote add origin https://github.com/rajratanpcu/ARIA.git
    Write-Host "`n[OK] Configured remote origin: https://github.com/rajratanpcu/ARIA.git" -ForegroundColor Green
} else {
    Write-Host "`nRemote origin: $remote" -ForegroundColor Green
}

Write-Host "`nPushing branch 'main' to origin..." -ForegroundColor Cyan
git push -u origin main

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n========================================================" -ForegroundColor Green
    Write-Host "  [SUCCESS] All latest commits synchronized to GitHub!" -ForegroundColor Green
    Write-Host "  Repository: https://github.com/rajratanpcu/ARIA" -ForegroundColor Green
    Write-Host "========================================================" -ForegroundColor Green
} else {
    Write-Host "`n========================================================" -ForegroundColor Yellow
    Write-Host "  [NOTICE] Push requires authentication or Personal Access Token" -ForegroundColor Yellow
    Write-Host "========================================================" -ForegroundColor Yellow
    Write-Host "  1. Enter your GitHub username: rajratanpcu"
    Write-Host "  2. Enter your Personal Access Token (PAT) with 'repo' permissions."
    Write-Host "     Generate a token at: https://github.com/settings/tokens"
    Write-Host "  Or authenticate via GitHub CLI: gh auth login"
}

Write-Host "`nPress any key to close..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
