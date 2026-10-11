const QUOTED_FILENAME: RegExp = /filename="([^"]+)"/i;
const BARE_FILENAME: RegExp = /filename=([^;]+)/i;
const SAFE_FILENAME: RegExp = /^[\w.-]{1,100}$/;

export function filenameFromDisposition(header: string | null, fallback: string): string {
    if (header === null) {
        return fallback;
    }
    const candidate: string | undefined = (QUOTED_FILENAME.exec(header) ?? BARE_FILENAME.exec(header))?.[1]?.trim();
    if (candidate === undefined || !SAFE_FILENAME.test(candidate) || candidate.startsWith('.')) {
        return fallback;
    }
    return candidate;
}
