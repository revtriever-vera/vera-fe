import type { ReactElement } from 'react';
import type { UseQueryResult } from '@tanstack/react-query';
import { usePortfolioSettings } from '../../api/use-portfolio-settings.query';
import type { PortfolioSettings } from '../../types';
import { FgcCard } from '../components/fgc-card';
import { MaturitiesCard } from '../components/maturities-card';
import { RealRateCard } from '../components/real-rate-card';

export function FixedIncomeTab(): ReactElement {
    const settings: UseQueryResult<PortfolioSettings> = usePortfolioSettings();
    const showBrlNote: boolean = settings.data?.baseCurrency === 'USD';
    return (
        <div className="flex flex-col gap-4">
            <MaturitiesCard showBrlNote={showBrlNote} />
            <RealRateCard showBrlNote={showBrlNote} />
            <FgcCard showBrlNote={showBrlNote} />
        </div>
    );
}
