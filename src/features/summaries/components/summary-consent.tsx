import { useState, type ReactElement } from 'react';
import type { UseMutationResult } from '@tanstack/react-query';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { useToast, type ToastApi } from '@/app/providers/toast-provider';
import type { ApiError } from '@/shared/lib/api/api-error';
import { track } from '@/shared/lib/analytics';
import { useLocale } from '@/shared/lib/i18n';
import type { SupportedLocale } from '@/shared/lib/locale';
import { Button } from '@/shared/ui/button';
import { useGrantConsent, type GrantConsentInput } from '../api/use-grant-consent.mutation';
import { summaryErrorMessage } from '../lib/summary-error-message';
import { summaryDescription, summaryTitle } from '../lib/summary-titles';
import { useNoticeSuffix } from '../lib/use-notice-key';
import { useTrackSummaryViewed } from '../lib/use-track-summary-viewed';
import type { ConsentState, ConsentSource, SummaryKind, SummaryParams } from '../types';
import { LinkButton } from './link-button';
import { PayloadModal } from './payload-modal';
import { SummaryShell } from './summary-shell';

export interface SummaryConsentProps {
    readonly kind: SummaryKind;
    readonly month: string | undefined;
    readonly params: SummaryParams;
    readonly consent: ConsentState;
}

const SOURCE: ConsentSource = 'summary_card';

function useAllow(consent: ConsentState): { readonly allow: () => Promise<void>; readonly pending: boolean } {
    const { t }: UseTranslationResponse<'summaries', undefined> = useTranslation('summaries');
    const toast: ToastApi = useToast();
    const grant: UseMutationResult<ConsentState, ApiError, GrantConsentInput> = useGrantConsent();
    const allow = async (): Promise<void> => {
        try {
            await grant.mutateAsync({ noticeVersion: consent.noticeVersion, source: SOURCE });
            track('summary_consent_granted', { source: SOURCE });
            toast.show({ tone: 'positive', title: t('consent.granted') });
        } catch (error) {
            toast.show({
                tone: 'critical',
                title: summaryErrorMessage(t, error instanceof Error ? error : new Error('grant failed'), null)
            });
        }
    };
    return { allow, pending: grant.isPending };
}

function AllowRow({ consent }: { readonly consent: ConsentState }): ReactElement {
    const { t }: UseTranslationResponse<'summaries', undefined> = useTranslation('summaries');
    const { allow, pending } = useAllow(consent);
    if (!consent.canChange) {
        return <p className="m-0 text-sm text-content-muted">{t('consent.askEditor')}</p>;
    }
    return (
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
            <Button size="sm" loading={pending} onClick={(): void => void allow()}>
                {t('consent.allow')}
            </Button>
            <span className="text-xs text-content-muted">{t('consent.hint')}</span>
        </div>
    );
}

export function SummaryConsent({ kind, month, params, consent }: SummaryConsentProps): ReactElement {
    const { t }: UseTranslationResponse<'summaries', undefined> = useTranslation('summaries');
    const locale: SupportedLocale = useLocale();
    const suffix: '' | 'SelfHosted' = useNoticeSuffix();
    const [payloadOpen, setPayloadOpen] = useState<boolean>(false);
    useTrackSummaryViewed(kind, 'consent');
    return (
        <SummaryShell title={summaryTitle(t, kind, month, locale)} description={summaryDescription(t, kind)}>
            <p className="m-0 rounded-control bg-surface-muted p-3 text-sm text-content-muted">
                {t(`consent.notice${suffix}`)}{' '}
                <LinkButton
                    onClick={(): void => {
                        setPayloadOpen(true);
                    }}
                >
                    {t('consent.seeSent')}
                </LinkButton>
            </p>
            <AllowRow consent={consent} />
            {payloadOpen ? (
                <PayloadModal
                    kind={kind}
                    params={params}
                    onClose={(): void => {
                        setPayloadOpen(false);
                    }}
                />
            ) : null}
        </SummaryShell>
    );
}
