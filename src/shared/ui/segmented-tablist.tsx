import { useRef, type KeyboardEvent, type ReactElement, type RefObject } from 'react';
import { cn } from '@/shared/lib/cn';
import type { SegmentedControlProps, SegmentedOption } from './segmented-control';

const TAB: string =
    'min-w-12 rounded-control px-3 py-1 text-sm font-semibold text-content-muted transition hover:text-content focus-visible:ring-2 focus-visible:ring-accent/30 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-60 aria-selected:bg-surface aria-selected:text-content aria-selected:shadow-card';

const STEP_BY_KEY: Readonly<Record<string, number>> = { ArrowRight: 1, ArrowLeft: -1 };

export type SegmentedTablistProps<T extends string> = Omit<SegmentedControlProps<T>, 'mode'>;

export function tabId(prefix: string, value: string): string {
    return `${prefix}-tab-${value}`;
}

export function panelId(prefix: string): string {
    return `${prefix}-panel`;
}

function nextIndex(key: string, current: number, count: number): number | null {
    if (key === 'Home') {
        return 0;
    }
    if (key === 'End') {
        return count - 1;
    }
    const step: number | undefined = STEP_BY_KEY[key];
    return step === undefined ? null : (current + step + count) % count;
}

interface TabButtonProps<T extends string> {
    readonly option: SegmentedOption<T>;
    readonly selected: boolean;
    readonly disabled: boolean;
    readonly idPrefix: string;
    readonly register: (value: string, node: HTMLButtonElement | null) => void;
    readonly onSelect: (value: T) => void;
    readonly onKeyDown: (event: KeyboardEvent<HTMLButtonElement>) => void;
}

function TabButton<T extends string>({ option, selected, disabled, idPrefix, register, onSelect, onKeyDown }: TabButtonProps<T>): ReactElement {
    return (
        <button
            ref={(node: HTMLButtonElement | null): void => {
                register(option.value, node);
            }}
            id={tabId(idPrefix, option.value)}
            type="button"
            role="tab"
            aria-selected={selected}
            aria-controls={panelId(idPrefix)}
            tabIndex={selected ? 0 : -1}
            disabled={disabled}
            className={TAB}
            onClick={(): void => {
                if (!selected) {
                    onSelect(option.value);
                }
            }}
            onKeyDown={onKeyDown}
        >
            {option.label}
        </button>
    );
}

export function SegmentedTablist<T extends string>({
    label,
    options,
    value,
    onChange,
    disabled = false,
    busy = false,
    className,
    idPrefix = 'tabs'
}: SegmentedTablistProps<T>): ReactElement {
    const refs: RefObject<Map<string, HTMLButtonElement>> = useRef(new Map<string, HTMLButtonElement>());
    const register = (key: string, node: HTMLButtonElement | null): void => {
        if (node === null) {
            refs.current.delete(key);
            return;
        }
        refs.current.set(key, node);
    };
    const move = (event: KeyboardEvent<HTMLButtonElement>, index: number): void => {
        const target: number | null = nextIndex(event.key, index, options.length);
        const option: SegmentedOption<T> | undefined = target === null ? undefined : options[target];
        if (option === undefined) {
            return;
        }
        event.preventDefault();
        refs.current.get(option.value)?.focus();
        onChange(option.value);
    };
    return (
        <div
            role="tablist"
            aria-label={label}
            aria-busy={busy}
            className={cn('inline-flex gap-1 rounded-control border border-border bg-surface-muted p-1', className)}
        >
            {options.map((option: SegmentedOption<T>, index: number): ReactElement => (
                <TabButton
                    key={option.value}
                    option={option}
                    selected={option.value === value}
                    disabled={disabled}
                    idPrefix={idPrefix}
                    register={register}
                    onSelect={onChange}
                    onKeyDown={(event: KeyboardEvent<HTMLButtonElement>): void => {
                        move(event, index);
                    }}
                />
            ))}
        </div>
    );
}
