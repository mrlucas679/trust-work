# Simple MCP Server Test
Write-Host "Testing MCP Servers..." -ForegroundColor Cyan
Write-Host ""

# Test Playwright
Write-Host "[1/5] Playwright MCP..." -ForegroundColor Yellow
$null = npx -y @playwright/mcp@latest --version 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "  OK - Playwright MCP is working" -ForegroundColor Green
} else {
    Write-Host "  FAIL - Playwright MCP failed" -ForegroundColor Red
}
Write-Host ""

# Test Chrome DevTools
Write-Host "[2/5] Chrome DevTools MCP..." -ForegroundColor Yellow
$null = npx -y chrome-devtools-mcp@0.10.2 --version 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "  OK - Chrome DevTools MCP is working" -ForegroundColor Green
} else {
    Write-Host "  FAIL - Chrome DevTools MCP failed" -ForegroundColor Red
}
Write-Host ""

# Test MarkItDown
Write-Host "[3/5] MarkItDown MCP..." -ForegroundColor Yellow
$null = uvx markitdown-mcp==0.0.1a4 --version 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "  OK - MarkItDown MCP is working" -ForegroundColor Green
} else {
    Write-Host "  FAIL - MarkItDown MCP failed" -ForegroundColor Red
}
Write-Host ""

# Test DevBox
Write-Host "[4/5] DevBox MCP..." -ForegroundColor Yellow
$null = npx -y @microsoft/devbox-mcp@latest --version 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "  OK - DevBox MCP is working" -ForegroundColor Green
} else {
    Write-Host "  FAIL - DevBox MCP failed" -ForegroundColor Red
}
Write-Host ""

# Test Chroma
Write-Host "[5/5] Chroma MCP..." -ForegroundColor Yellow
Write-Host "  SKIP - Requires environment setup" -ForegroundColor Yellow
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Next Steps:" -ForegroundColor Cyan
Write-Host "1. Press Ctrl+Shift+P in VS Code" -ForegroundColor White
Write-Host "2. Type: GitHub Copilot: Manage MCP Servers" -ForegroundColor White
Write-Host "3. Enable the servers that are working" -ForegroundColor White
Write-Host "4. Click Reload" -ForegroundColor White
Write-Host ""
Write-Host "For help: See MCP_QUICKSTART.md" -ForegroundColor Cyan
