import type { ReactElement } from 'react';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { Badge } from '@/shared/ui/badge';
import { Balloon } from '@/shared/ui/tooltip';
import type { CategorySource } from '../types';

export interface CategorySourceBadgeProps {
    readonly source: CategorySource;
}

export function CategorySourceBadge({ source }: CategorySourceBadgeProps): ReactElement | null {
    const { t }: UseTranslationResponse<'spending', undefined> = useTranslation('spending');
    if (source === 'none') {
        return null;
    }
    return (
        <Balloon text={t(`origin.tips.${source}`)}>
            <button type="button" className="rounded-control">
                <Badge>{t(`origin.labels.${source}`)}</Badge>
            </button>
        </Balloon>
    );
}
