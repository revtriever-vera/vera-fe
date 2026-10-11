import type { LucideIcon } from 'lucide-react';
import type { ReactElement } from 'react';
import { Card } from '@/shared/ui/card';
import { IconTile, type IconTileTone } from '@/shared/ui/icon-tile';

export interface PathCardProps {
    readonly icon: LucideIcon;
    readonly tone: IconTileTone;
    readonly title: string;
    readonly description: string;
    readonly time: string;
}

export function PathCard({ icon, tone, title, description, time }: PathCardProps): ReactElement {
    return (
        <Card className="grid grid-cols-[52px_minmax(0,1fr)_auto] items-center gap-3.5 p-[18px]">
            <IconTile icon={icon} tone={tone} size="lg" className="size-[52px]" />
            <span className="flex flex-col">
                <b className="text-base text-content">{title}</b>
                <span className="text-[13.5px] text-content-muted">{description}</span>
            </span>
            <span className="rounded-full border border-border px-2.5 py-0.5 text-xs font-semibold text-content-muted">{time}</span>
        </Card>
    );
}
