import { useId, type ReactElement } from 'react';
import { useNavigate, type UseNavigateResult } from '@tanstack/react-router';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { formatMonthYear } from '@/shared/lib/format/date';
import { useLocale } from '@/shared/lib/i18n';
import type { SupportedLocale } from '@/shared/lib/locale';
import { SelectMenu, type SelectChoice } from '@/shared/ui/select-menu';
import type { MonthlyReviewList } from '../types';

export interface MonthSelectProps {
    readonly items: MonthlyReviewList['items'];
    readonly value: string;
}

export function MonthSelect({ items, value }: MonthSelectProps): ReactElement {
    const { t }: UseTranslationResponse<'portfolioReview', undefined> = useTranslation('portfolioReview');
    const locale: SupportedLocale = useLocale();
    const navigate: UseNavigateResult<string> = useNavigate();
    const labelId: string = useId();
    const choices: readonly SelectChoice[] = items.map((item: MonthlyReviewList['items'][number]): SelectChoice => ({
        value: item.month,
        label: formatMonthYear(item.month, locale),
        warning: null
    }));
    return (
        <div className="flex min-w-48 flex-col gap-1">
            <span id={labelId} className="sr-only">
                {t('month.label')}
            </span>
            <SelectMenu
                value={value}
                choices={choices}
                placeholder={t('month.label')}
                ariaLabelledBy={labelId}
                onChange={(next: string): void => {
                    void navigate({
                        to: '.',
                        search: (previous: Record<string, unknown>): Record<string, unknown> => ({ ...previous, month: next }),
                        replace: true
                    });
                }}
            />
        </div>
    );
}
