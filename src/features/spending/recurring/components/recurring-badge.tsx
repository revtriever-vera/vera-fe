import type { ReactElement } from 'react';
import { Repeat } from 'lucide-react';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { Badge } from '@/shared/ui/badge';

export function RecurringBadge(): ReactElement {
    const { t }: UseTranslationResponse<'spendingRecurring', undefined> = useTranslation('spendingRecurring');
    return (
        <Badge tone="accent">
            <Repeat aria-hidden="true" className="size-3" />
            {t('touchpoints.badge')}
        </Badge>
    );
}
