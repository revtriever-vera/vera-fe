import type { ReactElement, ReactNode } from 'react';

export interface ValueTodayProps {
    readonly label: string;
    readonly value: string;
    readonly legend: ReactNode;
}

export function ValueToday({ label, value, legend }: ValueTodayProps): ReactElement {
    return (
        <div className="flex flex-col gap-1 rounded-card bg-surface-muted p-4" aria-live="polite">
            <span className="text-xs font-medium text-content-muted">{label}</span>
            <span className="numeric text-3xl font-bold tracking-tight text-content">{value}</span>
            <span className="text-xs text-content-muted">{legend}</span>
        </div>
    );
}
