import type { ReactElement } from 'react';
import { CircleCheck } from 'lucide-react';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import type { AreaSummary } from '../types';
import { banksDetail } from './summary-rows';

export function ConnectedBanksCard({ area }: { readonly area: AreaSummary }): ReactElement {
    const { t }: UseTranslationResponse<'onboarding', undefined> = useTranslation('onboarding');

    return (
        <div>
            <h2 className="flex items-center gap-2 font-display text-xl font-bold text-content">
                <CircleCheck className="size-5 text-positive" aria-hidden="true" />
                {t('banksConnectedTitle')}
            </h2>
            <p className="mt-1 text-sm text-content-muted">{t('banksConnectedDetail')}</p>
            <p className="mt-3 rounded-control border border-border bg-surface-muted p-3 text-sm font-semibold text-content">
                {banksDetail(t, area) ?? t('banksDone', { count: area.items })}
            </p>
        </div>
    );
}
