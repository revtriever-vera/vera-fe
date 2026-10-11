import { useId, type ReactElement, type ReactNode } from 'react';
import { cn } from '@/shared/lib/cn';
import { Card } from '@/shared/ui/card';

interface AccountSectionProps {
    readonly title: string;
    readonly description?: string;
    readonly tone?: 'default' | 'critical';
    readonly children: ReactNode;
}

export function AccountSection({ title, description, tone = 'default', children }: AccountSectionProps): ReactElement {
    const titleId: string = useId();

    return (
        <Card role="region" aria-labelledby={titleId} className="flex flex-col gap-3">
            <div className="flex flex-col gap-1">
                <h2 id={titleId} className={cn('text-base font-semibold', tone === 'critical' ? 'text-critical' : 'text-content')}>
                    {title}
                </h2>
                {description === undefined ? null : <p className="text-sm text-content-muted">{description}</p>}
            </div>
            {children}
        </Card>
    );
}
