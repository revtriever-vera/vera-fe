export const SUPPORTED_LOCALES: readonly ['pt-BR', 'en'] = ['pt-BR', 'en'] as const;

export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];

export const DEFAULT_LOCALE: SupportedLocale = 'pt-BR';
