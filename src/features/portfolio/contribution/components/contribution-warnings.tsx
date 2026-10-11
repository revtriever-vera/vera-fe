import type { ReactElement } from 'react';
import { Link } from '@tanstack/react-router';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { Alert } from '@/shared/ui/alert';
import type { ContributionWarning } from '../types';

export interface ContributionWarningsProps {
    readonly warnings: readonly ContributionWarning[];
}

export function ContributionWarnings({ warnings }: ContributionWarningsProps): ReactElement | null {
    const { t }: UseTranslationResponse<'portfolioContribution', undefined> = useTranslation('portfolioContribution');
    if (!warnings.includes('class_targets_not_100')) {
        return null;
    }
    return (
        <Alert
            tone="caution"
            title={t('warnings.classTargetsNot100.title')}
            detail={t('warnings.classTargetsNot100.detail')}
            action={
                <Link to="/portfolio/targets" className="underline-offset-2 hover:underline">
                    {t('warnings.classTargetsNot100.action')}
                </Link>
            }
        />
    );
}
