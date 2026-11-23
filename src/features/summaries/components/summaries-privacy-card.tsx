import { useId, useState, type ReactElement } from 'react';
import { Link } from '@tanstack/react-router';
import type { UseMutationResult, UseQueryResult } from '@tanstack/react-query';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { useToast, type ToastApi } from '@/app/providers/toast-provider';
import type { ApiError } from '@/shared/lib/api/api-error';
import { track } from '@/shared/lib/analytics';
import type { BillingState } from '@/shared/lib/billing/billing-context';
import { useBilling } from '@/shared/lib/billing/use-billing';
import { Button, buttonVariants } from '@/shared/ui/button';
import { Card } from '@/shared/ui/card';
import { ConfirmDialog } from '@/shared/ui/confirm-dialog';
import { FailureAlert } from '@/shared/ui/failure-alert';
import { LockLine } from '@/shared/ui/lock-line';
import { Skeleton } from '@/shared/ui/skeleton';
import { Switch } from '@/shared/ui/switch';
import { useAiConsent } from '../api/use-ai-consent.query';
import { useGrantConsent, type GrantConsentInput } from '../api/use-grant-consent.mutation';
import { useRevokeConsent } from '../api/use-revoke-consent.mutation';
import { summaryErrorMessage } from '../lib/summary-error-message';
import { useSummaryParams } from '../lib/use-summary-params';
import { SUMMARY_KIND, type ConsentState, type SummaryParams } from '../types';
import { LinkButton } from './link-button';
import { PayloadTabsModal } from './payload-tabs-modal';

const INTEGRATIONS_PARAMS: { readonly tab: string } = { tab: 'integrations' };

interface Toggle {
    readonly on: boolean;
    readonly pending: boolean;
    readonly request: (next: boolean) => void;
    readonly confirmOff: () => Promise<void>;
    readonly confirming: boolean;
    readonly cancel: () => void;
}

function useConsentActions(consent: ConsentState): {
    readonly turnOn: () => Promise<void>;
    readonly turnOff: () => Promise<void>;
    readonly pending: boolean;
} {
    const { t }: UseTranslationResponse<'summaries', undefined> = useTranslation('summaries');
    const toast: ToastApi = useToast();
    const grant: UseMutationResult<ConsentState, ApiError, GrantConsentInput> = useGrantConsent();
    const revoke: UseMutationResult<void, ApiError, void> = useRevokeConsent();
    const fail = (error: unknown): void => {
        toast.show({ tone: 'critical', title: summaryErrorMessage(t, error instanceof Error ? error : new Error('toggle failed'), null) });
    };
    const turnOn = async (): Promise<void> => {
        try {
            await grant.mutateAsync({ noticeVersion: consent.noticeVersion, source: 'privacy_settings' });
            track('summary_consent_granted', { source: 'privacy_settings' });
            toast.show({ tone: 'positive', title: t('privacy.granted') });
        } catch (error) {
            fail(error);
        }
    };
    const turnOff = async (): Promise<void> => {
        try {
            await revoke.mutateAsync();
            track('summary_consent_revoked');
            toast.show({ tone: 'positive', title: t('privacy.revoked') });
        } catch (error) {
            fail(error);
        }
    };
    return { turnOn, turnOff, pending: grant.isPending };
}

function useToggle(consent: ConsentState): Toggle {
    const { turnOn, turnOff, pending } = useConsentActions(consent);
    const [confirming, setConfirming] = useState<boolean>(false);
    return {
        on: consent.granted && !consent.needsConsent,
        pending,
        request: (next: boolean): void => {
            if (next) {
                void turnOn();
                return;
            }
            setConfirming(true);
        },
        confirmOff: async (): Promise<void> => {
            await turnOff();
            setConfirming(false);
        },
        confirming,
        cancel: (): void => {
            setConfirming(false);
        }
    };
}

function SwitchRow({ consent }: { readonly consent: ConsentState }): ReactElement {
    const { t }: UseTranslationResponse<'summaries', undefined> = useTranslation('summaries');
    const toggle: Toggle = useToggle(consent);
    return (
        <div className="flex items-start gap-3">
            <Switch
                checked={toggle.on}
                label={t('privacy.switchLabel')}
                disabled={!consent.canChange}
                busy={toggle.pending}
                onCheckedChange={toggle.request}
            />
            <div className="flex min-w-0 flex-col gap-0.5">
                <span className="text-sm font-semibold text-content">{t('privacy.switchLabel')}</span>
                <span className="text-xs text-content-muted">{consent.canChange ? t('privacy.switchHint') : t('privacy.askEditor')}</span>
            </div>
            {toggle.confirming ? (
                <ConfirmDialog
                    title={t('privacy.confirmTitle')}
                    description={t('privacy.confirmDescription')}
                    confirmLabel={t('privacy.confirmAction')}
                    destructive
                    onConfirm={(): void => void toggle.confirmOff()}
                    onCancel={toggle.cancel}
                />
            ) : null}
        </div>
    );
}

function ConsentLoadFailed({ error, onRetry }: { readonly error: Error; readonly onRetry: () => void }): ReactElement {
    const { t }: UseTranslationResponse<'summaries', undefined> = useTranslation('summaries');
    return (
        <div className="flex flex-col items-start gap-3">
            <FailureAlert error={error} title={t('privacy.loadFailed')} />
            <Button variant="secondary" onClick={onRetry}>
                {t('privacy.retry')}
            </Button>
        </div>
    );
}

function ConsentControls({ portfolioParams }: { readonly portfolioParams: SummaryParams }): ReactElement {
    const { t }: UseTranslationResponse<'summaries', undefined> = useTranslation('summaries');
    const consent: UseQueryResult<ConsentState> = useAiConsent();
    const [payloadOpen, setPayloadOpen] = useState<boolean>(false);
    if (consent.error !== null) {
        return (
            <ConsentLoadFailed
                error={consent.error}
                onRetry={(): void => {
                    void consent.refetch();
                }}
            />
        );
    }
    if (consent.data === undefined) {
        return <Skeleton className="h-10 w-full" />;
    }
    return (
        <div className="flex flex-col gap-3">
            <SwitchRow consent={consent.data} />
            <p className="m-0 text-sm">
                <LinkButton
                    onClick={(): void => {
                        setPayloadOpen(true);
                    }}
                >
                    {t('privacy.seeSent')}
                </LinkButton>
            </p>
            {payloadOpen ? (
                <PayloadTabsModal
                    portfolioParams={portfolioParams}
                    onClose={(): void => {
                        setPayloadOpen(false);
                    }}
                />
            ) : null}
        </div>
    );
}

function RegisterModelLink(): ReactElement {
    const { t }: UseTranslationResponse<'summaries', undefined> = useTranslation('summaries');
    return (
        <Link to="/settings/$tab" params={INTEGRATIONS_PARAMS} className={buttonVariants({ variant: 'secondary', size: 'sm' })}>
            {t('privacy.registerModel')}
        </Link>
    );
}

function PrivacyBody({ portfolioParams }: { readonly portfolioParams: SummaryParams }): ReactElement | null {
    const { t }: UseTranslationResponse<'summaries', undefined> = useTranslation('summaries');
    const billing: BillingState = useBilling();
    const access: ReturnType<BillingState['featureState']> = billing.featureState('ai');
    if (access === 'loading') {
        return <Skeleton className="h-10 w-full" />;
    }
    if (access === 'premium_required') {
        return <LockLine action="none">{t('privacy.locked')}</LockLine>;
    }
    if (access === 'disabled') {
        return <RegisterModelLink />;
    }
    return <ConsentControls portfolioParams={portfolioParams} />;
}

export function SummariesPrivacyCard(): ReactElement {
    const { t }: UseTranslationResponse<'summaries', undefined> = useTranslation('summaries');
    const titleId: string = useId();
    const portfolioParams: SummaryParams = useSummaryParams(SUMMARY_KIND.portfolio, undefined, undefined);
    return (
        <Card role="region" aria-labelledby={titleId} className="flex flex-col gap-3">
            <div className="flex flex-col gap-1">
                <h2 id={titleId} className="text-base font-semibold text-content">
                    {t('privacy.title')}
                </h2>
                <p className="m-0 text-sm text-content-muted">{t('privacy.description')}</p>
            </div>
            <PrivacyBody portfolioParams={portfolioParams} />
        </Card>
    );
}
