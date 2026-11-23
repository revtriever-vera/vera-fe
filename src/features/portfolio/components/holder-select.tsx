import { useId, type ReactElement, type ReactNode } from 'react';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { SelectMenu, type SelectChoice } from '@/shared/ui/select-menu';
import { HOLDER_ALL, type PortfolioPerson } from '../lib/holder-filter';
import { usePeople, type PeopleState } from '../lib/people-context';

export interface HolderSelectProps {
    readonly value: string;
    readonly label: string;
    readonly disabled?: boolean;
    readonly leading?: ReactNode;
    readonly onChange: (value: string) => void;
}

export function useHolderChoices(): readonly SelectChoice[] {
    const { t }: UseTranslationResponse<'portfolio', undefined> = useTranslation('portfolio');
    const { people }: PeopleState = usePeople();
    return [
        { value: HOLDER_ALL, label: t('holder.all'), warning: null },
        ...people.map((person: PortfolioPerson): SelectChoice => ({ value: person.userId, label: person.name, warning: null }))
    ];
}

export function HolderSelect({ value, label, disabled = false, leading, onChange }: HolderSelectProps): ReactElement {
    const labelId: string = useId();
    const choices: readonly SelectChoice[] = useHolderChoices();
    return (
        <div className="min-w-0">
            <span id={labelId} className="sr-only">
                {label}
            </span>
            <SelectMenu
                value={value}
                choices={choices}
                placeholder={label}
                ariaLabelledBy={labelId}
                disabled={disabled}
                leading={leading}
                showCheck={false}
                onChange={onChange}
            />
        </div>
    );
}
