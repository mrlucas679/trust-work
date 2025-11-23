# MCP Servers for TrustWork

This directory contains Model Context Protocol (MCP) server implementations for the TrustWork project.

## Overview

MCP servers enable GitHub Copilot to interact with external tools and services. This project has been configured with MCP support for enhanced development capabilities.

## Configuration

MCP servers are configured in two places:

1. **Project Configuration**: `.mcp.json` in the project root
2. **VS Code Settings**: `.vscode/settings.json` enables MCP and points to the config file

## Available Servers

### 1. Playwright (Active)

- **Status**: ✅ Active
- **Purpose**: E2E testing automation using the installed Playwright package
- **Command**: `npx @playwright/test`
- **Usage**: Run Playwright tests directly through Copilot Chat

### 2. Filesystem (Disabled - Custom Implementation Needed)

- **Status**: ⚠️ Disabled (requires custom implementation)
- **Purpose**: Enhanced filesystem operations
- **Implementation**: Create `mcp-servers/filesystem-server.js` to enable
- **Note**: Basic file operations already work through VS Code

### 3. Supabase (Disabled - Custom Implementation Needed)

- **Status**: ⚠️ Disabled (requires custom implementation)
- **Purpose**: Direct Supabase database and auth operations
- **Implementation**: Create `mcp-servers/supabase-server.js` to enable
- **Environment Variables**: Uses `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`

### 4. Git (Disabled - Use Native Commands)

- **Status**: ℹ️ Disabled (native git preferred)
- **Purpose**: Git version control operations
- **Note**: Use terminal git commands directly instead

## Enabling MCP Servers

To enable MCP integration:

1. **Reload VS Code Window**: Press `Ctrl+Shift+P` and select "Developer: Reload Window"
2. **Verify Configuration**: Check that `.vscode/settings.json` has MCP enabled
3. **Test Connection**: Ask Copilot to run a Playwright test

## Creating Custom MCP Servers

To create custom MCP servers for Supabase or filesystem operations:

### Example: Supabase MCP Server

```javascript
// mcp-servers/supabase-server.js
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

// Implement MCP protocol handlers
// See: https://modelcontextprotocol.io/docs
```

### Example: Filesystem MCP Server

```javascript
// mcp-servers/filesystem-server.js
import fs from 'fs/promises';
import path from 'path';

const rootPath = process.argv[2];

// Implement MCP protocol handlers for file operations
// See: https://modelcontextprotocol.io/docs
```

## Security Considerations

- ⚠️ **Never commit sensitive credentials** to the repository
- ✅ Use environment variables for API keys and tokens
- ✅ The `.mcp.json` file references env vars, not hardcoded secrets
- ✅ Supabase credentials are already in `.env` (gitignored)

## Troubleshooting

### MCP Not Working

1. Check VS Code settings: `"github.copilot.chat.mcp.enabled": true`
2. Verify `.mcp.json` syntax is valid
3. Reload VS Code window
4. Check Output panel → "GitHub Copilot Chat" for errors

### Server Not Found

- Ensure the command path is correct in `.mcp.json`
- For npx commands, ensure the package is installed
- For custom servers, ensure the script file exists

### Environment Variables Not Loading

- Check `.env` file exists with correct values
- Restart VS Code after modifying `.env`
- Verify env var names match in `.mcp.json`

## Resources

- [MCP Specification](https://modelcontextprotocol.io/docs)
- [Playwright Documentation](https://playwright.dev)
- [Supabase Documentation](https://supabase.com/docs)
- [GitHub Copilot MCP Guide](https://docs.github.com/copilot)

## Next Steps

1. ✅ Playwright integration is ready to use
2. ⚠️ Implement custom Supabase MCP server if needed for advanced operations
3. ⚠️ Implement custom filesystem MCP server if enhanced file ops are needed
4. ℹ️ Continue using terminal for git operations (works well natively)
