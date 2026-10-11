import { SYSTEM_CLASS_KEYS, type SystemClassKey } from '../types';
import { BarChart3, Building2, Globe, Hexagon, Home, Layers, Lock, Percent, Thermometer, type LucideIcon } from 'lucide-react';

const ICONS: Readonly<Record<SystemClassKey, LucideIcon>> = {
    [SYSTEM_CLASS_KEYS.fixedIncomePost]: Percent,
    [SYSTEM_CLASS_KEYS.fixedIncomePre]: Lock,
    [SYSTEM_CLASS_KEYS.fixedIncomeIpca]: Thermometer,
    [SYSTEM_CLASS_KEYS.stocksBr]: BarChart3,
    [SYSTEM_CLASS_KEYS.fii]: Building2,
    [SYSTEM_CLASS_KEYS.stocksUs]: Globe,
    [SYSTEM_CLASS_KEYS.reits]: Home,
    [SYSTEM_CLASS_KEYS.crypto]: Hexagon
};

export function isSystemClassKey(value: string): value is SystemClassKey {
    return Object.hasOwn(ICONS, value);
}

export function classIcon(systemKey: string | null): LucideIcon {
    return systemKey !== null && isSystemClassKey(systemKey) ? ICONS[systemKey] : Layers;
}
