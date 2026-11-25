import type { PreviewLine } from '../types';
import { LINE_STATUS } from '../types';
import { affectsPosition, lineActive, lineBlocked, lineInvalid, type Drafts, type LineDraft, type PositionModes } from './line-drafts';
import type { EffectRow } from './recalculate-effect';

export interface Readiness {
    readonly blocked: number;
    readonly invalid: number;
    readonly pendingAssets: readonly string[];
    readonly active: number;
}

function activeAssetIds(lines: readonly PreviewLine[], drafts: Drafts): ReadonlySet<string> {
    const ids: Set<string> = new Set();
    for (const line of lines) {
        const draft: LineDraft | undefined = drafts[line.lineId];
        const assetId: string | null = draft?.asset?.id ?? line.assetId;
        if (assetId !== null && affectsPosition(line) && lineActive(line, draft)) {
            ids.add(assetId);
        }
    }
    return ids;
}

export function readinessOf(lines: readonly PreviewLine[], rows: readonly EffectRow[], drafts: Drafts, modes: PositionModes): Readiness {
    const live: ReadonlySet<string> = activeAssetIds(lines, drafts);
    const pendingAssets: string[] = rows
        .filter((row: EffectRow): boolean => row.existingPosition && live.has(row.assetId) && modes[row.assetId] === undefined)
        .map((row: EffectRow): string => row.assetId);
    return {
        blocked: lines.filter((line: PreviewLine): boolean => lineBlocked(line, drafts[line.lineId])).length,
        invalid: lines.filter((line: PreviewLine): boolean => lineInvalid(drafts[line.lineId])).length,
        pendingAssets,
        active: lines.filter((line: PreviewLine): boolean => line.status !== LINE_STATUS.ignored && lineActive(line, drafts[line.lineId]))
            .length
    };
}
