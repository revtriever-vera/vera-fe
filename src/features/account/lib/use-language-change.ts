import type { UseMutationResult } from '@tanstack/react-query';
import { useSession } from '@/app/providers/session-provider';
import type { SessionUser } from '@/app/providers/session-context';
import { useToast, type ToastApi } from '@/app/providers/toast-provider';
import { track } from '@/shared/lib/analytics';
import { i18n, useLocale } from '@/shared/lib/i18n';
import type { SupportedLocale } from '@/shared/lib/locale';
import { useUpdatePreferences } from '../api/use-update-preferences.mutation';
import { accountErrorMessage } from './account-error-message';

export interface LanguageChange {
    readonly locale: SupportedLocale;
    readonly pending: boolean;
    readonly change: (value: string) => void;
}

export function useLanguageChange(): LanguageChange {
    const locale: SupportedLocale = useLocale();
    const { replaceUser } = useSession();
    const toast: ToastApi = useToast();
    const update: UseMutationResult<SessionUser, Error, SupportedLocale> = useUpdatePreferences();

    const change = (value: string): void => {
        const next: SupportedLocale = value === 'en' ? 'en' : 'pt-BR';
        if (next === locale) {
            return;
        }
        void i18n.changeLanguage(next);
        update.mutate(next, {
            onSuccess: (user: SessionUser): void => {
                track('language_changed', { locale: next });
                replaceUser(user);
            },
            onError: (error: Error): void => {
                void i18n.changeLanguage(locale).then((): void => {
                    toast.show({ tone: 'critical', title: accountErrorMessage(i18n.getFixedT(locale, 'account'), error, 'language') });
                });
            }
        });
    };

    return { locale, pending: update.isPending, change };
}
