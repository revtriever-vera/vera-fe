const UUID_PATTERN: RegExp = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;
const SEPARATORS: RegExp = /[\s,;]+/;
const SHORT_HEAD: number = 4;
const SHORT_TAIL: number = 4;

export interface ParsedItemIds {
    readonly valid: string[];
    readonly invalid: string[];
}

export function isUuid(value: string): boolean {
    return UUID_PATTERN.test(value);
}

export function parseItemIds(text: string): ParsedItemIds {
    const tokens: string[] = text
        .split(SEPARATORS)
        .map((token: string): string => token.trim().toLowerCase())
        .filter((token: string): boolean => token.length > 0);
    const unique: string[] = [...new Set<string>(tokens)];
    return {
        valid: unique.filter(isUuid),
        invalid: unique.filter((token: string): boolean => !isUuid(token))
    };
}

export function shortenItemId(value: string): string {
    if (value.length <= SHORT_HEAD + SHORT_TAIL + 1) {
        return value;
    }
    return `${value.slice(0, SHORT_HEAD)}…${value.slice(-SHORT_TAIL)}`;
}
