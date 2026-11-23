import { useId, type ReactElement, type ReactNode } from 'react';
import { Card } from '@/shared/ui/card';

interface SectionCardProps {
    readonly title: string;
    readonly description?: string;
    readonly aside?: ReactNode;
    readonly children: ReactNode;
}

export function SectionCard({ title, description, aside, children }: SectionCardProps): ReactElement {
    const titleId: string = useId();

    return (
        <Card role="region" aria-labelledby={titleId} className="flex flex-col gap-3">
            <div className="flex items-start justify-between gap-3">
                <div className="flex flex-col gap-1">
                    <h2 id={titleId} className="text-base font-semibold text-content">
                        {title}
                    </h2>
                    {description === undefined ? null : <p className="text-sm text-content-muted">{description}</p>}
                </div>
                {aside}
            </div>
            {children}
        </Card>
    );
}
