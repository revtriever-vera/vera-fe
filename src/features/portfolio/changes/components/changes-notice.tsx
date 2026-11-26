import type { ReactElement } from 'react';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';

export function ChangesNotice(): ReactElement {
    const { t }: UseTranslationResponse<'portfolioChanges', undefined> = useTranslation('portfolioChanges');
    return <p className="text-xs text-content-muted">{t('notice')}</p>;
}
