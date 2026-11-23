import type { ReactElement } from 'react';
import { Zap } from 'lucide-react';
import { useNavigate, type UseNavigateResult } from '@tanstack/react-router';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { Button } from '@/shared/ui/button';
import { reallocateAmount } from '../lib/reallocate-amount';
import type { MaturityItem } from '../types';

export interface ReallocateButtonProps {
    readonly item: MaturityItem;
    readonly primary: boolean;
    readonly onClick: () => void;
}

export function ReallocateButton({ item, primary, onClick }: ReallocateButtonProps): ReactElement {
    const { t }: UseTranslationResponse<'portfolioFixedIncome', undefined> = useTranslation('portfolioFixedIncome');
    const navigate: UseNavigateResult<string> = useNavigate();
    return (
        <Button
            size="sm"
            variant={primary ? 'primary' : 'ghost'}
            aria-label={t('maturities.reallocateLabel', { name: item.name })}
            onClick={(): void => {
                onClick();
                void navigate({ to: '/portfolio/contribution', search: { amount: reallocateAmount(item.reallocateMinor) } });
            }}
        >
            <Zap className="size-3.5" aria-hidden="true" />
            {t('maturities.reallocate')}
        </Button>
    );
}
