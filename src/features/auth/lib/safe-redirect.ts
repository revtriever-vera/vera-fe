const FALLBACK: string = '/';
const SPACE_CODE: number = 32;

function hasControlCharacter(value: string): boolean {
    return Array.from(value).some((char: string): boolean => (char.codePointAt(0) ?? SPACE_CODE) < SPACE_CODE);
}

export function safeRedirect(value: string | undefined): string {
    if (value === undefined || !value.startsWith('/') || value.startsWith('//') || value.includes('\\')) {
        return FALLBACK;
    }
    return hasControlCharacter(value) ? FALLBACK : value;
}
