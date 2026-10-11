import { describe, expect, it } from 'vitest';
import type { TFunction } from 'i18next';
import { i18n } from '@/shared/lib/i18n';
import { SUPPORTED_LOCALES, type SupportedLocale } from '@/shared/lib/locale';

const API_DEFAULT_NAMES: Readonly<Record<SupportedLocale, Readonly<Record<string, string>>>> = {
    'pt-BR': {
        rf_pos: 'Renda fixa pós',
        rf_pre: 'Renda fixa pré',
        rf_ipca: 'Renda fixa IPCA+',
        acoes_br: 'Ações Brasil',
        fii: 'FIIs',
        acoes_eua: 'Ações EUA',
        reits: 'REITs',
        cripto: 'Cripto'
    },
    en: {
        rf_pos: 'Floating-rate fixed income',
        rf_pre: 'Fixed-rate fixed income',
        rf_ipca: 'Inflation-linked fixed income',
        acoes_br: 'Brazilian stocks',
        fii: 'Brazilian REITs (FIIs)',
        acoes_eua: 'US stocks',
        reits: 'US REITs',
        cripto: 'Crypto'
    }
};

describe('nomes padrão das classes', () => {
    it.each(SUPPORTED_LOCALES)('%s é idêntico ao DEFAULT_CLASS_NAMES da API', (locale: SupportedLocale) => {
        const t: TFunction<'portfolio'> = i18n.getFixedT(locale, 'portfolio');
        const names: Record<string, string> = {};
        for (const key of Object.keys(API_DEFAULT_NAMES[locale])) {
            names[key] = t(`classes.names.${key}` as 'classes.names.fii');
        }

        expect(names).toEqual(API_DEFAULT_NAMES[locale]);
    });
});
