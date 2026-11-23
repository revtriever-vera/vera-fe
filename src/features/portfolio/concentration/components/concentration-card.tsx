import type { ReactElement, ReactNode } from 'react';

export interface ConcentrationCardProps {
    readonly title: string;
    readonly description: string;
    readonly note?: string;
    readonly children: ReactNode;
}

export function ConcentrationCard({ title, description, note, children }: ConcentrationCardProps): ReactElement {
    return (
        <section className="surface-card flex min-w-0 flex-col gap-2 p-5">
            <div>
                <h3 className="text-base font-semibold">{title}</h3>
                <p className="text-sm text-content-muted">{description}</p>
            </div>
            {children}
            {note === undefined ? null : <p className="text-xs text-content-muted">{note}</p>}
        </section>
    );
}
