import { Link } from '@tanstack/react-router';
import type { ReactElement } from 'react';

export interface TabItem {
    readonly to: string;
    readonly label: string;
}

interface TabNavProps {
    readonly label: string;
    readonly tabs: readonly TabItem[];
}

const TAB_CLASS: string = 'whitespace-nowrap rounded-control px-3 py-1.5 text-sm text-content-muted transition hover:bg-surface-muted';
const TAB_ACTIVE_CLASS: string = 'bg-surface text-content font-medium shadow-card';

export function TabNav({ label, tabs }: TabNavProps): ReactElement {
    return (
        <nav aria-label={label} className="flex gap-1 overflow-x-auto rounded-control border border-border bg-surface-muted p-1">
            {tabs.map((tab: TabItem): ReactElement => (
                <Link key={tab.to} to={tab.to} className={TAB_CLASS} activeProps={{ className: TAB_ACTIVE_CLASS }}>
                    {tab.label}
                </Link>
            ))}
        </nav>
    );
}
