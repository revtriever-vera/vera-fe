import type { UseMutationResult } from '@tanstack/react-query';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { useToast, type ToastApi } from '@/app/providers/toast-provider';
import { track } from '@/shared/lib/analytics';
import { useLocale } from '@/shared/lib/i18n';
import type { SupportedLocale } from '@/shared/lib/locale';
import { useLinkCode } from '../api/use-link-code.mutation';
import type { IssueCodeBody, IssuedCode, IssuedLink } from '../types';
import { whatsappErrorMessage } from './whatsapp-error-message';

export interface CodeIssuer {
    readonly pending: boolean;
    readonly issue: (consent: boolean) => void;
}

export function useCodeIssuer(onIssued: (issued: IssuedLink) => void): CodeIssuer {
    const { t }: UseTranslationResponse<'whatsapp', undefined> = useTranslation('whatsapp');
    const { t: tBilling }: UseTranslationResponse<'billing', undefined> = useTranslation('billing');
    const locale: SupportedLocale = useLocale();
    const toast: ToastApi = useToast();
    const mutation: UseMutationResult<IssuedCode, Error, IssueCodeBody> = useLinkCode();
    const issue = (consent: boolean): void => {
        mutation.mutate(consent ? { consent: true } : {}, {
            onSuccess: (issued: IssuedCode): void => {
                track('whatsapp_link_code_issued');
                onIssued({ ...issued, consentGiven: consent });
            },
            onError: (error: Error): void => {
                toast.show({ tone: 'critical', title: whatsappErrorMessage(t, tBilling, error, locale) });
            }
        });
    };
    return { pending: mutation.isPending, issue };
}
