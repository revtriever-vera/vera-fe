import { Link } from '@tanstack/react-router';
import type { ReactElement } from 'react';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { buttonVariants } from '@/shared/ui/button';
import { AssetsStep, type AssetsStepState } from '../components/assets-step';

function StepFooter({ count }: { readonly count: number }): ReactElement {
    const { t }: UseTranslationResponse<'portfolioAssets', undefined> = useTranslation('portfolioAssets');
    return (
        <div className="flex justify-end">
            <Link to="/patrimonio" className={buttonVariants({ variant: count > 0 ? 'primary' : 'ghost' })}>
                {count > 0 ? t('step.seeOverview') : t('step.skip')}
            </Link>
        </div>
    );
}

export function AssetsStepPage(): ReactElement {
    return <AssetsStep footer={(state: AssetsStepState): ReactElement => <StepFooter count={state.count} />} />;
}
