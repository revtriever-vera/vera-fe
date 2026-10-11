import type { ReactElement } from 'react';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { EmptyState } from '@/shared/ui/empty-state';

export function UnderConstruction(): ReactElement {
    const { t }: UseTranslationResponse<'spending', undefined> = useTranslation('spending');
    return <EmptyState title={t('underConstruction.title')} description={t('underConstruction.description')} />;
}
