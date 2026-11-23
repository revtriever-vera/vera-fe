import type { ReactElement } from 'react';
import { Link } from '@tanstack/react-router';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { buttonVariants } from '@/shared/ui/button';
import { AccountSection } from './account-section';

export function PeopleCard(): ReactElement {
    const { t }: UseTranslationResponse<'account', undefined> = useTranslation('account');

    return (
        <AccountSection title={t('peopleTitle')} description={t('peopleDescription')}>
            <div>
                <Link to="/people" className={buttonVariants({ variant: 'secondary' })}>
                    {t('peopleOpen')}
                </Link>
            </div>
        </AccountSection>
    );
}
