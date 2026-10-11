import { Check } from 'lucide-react';
import type { ReactElement, ReactNode } from 'react';
import { cn } from '@/shared/lib/cn';

export interface StepperStep {
    readonly label: string;
    readonly skipped?: boolean;
}

export interface StepperProps {
    readonly label: string;
    readonly steps: readonly StepperStep[];
    readonly activeIndex: number;
}

type StepStatus = 'done' | 'active' | 'pending' | 'skipped';

function markClass(status: StepStatus): string {
    if (status === 'skipped') {
        return 'border border-border bg-surface-muted text-content-muted';
    }
    if (status === 'done') {
        return 'bg-accent-strong text-accent-contrast';
    }
    if (status === 'active') {
        return 'border-2 border-accent text-accent-strong';
    }
    return 'border border-border text-content-subtle';
}

function statusOf(index: number, activeIndex: number, skipped: boolean | undefined): StepStatus {
    if (index !== activeIndex && skipped === true) {
        return 'skipped';
    }
    if (index < activeIndex) {
        return 'done';
    }
    if (index === activeIndex) {
        return 'active';
    }
    return 'pending';
}

function markOf(status: StepStatus, index: number): ReactNode {
    if (status === 'done') {
        return <Check className="h-3.5 w-3.5" aria-hidden />;
    }
    return status === 'skipped' ? <span aria-hidden>–</span> : index + 1;
}

export function Stepper({ label, steps, activeIndex }: StepperProps): ReactElement {
    return (
        <ol aria-label={label} className="flex w-full items-center">
            {steps.map((step: StepperStep, index: number): ReactElement => {
                const status: StepStatus = statusOf(index, activeIndex, step.skipped);
                return (
                    <li key={step.label} className="flex flex-1 items-center last:flex-none">
                        <div className="flex flex-col items-center gap-1">
                            <span
                                aria-current={status === 'active' ? 'step' : undefined}
                                className={cn(
                                    'grid h-7 w-7 shrink-0 place-items-center rounded-full text-xs font-semibold',
                                    markClass(status)
                                )}
                            >
                                {markOf(status, index)}
                            </span>
                            <span className={cn('text-2xs text-content-muted', status === 'skipped' && 'line-through')}>{step.label}</span>
                        </div>
                        {index === steps.length - 1 ? null : (
                            <span className={cn('mx-2 h-px flex-1', status === 'done' ? 'bg-accent' : 'bg-border')} />
                        )}
                    </li>
                );
            })}
        </ol>
    );
}
