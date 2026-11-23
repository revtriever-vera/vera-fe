import type { ReactElement } from 'react';
import { cn } from '@/shared/lib/cn';

export interface SwitchProps {
    readonly checked: boolean;
    readonly onCheckedChange: (next: boolean) => void;
    readonly label: string;
    readonly disabled?: boolean;
    readonly busy?: boolean;
}

export function Switch({ checked, onCheckedChange, label, disabled = false, busy = false }: SwitchProps): ReactElement {
    return (
        <button
            type="button"
            role="switch"
            aria-checked={checked}
            aria-label={label}
            aria-busy={busy}
            disabled={disabled || busy}
            onClick={(): void => {
                onCheckedChange(!checked);
            }}
            className={cn(
                'relative inline-flex h-6 w-11 shrink-0 items-center rounded-full border border-transparent transition-colors disabled:cursor-not-allowed disabled:opacity-50',
                checked ? 'bg-accent-strong' : 'bg-border-strong'
            )}
        >
            <span
                aria-hidden="true"
                className={cn(
                    'inline-block size-5 rounded-full bg-surface shadow-control transition-transform motion-reduce:transition-none',
                    checked ? 'translate-x-5' : 'translate-x-0.5'
                )}
            />
        </button>
    );
}
