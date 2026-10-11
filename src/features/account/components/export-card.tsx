import type { ReactElement } from 'react';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { AccountSection } from './account-section';
import { ExportButton } from './export-button';

export function ExportCard(): ReactElement {
    const { t }: UseTranslationResponse<'account', undefined> = useTranslation('account');

    return (
        <AccountSection title={t('exportTitle')} description={t('exportDescription')}>
            <div>
                <ExportButton />
            </div>
        </AccountSection>
    );
}
