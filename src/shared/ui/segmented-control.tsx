import type { ReactElement } from 'react';
import * as ToggleGroup from '@radix-ui/react-toggle-group';
import { cn } from '@/shared/lib/cn';

export interface SegmentedOption<T extends string> {
    readonly value: T;
    readonly label: string;
}

export interface SegmentedControlProps<T extends string> {
    readonly label: string;
    readonly options: readonly SegmentedOption<T>[];
    readonly value: T;
    readonly onChange: (value: T) => void;
    readonly disabled?: boolean;
    readonly busy?: boolean;
    readonly className?: string;
}

const ITEM: string =
    'min-w-12 rounded-control px-3 py-1 text-sm font-semibold text-content-muted transition hover:text-content disabled:cursor-not-allowed disabled:opacity-60 data-[state=on]:bg-surface data-[state=on]:text-content data-[state=on]:shadow-card';

export function SegmentedControl<T extends string>({
    label,
    options,
    value,
    onChange,
    disabled = false,
    busy = false,
    className
}: SegmentedControlProps<T>): ReactElement {
    const select = (next: string): void => {
        const match: SegmentedOption<T> | undefined = options.find((option: SegmentedOption<T>): boolean => option.value === next);
        if (match !== undefined && match.value !== value) {
            onChange(match.value);
        }
    };
    return (
        <ToggleGroup.Root
            type="single"
            value={value}
            onValueChange={select}
            disabled={disabled}
            aria-label={label}
            aria-busy={busy}
            className={cn('inline-flex gap-1 rounded-control border border-border bg-surface-muted p-1', className)}
        >
            {options.map((option: SegmentedOption<T>): ReactElement => (
                <ToggleGroup.Item key={option.value} value={option.value} className={ITEM}>
                    {option.label}
                </ToggleGroup.Item>
            ))}
        </ToggleGroup.Root>
    );
}
