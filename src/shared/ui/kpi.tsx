import type { LucideIcon } from 'lucide-react';
import type { ReactElement, ReactNode } from 'react';
import { cn } from '@/shared/lib/cn';
import { IconTile, type IconTileTone } from './icon-tile';

export interface KpiTileProps {
    readonly label: string;
    readonly value: ReactNode;
    readonly support?: ReactNode;
    readonly icon?: LucideIcon;
    readonly tone?: IconTileTone;
    readonly className?: string;
}

export function KpiTile({ label, value, support, icon, tone = 'neutral', className }: KpiTileProps): ReactElement {
    return (
        <div className={cn('surface-card flex flex-col gap-3 p-4', className)}>
            <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-medium text-content-muted">{label}</span>
                {icon === undefined ? null : <IconTile icon={icon} tone={tone} size="sm" />}
            </div>
            <div className="flex flex-col gap-0.5">
                <span className="numeric text-2xl leading-tight font-bold tracking-tight text-content">{value}</span>
                {support === undefined ? null : <span className="text-xs text-content-subtle">{support}</span>}
            </div>
        </div>
    );
}
