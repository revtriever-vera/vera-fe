import { BarChart3, Building2, Globe, Hexagon, Home, Landmark, Percent, type LucideIcon } from 'lucide-react';
import { toClassColorKey } from '../../lib/class-color';
import { isSystemClassKey } from '../../lib/class-icons';
import { SYSTEM_CLASS_KEYS, type AssetClassView, type ClassColorKey, type SystemClassKey } from '../../types';
import type { CatalogGroup } from '../types';
import { suggestedClassId } from './suggested-class';

export type AddAssetType = 'fixed_income' | 'tesouro' | 'acoes_br' | 'fii' | 'acoes_eua' | 'reits' | 'cripto';

export const ADD_ASSET_TYPES: readonly AddAssetType[] = ['fixed_income', 'tesouro', 'acoes_br', 'fii', 'acoes_eua', 'reits', 'cripto'];

export interface AssetTypeSpec {
    readonly classKey: SystemClassKey;
    readonly icon: LucideIcon;
    readonly group: CatalogGroup | null;
}

export const ASSET_TYPE_SPECS: Readonly<Record<AddAssetType, AssetTypeSpec>> = {
    fixed_income: { classKey: SYSTEM_CLASS_KEYS.fixedIncomePost, icon: Percent, group: null },
    tesouro: { classKey: SYSTEM_CLASS_KEYS.fixedIncomeIpca, icon: Landmark, group: 'tesouro' },
    acoes_br: { classKey: SYSTEM_CLASS_KEYS.stocksBr, icon: BarChart3, group: 'acoes_br' },
    fii: { classKey: SYSTEM_CLASS_KEYS.fii, icon: Building2, group: 'fii' },
    acoes_eua: { classKey: SYSTEM_CLASS_KEYS.stocksUs, icon: Globe, group: 'acoes_eua' },
    reits: { classKey: SYSTEM_CLASS_KEYS.reits, icon: Home, group: 'reits' },
    cripto: { classKey: SYSTEM_CLASS_KEYS.crypto, icon: Hexagon, group: 'cripto' }
};

export function isAddAssetType(value: string): value is AddAssetType {
    return ADD_ASSET_TYPES.some((type: AddAssetType): boolean => type === value);
}

export function catalogGroupOf(type: AddAssetType): CatalogGroup | null {
    return ASSET_TYPE_SPECS[type].group;
}

const DEFAULT_COLOR_KEYS: Readonly<Record<SystemClassKey, ClassColorKey>> = {
    rf_pos: 'c1',
    rf_pre: 'c2',
    rf_ipca: 'c3',
    acoes_br: 'c4',
    fii: 'c5',
    acoes_eua: 'c6',
    reits: 'c7',
    cripto: 'c8'
};

export function colorKeyForClassKey(classes: readonly AssetClassView[], classKey: string | null): ClassColorKey {
    const classId: string | null = suggestedClassId(classes, classKey);
    const found: AssetClassView | undefined = classes.find((item: AssetClassView): boolean => item.id === classId);
    if (found !== undefined) {
        return toClassColorKey(found.colorKey);
    }
    return classKey !== null && isSystemClassKey(classKey) ? DEFAULT_COLOR_KEYS[classKey] : 'c1';
}

export function typeColorKey(classes: readonly AssetClassView[], type: AddAssetType): ClassColorKey {
    return colorKeyForClassKey(classes, ASSET_TYPE_SPECS[type].classKey);
}
