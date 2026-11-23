import { Download } from 'lucide-react';
import type { ReactElement } from 'react';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { DataRow } from './data-row';
import { ExportButton } from './export-button';

export function ExportCard(): ReactElement {
    const { t }: UseTranslationResponse<'account', undefined> = useTranslation('account');

    return (
        <DataRow icon={Download} title={t('exportTitle')} description={t('exportDescription')}>
            <ExportButton size="sm" />
        </DataRow>
    );
}
