import { useId, useState, type ChangeEvent, type ReactElement, type ReactNode, type Ref } from 'react';
import { cn } from '@/shared/lib/cn';
import { currencySymbol, formatMoneyText, fractionDigitsOf, parseMoneyText, sanitizeMoneyText } from '@/shared/lib/format/money-input';
import type { SupportedLocale } from '@/shared/lib/locale';
import { useUiLocale } from './ui-text';

export interface MoneyInputProps {
    readonly label: string;
    readonly value: number | null;
    readonly currency: string;
    readonly onChange: (minor: number | null) => void;
    readonly onBlur?: () => void;
    readonly name?: string;
    readonly placeholder?: string;
    readonly error?: string;
    readonly hint?: ReactNode;
    readonly disabled?: boolean;
    readonly ref?: Ref<HTMLInputElement>;
}

function textOf(value: number | null, digits: number, locale: SupportedLocale): string {
    return value === null ? '' : formatMoneyText(value, digits, locale);
}

function useMoneyText(
    value: number | null,
    digits: number,
    locale: SupportedLocale
): { text: string; setText: (next: string) => void; showFormatted: () => void } {
    const [text, setText] = useState<string>(textOf(value, digits, locale));
    const [shown, setShown] = useState<number | null>(value);
    if (value !== shown) {
        setShown(value);
        if (value !== parseMoneyText(text, digits)) {
            setText(textOf(value, digits, locale));
        }
    }
    return {
        text,
        setText,
        showFormatted: (): void => {
            setText(textOf(parseMoneyText(text, digits), digits, locale));
        }
    };
}

function MessageLines({
    id,
    error,
    hint
}: {
    readonly id: string;
    readonly error: string | undefined;
    readonly hint: ReactNode;
}): ReactElement {
    return (
        <>
            {hint && !error ? <p className="text-2xs text-content-subtle">{hint}</p> : null}
            {error ? (
                <p id={id} role="alert" className="text-2xs text-critical">
                    {error}
                </p>
            ) : null}
        </>
    );
}

function boxClass(error: string | undefined, disabled: boolean | undefined): string {
    return cn(
        'flex h-10 items-center gap-2 rounded-control border border-border bg-surface px-3 text-sm text-content',
        'focus-within:border-accent focus-within:ring-2 focus-within:ring-accent/20',
        error && 'border-critical focus-within:border-critical focus-within:ring-critical/20',
        disabled && 'opacity-60'
    );
}

interface MoneyBoxProps extends Pick<MoneyInputProps, 'currency' | 'name' | 'placeholder' | 'disabled' | 'ref' | 'onChange' | 'onBlur'> {
    readonly id: string;
    readonly error: string | undefined;
    readonly value: number | null;
}

function MoneyBox({ id, currency, name, placeholder, disabled, ref, error, value, onChange, onBlur }: MoneyBoxProps): ReactElement {
    const locale: SupportedLocale = useUiLocale();
    const digits: number = fractionDigitsOf(currency, locale);
    const { text, setText, showFormatted } = useMoneyText(value, digits, locale);
    return (
        <div className={boxClass(error, disabled)}>
            <span aria-hidden="true" className="text-content-subtle">
                {currencySymbol(currency, locale)}
            </span>
            <input
                id={id}
                ref={ref}
                name={name}
                type="text"
                inputMode="decimal"
                autoComplete="off"
                disabled={disabled}
                placeholder={placeholder}
                value={text}
                aria-invalid={error ? true : undefined}
                aria-describedby={error ? `${id}-error` : undefined}
                className="numeric h-full min-w-0 flex-1 bg-transparent outline-none placeholder:text-content-subtle"
                onChange={(event: ChangeEvent<HTMLInputElement>): void => {
                    const next: string = sanitizeMoneyText(event.target.value);
                    setText(next);
                    onChange(parseMoneyText(next, digits));
                }}
                onBlur={(): void => {
                    showFormatted();
                    onBlur?.();
                }}
            />
        </div>
    );
}

export function MoneyInput({ label, hint, error, ...box }: MoneyInputProps): ReactElement {
    const id: string = useId();
    return (
        <div className="flex flex-col gap-1.5">
            <label htmlFor={id} className="text-sm font-medium text-content">
                {label}
            </label>
            <MoneyBox id={id} error={error} {...box} />
            <MessageLines id={`${id}-error`} error={error} hint={hint} />
        </div>
    );
}
