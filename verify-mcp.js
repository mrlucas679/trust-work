#!/usr/bin/env node

/**
 * MCP Server Installation Verification Script
 * 
 * This script checks if all MCP servers are properly configured and can execute.
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔍 MCP Server Installation Verification\n');
console.log('='.repeat(60));

// Test results
const results = {
    passed: 0,
    failed: 0,
    warnings: 0
};

function test(name, fn) {
    try {
        process.stdout.write(`\n${name}... `);
        const result = fn();
        if (result === 'warning') {
            console.log('⚠️  WARNING');
            results.warnings++;
        } else {
            console.log('✅ PASSED');
            results.passed++;
        }
        return true;
    } catch (error) {
        console.log('❌ FAILED');
        console.log(`   Error: ${error.message}`);
        results.failed++;
        return false;
    }
}

// 1. Check VS Code settings
test('VS Code MCP configuration', () => {
    const settingsPath = path.join(__dirname, '.vscode', 'settings.json');
    if (!fs.existsSync(settingsPath)) {
        throw new Error('.vscode/settings.json not found');
    }
    const settings = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
    if (!settings['github.copilot.chat.mcp.enabled']) {
        throw new Error('MCP not enabled in VS Code settings');
    }
    if (!settings['github.copilot.chat.mcp.configFile']) {
        throw new Error('MCP config file not specified');
    }
});

// 2. Check .mcp.json exists and is valid
test('.mcp.json configuration file', () => {
    const mcpPath = path.join(__dirname, '.mcp.json');
    if (!fs.existsSync(mcpPath)) {
        throw new Error('.mcp.json not found');
    }
    const config = JSON.parse(fs.readFileSync(mcpPath, 'utf8'));
    if (!config.mcpServers) {
        throw new Error('mcpServers not defined in .mcp.json');
    }
    const serverCount = Object.keys(config.mcpServers).length;
    console.log(`\n   Found ${serverCount} MCP servers configured`);
});

// 3. Check Node.js version
test('Node.js installation', () => {
    const version = execSync('node --version', { encoding: 'utf8' }).trim();
    console.log(`\n   Version: ${version}`);
    const major = parseInt(version.slice(1).split('.')[0]);
    if (major < 18) {
        throw new Error(`Node.js ${version} found, but v18+ required`);
    }
});

// 4. Check Git installation
test('Git installation', () => {
    const version = execSync('git --version', { encoding: 'utf8' }).trim();
    console.log(`\n   Version: ${version}`);
});

// 5. Check Playwright installation
test('Playwright (@playwright/test)', () => {
    try {
        const version = execSync('npx -y @playwright/test --version', {
            encoding: 'utf8',
            timeout: 10000
        }).trim();
        console.log(`\n   Version: ${version}`);
    } catch (error) {
        throw new Error('Playwright not accessible via npx');
    }
});

// 6. Check @supabase/supabase-js
test('Supabase client library', () => {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    const version = packageJson.dependencies['@supabase/supabase-js'];
    if (!version) {
        throw new Error('@supabase/supabase-js not found in dependencies');
    }
    console.log(`\n   Version: ${version}`);
});

// 7. Check environment variables
test('Environment variables (.env)', () => {
    const envPath = path.join(__dirname, '.env');
    if (!fs.existsSync(envPath)) {
        throw new Error('.env file not found');
    }
    const envContent = fs.readFileSync(envPath, 'utf8');
    const hasUrl = envContent.includes('VITE_SUPABASE_URL=');
    const hasKey = envContent.includes('VITE_SUPABASE_ANON_KEY=');

    if (!hasUrl || !hasKey) {
        throw new Error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY');
    }

    // Check if they have values
    const urlMatch = envContent.match(/VITE_SUPABASE_URL=(.+)/);
    const keyMatch = envContent.match(/VITE_SUPABASE_ANON_KEY=(.+)/);

    if (!urlMatch || !urlMatch[1] || urlMatch[1].trim() === '') {
        return 'warning'; // Warning instead of failure
    }
    if (!keyMatch || !keyMatch[1] || keyMatch[1].trim() === '') {
        return 'warning';
    }
});

// 8. Check MCP server files exist
test('MCP server files', () => {
    const serversDir = path.join(__dirname, 'mcp-servers');
    if (!fs.existsSync(serversDir)) {
        throw new Error('mcp-servers directory not found');
    }

    const files = [
        'supabase-server.js',
        'filesystem-server.js',
        'README.md'
    ];

    for (const file of files) {
        const filePath = path.join(serversDir, file);
        if (!fs.existsSync(filePath)) {
            throw new Error(`${file} not found in mcp-servers/`);
        }
    }
    console.log(`\n   Found ${files.length} server files`);
});

// 9. Test filesystem server execution
test('Filesystem server execution', () => {
    const serverPath = path.join(__dirname, 'mcp-servers', 'filesystem-server.js');
    const output = execSync(`node "${serverPath}" "${__dirname}"`, {
        encoding: 'utf8',
        timeout: 5000
    });
    if (!output.includes('Filesystem MCP Server')) {
        throw new Error('Unexpected output from filesystem server');
    }
});

// Summary
console.log('\n' + '='.repeat(60));
console.log('\n📊 Test Summary:');
console.log(`   ✅ Passed:   ${results.passed}`);
console.log(`   ❌ Failed:   ${results.failed}`);
console.log(`   ⚠️  Warnings: ${results.warnings}`);

if (results.failed === 0) {
    console.log('\n🎉 All critical tests passed!');
    if (results.warnings > 0) {
        console.log('⚠️  Some warnings were found - check .env configuration');
    }
    console.log('\n📝 Next steps:');
    console.log('   1. Reload VS Code window (Ctrl+Shift+P → "Developer: Reload Window")');
    console.log('   2. Test MCP by asking Copilot to run Playwright tests');
    console.log('   3. Configure Supabase credentials in .env if needed');
    process.exit(0);
} else {
    console.log('\n❌ Some tests failed. Please fix the issues above.');
    process.exit(1);
}
