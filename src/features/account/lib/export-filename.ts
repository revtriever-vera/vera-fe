export const FALLBACK_EXPORT_FILENAME: string = 'vera-export.json';

const QUOTED_FILENAME: RegExp = /filename="([^"]+)"/i;
const BARE_FILENAME: RegExp = /filename=([^;]+)/i;
const SAFE_FILENAME: RegExp = /^[\w.-]{1,100}$/;

export function exportFilename(contentDisposition: string | null): string {
    if (contentDisposition === null) {
        return FALLBACK_EXPORT_FILENAME;
    }
    const candidate: string | undefined = (QUOTED_FILENAME.exec(contentDisposition) ?? BARE_FILENAME.exec(contentDisposition))?.[1]?.trim();
    if (candidate === undefined || !SAFE_FILENAME.test(candidate) || candidate.startsWith('.')) {
        return FALLBACK_EXPORT_FILENAME;
    }
    return candidate;
}
