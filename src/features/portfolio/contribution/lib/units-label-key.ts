export type UnitsLabelKey = 'shares' | 'units' | 'bonds' | 'less_than_one' | 'fixed_income' | 'price_unavailable';

const BOND_GROUPS: readonly string[] = ['tesouro', 'fixed_income'];

export function unitsLabelKey(typeGroup: string, approxUnits: string | null): UnitsLabelKey {
    if (approxUnits === null) {
        return typeGroup === 'fixed_income' ? 'fixed_income' : 'price_unavailable';
    }
    if (Number(approxUnits) === 0) {
        return 'less_than_one';
    }
    if (typeGroup === 'cripto') {
        return 'units';
    }
    return BOND_GROUPS.includes(typeGroup) ? 'bonds' : 'shares';
}
