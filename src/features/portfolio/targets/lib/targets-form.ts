import { ApiError } from '@/shared/lib/api/api-error';
import type { AssetClassView, SaveClassTargetsBody } from '../../types';
import { FULL_TARGET_BPS, type ClassTargetValue, type ClassTargetsFormValues } from '../schemas/class-targets.schema';

export type TotalChipKind = 'ok' | 'missing' | 'excess';

export interface TotalChipState {
    readonly kind: TotalChipKind;
    readonly diffBps: number;
}

export function totalChipState(sumBps: number): TotalChipState {
    if (sumBps === FULL_TARGET_BPS) {
        return { kind: 'ok', diffBps: 0 };
    }
    return sumBps < FULL_TARGET_BPS
        ? { kind: 'missing', diffBps: FULL_TARGET_BPS - sumBps }
        : { kind: 'excess', diffBps: sumBps - FULL_TARGET_BPS };
}

export function sortedClasses(classes: readonly AssetClassView[]): readonly AssetClassView[] {
    return [...classes].sort((a: AssetClassView, b: AssetClassView): number => a.sortOrder - b.sortOrder);
}

export function toFormValues(classes: readonly AssetClassView[]): ClassTargetsFormValues {
    return {
        targets: sortedClasses(classes).map((item: AssetClassView): ClassTargetValue => ({ classId: item.id, targetBps: item.targetBps }))
    };
}

export function sumTargets(values: ClassTargetsFormValues): number {
    return values.targets.reduce(
        (sum: number, item: ClassTargetValue): number => sum + (Number.isFinite(item.targetBps) ? item.targetBps : 0),
        0
    );
}

export function hasUnsavedChanges(values: ClassTargetsFormValues, classes: readonly AssetClassView[]): boolean {
    const saved: ReadonlyMap<string, number> = new Map(classes.map((item: AssetClassView): [string, number] => [item.id, item.targetBps]));
    return (
        values.targets.length !== saved.size ||
        values.targets.some((item: ClassTargetValue): boolean => !Object.is(saved.get(item.classId), item.targetBps))
    );
}

export function mergeDrafts(
    current: ClassTargetsFormValues,
    previous: readonly AssetClassView[],
    next: readonly AssetClassView[]
): ClassTargetsFormValues {
    const drafts: ReadonlyMap<string, number> = new Map(
        current.targets.map((item: ClassTargetValue): [string, number] => [item.classId, item.targetBps])
    );
    const before: ReadonlyMap<string, number> = new Map(
        previous.map((item: AssetClassView): [string, number] => [item.id, item.targetBps])
    );
    return {
        targets: sortedClasses(next).map((item: AssetClassView): ClassTargetValue => {
            const draft: number | undefined = drafts.get(item.id);
            const untouchedByServer: boolean = before.get(item.id) === item.targetBps;
            return { classId: item.id, targetBps: untouchedByServer && draft !== undefined ? draft : item.targetBps };
        })
    };
}

export function toSaveBody(values: ClassTargetsFormValues): SaveClassTargetsBody {
    return {
        targets: values.targets.map((item: ClassTargetValue): ClassTargetValue => ({ classId: item.classId, targetBps: item.targetBps }))
    };
}

export function sumReceivedBps(error: Error | null): number | null {
    const raw: unknown = error instanceof ApiError ? error.problem.meta?.['sumBps'] : undefined;
    return typeof raw === 'number' ? raw : null;
}
