import type { ReactElement, ReactNode } from 'react';

export interface EmptyStateProps {
    readonly title: string;
    readonly description: string;
    readonly icon?: ReactNode;
    readonly action?: ReactNode;
    readonly actions?: ReactNode;
}

export function EmptyState({ title, description, icon, action, actions }: EmptyStateProps): ReactElement {
    return (
        <div className="surface-card flex flex-col items-center gap-2 px-6 py-12 text-center min-[861px]:py-16">
            {icon && (
                <span
                    aria-hidden="true"
                    className="mb-2 inline-flex size-12 items-center justify-center rounded-full bg-accent-soft text-accent-strong"
                >
                    {icon}
                </span>
            )}
            <h3 className="text-base font-semibold text-content">{title}</h3>
            <p className="max-w-sm text-sm text-content-muted">{description}</p>
            {action && <div className="mt-2">{action}</div>}
            {actions && (
                <div className="mt-3 flex w-full empty:hidden flex-col items-stretch justify-center gap-2.5 min-[480px]:w-auto min-[480px]:flex-row">
                    {actions}
                </div>
            )}
        </div>
    );
}
