import type { HoldingView } from '../../types';

export type UnitLabelKey = 'shares' | 'units' | 'bonds';

const UNIT_KEYS: Readonly<Partial<Record<HoldingView['typeGroup'], UnitLabelKey>>> = {
    acoes_br: 'shares',
    fii: 'shares',
    acoes_eua: 'shares',
    reits: 'shares',
    cripto: 'units',
    tesouro: 'bonds'
};

export function unitLabelKey(typeGroup: HoldingView['typeGroup']): UnitLabelKey | null {
    return UNIT_KEYS[typeGroup] ?? null;
}
