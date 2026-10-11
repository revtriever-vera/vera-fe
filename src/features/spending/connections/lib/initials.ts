const FALLBACK: string = '•';

export function initialsOf(name: string | null): string {
    const words: string[] = (name ?? '')
        .trim()
        .split(/\s+/)
        .filter((word: string): boolean => word.length > 0);
    const [first, second] = words;
    if (first === undefined) {
        return FALLBACK;
    }
    if (second !== undefined) {
        return `${first.charAt(0)}${second.charAt(0)}`.toUpperCase();
    }
    return `${first.charAt(0).toUpperCase()}${first.charAt(1).toLowerCase()}`;
}
