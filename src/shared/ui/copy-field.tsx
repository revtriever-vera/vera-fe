import { Check, Copy } from 'lucide-react';
import { useState, type ReactElement } from 'react';
import { cn } from '@/shared/lib/cn';
import { type UiText, useUiText } from './ui-text';

const COPIED_RESET_MS: number = 2000;

export interface CopyFieldProps {
    readonly value: string;
    readonly copyLabel: string;
    readonly className?: string;
}

export function CopyField({ value, copyLabel, className }: CopyFieldProps): ReactElement {
    const t: UiText = useUiText();
    const [copied, setCopied] = useState<boolean>(false);

    const copy = async (): Promise<void> => {
        await navigator.clipboard.writeText(value);
        setCopied(true);
        window.setTimeout((): void => {
            setCopied(false);
        }, COPIED_RESET_MS);
    };

    const label: string = copied ? t.copied : copyLabel;

    return (
        <div className={cn('flex items-stretch gap-1.5', className)}>
            <code className="block flex-1 overflow-x-auto rounded-control border border-border bg-surface-muted px-3 py-2 font-mono text-2xs text-content">
                {value}
            </code>
            <button
                type="button"
                onClick={(): void => {
                    void copy();
                }}
                aria-label={label}
                title={label}
                className="flex w-9 shrink-0 items-center justify-center rounded-control border border-border bg-surface text-content-muted transition-colors hover:bg-surface-muted"
            >
                {copied ? <Check className="h-4 w-4 text-positive" /> : <Copy className="h-4 w-4" />}
            </button>
        </div>
    );
}
