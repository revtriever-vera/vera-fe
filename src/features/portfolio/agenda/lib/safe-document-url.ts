const WEB_PROTOCOLS: ReadonlySet<string> = new Set<string>(['https:', 'http:']);

export function safeDocumentUrl(url: string | null): string | null {
    if (url === null) {
        return null;
    }
    try {
        return WEB_PROTOCOLS.has(new URL(url).protocol) ? url : null;
    } catch {
        return null;
    }
}
