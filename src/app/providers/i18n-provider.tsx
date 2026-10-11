import type { ReactElement, ReactNode } from 'react';
import { useEffect } from 'react';
import { I18nextProvider } from 'react-i18next';
import { i18n, useLocale } from '@/shared/lib/i18n';
import type { SupportedLocale } from '@/shared/lib/i18n/resolve-locale';

function DocumentLangSync(): null {
    const locale: SupportedLocale = useLocale();
    useEffect((): void => {
        document.documentElement.lang = locale;
    }, [locale]);
    return null;
}

export function I18nProvider({ children }: { readonly children: ReactNode }): ReactElement {
    return (
        <I18nextProvider i18n={i18n}>
            <DocumentLangSync />
            {children}
        </I18nextProvider>
    );
}
