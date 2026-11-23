import { useId, type ReactElement } from 'react';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { track } from '@/shared/lib/analytics';
import type { BillingState } from '@/shared/lib/billing/billing-context';
import { useBilling } from '@/shared/lib/billing/use-billing';
import { useLocale } from '@/shared/lib/i18n';
import type { SupportedLocale } from '@/shared/lib/locale';
import { Card } from '@/shared/ui/card';
import { LockLine } from '@/shared/ui/lock-line';
import { summaryTitle } from '../lib/summary-titles';
import { useTrackSummaryViewed } from '../lib/use-track-summary-viewed';
import type { SummaryKind } from '../types';

export interface SummaryLockedProps {
    readonly kind: SummaryKind;
    readonly month: string | undefined;
}

export function SummaryLocked({ kind, month }: SummaryLockedProps): ReactElement {
    const { t }: UseTranslationResponse<'summaries', undefined> = useTranslation('summaries');
    const locale: SupportedLocale = useLocale();
    const billing: BillingState = useBilling();
    const titleId: string = useId();
    useTrackSummaryViewed(kind, 'locked');
    return (
        <Card role="region" aria-labelledby={titleId}>
            <LockLine
                action={billing.canManage ? 'premium' : 'ownerOnly'}
                onActionClick={(): void => {
                    track('premium_gate_clicked', { feature: 'ai' });
                }}
            >
                <b id={titleId} className="font-bold text-content">
                    {summaryTitle(t, kind, month, locale)}.
                </b>{' '}
                {t('locked.text')}
            </LockLine>
        </Card>
    );
}
