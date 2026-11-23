export function confirmWordMatches(typed: string, word: string): boolean {
    const candidate: string = typed.trim().toLocaleUpperCase();
    return candidate !== '' && candidate === word.trim().toLocaleUpperCase();
}
