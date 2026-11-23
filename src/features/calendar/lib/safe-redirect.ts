const HTTPS: string = 'https:';

export function isHttpsUrl(url: string): boolean {
    try {
        return new URL(url).protocol === HTTPS;
    } catch {
        return false;
    }
}
