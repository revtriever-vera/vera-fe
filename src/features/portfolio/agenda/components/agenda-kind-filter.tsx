import type { ReactElement } from 'react';
import { useNavigate, type UseNavigateResult } from '@tanstack/react-router';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { SegmentedControl, type SegmentedOption } from '@/shared/ui/segmented-control';
import { AGENDA_FILTERS, type AgendaFilter } from '../types';

const ALL: string = 'all';

export function AgendaKindFilter({ value }: { readonly value: AgendaFilter | undefined }): ReactElement {
    const { t }: UseTranslationResponse<'portfolioAgenda', undefined> = useTranslation('portfolioAgenda');
    const navigate: UseNavigateResult<string> = useNavigate();
    const options: readonly SegmentedOption<string>[] = [
        { value: ALL, label: t('filter.all') },
        ...AGENDA_FILTERS.map((filter: AgendaFilter): SegmentedOption<string> => ({ value: filter, label: t(`filter.${filter}`) }))
    ];
    const change = (next: string): void => {
        void navigate({
            to: '.',
            search: (previous: Record<string, unknown>): Record<string, unknown> => ({
                ...previous,
                kind: next === ALL ? undefined : next
            }),
            replace: true
        });
    };
    return (
        <div className="max-w-full overflow-x-auto">
            <SegmentedControl label={t('filter.label')} options={options} value={value ?? ALL} onChange={change} />
        </div>
    );
}
