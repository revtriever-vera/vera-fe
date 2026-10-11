import i18next, { type i18n as I18nInstance } from 'i18next';
import { initReactI18next, useTranslation, type UseTranslationResponse } from 'react-i18next';
import ptBRCommon from './resources/pt-BR/common.json';
import enCommon from './resources/en/common.json';
import { DEFAULT_LOCALE, resolveLocale, type SupportedLocale } from './resolve-locale';

type CommonResource = typeof ptBRCommon;

const resources: Record<SupportedLocale, { common: CommonResource }> = {
    'pt-BR': { common: ptBRCommon },
    en: { common: enCommon }
};

function initialLocale(): SupportedLocale {
    const navigatorLanguage: string | null = typeof navigator === 'undefined' ? null : navigator.language;
    return resolveLocale({ navigatorLanguage });
}

void i18next.use(initReactI18next).init({
    resources,
    lng: initialLocale(),
    fallbackLng: DEFAULT_LOCALE,
    ns: ['common'],
    defaultNS: 'common',
    interpolation: { escapeValue: false },
    returnNull: false
});

export const i18n: I18nInstance = i18next;

export function useLocale(): SupportedLocale {
    const { i18n: instance }: UseTranslationResponse<'common', undefined> = useTranslation();
    return resolveLocale({ navigatorLanguage: instance.language });
}
