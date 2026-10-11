import type { AssetClassView } from '../../types';

function classIdsByKey(classes: readonly AssetClassView[]): ReadonlyMap<string, string> {
    const byKey: Map<string, string> = new Map<string, string>();
    for (const item of classes) {
        for (const alias of item.aliasKeys) {
            byKey.set(alias, item.id);
        }
    }
    for (const item of classes) {
        if (item.systemKey !== null) {
            byKey.set(item.systemKey, item.id);
        }
    }
    return byKey;
}

export function suggestedClassId(classes: readonly AssetClassView[], suggestedClassKey: string | null): string | null {
    return suggestedClassKey === null ? null : (classIdsByKey(classes).get(suggestedClassKey) ?? null);
}
