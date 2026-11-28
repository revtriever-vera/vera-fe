import { useId, useState, type ReactElement } from 'react';
import type { UseQueryResult } from '@tanstack/react-query';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { track } from '@/shared/lib/analytics';
import type { BillingState } from '@/shared/lib/billing/billing-context';
import { useBilling } from '@/shared/lib/billing/use-billing';
import { Card } from '@/shared/ui/card';
import { LockLine } from '@/shared/ui/lock-line';
import { useAiConsent } from '../api/use-ai-consent.query';
import type { ConsentState } from '../types';
import { LinkButton } from './link-button';
import { MonthlyReviewConsent, MonthlyReviewConsentGranted } from './monthly-review-consent';
import { MonthlyReviewPayload } from './monthly-review-payload';
import { SummaryText } from './summary-text';

export interface MonthlyReviewNarrativeProps {
    readonly month: string;
    readonly text: string | null;
}

const PARAGRAPH_BREAK: RegExp = /\n{2,}/;

function NarrativeLocked(): ReactElement {
    const { t }: UseTranslationResponse<'summaries', undefined> = useTranslation('summaries');
    const billing: BillingState = useBilling();
    const titleId: string = useId();
    return (
        <Card role="region" aria-labelledby={titleId}>
            <LockLine
                action={billing.canManage ? 'premium' : 'ownerOnly'}
                onActionClick={(): void => {
                    track('premium_gate_clicked', { feature: 'ai' });
                }}
            >
                <b id={titleId} className="font-bold text-content">
                    {t('monthlyReview.title')}.
                </b>{' '}
                {t('monthlyReview.locked')}
            </LockLine>
        </Card>
    );
}

function NarrativeText({ month, text }: { readonly month: string; readonly text: string }): ReactElement {
    const { t }: UseTranslationResponse<'summaries', undefined> = useTranslation('summaries');
    const [open, setOpen] = useState<boolean>(false);
    const titleId: string = useId();
    return (
        <Card role="region" aria-labelledby={titleId} className="flex flex-col gap-3">
            <h3 id={titleId} className="text-base font-semibold">
                {t('monthlyReview.title')}
            </h3>
            <SummaryText paragraphs={text.split(PARAGRAPH_BREAK).filter((part: string): boolean => part.trim() !== '')} />
            <div className="text-xs text-content-muted">
                <LinkButton
                    onClick={(): void => {
                        setOpen(true);
                    }}
                >
                    {t('consent.seeSent')}
                </LinkButton>
            </div>
            {open ? (
                <MonthlyReviewPayload
                    month={month}
                    onClose={(): void => {
                        setOpen(false);
                    }}
                />
            ) : null}
        </Card>
    );
}

/** Premium without a paragraph: when the permission is missing, ask for it here (#374); otherwise show nothing. */
function NarrativeMissing({ month }: { readonly month: string }): ReactElement | null {
    const consent: UseQueryResult<ConsentState> = useAiConsent();
    const [asked, setAsked] = useState<boolean>(false);
    const needsConsent: boolean = consent.data?.available === true && consent.data.needsConsent;
    if (needsConsent && !asked) {
        setAsked(true);
    }
    if (needsConsent && consent.data !== undefined) {
        return <MonthlyReviewConsent month={month} consent={consent.data} />;
    }
    return asked && consent.data?.granted === true ? <MonthlyReviewConsentGranted /> : null;
}

export function MonthlyReviewNarrative({ month, text }: MonthlyReviewNarrativeProps): ReactElement | null {
    const billing: BillingState = useBilling();
    const access: ReturnType<BillingState['featureState']> = billing.featureState('ai');
    if (access === 'loading' || access === 'disabled') {
        return null;
    }
    if (access === 'premium_required') {
        return <NarrativeLocked />;
    }
    return text === null || text.trim() === '' ? <NarrativeMissing month={month} /> : <NarrativeText month={month} text={text} />;
}
