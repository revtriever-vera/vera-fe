import type { ReactElement } from 'react';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { useHolderChoices } from '../../components/holder-select';
import { usePeople, type PeopleState } from '../../lib/people-context';
import { LabeledSelect } from './labeled-select';

export interface HolderFieldProps {
    readonly value: string;
    readonly onChange: (value: string) => void;
}

export function HolderField({ value, onChange }: HolderFieldProps): ReactElement | null {
    const { t }: UseTranslationResponse<'portfolio', undefined> = useTranslation('portfolio');
    const { multi }: PeopleState = usePeople();
    const choices: ReturnType<typeof useHolderChoices> = useHolderChoices();
    if (!multi) {
        return null;
    }
    return <LabeledSelect label={t('holder.field')} placeholder={t('holder.field')} value={value} choices={choices} onChange={onChange} />;
}
