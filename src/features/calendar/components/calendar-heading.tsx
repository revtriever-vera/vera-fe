import type { ReactElement, ReactNode } from 'react';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';

export function CalendarHeading({ badge }: { readonly badge?: ReactNode }): ReactElement {
    const { t }: UseTranslationResponse<'calendar', undefined> = useTranslation('calendar');
    return (
        <div className="flex flex-col gap-1">
            <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-base font-semibold text-content">{t('title')}</h2>
                {badge}
            </div>
            <p className="text-sm text-content-muted">{t('description')}</p>
        </div>
    );
}
