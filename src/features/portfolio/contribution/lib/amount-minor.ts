import type { SupportedLocale } from '@/shared/lib/locale';

const MAX_DIGITS: number = 15;
const PLAIN_NUMBER: RegExp = /^\d+(\.\d+)?$/;

function separatorsOf(locale: SupportedLocale): { group: string; decimal: string } {
    const parts: Intl.NumberFormatPart[] = new Intl.NumberFormat(locale).formatToParts(1000.5);
    return {
        group: parts.find((part: Intl.NumberFormatPart): boolean => part.type === 'group')?.value ?? ',',
        decimal: parts.find((part: Intl.NumberFormatPart): boolean => part.type === 'decimal')?.value ?? '.'
    };
}

function fractionDigits(currency: string, locale: SupportedLocale): number {
    return new Intl.NumberFormat(locale, { style: 'currency', currency }).resolvedOptions().maximumFractionDigits ?? 2;
}

export function amountToMinor(text: string, currency: 'BRL' | 'USD', locale: SupportedLocale): number | null {
    const { group, decimal }: { group: string; decimal: string } = separatorsOf(locale);
    const plain: string = text.trim().replaceAll(group, '').replace(decimal, '.');
    if (!PLAIN_NUMBER.test(plain)) {
        return null;
    }
    const digits: number = fractionDigits(currency, locale);
    const [whole = '', fraction = ''] = plain.split('.');
    const joined: string = `${whole}${fraction.slice(0, digits).padEnd(digits, '0')}`.replace(/^0+(?=\d)/, '');
    const minor: number = Number(joined);
    return joined.length > MAX_DIGITS || minor <= 0 ? null : minor;
}

export function majorToMinor(major: number, currency: string, locale: SupportedLocale): number {
    return Math.round(major * 10 ** fractionDigits(currency, locale));
}

export function minorToMajor(minor: number, currency: string, locale: SupportedLocale): number {
    return minor / 10 ** fractionDigits(currency, locale);
}
