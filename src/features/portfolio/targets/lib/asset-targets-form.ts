import type { AssetTargetEntry, AssetTargetsInput, ClassDetailAsset } from '../types';
import { equalSplitBps } from './equal-split';
import type { AssetTargetValue, AssetTargetsFormValues } from '../schemas/asset-targets.schema';

export function toAssetFormValues(assets: readonly ClassDetailAsset[]): AssetTargetsFormValues {
    return {
        targets: assets.map((asset: ClassDetailAsset): AssetTargetValue => ({
            subjectType: asset.kind,
            subjectId: asset.id,
            targetBps: asset.targetInClassBps
        }))
    };
}

export function sumAssetTargets(values: AssetTargetsFormValues): number {
    return values.targets.reduce(
        (sum: number, item: AssetTargetValue): number => sum + (Number.isFinite(item.targetBps) ? item.targetBps : 0),
        0
    );
}

export function allTargetsFinite(values: AssetTargetsFormValues): boolean {
    return values.targets.every((item: AssetTargetValue): boolean => Number.isFinite(item.targetBps));
}

export function hasUnsavedAssetChanges(values: AssetTargetsFormValues, assets: readonly ClassDetailAsset[]): boolean {
    const saved: ReadonlyMap<string, number> = new Map(
        assets.map((asset: ClassDetailAsset): [string, number] => [asset.id, asset.targetInClassBps])
    );
    return (
        values.targets.length !== saved.size ||
        values.targets.some((item: AssetTargetValue): boolean => !Object.is(saved.get(item.subjectId), item.targetBps))
    );
}

export function mergeAssetDrafts(
    current: AssetTargetsFormValues,
    previous: readonly ClassDetailAsset[],
    next: readonly ClassDetailAsset[]
): AssetTargetsFormValues {
    const drafts: ReadonlyMap<string, number> = new Map(
        current.targets.map((item: AssetTargetValue): [string, number] => [item.subjectId, item.targetBps])
    );
    const before: ReadonlyMap<string, number> = new Map(
        previous.map((asset: ClassDetailAsset): [string, number] => [asset.id, asset.targetInClassBps])
    );
    return {
        targets: next.map((asset: ClassDetailAsset): AssetTargetValue => {
            const draft: number | undefined = drafts.get(asset.id);
            const untouchedByServer: boolean = before.get(asset.id) === asset.targetInClassBps;
            return {
                subjectType: asset.kind,
                subjectId: asset.id,
                targetBps: untouchedByServer && draft !== undefined ? draft : asset.targetInClassBps
            };
        })
    };
}

export function toAssetTargetsBody(values: AssetTargetsFormValues): AssetTargetsInput {
    return {
        targets: values.targets.map((item: AssetTargetValue): AssetTargetEntry => ({
            subjectType: item.subjectType,
            subjectId: item.subjectId,
            targetInClassBps: item.targetBps
        }))
    };
}

export function withEqualSplit(values: AssetTargetsFormValues): AssetTargetsFormValues {
    const split: readonly number[] = equalSplitBps(values.targets.length);
    return {
        targets: values.targets.map((item: AssetTargetValue, index: number): AssetTargetValue => ({
            ...item,
            targetBps: split[index] ?? 0
        }))
    };
}

export function withAutomaticSplit(values: AssetTargetsFormValues): AssetTargetsFormValues {
    return { targets: values.targets.map((item: AssetTargetValue): AssetTargetValue => ({ ...item, targetBps: 0 })) };
}

export function canSaveAssetTargets(
    values: AssetTargetsFormValues,
    assets: readonly ClassDetailAsset[],
    targetsSumBps: number,
    validSum: boolean
): boolean {
    const sum: number = sumAssetTargets(values);
    const firstSave: boolean = targetsSumBps === 0 && sum !== 0;
    return validSum && allTargetsFinite(values) && (hasUnsavedAssetChanges(values, assets) || firstSave);
}
