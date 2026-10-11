import type { ReactElement } from 'react';
import { IconTile } from '@/shared/ui/icon-tile';
import { classIcon } from '../lib/class-icons';
import type { ClassColorKey } from '../types';

export const CLASS_TILE_TONES: Readonly<Record<ClassColorKey, string>> = {
    c1: 'bg-class-1-soft text-class-1',
    c2: 'bg-class-2-soft text-class-2',
    c3: 'bg-class-3-soft text-class-3',
    c4: 'bg-class-4-soft text-class-4',
    c5: 'bg-class-5-soft text-class-5',
    c6: 'bg-class-6-soft text-class-6',
    c7: 'bg-class-7-soft text-class-7',
    c8: 'bg-class-8-soft text-class-8',
    c9: 'bg-class-9-soft text-class-9',
    c10: 'bg-class-10-soft text-class-10',
    c11: 'bg-class-11-soft text-class-11',
    c12: 'bg-class-12-soft text-class-12'
};

export interface ClassTileProps {
    readonly systemKey: string | null;
    readonly colorKey: ClassColorKey;
    readonly size?: 'sm' | 'md';
}

export function ClassTile({ systemKey, colorKey, size = 'md' }: ClassTileProps): ReactElement {
    return <IconTile icon={classIcon(systemKey)} tone="neutral" size={size} className={CLASS_TILE_TONES[colorKey]} />;
}
