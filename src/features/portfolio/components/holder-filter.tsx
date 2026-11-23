import type { ReactElement } from 'react';
import { useNavigate, type UseNavigateResult } from '@tanstack/react-router';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { track } from '@/shared/lib/analytics';
import { SegmentedControl, type SegmentedOption } from '@/shared/ui/segmented-control';
import { HOLDER_ALL, holderKind, type HolderParam, type PortfolioPerson } from '../lib/holder-filter';
import { usePeople, type PeopleState } from '../lib/people-context';
import { useHolderParam } from '../lib/use-holder-param';

const ANY: string = 'any';

export function HolderFilter(): ReactElement | null {
    const { t }: UseTranslationResponse<'portfolio', undefined> = useTranslation('portfolio');
    const { people, multi }: PeopleState = usePeople();
    const holder: HolderParam = useHolderParam();
    const navigate: UseNavigateResult<string> = useNavigate();
    if (!multi) {
        return null;
    }
    const options: readonly SegmentedOption<string>[] = [
        { value: ANY, label: t('holder.any') },
        { value: HOLDER_ALL, label: t('holder.all') },
        ...people.map((person: PortfolioPerson): SegmentedOption<string> => ({ value: person.userId, label: person.name }))
    ];
    const change = (next: string): void => {
        const value: HolderParam = next === ANY ? undefined : next;
        track('holder_filter_changed', { kind: holderKind(value) });
        void navigate({
            to: '.',
            search: (previous: Record<string, unknown>): Record<string, unknown> => ({ ...previous, holder: value }),
            replace: true
        });
    };
    return (
        <div className="max-w-full overflow-x-auto">
            <SegmentedControl label={t('holder.label')} options={options} value={holder ?? ANY} onChange={change} />
        </div>
    );
}
