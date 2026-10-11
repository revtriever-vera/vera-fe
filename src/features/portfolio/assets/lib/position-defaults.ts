import type { AssetClassView } from '../../types';
import type { CatalogAsset } from '../types';
import type { PositionFormInput } from '../schemas/position.schema';
import { suggestedClassId } from './suggested-class';

export function hasClass(classes: readonly AssetClassView[], classId: string | undefined): classId is string {
    return classId !== undefined && classes.some((item: AssetClassView): boolean => item.id === classId);
}

export function defaultClassId(
    classes: readonly AssetClassView[],
    suggestedClassKey: string | null,
    initialClassId: string | undefined
): string {
    if (hasClass(classes, initialClassId)) {
        return initialClassId;
    }
    return suggestedClassId(classes, suggestedClassKey) ?? '';
}

export function positionDefaults(
    classes: readonly AssetClassView[],
    asset: CatalogAsset | null,
    initialClassId: string | undefined
): PositionFormInput {
    return { quantity: '', averagePrice: '', classId: defaultClassId(classes, asset?.suggestedClassKey ?? null, initialClassId) };
}
