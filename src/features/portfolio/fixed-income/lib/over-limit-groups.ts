import type { FgcCoverage, FgcGroup, FgcHolderBlock } from '../types';

export interface OverLimitGroup {
    readonly key: string;
    readonly group: FgcGroup;
    readonly holderName: string | null;
}

function fromBlock(block: FgcHolderBlock): readonly OverLimitGroup[] {
    const holderName: string | null = block.holder?.name ?? null;
    const holderKey: string = block.holder?.userId ?? 'account';
    return block.groups.map((group: FgcGroup): OverLimitGroup => ({ key: `${holderKey}-${group.groupId}`, group, holderName }));
}

export function overLimitGroups(coverage: FgcCoverage): readonly OverLimitGroup[] {
    const own: readonly OverLimitGroup[] = coverage.groups.map((group: FgcGroup): OverLimitGroup => ({
        key: group.groupId,
        group,
        holderName: null
    }));
    return [...own, ...coverage.byHolder.flatMap(fromBlock)].filter((item: OverLimitGroup): boolean => item.group.overMinor > 0);
}
