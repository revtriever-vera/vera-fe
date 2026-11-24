import { describe, expect, it } from 'vitest';
import { mcpAddCommand, mcpEndpoint } from './platform-token-command';

describe('platform token command', () => {
    it('points to the MCP path of the API, with or without a trailing slash', () => {
        expect(mcpEndpoint('https://api.example.com')).toBe('https://api.example.com/mcp');
        expect(mcpEndpoint('https://api.example.com/')).toBe('https://api.example.com/mcp');
    });

    it('builds the claude mcp add command with the bearer token', () => {
        expect(mcpAddCommand('https://api.example.com', 'vera_pat_x')).toBe(
            'claude mcp add --transport http vera https://api.example.com/mcp --header "Authorization: Bearer vera_pat_x"'
        );
    });
});
