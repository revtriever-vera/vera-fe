import type { ReactElement } from 'react';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { EmptyState } from '@/shared/ui/empty-state';

export function UnderConstruction(): ReactElement {
    const { t }: UseTranslationResponse<'portfolio', undefined> = useTranslation('portfolio');
    return <EmptyState title={t('underConstruction.title')} description={t('underConstruction.description')} />;
}
