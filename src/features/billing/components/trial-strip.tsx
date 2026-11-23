import type { ReactElement } from 'react';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { isNoCardTrialEnding } from '@/shared/lib/billing/trial-ending';
import { useLocale } from '@/shared/lib/i18n';
import type { SupportedLocale } from '@/shared/lib/locale';
import { Alert } from '@/shared/ui/alert';
import { Button } from '@/shared/ui/button';
import { longDate } from '../lib/billing-format';
import type { BillingMe } from '../types';

export interface TrialStripProps {
    readonly me: BillingMe;
    readonly onSubscribe: () => void;
}

export function TrialStrip({ me, onSubscribe }: TrialStripProps): ReactElement | null {
    const { t }: UseTranslationResponse<'billing', undefined> = useTranslation('billing');
    const locale: SupportedLocale = useLocale();
    const trial: BillingMe['trial'] = me.trial;
    if (trial?.kind !== 'no_card' || me.subscription !== null) {
        return null;
    }
    const date: string = longDate(trial.endsAt, locale);
    if (!isNoCardTrialEnding(trial, false)) {
        return <Alert tone="positive" title={t('planTab.trialStrip.title', { date })} detail={t('planTab.trialStrip.detail')} />;
    }
    const subscribable: boolean = me.canManage && me.methods.length > 0;
    return (
        <Alert
            tone="caution"
            title={t('planTab.trialStrip.endingTitle', { date })}
            detail={t('planTab.trialStrip.endingDetail')}
            action={
                subscribable ? (
                    <Button size="sm" onClick={onSubscribe}>
                        {t('planTab.cards.subscribe')}
                    </Button>
                ) : undefined
            }
        />
    );
}
