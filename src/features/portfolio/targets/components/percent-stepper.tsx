import { useId, useState, type ChangeEvent, type ReactElement } from 'react';
import { Minus, Plus, type LucideIcon } from 'lucide-react';
import { useLocale } from '@/shared/lib/i18n';
import type { SupportedLocale } from '@/shared/lib/locale';
import { bpsToInput, parsePercentInput } from '../../lib/parse-percent-input';

export interface PercentStepperProps {
    readonly value: number;
    readonly onChange: (bps: number) => void;
    readonly onCommit?: (bps: number) => void;
    readonly stepBps: number;
    readonly minBps: number;
    readonly maxBps: number;
    readonly inputLabel: string;
    readonly decreaseLabel: string;
    readonly increaseLabel: string;
    readonly error?: string;
    readonly disabled?: boolean;
}

const BUTTON: string =
    'inline-flex size-9 items-center justify-center rounded-control border border-border bg-surface text-content transition-colors hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:pointer-events-none disabled:opacity-50';
const INPUT: string =
    'h-9 w-16 rounded-control border border-border bg-surface px-2 text-right text-sm tabular-nums text-content focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 aria-[invalid=true]:border-critical disabled:opacity-50';

interface Bounds {
    readonly minBps: number;
    readonly maxBps: number;
}

function parseWithin(text: string, locale: SupportedLocale, bounds: Bounds): number | null {
    const parsed: number | null = parsePercentInput(text, locale);
    return parsed !== null && parsed >= bounds.minBps && parsed <= bounds.maxBps ? parsed : null;
}

function displayOf(value: number, locale: SupportedLocale): string {
    return Number.isFinite(value) ? bpsToInput(value, locale) : '';
}

function shownText(draft: string | null, value: number, locale: SupportedLocale, bounds: Bounds): string {
    if (draft === null) {
        return displayOf(value, locale);
    }
    const typed: number | null = parseWithin(draft, locale, bounds);
    return !Number.isFinite(value) || typed === value ? draft : displayOf(value, locale);
}

interface StepButtonProps {
    readonly icon: LucideIcon;
    readonly label: string;
    readonly disabled: boolean;
    readonly onClick: () => void;
}

function StepButton({ icon: Icon, label, disabled, onClick }: StepButtonProps): ReactElement {
    return (
        <button type="button" className={BUTTON} aria-label={label} disabled={disabled} onClick={onClick}>
            <Icon className="size-4" aria-hidden="true" />
        </button>
    );
}

interface StepperHandlers {
    readonly shown: string;
    readonly base: number;
    readonly step: (direction: 1 | -1) => void;
    readonly edit: (event: ChangeEvent<HTMLInputElement>) => void;
    readonly blur: () => void;
}

function useStepperHandlers({ value, onChange, onCommit, stepBps, minBps, maxBps }: PercentStepperProps): StepperHandlers {
    const bounds: Bounds = { minBps, maxBps };
    const locale: SupportedLocale = useLocale();
    const [draft, setDraft] = useState<string | null>(null);
    const base: number = Number.isFinite(value) ? value : 0;
    return {
        shown: shownText(draft, value, locale, bounds),
        base,
        step: (direction: 1 | -1): void => {
            const next: number = Math.min(maxBps, Math.max(minBps, base + direction * stepBps));
            setDraft(null);
            onChange(next);
            onCommit?.(next);
        },
        edit: (event: ChangeEvent<HTMLInputElement>): void => {
            setDraft(event.target.value);
            onChange(parseWithin(event.target.value, locale, bounds) ?? Number.NaN);
        },
        blur: (): void => {
            const typed: number | null = draft === null ? null : parseWithin(draft, locale, bounds);
            if (typed !== null) {
                setDraft(null);
                onCommit?.(typed);
            }
        }
    };
}

interface StepperInputProps {
    readonly props: PercentStepperProps;
    readonly handlers: StepperHandlers;
    readonly errorId: string;
}

function StepperInput({ props, handlers, errorId }: StepperInputProps): ReactElement {
    return (
        <input
            type="text"
            inputMode="decimal"
            autoComplete="off"
            aria-label={props.inputLabel}
            aria-invalid={props.error === undefined ? undefined : true}
            aria-describedby={props.error === undefined ? undefined : errorId}
            className={INPUT}
            value={handlers.shown}
            disabled={props.disabled === true}
            onChange={handlers.edit}
            onBlur={handlers.blur}
        />
    );
}

export function PercentStepper(props: PercentStepperProps): ReactElement {
    const { error, disabled = false }: PercentStepperProps = props;
    const errorId: string = useId();
    const handlers: StepperHandlers = useStepperHandlers(props);
    return (
        <div className="flex flex-col items-end gap-1">
            <div className="inline-flex items-center gap-1.5">
                <StepButton
                    icon={Minus}
                    label={props.decreaseLabel}
                    disabled={disabled || handlers.base <= props.minBps}
                    onClick={(): void => {
                        handlers.step(-1);
                    }}
                />
                <StepperInput props={props} handlers={handlers} errorId={errorId} />
                <StepButton
                    icon={Plus}
                    label={props.increaseLabel}
                    disabled={disabled || handlers.base >= props.maxBps}
                    onClick={(): void => {
                        handlers.step(1);
                    }}
                />
            </div>
            {error === undefined ? null : (
                <p id={errorId} role="alert" className="text-2xs text-critical">
                    {error}
                </p>
            )}
        </div>
    );
}
