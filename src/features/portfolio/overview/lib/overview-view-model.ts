import { toClassColorKey } from '../../lib/class-color';
import type { ClassColorKey, DeviationStatus, Overview, OverviewClass } from '../../types';
import { segmentWidths } from './segment-widths';

export interface ClassSegment {
    readonly classId: string;
    readonly widthPercent: number;
    readonly colorKey: ClassColorKey;
}

export interface ClassRow {
    readonly classId: string;
    readonly systemKey: string | null;
    readonly name: string | null;
    readonly colorKey: ClassColorKey;
    readonly valueMinor: number;
    readonly targetValueMinor: number;
    readonly shareBps: number;
    readonly targetBps: number;
    readonly deviationBps: number;
    readonly status: DeviationStatus;
    readonly gapMinor: number;
    readonly dimmed: boolean;
}

export interface Callout {
    readonly classId: string;
    readonly systemKey: string | null;
    readonly name: string | null;
    readonly status: DeviationStatus;
    readonly deviationBps: number;
}

export interface OverviewViewModel {
    readonly rows: readonly ClassRow[];
    readonly actual: readonly ClassSegment[];
    readonly target: readonly ClassSegment[];
    readonly callout: Callout | null;
}

function toRow(item: OverviewClass): ClassRow {
    return {
        classId: item.classId,
        systemKey: item.systemKey,
        name: item.name,
        colorKey: toClassColorKey(item.colorKey),
        valueMinor: item.valueMinor,
        targetValueMinor: item.valueMinor + item.gapMinor,
        shareBps: item.shareBps,
        targetBps: item.targetBps,
        deviationBps: item.deviationBps,
        status: item.status,
        gapMinor: item.gapMinor,
        dimmed: item.valueMinor === 0 && item.targetBps === 0
    };
}

function toSegments(rows: readonly ClassRow[], bps: (row: ClassRow) => number): readonly ClassSegment[] {
    const widths: readonly number[] = segmentWidths(rows.map(bps));
    return rows.map((row: ClassRow, index: number): ClassSegment => ({
        classId: row.classId,
        widthPercent: widths[index] ?? 0,
        colorKey: row.colorKey
    }));
}

function toCallout(overview: Overview, rows: readonly ClassRow[]): Callout | null {
    const largest: Overview['largestDeviation'] = overview.largestDeviation;
    const row: ClassRow | undefined =
        largest === null ? undefined : rows.find((item: ClassRow): boolean => item.classId === largest.classId);
    if (largest === null || row === undefined) {
        return null;
    }
    return { classId: row.classId, systemKey: row.systemKey, name: row.name, status: largest.status, deviationBps: largest.deviationBps };
}

export function buildOverviewViewModel(overview: Overview): OverviewViewModel {
    const rows: readonly ClassRow[] = overview.classes.map(toRow);
    return {
        rows,
        actual: toSegments(rows, (row: ClassRow): number => row.shareBps),
        target: toSegments(rows, (row: ClassRow): number => row.targetBps),
        callout: toCallout(overview, rows)
    };
}
