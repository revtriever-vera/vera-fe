import { useId, type ReactElement } from 'react';
import { SelectMenu, type SelectChoice } from '@/shared/ui/select-menu';

export interface OptionSelectProps<Value extends string> {
    readonly label: string;
    readonly value: Value;
    readonly values: readonly Value[];
    readonly optionLabel: (value: Value) => string;
    readonly onChange: (value: Value) => void;
}

export function OptionSelect<Value extends string>({
    label,
    value,
    values,
    optionLabel,
    onChange
}: OptionSelectProps<Value>): ReactElement {
    const labelId: string = useId();
    const choices: readonly SelectChoice[] = values.map((item: Value): SelectChoice => ({
        value: item,
        label: optionLabel(item),
        warning: null
    }));
    return (
        <div className="flex flex-col gap-1.5">
            <span id={labelId} className="text-sm font-medium text-content">
                {label}
            </span>
            <SelectMenu
                value={value}
                choices={choices}
                placeholder={label}
                ariaLabelledBy={labelId}
                onChange={(next: string): void => {
                    const match: Value | undefined = values.find((item: Value): boolean => item === next);
                    if (match !== undefined) {
                        onChange(match);
                    }
                }}
            />
        </div>
    );
}
