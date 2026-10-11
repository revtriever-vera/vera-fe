import type { SupportedLocale } from '@/shared/lib/locale';

const MAX_DIGITS: number = 15;
const SEPARATORS: RegExp = /[.,]/g;
const NOT_MONEY_CHARACTER: RegExp = /[^\d.,]/g;

export function fractionDigitsOf(currency: string, locale: SupportedLocale): number {
    return new Intl.NumberFormat(locale, { style: 'currency', currency }).resolvedOptions().maximumFractionDigits ?? 2;
}

export function sanitizeMoneyText(text: string): string {
    return text.replace(NOT_MONEY_CHARACTER, '');
}

function splitDecimal(clean: string, fractionDigits: number): { whole: string; fraction: string } {
    const lastSeparator: number = Math.max(clean.lastIndexOf(','), clean.lastIndexOf('.'));
    if (lastSeparator === -1) {
        return { whole: clean, fraction: '' };
    }
    const fraction: string = clean.slice(lastSeparator + 1);
    if (fraction.length > fractionDigits) {
        return { whole: clean.replace(SEPARATORS, ''), fraction: '' };
    }
    return { whole: clean.slice(0, lastSeparator).replace(SEPARATORS, ''), fraction };
}

export function parseMoneyText(text: string, fractionDigits: number): number | null {
    const clean: string = sanitizeMoneyText(text);
    if (!/\d/.test(clean)) {
        return null;
    }
    const { whole, fraction }: { whole: string; fraction: string } = splitDecimal(clean, fractionDigits);
    const digits: string = `${whole}${fraction.padEnd(fractionDigits, '0')}`.replace(/^0+(?=\d)/, '');
    return digits.length > MAX_DIGITS ? null : Number(digits);
}

export function formatMoneyText(minor: number, fractionDigits: number, locale: SupportedLocale): string {
    return new Intl.NumberFormat(locale, { minimumFractionDigits: fractionDigits, maximumFractionDigits: fractionDigits }).format(
        minor / 10 ** fractionDigits
    );
}

export function currencySymbol(currency: string, locale: SupportedLocale): string {
    const parts: Intl.NumberFormatPart[] = new Intl.NumberFormat(locale, { style: 'currency', currency }).formatToParts(0);
    return parts.find((part: Intl.NumberFormatPart): boolean => part.type === 'currency')?.value ?? currency;
}
