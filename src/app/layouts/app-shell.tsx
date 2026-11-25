import type { ReactElement, ReactNode } from 'react';
import { AssistantLauncher } from '@/features/assistant/components/assistant-launcher';
import type { NavItem } from './app-nav';
import { EndorsementSeal } from '@/shared/ui/endorsement-seal';
import { MobileTopBar } from './mobile-top-bar';
import { Sidebar } from './sidebar';
import { UserMenu } from './user-menu';

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
            <div className="min-w-0 min-[861px]:h-dvh min-[861px]:overflow-y-auto">
                <div className="hidden justify-end px-page-x pt-3 min-[861px]:flex">
                    <UserMenu />
                </div>
                {children}
                <EndorsementSeal className="px-page-x py-6" />
            </div>
            <AssistantLauncher />
        </div>
    );
}
