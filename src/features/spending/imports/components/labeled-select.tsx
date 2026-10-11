import { useId, type ReactElement } from 'react';
import { SelectMenu, type SelectChoice } from '@/shared/ui/select-menu';

export interface LabeledSelectProps {
    readonly label: string;
    readonly value: string;
    readonly choices: readonly SelectChoice[];
    readonly placeholder: string;
    readonly error?: string;
    readonly note?: string | null;
    readonly onChange: (value: string) => void;
}

export function LabeledSelect({ label, value, choices, placeholder, error, note, onChange }: LabeledSelectProps): ReactElement {
    const labelId: string = useId();
    return (
        <div className="flex flex-col gap-1.5">
            <span id={labelId} className="text-sm font-medium text-content">
                {label}
            </span>
            <SelectMenu
                value={value}
                choices={choices}
                placeholder={placeholder}
                ariaLabelledBy={labelId}
                invalid={error !== undefined}
                onChange={onChange}
            />
            {note === undefined || note === null ? null : <p className="text-2xs text-content-subtle">{note}</p>}
            {error === undefined ? null : (
                <p role="alert" className="text-2xs text-critical">
                    {error}
                </p>
            )}
        </div>
    );
}
