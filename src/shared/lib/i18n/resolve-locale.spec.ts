import { describe, expect, it } from 'vitest';
import { DEFAULT_LOCALE, resolveLocale, type SupportedLocale } from './resolve-locale';

describe('resolveLocale', () => {
    it('prioriza o locale do usuário sobre conta e navegador', () => {
        const locale: SupportedLocale = resolveLocale({
            userLocale: 'en-GB',
            accountLocale: 'pt-BR',
            navigatorLanguage: 'pt-BR'
        });
        expect(locale).toBe('en');
    });

    it('ignora o usuário não suportado e segue a cadeia', () => {
        const locale: SupportedLocale = resolveLocale({
            userLocale: 'es-AR',
            accountLocale: 'en-US',
            navigatorLanguage: 'pt-BR'
        });
        expect(locale).toBe('en');
    });

    it('usa o locale da conta quando não há usuário', () => {
        const locale: SupportedLocale = resolveLocale({
            userLocale: null,
            accountLocale: 'en-US',
            navigatorLanguage: 'pt-BR'
        });
        expect(locale).toBe('en');
    });

    it('usa o idioma do navegador quando não há usuário nem conta', () => {
        const locale: SupportedLocale = resolveLocale({
            userLocale: null,
            accountLocale: null,
            navigatorLanguage: 'pt-BR'
        });
        expect(locale).toBe('pt-BR');
    });

    it('normaliza pt-PT para pt-BR e en-US para en', () => {
        expect(resolveLocale({ userLocale: 'pt-PT' })).toBe('pt-BR');
        expect(resolveLocale({ navigatorLanguage: 'en-US' })).toBe('en');
    });

    it('cai no fallback quando nenhum sinal existe', () => {
        const locale: SupportedLocale = resolveLocale({});
        expect(locale).toBe(DEFAULT_LOCALE);
    });

    it('ignora valor não reconhecido em toda a cadeia', () => {
        const locale: SupportedLocale = resolveLocale({
            userLocale: 'fr',
            accountLocale: 'fr-FR',
            navigatorLanguage: 'es-CL'
        });
        expect(locale).toBe(DEFAULT_LOCALE);
    });
});
