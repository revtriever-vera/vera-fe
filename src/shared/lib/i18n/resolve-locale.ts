import { DEFAULT_LOCALE, SUPPORTED_LOCALES, type SupportedLocale } from '@/shared/lib/locale';

export { DEFAULT_LOCALE, SUPPORTED_LOCALES, type SupportedLocale };

export interface ResolveLocaleInput {
    readonly userLocale?: string | null;
    readonly accountLocale?: string | null;
    readonly navigatorLanguage?: string | null;
}

function normalizeLocale(value: string | null | undefined): SupportedLocale | null {
    const prefix: string = (value ?? '').toLowerCase().split('-')[0] ?? '';
    if (prefix === 'pt') {
        return 'pt-BR';
    }
    if (prefix === 'en') {
        return 'en';
    }
    return null;
}

export function resolveLocale(input: ResolveLocaleInput): SupportedLocale {
    const candidates: (SupportedLocale | null)[] = [
        normalizeLocale(input.userLocale),
        normalizeLocale(input.accountLocale),
        normalizeLocale(input.navigatorLanguage)
    ];
    return candidates.find((locale): locale is SupportedLocale => locale !== null) ?? DEFAULT_LOCALE;
}
