import type { ReactElement, ReactNode } from 'react';
import { cn } from '@/shared/lib/cn';
import { RichBalloon } from '@/shared/ui/tooltip';

export interface BarTrackProps {
    readonly label: string;
    readonly fillClass: string;
    readonly valuePercent: number;
    readonly averagePercent: number | null;
    readonly tooltip: ReactNode;
}

function percent(value: number): string {
    return `${String(value)}%`;
}

export function BarTrack({ label, fillClass, valuePercent, averagePercent, tooltip }: BarTrackProps): ReactElement {
    return (
        <RichBalloon content={tooltip}>
            <button type="button" aria-label={label} className="relative block h-3 w-full rounded-full bg-surface-muted">
                <span
                    aria-hidden="true"
                    className={cn('absolute inset-y-0 left-0 rounded-full', fillClass)}
                    style={{ width: percent(valuePercent) }}
                />
                {averagePercent === null ? null : (
                    <span
                        aria-hidden="true"
                        className="absolute -inset-y-0.5 -ml-px w-0.5 rounded-full bg-content"
                        style={{ left: percent(averagePercent) }}
                    />
                )}
            </button>
        </RichBalloon>
    );
}
