import { useId, type ReactElement } from 'react';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { track } from '@/shared/lib/analytics';
import type { BillingState } from '@/shared/lib/billing/billing-context';
import { useBilling } from '@/shared/lib/billing/use-billing';
import { Card } from '@/shared/ui/card';
import { LockLine } from '@/shared/ui/lock-line';
import type { ChangesLock } from '../lib/locked-count';

export function ChangesLocked({ lock }: { readonly lock: ChangesLock }): ReactElement {
    const { t }: UseTranslationResponse<'portfolioChanges', undefined> = useTranslation('portfolioChanges');
    const billing: BillingState = useBilling();
    const titleId: string = useId();
    return (
        <Card role="region" aria-labelledby={titleId}>
            <LockLine
                action={billing.canManage ? 'premium' : 'ownerOnly'}
                onActionClick={(): void => {
                    track('premium_gate_clicked', { feature: 'portfolio_changes' });
                }}
            >
                <b id={titleId} className="font-bold text-content">
                    {t('title')}.
                </b>{' '}
                {lock.documentCount === null ? t('locked.noCount') : t('locked.count', { count: lock.documentCount })}
            </LockLine>
        </Card>
    );
}
