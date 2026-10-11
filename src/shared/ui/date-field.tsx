import { useState, type ChangeEvent, type ReactElement } from 'react';
import * as Popover from '@radix-ui/react-popover';
import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/shared/lib/cn';
import {
    isoFromMasked,
    isoOf,
    isWithin,
    longDateOf,
    maskDate,
    maskedFromIso,
    monthGridOf,
    monthLabelOf,
    partsOf,
    shiftMonth,
    weekdayInitials,
    type CalendarDay,
    type CalendarMonth
} from '@/shared/lib/calendar-grid';
import type { SupportedLocale } from '@/shared/lib/locale';
import { type UiText, useUiText, useUiLocale } from './ui-text';

export interface DateFieldProps {
    readonly label: string;
    readonly value: string | null;
    readonly min?: string | null;
    readonly max?: string | null;
    readonly disabled?: boolean;
    readonly onChange: (iso: string | null) => void;
}

const INPUT: string =
    'h-10 w-full rounded-control border border-border bg-surface pl-3 pr-9 text-sm text-content placeholder:text-content-subtle focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20';

const DAY: string = 'grid h-8 w-8 place-items-center rounded-control text-sm transition';

function todayIso(): string {
    const now: Date = new Date();
    return isoOf(now.getFullYear(), now.getMonth(), now.getDate());
}

function monthOf(value: string | null, max: string | null): CalendarMonth {
    const anchor: string = value ?? max ?? todayIso();
    const { year, month }: { year: number; month: number } = partsOf(anchor);
    return { year, month };
}

interface CalendarProps {
    readonly value: string | null;
    readonly min: string | null;
    readonly max: string | null;
    readonly locale: SupportedLocale;
    readonly onPick: (iso: string) => void;
}

function CalendarHeaderButton({
    icon: Icon,
    ariaLabel,
    onShift
}: {
    readonly icon: typeof ChevronLeft;
    readonly ariaLabel: string;
    readonly onShift: () => void;
}): ReactElement {
    return (
        <button
            type="button"
            aria-label={ariaLabel}
            className="grid h-7 w-7 place-items-center rounded-control text-content-muted hover:bg-surface-muted hover:text-content"
            onClick={onShift}
        >
            <Icon className="h-4 w-4" aria-hidden />
        </button>
    );
}

function CalendarHeader({
    visible,
    locale,
    previousLabel,
    nextLabel,
    onShift
}: {
    readonly visible: CalendarMonth;
    readonly locale: SupportedLocale;
    readonly previousLabel: string;
    readonly nextLabel: string;
    readonly onShift: (delta: number) => void;
}): ReactElement {
    return (
        <div className="flex items-center justify-between">
            <CalendarHeaderButton
                icon={ChevronLeft}
                ariaLabel={previousLabel}
                onShift={(): void => {
                    onShift(-1);
                }}
            />
            <span aria-live="polite" className="text-sm font-medium text-content first-letter:uppercase">
                {monthLabelOf(visible, locale)}
            </span>
            <CalendarHeaderButton
                icon={ChevronRight}
                ariaLabel={nextLabel}
                onShift={(): void => {
                    onShift(1);
                }}
            />
        </div>
    );
}

function CalendarWeekdays({ locale }: { readonly locale: SupportedLocale }): ReactElement {
    return (
        <div className="grid grid-cols-7 gap-y-1 text-center text-2xs text-content-subtle">
            {weekdayInitials(locale).map((initial: string, index: number): ReactElement => (
                <span key={`${initial}-${String(index)}`}>{initial}</span>
            ))}
        </div>
    );
}

function CalendarDayCell({
    cell,
    allowed,
    today,
    value,
    locale,
    onPick
}: {
    readonly cell: CalendarDay;
    readonly allowed: boolean;
    readonly today: string;
    readonly value: string | null;
    readonly locale: SupportedLocale;
    readonly onPick: (iso: string) => void;
}): ReactElement {
    return (
        <button
            key={cell.iso}
            type="button"
            disabled={!allowed}
            aria-label={longDateOf(cell.iso, locale)}
            aria-current={cell.iso === today ? 'date' : undefined}
            aria-pressed={cell.iso === value}
            className={cn(
                DAY,
                !cell.inMonth && 'text-content-subtle',
                allowed ? 'hover:bg-surface-muted' : 'cursor-not-allowed opacity-30',
                cell.iso === today && cell.iso !== value && 'font-semibold text-accent-strong',
                cell.iso === value && 'bg-accent-strong font-medium text-accent-contrast'
            )}
            onClick={(): void => {
                onPick(cell.iso);
            }}
        >
            {cell.day}
        </button>
    );
}

function CalendarDayGrid({
    visible,
    min,
    max,
    value,
    locale,
    today,
    onPick
}: {
    readonly visible: CalendarMonth;
    readonly min: string | null;
    readonly max: string | null;
    readonly value: string | null;
    readonly locale: SupportedLocale;
    readonly today: string;
    readonly onPick: (iso: string) => void;
}): ReactElement {
    return (
        <div className="grid grid-cols-7 gap-y-1 justify-items-center">
            {monthGridOf(visible).map((cell: CalendarDay): ReactElement => (
                <CalendarDayCell
                    key={cell.iso}
                    cell={cell}
                    allowed={isWithin(cell.iso, min, max)}
                    today={today}
                    value={value}
                    locale={locale}
                    onPick={onPick}
                />
            ))}
        </div>
    );
}

function Calendar({ value, min, max, locale, onPick }: CalendarProps): ReactElement {
    const t: UiText = useUiText();
    const [visible, setVisible] = useState<CalendarMonth>(monthOf(value, max));
    const today: string = todayIso();

    return (
        <div className="flex w-64 flex-col gap-2">
            <CalendarHeader
                visible={visible}
                locale={locale}
                previousLabel={t.previousMonth}
                nextLabel={t.nextMonth}
                onShift={(delta: number): void => {
                    setVisible(shiftMonth(visible, delta));
                }}
            />
            <CalendarWeekdays locale={locale} />
            <CalendarDayGrid visible={visible} min={min} max={max} value={value} locale={locale} today={today} onPick={onPick} />
        </div>
    );
}

function DateFieldCalendarTrigger({ ariaLabel, disabled }: { readonly ariaLabel: string; readonly disabled: boolean }): ReactElement {
    return (
        <Popover.Trigger asChild>
            <button
                type="button"
                aria-label={ariaLabel}
                disabled={disabled}
                className="absolute inset-y-0 right-0 grid w-9 place-items-center text-content-subtle transition hover:text-content"
            >
                <CalendarDays className="h-4 w-4" aria-hidden />
            </button>
        </Popover.Trigger>
    );
}

function DateFieldInputField({
    ariaLabel,
    placeholder,
    invalid,
    disabled,
    text,
    onType
}: {
    readonly ariaLabel: string;
    readonly placeholder: string;
    readonly invalid: boolean;
    readonly disabled: boolean;
    readonly text: string;
    readonly onType: (event: ChangeEvent<HTMLInputElement>) => void;
}): ReactElement {
    return (
        <input
            type="text"
            inputMode="numeric"
            placeholder={placeholder}
            aria-label={ariaLabel}
            aria-invalid={invalid}
            disabled={disabled}
            className={cn(INPUT, invalid && 'border-critical focus:border-critical focus:ring-critical/20')}
            value={text}
            onChange={onType}
        />
    );
}

function buildTypeHandler(
    onChange: (iso: string | null) => void,
    min: string | null,
    max: string | null,
    setText: (text: string) => void
): (event: ChangeEvent<HTMLInputElement>) => void {
    return (event: ChangeEvent<HTMLInputElement>): void => {
        const masked: string = maskDate(event.target.value);
        setText(masked);
        const iso: string | null = isoFromMasked(masked);
        if (masked === '') {
            onChange(null);
            return;
        }
        if (iso !== null && isWithin(iso, min, max)) {
            onChange(iso);
        }
    };
}

function DateFieldCalendarPanel({
    value,
    min,
    max,
    locale,
    onPick
}: {
    readonly value: string | null;
    readonly min: string | null;
    readonly max: string | null;
    readonly locale: SupportedLocale;
    readonly onPick: (iso: string) => void;
}): ReactElement {
    return (
        <Popover.Portal>
            <Popover.Content align="end" sideOffset={6} className="z-50 rounded-card border border-border bg-surface p-3 shadow-popover">
                <Calendar value={value} min={min} max={max} locale={locale} onPick={onPick} />
            </Popover.Content>
        </Popover.Portal>
    );
}

function DateFieldInputSlot({
    label,
    placeholder,
    invalid,
    disabled,
    text,
    onType,
    triggerAriaLabel
}: {
    readonly label: string;
    readonly placeholder: string;
    readonly invalid: boolean;
    readonly disabled: boolean;
    readonly text: string;
    readonly onType: (event: ChangeEvent<HTMLInputElement>) => void;
    readonly triggerAriaLabel: string;
}): ReactElement {
    return (
        <div className="relative">
            <DateFieldInputField
                ariaLabel={label}
                placeholder={placeholder}
                invalid={invalid}
                disabled={disabled}
                text={text}
                onType={onType}
            />
            <DateFieldCalendarTrigger ariaLabel={triggerAriaLabel} disabled={disabled} />
        </div>
    );
}

function useDateFieldState(value: string | null): { text: string; setText: (next: string) => void } {
    const [text, setText] = useState<string>(maskedFromIso(value));
    const [shown, setShown] = useState<string | null>(value);

    if (value !== shown) {
        setShown(value);
        setText(maskedFromIso(value));
    }

    return { text, setText };
}

export function DateField({ label, value, min = null, max = null, disabled = false, onChange }: DateFieldProps): ReactElement {
    const t: UiText = useUiText();
    const locale: SupportedLocale = useUiLocale();
    const { text, setText } = useDateFieldState(value);
    const [open, setOpen] = useState<boolean>(false);

    const type: (event: ChangeEvent<HTMLInputElement>) => void = buildTypeHandler(onChange, min, max, setText);
    const invalid: boolean = text.length > 0 && isoFromMasked(text) === null;
    const triggerAriaLabel: string = t.openCalendarFor(label.toLowerCase());

    return (
        <label className="flex flex-col gap-1 text-xs text-content-muted">
            {label}
            <Popover.Root open={open} onOpenChange={setOpen}>
                <DateFieldInputSlot
                    label={label}
                    placeholder={t.datePlaceholder}
                    invalid={invalid}
                    disabled={disabled}
                    text={text}
                    onType={type}
                    triggerAriaLabel={triggerAriaLabel}
                />
                <DateFieldCalendarPanel
                    value={value}
                    min={min}
                    max={max}
                    locale={locale}
                    onPick={(iso: string): void => {
                        onChange(iso);
                        setOpen(false);
                    }}
                />
            </Popover.Root>
        </label>
    );
}
