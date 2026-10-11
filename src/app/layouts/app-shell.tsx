import type { ReactElement, ReactNode } from 'react';
import type { NavItem } from './app-nav';
import { MobileTopBar } from './mobile-top-bar';
import { Sidebar } from './sidebar';

export interface AppShellProps {
    readonly items: readonly NavItem[];
    readonly topSlot?: ReactNode;
    readonly children: ReactNode;
}

export function AppShell({ items, topSlot, children }: AppShellProps): ReactElement {
    return (
        <div className="min-h-dvh bg-canvas min-[861px]:grid min-[861px]:grid-cols-[248px_minmax(0,1fr)]">
            <Sidebar items={items} topSlot={topSlot} />
            <MobileTopBar items={items} topSlot={topSlot} />
            <div className="min-w-0 min-[861px]:h-dvh min-[861px]:overflow-y-auto">{children}</div>
        </div>
    );
}
