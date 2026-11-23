import { useEffect, useState, type ReactElement, type ReactNode } from 'react';
import { Link } from '@tanstack/react-router';
import { CircleAlert, TriangleAlert, X } from 'lucide-react';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { track } from '@/shared/lib/analytics';
import { cn } from '@/shared/lib/cn';
import { billingBannerKind, type BillingBannerKind } from '@/shared/lib/billing/billing-banner-kind';
import type { BillingState } from '@/shared/lib/billing/billing-context';
import { formatDayMonth, periodMonthName, usedPercent } from '@/shared/lib/billing/billing-dates';
import type { BillingTrial, BillingUsage } from '@/shared/lib/billing/billing-types';
import { useBilling } from '@/shared/lib/billing/use-billing';
import { useLocale } from '@/shared/lib/i18n';
import type { SupportedLocale } from '@/shared/lib/locale';
import { Button, buttonVariants } from './button';

const DISMISS_KEY: string = 'vera.billing.warning-dismissed';

type BillingT = UseTranslationResponse<'billing', undefined>['t'];

function readDismissed(): string | null {
    try {
        return window.sessionStorage.getItem(DISMISS_KEY);
    } catch {
        return null;
    }
}

function writeDismissed(period: string): void {
    try {
        window.sessionStorage.setItem(DISMISS_KEY, period);
    } catch {
        return;
    }
}

interface Strip {
    readonly tone: 'caution' | 'critical';
    readonly title: string;
    readonly detail: string;
}

function usageStrip(kind: 'warning' | 'paused', usage: BillingUsage, t: BillingT, locale: SupportedLocale): Strip {
    const date: string = formatDayMonth(usage.resetsAt, locale);
    if (kind === 'paused') {
        return { tone: 'critical', title: t('banner.pausedTitle', { date }), detail: t('banner.paused') };
    }
    const percent: number = usedPercent(usage.usedBps);
    const month: string = periodMonthName(usage.resetsAt, locale);
    return { tone: 'caution', title: t('banner.warningTitle', { percent, month }), detail: t('banner.warning', { date }) };
}

function pastDueStrip(graceEndsAt: string | null, t: BillingT, locale: SupportedLocale): Strip {
    const detail: string =
        graceEndsAt === null ? t('banner.pastDueNoDate') : t('banner.pastDueUntil', { date: formatDayMonth(graceEndsAt, locale) });
    return { tone: 'critical', title: t('banner.pastDueTitle'), detail };
}

function Shell({ strip, children }: { readonly strip: Strip; readonly children?: ReactNode }): ReactElement {
    const Icon: typeof CircleAlert = strip.tone === 'critical' ? CircleAlert : TriangleAlert;
    const surface: string = strip.tone === 'critical' ? 'border-critical bg-critical/10' : 'border-caution bg-caution/10';
    const accent: string = strip.tone === 'critical' ? 'text-critical' : 'text-caution';
    return (
        <output
            className={cn('flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-l-[3px] px-page-x py-2.5 text-sm', surface)}
        >
            <span className="flex min-w-56 flex-1 items-start gap-2.5">
                <Icon className={cn('mt-0.5 size-4 shrink-0', accent)} aria-hidden="true" />
                <span className="text-content-muted">
                    <b className={cn('mr-1 font-bold', accent)}>{strip.title}</b>
                    {strip.detail}
                </span>
            </span>
            {children}
        </output>
    );
}

const PLAN_PARAMS: { readonly tab: string } = { tab: 'plan' };

function trialEndingStrip(trial: BillingTrial, t: BillingT, locale: SupportedLocale): Strip {
    return {
        tone: 'caution',
        title: t('banner.trialEndingTitle', { date: formatDayMonth(trial.endsAt, locale) }),
        detail: t('banner.trialEnding')
    };
}

function TrialEndingBanner({ billing, trial }: { readonly billing: BillingState; readonly trial: BillingTrial }): ReactElement {
    const { t }: UseTranslationResponse<'billing', undefined> = useTranslation('billing');
    const locale: SupportedLocale = useLocale();
    return (
        <Shell strip={trialEndingStrip(trial, t, locale)}>
            {billing.canManage ? (
                <Link to="/settings/$tab" params={PLAN_PARAMS} className={buttonVariants({ variant: 'secondary', size: 'sm' })}>
                    {t('planTab.cards.subscribe')}
                </Link>
            ) : (
                <span className="text-sm font-semibold text-content-muted">{t('banner.tellOwner')}</span>
            )}
        </Shell>
    );
}

function PayAction({ billing }: { readonly billing: BillingState }): ReactElement | null {
    const { t }: UseTranslationResponse<'billing', undefined> = useTranslation('billing');
    const [opening, setOpening] = useState<boolean>(false);
    if (!billing.canManage) {
        return <span className="text-sm font-semibold text-content-muted">{t('banner.tellOwner')}</span>;
    }
    if (billing.openInvoice === null) {
        return null;
    }
    return (
        <Button
            size="sm"
            variant="secondary"
            loading={opening}
            onClick={(): void => {
                setOpening(true);
                void billing.payInvoice('banner').finally((): void => {
                    setOpening(false);
                });
            }}
        >
            {t('banner.pay')}
        </Button>
    );
}

function DismissAction({ onDismiss }: { readonly onDismiss: () => void }): ReactElement {
    const { t }: UseTranslationResponse<'billing', undefined> = useTranslation('billing');
    return (
        <Button variant="ghost" size="sm" aria-label={t('banner.dismiss')} onClick={onDismiss}>
            <X className="size-4" aria-hidden="true" />
        </Button>
    );
}

function useBannerView(kind: BillingBannerKind | null): void {
    useEffect((): void => {
        if (kind !== null) {
            track('billing_banner_viewed', { kind });
        }
    }, [kind]);
}

function useDismissal(period: string | null): { readonly dismissed: boolean; readonly dismiss: () => void } {
    const [stored, setStored] = useState<string | null>(readDismissed);
    return {
        dismissed: period !== null && stored === period,
        dismiss: (): void => {
            if (period !== null) {
                writeDismissed(period);
                setStored(period);
            }
        }
    };
}

function UsageBanner({
    kind,
    usage,
    onDismiss
}: {
    readonly kind: 'warning' | 'paused';
    readonly usage: BillingUsage;
    readonly onDismiss: () => void;
}): ReactElement {
    const { t }: UseTranslationResponse<'billing', undefined> = useTranslation('billing');
    const locale: SupportedLocale = useLocale();
    return <Shell strip={usageStrip(kind, usage, t, locale)}>{kind === 'warning' ? <DismissAction onDismiss={onDismiss} /> : null}</Shell>;
}

function PastDueBanner({ billing }: { readonly billing: BillingState }): ReactElement {
    const { t }: UseTranslationResponse<'billing', undefined> = useTranslation('billing');
    const locale: SupportedLocale = useLocale();
    return (
        <Shell strip={pastDueStrip(billing.graceEndsAt, t, locale)}>
            <PayAction billing={billing} />
        </Shell>
    );
}

function BannerView({
    kind,
    billing,
    onDismiss
}: {
    readonly kind: BillingBannerKind;
    readonly billing: BillingState;
    readonly onDismiss: () => void;
}): ReactElement | null {
    if (kind === 'past_due') {
        return <PastDueBanner billing={billing} />;
    }
    if (kind === 'trial_ending') {
        return billing.trial === null ? null : <TrialEndingBanner billing={billing} trial={billing.trial} />;
    }
    return billing.usage === null ? null : <UsageBanner kind={kind} usage={billing.usage} onDismiss={onDismiss} />;
}

export function BillingBanner(): ReactElement | null {
    const billing: BillingState = useBilling();
    const { dismissed, dismiss } = useDismissal(billing.usage?.resetsAt ?? null);
    const kind: BillingBannerKind | null = billingBannerKind(billing);
    const hidden: boolean = kind === 'warning' && dismissed;
    useBannerView(hidden ? null : kind);

    if (kind === null || hidden) {
        return null;
    }
    return <BannerView kind={kind} billing={billing} onDismiss={dismiss} />;
}
