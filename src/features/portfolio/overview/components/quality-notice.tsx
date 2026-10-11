import type { ReactElement } from 'react';
import { Link } from '@tanstack/react-router';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { Alert } from '@/shared/ui/alert';
import type { Overview } from '../../types';

export interface QualityNoticeProps {
    readonly quality: Overview['quality'];
}

export function QualityNotice({ quality }: QualityNoticeProps): ReactElement | null {
    const { t }: UseTranslationResponse<'portfolioOverview', undefined> = useTranslation('portfolioOverview');
    const items: readonly string[] = [
        quality.missingQuotes > 0 ? t('quality.missingQuotes', { count: quality.missingQuotes }) : '',
        quality.staleQuotes > 0 ? t('quality.staleQuotes', { count: quality.staleQuotes }) : '',
        quality.estimatedFixedIncome > 0 ? t('quality.estimatedFixedIncome') : '',
        quality.indexDataMissing > 0 ? t('quality.indexDataMissing', { count: quality.indexDataMissing }) : '',
        quality.missingRates > 0 ? t('quality.missingRates') : ''
    ].filter((item: string): boolean => item !== '');
    if (items.length === 0) {
        return null;
    }
    return (
        <Alert
            tone="caution"
            title={t('quality.title')}
            detail={
                <ul className="list-disc pl-4">
                    {items.map((item: string): ReactElement => (
                        <li key={item}>{item}</li>
                    ))}
                </ul>
            }
            action={
                <Link to="/patrimonio/ativos" className="underline-offset-2 hover:underline">
                    {t('quality.action')}
                </Link>
            }
        />
    );
}
