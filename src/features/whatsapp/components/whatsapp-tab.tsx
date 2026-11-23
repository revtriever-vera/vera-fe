import { useCallback, useState, type ReactElement } from 'react';
import type { UseQueryResult } from '@tanstack/react-query';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { useToast, type ToastApi } from '@/app/providers/toast-provider';
import { track } from '@/shared/lib/analytics';
import { formatDayMonth } from '@/shared/lib/billing/billing-dates';
import type { BillingState } from '@/shared/lib/billing/billing-context';
import type { FeatureAccess } from '@/shared/lib/billing/billing-types';
import { useBilling } from '@/shared/lib/billing/use-billing';
import { useLocale } from '@/shared/lib/i18n';
import type { SupportedLocale } from '@/shared/lib/locale';
import { Alert } from '@/shared/ui/alert';
import { Card } from '@/shared/ui/card';
import { QuotaMeter } from '@/shared/ui/quota-meter';
import { SkeletonPanel } from '@/shared/ui/skeleton-form';
import { useWhatsAppLink } from '../api/use-whatsapp-link.query';
import { useAnnounceLinked } from '../lib/use-announce-linked';
import { whatsappErrorMessage } from '../lib/whatsapp-error-message';
import { LINK_STATUS, type IssuedLink, type LinkView, type UnlinkReason } from '../types';
import { ExamplesCard } from './examples-card';
import { LinkStartCard } from './link-start-card';
import { LinkWaitingCard } from './link-waiting-card';
import { LinkedCard } from './linked-card';
import { LockedCard } from './locked-card';
import { RemindersCard } from './reminders-card';
import { UnavailableCard } from './unavailable-card';

function PausedNotice(): ReactElement {
    const { t }: UseTranslationResponse<'whatsapp', undefined> = useTranslation('whatsapp');
    const billing: BillingState = useBilling();
    const locale: SupportedLocale = useLocale();
    const resetsAt: string | undefined = billing.usage?.resetsAt;
    const text: string = resetsAt === undefined ? t('pausedNoDate') : t('paused', { date: formatDayMonth(resetsAt, locale) });
    return <Alert tone="caution" title={text} />;
}

function UnlinkNotice({ reason }: { readonly reason: UnlinkReason | null }): ReactElement | null {
    const { t }: UseTranslationResponse<'whatsapp', undefined> = useTranslation('whatsapp');
    if (reason === 'stale') {
        return <Alert tone="caution" title={t('notice.stale')} />;
    }
    return reason === 'premium_ended' ? <Alert tone="caution" title={t('notice.premiumEnded')} /> : null;
}

function LinkedSections({
    view,
    paused,
    onUnlinked
}: {
    readonly view: LinkView;
    readonly paused: boolean;
    readonly onUnlinked: () => void;
}): ReactElement {
    const billing: BillingState = useBilling();
    const showMeter: boolean = billing.mode === 'hosted' && billing.usage !== null;
    return (
        <>
            <LinkedCard view={view} onUnlinked={onUnlinked} />
            <ExamplesCard veraNumber={view.veraNumber} />
            <RemindersCard paused={paused} />
            {showMeter && billing.usage !== null ? (
                <Card>
                    <QuotaMeter usage={billing.usage} />
                </Card>
            ) : null}
        </>
    );
}

function LinkFlow({
    view,
    issued,
    onIssued
}: {
    readonly view: LinkView;
    readonly issued: IssuedLink | null;
    readonly onIssued: (issued: IssuedLink) => void;
}): ReactElement {
    const expiresAt: string | null = view.pending?.expiresAt ?? issued?.expiresAt ?? null;
    if (expiresAt === null) {
        return (
            <>
                <UnlinkNotice reason={view.lastUnlinkReason} />
                <LinkStartCard consentRequired={view.consentRequired} onIssued={onIssued} />
            </>
        );
    }
    return <LinkWaitingCard issued={issued} expiresAt={expiresAt} veraNumber={view.veraNumber} onIssued={onIssued} />;
}

function useLinkedAnnouncement(view: LinkView | undefined, issued: IssuedLink | null, clear: () => void): void {
    const { t }: UseTranslationResponse<'whatsapp', undefined> = useTranslation('whatsapp');
    const toast: ToastApi = useToast();
    const consentGiven: boolean = issued?.consentGiven ?? false;
    const onLinked: () => void = useCallback((): void => {
        track('whatsapp_linked', { consentGiven });
        toast.show({ tone: 'positive', title: t('toasts.linked') });
        clear();
    }, [consentGiven, toast, t, clear]);
    useAnnounceLinked(view?.status, onLinked);
}

function LinkSections({ paused }: { readonly paused: boolean }): ReactElement {
    const { t }: UseTranslationResponse<'whatsapp', undefined> = useTranslation('whatsapp');
    const { t: tBilling }: UseTranslationResponse<'billing', undefined> = useTranslation('billing');
    const locale: SupportedLocale = useLocale();
    const [issued, setIssued] = useState<IssuedLink | null>(null);
    const link: UseQueryResult<LinkView> = useWhatsAppLink(true);
    const clear: () => void = useCallback((): void => {
        setIssued(null);
    }, []);
    useLinkedAnnouncement(link.data, issued, clear);
    if (link.isPending) {
        return <SkeletonPanel label={t('loading')} lines={4} />;
    }
    if (link.error) {
        return <Alert title={whatsappErrorMessage(t, tBilling, link.error, locale)} />;
    }
    const linked: boolean = link.data.status === LINK_STATUS.active || link.data.status === LINK_STATUS.suspended;
    return (
        <>
            {paused ? <PausedNotice /> : null}
            {linked ? (
                <LinkedSections view={link.data} paused={paused} onUnlinked={clear} />
            ) : (
                <LinkFlow view={link.data} issued={issued} onIssued={setIssued} />
            )}
        </>
    );
}

export function WhatsAppTab(): ReactElement {
    const { t }: UseTranslationResponse<'whatsapp', undefined> = useTranslation('whatsapp');
    const billing: BillingState = useBilling();
    const state: FeatureAccess = billing.featureState('whatsapp');
    if (state === 'loading') {
        return <SkeletonPanel label={t('loading')} lines={3} />;
    }
    if (state === 'premium_required') {
        return <LockedCard />;
    }
    if (state === 'disabled') {
        return <UnavailableCard />;
    }
    return <LinkSections paused={state === 'paused'} />;
}
