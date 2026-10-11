import { useId, type ReactElement } from 'react';
import { SelectMenu, type SelectChoice } from '@/shared/ui/select-menu';

export interface LabeledSelectProps {
    readonly label: string;
    readonly placeholder: string;
    readonly value: string;
    readonly choices: readonly SelectChoice[];
    readonly error?: string;
    readonly hint?: string;
    readonly onChange: (value: string) => void;
}

export function LabeledSelect({ label, placeholder, value, choices, error, hint, onChange }: LabeledSelectProps): ReactElement {
    const labelId: string = useId();
    const messageId: string = useId();
    const hasError: boolean = Boolean(error);
    const hasHint: boolean = Boolean(hint) && !hasError;
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
                ariaDescribedBy={hasError || hasHint ? messageId : undefined}
                invalid={hasError}
                onChange={onChange}
            />
            {hasHint ? (
                <p id={messageId} className="text-2xs text-content-subtle">
                    {hint}
                </p>
            ) : null}
            {error ? (
                <p id={messageId} role="alert" className="text-2xs text-critical">
                    {error}
                </p>
            ) : null}
        </div>
    );
}
