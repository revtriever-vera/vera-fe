import type { ReactElement } from 'react';
import type { InputHTMLAttributes, ReactNode } from 'react';
import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { cn } from '@/shared/lib/cn';
import { type UiText, useUiText } from './ui-text';

export interface FieldProps extends InputHTMLAttributes<HTMLInputElement> {
    readonly label: string;
    readonly error?: string;
    readonly hint?: ReactNode;
}

interface RevealToggleProps {
    readonly revealed: boolean;
    readonly onToggle: () => void;
}

function RevealToggle({ revealed, onToggle }: RevealToggleProps): ReactElement {
    const t: UiText = useUiText();
    return (
        <button
            type="button"
            aria-label={revealed ? t.hidePassword : t.showPassword}
            aria-pressed={revealed}
            onClick={onToggle}
            className="absolute inset-y-0 right-0 flex w-10 items-center justify-center text-content-subtle transition hover:text-content"
        >
            {revealed ? <EyeOff className="h-4 w-4" aria-hidden="true" /> : <Eye className="h-4 w-4" aria-hidden="true" />}
        </button>
    );
}

function inputClass(isPassword: boolean, error: string | undefined, className: string | undefined): string {
    return cn(
        'h-10 w-full rounded-control border border-border bg-surface px-3 text-sm text-content placeholder:text-content-subtle',
        'focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20',
        isPassword && 'pr-10',
        error && 'border-critical focus:border-critical focus:ring-critical/20',
        className
    );
}

export function Field({ label, error, hint, id, className, type, ...props }: FieldProps): ReactElement {
    const inputId: string = id ?? props.name ?? label;
    const errorId: string = `${inputId}-error`;
    const [revealed, setRevealed] = useState<boolean>(false);
    const isPassword: boolean = type === 'password';
    const inputType: FieldProps['type'] = revealed ? 'text' : type;
    return (
        <div className="flex flex-col gap-1.5">
            <label htmlFor={inputId} className="text-sm font-medium text-content">
                {label}
            </label>
            <div className="relative">
                <input
                    id={inputId}
                    type={inputType}
                    aria-invalid={error ? true : undefined}
                    aria-describedby={error ? errorId : undefined}
                    className={inputClass(isPassword, error, className)}
                    {...props}
                />
                {isPassword && (
                    <RevealToggle
                        revealed={revealed}
                        onToggle={(): void => {
                            setRevealed((current: boolean): boolean => !current);
                        }}
                    />
                )}
            </div>
            {hint && !error && <p className="text-2xs text-content-subtle">{hint}</p>}
            {error && (
                <p id={errorId} role="alert" className="text-2xs text-critical">
                    {error}
                </p>
            )}
        </div>
    );
}
