import type { CSSProperties, ReactElement } from 'react';
import { cn } from '@/shared/lib/cn';
import { gaugePositions, type GaugePositions } from '../lib/gauge-positions';
import type { ClassColorKey } from '../types';

export interface GaugeProps {
    readonly shareBps: number;
    readonly targetBps: number;
    readonly colorKey: ClassColorKey;
}

export const GAUGE_FILLS: Readonly<Record<ClassColorKey, string>> = {
    c1: 'bg-class-1',
    c2: 'bg-class-2',
    c3: 'bg-class-3',
    c4: 'bg-class-4',
    c5: 'bg-class-5',
    c6: 'bg-class-6',
    c7: 'bg-class-7',
    c8: 'bg-class-8',
    c9: 'bg-class-9',
    c10: 'bg-class-10',
    c11: 'bg-class-11',
    c12: 'bg-class-12'
};

function percentStyle(value: number): string {
    return `${String(Math.min(100, Math.max(0, value)))}%`;
}

export function Gauge({ shareBps, targetBps, colorKey }: GaugeProps): ReactElement {
    const { fill, mark }: GaugePositions = gaugePositions(shareBps, targetBps);
    const fillStyle: CSSProperties = { width: percentStyle(fill) };
    const markStyle: CSSProperties = { left: `calc(${percentStyle(mark)} - 1px)` };
    return (
        <div aria-hidden="true" className="relative h-2.5 w-full min-w-20 overflow-hidden rounded-full bg-surface-muted">
            <div className={cn('h-full rounded-full', GAUGE_FILLS[colorKey])} style={fillStyle} />
            <div className="absolute inset-y-0 w-0.5 bg-content" style={markStyle} />
        </div>
    );
}
