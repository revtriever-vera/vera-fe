import type { ReactElement } from 'react';
import { Target } from 'lucide-react';
import { Link } from '@tanstack/react-router';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { buttonVariants } from '@/shared/ui/button';
import { EmptyState } from '@/shared/ui/empty-state';

export function TargetsNotSet(): ReactElement {
    const { t }: UseTranslationResponse<'portfolioContribution', undefined> = useTranslation('portfolioContribution');
    return (
        <EmptyState
            icon={<Target className="size-6" />}
            title={t('targetsNotSet.title')}
            description={t('targetsNotSet.description')}
            action={
                <Link to="/portfolio/targets" className={buttonVariants()}>
                    {t('targetsNotSet.action')}
                </Link>
            }
        />
    );
}
