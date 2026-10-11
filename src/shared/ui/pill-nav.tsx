import { Link } from '@tanstack/react-router';
import type { ReactElement } from 'react';

export interface PillItem {
    readonly to: string;
    readonly label: string;
}

interface PillNavProps {
    readonly label: string;
    readonly items: readonly PillItem[];
}

const PILL_CLASS: string =
    'rounded-full border border-border px-3 py-1 text-xs font-medium text-content-muted transition hover:border-border-strong hover:text-content data-[status=active]:border-accent data-[status=active]:bg-accent/10 data-[status=active]:text-accent-strong data-[status=active]:hover:border-accent data-[status=active]:hover:text-accent-strong';

export function PillNav({ label, items }: PillNavProps): ReactElement {
    return (
        <nav aria-label={label} className="flex flex-wrap gap-2">
            {items.map((item: PillItem): ReactElement => (
                <Link key={item.to} to={item.to} className={PILL_CLASS}>
                    {item.label}
                </Link>
            ))}
        </nav>
    );
}
