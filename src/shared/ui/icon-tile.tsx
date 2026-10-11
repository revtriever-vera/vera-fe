import type { LucideIcon } from 'lucide-react';
import type { ReactElement } from 'react';
import { cn } from '@/shared/lib/cn';

export type IconTileTone = 'positive' | 'caution' | 'critical' | 'info' | 'accent' | 'neutral';

const TONES: Readonly<Record<IconTileTone, string>> = {
    positive: 'bg-positive/12 text-positive',
    caution: 'bg-caution/12 text-caution',
    critical: 'bg-critical/12 text-critical',
    info: 'bg-info/12 text-info',
    accent: 'bg-accent/12 text-accent-strong',
    neutral: 'bg-surface-muted text-content-muted'
};

export type IconTileSize = 'sm' | 'md' | 'lg';

const BOX: Readonly<Record<IconTileSize, string>> = {
    sm: 'h-8 w-8 rounded-lg',
    md: 'h-10 w-10 rounded-xl',
    lg: 'h-14 w-14 rounded-2xl'
};

const GLYPH: Readonly<Record<IconTileSize, string>> = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-7 w-7'
};

export interface IconTileProps {
    readonly icon: LucideIcon;
    readonly tone: IconTileTone;
    readonly size?: IconTileSize;
    readonly className?: string;
}

export function IconTile({ icon: Icon, tone, size = 'md', className }: IconTileProps): ReactElement {
    return (
        <span aria-hidden className={cn('grid shrink-0 place-items-center', BOX[size], TONES[tone], className)}>
            <Icon className={GLYPH[size]} strokeWidth={2} />
        </span>
    );
}
