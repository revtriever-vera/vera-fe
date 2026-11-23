import { useId, type ReactElement, type ReactNode } from 'react';
import { Card } from '@/shared/ui/card';

export interface SummaryShellProps {
    readonly title: string;
    readonly description?: ReactNode;
    readonly action?: ReactNode;
    readonly children?: ReactNode;
}

export function SummaryShell({ title, description, action, children }: SummaryShellProps): ReactElement {
    const titleId: string = useId();
    return (
        <Card role="region" aria-labelledby={titleId} className="flex min-w-0 flex-col gap-3">
            <div className="flex flex-col gap-2 min-[560px]:flex-row min-[560px]:items-start min-[560px]:justify-between">
                <div className="flex min-w-0 flex-col gap-1">
                    <h3 id={titleId} className="text-base font-semibold text-content">
                        {title}
                    </h3>
                    {description === undefined ? null : <div className="text-sm text-content-muted">{description}</div>}
                </div>
                {action === undefined ? null : <div className="shrink-0">{action}</div>}
            </div>
            {children}
        </Card>
    );
}
