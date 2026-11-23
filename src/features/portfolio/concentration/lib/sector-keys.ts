import { SECTOR_KEYS, type SectorKey } from '../types';

export const UNMAPPED_SECTOR: string = 'unmapped_sector';

export function isSectorKey(key: string): key is SectorKey {
    return (SECTOR_KEYS as readonly string[]).includes(key);
}
