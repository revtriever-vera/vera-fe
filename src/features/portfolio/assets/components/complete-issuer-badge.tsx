import type { ReactElement } from 'react';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { Badge } from '@/shared/ui/badge';
import type { HoldingView } from '../../types';

export interface CompleteIssuerBadgeProps {
    readonly holding: HoldingView;
    readonly onComplete: (holding: HoldingView) => void;
}

export function CompleteIssuerBadge({ holding, onComplete }: CompleteIssuerBadgeProps): ReactElement {
    const { t }: UseTranslationResponse<'portfolioAssets', undefined> = useTranslation('portfolioAssets');
    return (
        <button
            type="button"
            aria-label={t('issuer.completeLabel', { name: holding.symbol })}
            onClick={(): void => {
                onComplete(holding);
            }}
            className="rounded-control focus-visible:ring-2 focus-visible:ring-accent/30 focus-visible:outline-none"
        >
            <Badge tone="caution">{t('issuer.complete')}</Badge>
        </button>
    );
}
