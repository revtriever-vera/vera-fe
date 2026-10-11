import { Check, type LucideIcon } from 'lucide-react';
import type { ReactElement, ReactNode } from 'react';
import { cn } from '@/shared/lib/cn';
import { Card } from '@/shared/ui/card';

export interface SummaryRowProps {
    readonly done: boolean;
    readonly icon: LucideIcon;
    readonly title: string;
    readonly detail: string;
    readonly action?: ReactNode;
}

export function SummaryRow({ done, icon: Icon, title, detail, action }: SummaryRowProps): ReactElement {
    const Glyph: LucideIcon = done ? Check : Icon;
    return (
        <Card className="grid grid-cols-[44px_minmax(0,1fr)_auto] items-center gap-3.5 px-4 py-3.5">
            <span
                aria-hidden="true"
                className={cn(
                    'grid size-11 place-items-center rounded-xl',
                    done ? 'bg-positive/12 text-positive' : 'bg-surface-muted text-content-muted'
                )}
            >
                <Glyph className="size-5" />
            </span>
            <span className="flex min-w-0 flex-col">
                <b className="text-content">{title}</b>
                <span className="text-[13.5px] text-content-muted">{detail}</span>
            </span>
            {action}
        </Card>
    );
}
