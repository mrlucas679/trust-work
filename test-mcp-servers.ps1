# MCP Server Testing Script
# Tests each MCP server to verify it can start

Write-Host "🔍 Testing MCP Servers..." -ForegroundColor Cyan
Write-Host ""

$results = @()

# Test 1: Playwright MCP
Write-Host "Testing Playwright MCP..." -ForegroundColor Yellow
try {
    $output = npx -y @playwright/mcp@latest --version 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Playwright MCP: WORKING" -ForegroundColor Green
        $results += "✅ Playwright MCP"
    } else {
        Write-Host "❌ Playwright MCP: FAILED" -ForegroundColor Red
        $results += "❌ Playwright MCP"
    }
} catch {
    Write-Host "❌ Playwright MCP: ERROR - $_" -ForegroundColor Red
    $results += "❌ Playwright MCP"
}
Write-Host ""

# Test 2: Chrome DevTools MCP
Write-Host "Testing Chrome DevTools MCP..." -ForegroundColor Yellow
try {
    $output = npx -y chrome-devtools-mcp@0.10.2 --version 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Chrome DevTools MCP: WORKING" -ForegroundColor Green
        $results += "✅ Chrome DevTools MCP"
    } else {
        Write-Host "❌ Chrome DevTools MCP: FAILED" -ForegroundColor Red
        $results += "❌ Chrome DevTools MCP"
    }
} catch {
    Write-Host "❌ Chrome DevTools MCP: ERROR - $_" -ForegroundColor Red
    $results += "❌ Chrome DevTools MCP"
}
Write-Host ""

# Test 3: MarkItDown MCP
Write-Host "Testing MarkItDown MCP..." -ForegroundColor Yellow
try {
    $output = uvx markitdown-mcp==0.0.1a4 --version 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ MarkItDown MCP: WORKING" -ForegroundColor Green
        $results += "✅ MarkItDown MCP"
    } else {
        Write-Host "❌ MarkItDown MCP: FAILED" -ForegroundColor Red
        $results += "❌ MarkItDown MCP"
    }
} catch {
    Write-Host "❌ MarkItDown MCP: ERROR - $_" -ForegroundColor Red
    $results += "❌ MarkItDown MCP"
}
Write-Host ""

# Test 4: DevBox MCP
Write-Host "Testing DevBox MCP..." -ForegroundColor Yellow
try {
    $output = npx -y @microsoft/devbox-mcp@latest --version 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ DevBox MCP: WORKING" -ForegroundColor Green
        $results += "✅ DevBox MCP"
    } else {
        Write-Host "❌ DevBox MCP: FAILED" -ForegroundColor Red
        $results += "❌ DevBox MCP"
    }
} catch {
    Write-Host "❌ DevBox MCP: ERROR - $_" -ForegroundColor Red
    $results += "❌ DevBox MCP"
}
Write-Host ""

# Test 5: Postman MCP - will fail without API key, that is expected
Write-Host "Testing Postman MCP - needs API key to work..." -ForegroundColor Yellow
try {
    $output = npx -y @postman/postman-mcp-server@2.4.9 --version 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Warning: Postman MCP - Installed but needs API key to work" -ForegroundColor Yellow
        $results += "Warning: Postman MCP - needs API key"
    } else {
        Write-Host "Warning: Postman MCP - Installed but needs API key to work" -ForegroundColor Yellow
        $results += "Warning: Postman MCP - needs API key"
    }
} catch {
    Write-Host "Warning: Postman MCP - Needs API key" -ForegroundColor Yellow
    $results += "Warning: Postman MCP - needs API key"
}
Write-Host ""

# Summary
Write-Host "=" -NoNewline -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "Summary:" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
foreach ($result in $results) {
    Write-Host $result
}
Write-Host ""

Write-Host "📖 For detailed troubleshooting, see:" -ForegroundColor Cyan
Write-Host "   MCP_TROUBLESHOOTING.md" -ForegroundColor White
Write-Host ""

Write-Host "🚀 To enable servers in VS Code:" -ForegroundColor Cyan
Write-Host "   1. Press Ctrl+Shift+P" -ForegroundColor White
Write-Host "   2. Type: 'GitHub Copilot: Manage MCP Servers'" -ForegroundColor White
Write-Host "   3. Enable the working servers" -ForegroundColor White
Write-Host "   4. Click 'Reload'" -ForegroundColor White
Write-Host ""
