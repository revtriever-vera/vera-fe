export function emailsMatch(typed: string, expected: string): boolean {
    const candidate: string = typed.trim().toLowerCase();
    return candidate !== '' && candidate === expected.trim().toLowerCase();
}
