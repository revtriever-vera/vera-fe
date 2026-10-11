import type { ClassDetail, ClassDetailAsset } from '@/features/portfolio/targets/types';

const BPS: number = 10000;
const TOLERANCE_BPS: number = 500;
const PATRIMONY_MINOR: number = 177310040;

export interface AssetSeed {
    readonly id: string;
    readonly symbol: string;
    readonly name: string;
    readonly valueMinor: number;
    readonly targetBps: number;
    readonly zeroQuantity?: boolean;
    readonly missingQuote?: boolean;
}

export const ACOES_BR_SEEDS: readonly AssetSeed[] = [
    { id: 'position-itub4', symbol: 'ITUB4', name: 'Itaú Unibanco PN', valueMinor: 7560000, targetBps: 3000 },
    { id: 'position-wege3', symbol: 'WEGE3', name: 'WEG ON', valueMinor: 7815000, targetBps: 4000 },
    { id: 'position-petr4', symbol: 'PETR4', name: 'Petrobras PN', valueMinor: 6642000, targetBps: 3000 }
];

function statusOf(deviationBps: number): ClassDetailAsset['status'] {
    if (Math.abs(deviationBps) <= TOLERANCE_BPS) {
        return 'within';
    }
    return deviationBps > 0 ? 'above' : 'below';
}

function buildAsset(seed: AssetSeed, classValue: number): ClassDetailAsset {
    const share: number = classValue === 0 ? 0 : Math.round((seed.valueMinor * BPS) / classValue);
    const deviation: number = share - seed.targetBps;
    return {
        kind: 'position',
        id: seed.id,
        assetId: `asset-${seed.id}`,
        symbol: seed.symbol,
        name: seed.name,
        valueMinor: seed.valueMinor,
        shareInClassBps: share,
        targetInClassBps: seed.targetBps,
        deviationBps: deviation,
        status: statusOf(deviation),
        gapMinor: Math.round((classValue * seed.targetBps) / BPS) - seed.valueMinor,
        isZeroQuantity: seed.zeroQuantity ?? false,
        missingQuote: seed.missingQuote ?? false,
        stale: false
    };
}

export interface ClassDetailOptions {
    readonly seeds?: readonly AssetSeed[];
    readonly targetsSumBps?: number;
    readonly classId?: string;
    readonly systemKey?: string | null;
    readonly name?: string | null;
    readonly baseCurrency?: 'BRL' | 'USD';
}

export function classDetail(options: ClassDetailOptions = {}): ClassDetail {
    const seeds: readonly AssetSeed[] = options.seeds ?? ACOES_BR_SEEDS;
    const value: number = seeds.reduce((sum: number, seed: AssetSeed): number => sum + seed.valueMinor, 0);
    const targetsSumBps: number = options.targetsSumBps ?? seeds.reduce((sum: number, seed: AssetSeed): number => sum + seed.targetBps, 0);
    const share: number = Math.round((value * BPS) / PATRIMONY_MINOR);
    return {
        class: {
            classId: options.classId ?? 'class-acoes-br',
            systemKey: options.systemKey === undefined ? 'acoes_br' : options.systemKey,
            name: options.name ?? null,
            displayName: 'Ações Brasil',
            colorKey: 'c4',
            valueMinor: value,
            shareBps: share,
            targetBps: 1500,
            deviationBps: share - 1500,
            status: statusOf(share - 1500),
            gapMinor: Math.round((PATRIMONY_MINOR * 1500) / BPS) - value
        },
        baseCurrency: options.baseCurrency ?? 'BRL',
        toleranceBps: TOLERANCE_BPS,
        targetsSumBps,
        assets: seeds.map((seed: AssetSeed): ClassDetailAsset => buildAsset(seed, value))
    };
}

export function equalSplitDetail(): ClassDetail {
    const seeds: readonly AssetSeed[] = ACOES_BR_SEEDS.map((seed: AssetSeed, index: number): AssetSeed => ({
        ...seed,
        targetBps: index === 0 ? 3334 : 3333
    }));
    return classDetail({ seeds, targetsSumBps: 0 });
}

export function zeroQuantityDetail(): ClassDetail {
    const seeds: readonly AssetSeed[] = [
        ...ACOES_BR_SEEDS.map((seed: AssetSeed, index: number): AssetSeed => ({ ...seed, targetBps: [3000, 3000, 2000][index] ?? 0 })),
        { id: 'position-vale3', symbol: 'VALE3', name: 'Vale ON', valueMinor: 0, targetBps: 2000, zeroQuantity: true }
    ];
    return classDetail({ seeds });
}
