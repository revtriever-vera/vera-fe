import type { ReactElement } from 'react';
import { afterEach, describe, expect, it } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { i18n } from '@/shared/lib/i18n';
import { resolveLocale } from '@/shared/lib/i18n/resolve-locale';
import { I18nProvider } from './i18n-provider';

function CancelLabel(): ReactElement {
    const { t }: UseTranslationResponse<['common'], undefined> = useTranslation(['common']);
    return <span>{t('common:cancel')}</span>;
}

describe('I18nProvider', () => {
    afterEach(async () => {
        await i18n.changeLanguage('pt-BR');
    });

    it('renderiza a chave em en quando o navegador diz en-US', async () => {
        await i18n.changeLanguage(resolveLocale({ navigatorLanguage: 'en-US' }));
        render(
            <I18nProvider>
                <CancelLabel />
            </I18nProvider>
        );
        await waitFor(() => expect(screen.getByText('Cancel')).toBeInTheDocument());
        await waitFor(() => {
            expect(document.documentElement.lang).toBe('en');
        });
    });

    it('renderiza a chave em pt-BR quando o navegador diz um idioma não suportado', async () => {
        await i18n.changeLanguage(resolveLocale({ navigatorLanguage: 'fr' }));
        render(
            <I18nProvider>
                <CancelLabel />
            </I18nProvider>
        );
        await waitFor(() => expect(screen.getByText('Cancelar')).toBeInTheDocument());
        await waitFor(() => {
            expect(document.documentElement.lang).toBe('pt-BR');
        });
    });
});
