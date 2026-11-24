export const MCP_SERVER_NAME: string = 'vera';

export function mcpEndpoint(apiUrl: string): string {
    return `${apiUrl.endsWith('/') ? apiUrl.slice(0, -1) : apiUrl}/mcp`;
}

export function mcpAddCommand(apiUrl: string, token: string): string {
    return `claude mcp add --transport http ${MCP_SERVER_NAME} ${mcpEndpoint(apiUrl)} --header "Authorization: Bearer ${token}"`;
}
