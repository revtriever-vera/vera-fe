const DECIMAL_PATTERN: RegExp = /^\d+(\.\d+)?$/;

export function normalizeDecimalInput(text: string): string {
    return text.trim().replace(',', '.');
}

export function isDecimalText(text: string): boolean {
    return DECIMAL_PATTERN.test(text);
}

export function decimalPlaces(text: string): number {
    const separator: number = text.indexOf('.');
    return separator === -1 ? 0 : text.length - separator - 1;
}

export function fitsDecimals(text: string, allowedDecimals: number): boolean {
    return decimalPlaces(text) <= allowedDecimals;
}

export function quantityStep(allowedDecimals: number): string {
    return allowedDecimals === 0 ? '1' : `0.${'0'.repeat(allowedDecimals - 1)}1`;
}
