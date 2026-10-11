import type { SupportedLocale } from '@/shared/lib/locale';

export interface LanguageChoice {
    readonly value: SupportedLocale;
    readonly label: string;
}

export const LANGUAGE_CHOICES: readonly LanguageChoice[] = [
    { value: 'pt-BR', label: 'Português (Brasil)' },
    { value: 'en', label: 'English' }
];
