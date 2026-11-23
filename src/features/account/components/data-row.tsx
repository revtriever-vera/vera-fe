import type { LucideIcon } from 'lucide-react';
import type { ReactElement, ReactNode } from 'react';

export interface DataRowProps {
    readonly icon: LucideIcon;
    readonly title: string;
    readonly description: string;
    readonly children: ReactNode;
}

export function DataRow({ icon: Icon, title, description, children }: DataRowProps): ReactElement {
    return (
        <div className="flex flex-wrap items-center gap-3 border-t border-border py-3 first:border-t-0 first:pt-0 last:pb-0">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-control bg-surface-muted text-content-muted">
                <Icon className="size-4" aria-hidden="true" />
            </span>
            <div className="flex min-w-0 flex-1 basis-60 flex-col gap-0.5">
                <span className="text-sm font-semibold text-content">{title}</span>
                <span className="text-sm text-content-muted">{description}</span>
            </div>
            <div className="flex items-center gap-2">{children}</div>
        </div>
    );
}
