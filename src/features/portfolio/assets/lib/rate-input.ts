const RATE_PATTERN: RegExp = /^(\d{1,3})(?:[.,](\d{1,2}))?$/;
const BPS_PER_POINT: number = 100;

export function parseRateBps(text: string): number | null {
    const match: RegExpMatchArray | null = RATE_PATTERN.exec(text.trim());
    if (match?.[1] === undefined) {
        return null;
    }
    return Number(match[1]) * BPS_PER_POINT + Number((match[2] ?? '').padEnd(2, '0'));
}
