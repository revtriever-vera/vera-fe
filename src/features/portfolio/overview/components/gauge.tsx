import type { ReactElement } from 'react';
import { cn } from '@/shared/lib/cn';
import type { ClassColorKey } from '../../types';
import { CLASS_BAR_COLORS } from '../lib/class-bar-color';
import { percentStyle } from '../lib/percent-style';
import { gaugePositions, type GaugePositions } from '../lib/gauge-positions';

export interface GaugeProps {
    readonly shareBps: number;
    readonly targetBps: number;
    readonly colorKey: ClassColorKey;
}

export function Gauge({ shareBps, targetBps, colorKey }: GaugeProps): ReactElement {
    const { fill, mark }: GaugePositions = gaugePositions(shareBps, targetBps);
    return (
        <div aria-hidden="true" className="relative h-2.5 w-full min-w-24 overflow-hidden rounded-full bg-surface-muted">
            <div className={cn('h-full rounded-full', CLASS_BAR_COLORS[colorKey])} style={{ width: percentStyle(fill) }} />
            <div className="absolute inset-y-0 w-0.5 bg-content" style={{ left: `calc(${percentStyle(mark)} - 1px)` }} />
        </div>
    );
}
