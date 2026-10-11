import type { ReactElement, ReactNode } from 'react';
import { Link, useRouterState } from '@tanstack/react-router';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { cn } from '@/shared/lib/cn';
import { BrandLogo } from '@/shared/ui/brand-logo';
import { activeNavId, type NavGroup, type NavItem, type NavLabelKey } from './app-nav';
import { UserBox } from './user-box';

const GROUP_ORDER: readonly NavGroup[] = ['portfolio', 'spending', 'settings'];

const GROUP_LABEL: Readonly<Record<NavGroup, NavLabelKey>> = {
    portfolio: 'navGroupPortfolio',
    spending: 'navGroupSpending',
    settings: 'navGroupSettings'
};

interface SectionProps {
    readonly items: readonly NavItem[];
    readonly activeId: string | null;
    readonly heading?: string;
}

function NavSection({ items, activeId, heading }: SectionProps): ReactElement {
    const { t }: UseTranslationResponse<'common', undefined> = useTranslation();
    return (
        <div className="flex flex-col gap-0.5">
            {heading === undefined ? null : (
                <h6 className="mb-1.5 px-2.5 text-[11px] font-bold tracking-[0.08em] text-content-muted uppercase">{heading}</h6>
            )}
            {items.map((item: NavItem): ReactElement => (
                <Link
                    key={item.id}
                    to={item.to}
                    activeOptions={{ exact: item.id !== activeId }}
                    className={cn(
                        'group flex min-h-11 items-center gap-2.5 rounded-control px-2.5 py-1.5 font-medium transition-colors hover:bg-accent-tint',
                        item.id === activeId && 'bg-accent-soft font-semibold'
                    )}
                >
                    <span
                        className={cn(
                            'grid size-[30px] shrink-0 place-items-center rounded-control',
                            item.id === activeId ? 'bg-accent text-accent-contrast' : 'bg-surface-muted text-content-muted'
                        )}
                    >
                        <item.icon className="size-4" aria-hidden="true" />
                    </span>
                    {t(item.labelKey)}
                </Link>
            ))}
        </div>
    );
}

function groupItems(items: readonly NavItem[]): ReadonlyMap<NavGroup | undefined, readonly NavItem[]> {
    const groups: Map<NavGroup | undefined, NavItem[]> = new Map<NavGroup | undefined, NavItem[]>();
    for (const item of items) {
        groups.set(item.group, [...(groups.get(item.group) ?? []), item]);
    }
    return groups;
}

export interface SidebarContentProps {
    readonly items: readonly NavItem[];
    readonly topSlot?: ReactNode;
}

export function SidebarContent({ items, topSlot }: SidebarContentProps): ReactElement {
    const { t }: UseTranslationResponse<'common', undefined> = useTranslation();
    const pathname: string = useRouterState({ select: (state): string => state.location.pathname });
    const activeId: string | null = activeNavId(pathname, items);
    const byGroup: ReadonlyMap<NavGroup | undefined, readonly NavItem[]> = groupItems(items);
    const ungrouped: readonly NavItem[] = byGroup.get(undefined) ?? [];

    return (
        <div className="flex h-full flex-col gap-5">
            <div className="px-2">
                <BrandLogo />
            </div>
            {topSlot}
            <nav aria-label={t('navLabel')} className="flex flex-1 flex-col gap-5 overflow-y-auto">
                {ungrouped.length > 0 ? <NavSection items={ungrouped} activeId={activeId} /> : null}
                {GROUP_ORDER.map((group: NavGroup): ReactElement | null => {
                    const inGroup: readonly NavItem[] = byGroup.get(group) ?? [];
                    return inGroup.length === 0 ? null : (
                        <NavSection key={group} items={inGroup} activeId={activeId} heading={t(GROUP_LABEL[group])} />
                    );
                })}
            </nav>
            <UserBox />
        </div>
    );
}

export function Sidebar(props: SidebarContentProps): ReactElement {
    return (
        <aside className="sticky top-0 hidden h-dvh overflow-y-auto border-r border-border bg-surface px-3.5 py-5 min-[861px]:block">
            <SidebarContent {...props} />
        </aside>
    );
}
