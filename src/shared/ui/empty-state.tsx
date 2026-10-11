import type { ReactElement, ReactNode } from 'react';

export interface EmptyStateProps {
    readonly title: string;
    readonly description: string;
    readonly action?: ReactNode;
}

export function EmptyState({ title, description, action }: EmptyStateProps): ReactElement {
    return (
        <div className="surface-card flex flex-col items-center gap-2 px-6 py-12 text-center">
            <h3 className="text-base font-semibold text-content">{title}</h3>
            <p className="max-w-sm text-sm text-content-muted">{description}</p>
            {action && <div className="mt-2">{action}</div>}
        </div>
    );
}
