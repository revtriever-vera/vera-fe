import { Check } from 'lucide-react';
import type { ReactElement } from 'react';
import { cn } from '@/shared/lib/cn';

export interface StepperStep {
    readonly label: string;
}

export interface StepperProps {
    readonly label: string;
    readonly steps: readonly StepperStep[];
    readonly activeIndex: number;
}

function markClass(status: 'done' | 'active' | 'pending'): string {
    if (status === 'done') {
        return 'bg-accent-strong text-accent-contrast';
    }
    if (status === 'active') {
        return 'border-2 border-accent text-accent-strong';
    }
    return 'border border-border text-content-subtle';
}

function statusOf(index: number, activeIndex: number): 'done' | 'active' | 'pending' {
    if (index < activeIndex) {
        return 'done';
    }
    if (index === activeIndex) {
        return 'active';
    }
    return 'pending';
}

export function Stepper({ label, steps, activeIndex }: StepperProps): ReactElement {
    return (
        <ol aria-label={label} className="flex w-full items-center">
            {steps.map((step: StepperStep, index: number): ReactElement => {
                const status: 'done' | 'active' | 'pending' = statusOf(index, activeIndex);
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
                                {status === 'done' ? <Check className="h-3.5 w-3.5" aria-hidden /> : index + 1}
                            </span>
                            <span className="text-2xs text-content-muted">{step.label}</span>
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
