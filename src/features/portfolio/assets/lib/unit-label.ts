export type UnitLabelKey = 'shares' | 'units' | 'bonds';

const UNIT_KEYS: Readonly<Partial<Record<string, UnitLabelKey>>> = {
    fundos: 'shares',
    acoes_br: 'shares',
    fii: 'shares',
    acoes_eua: 'shares',
    reits: 'shares',
    cripto: 'units',
    tesouro: 'bonds'
};

export function unitLabelKey(typeGroup: string): UnitLabelKey | null {
    return UNIT_KEYS[typeGroup] ?? null;
}
