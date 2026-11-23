import { useEffect, useRef, type ReactElement, type RefObject } from 'react';
import * as Menu from '@radix-ui/react-dropdown-menu';
import { Link, useNavigate, type UseNavigateResult } from '@tanstack/react-router';
import { Crown, LogOut, Settings } from 'lucide-react';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { useSession } from '@/app/providers/session-provider';
import type { SessionContext, SessionUser } from '@/app/providers/session-context';
import { currentSettingsMode } from '@/features/settings/lib/settings-tabs';
import { SETTINGS_MODE, SETTINGS_TAB } from '@/features/settings/types';
import { track } from '@/shared/lib/analytics';
import { Avatar } from '@/shared/ui/avatar';
import type { BillingState } from '@/shared/lib/billing/billing-context';
import { useBilling } from '@/shared/lib/billing/use-billing';
import { Badge } from '@/shared/ui/badge';

const CONTENT: string = 'z-50 w-64 rounded-card border border-border bg-surface p-1.5 shadow-popover';
const ITEM: string =
    'flex min-h-11 w-full cursor-pointer items-center gap-2.5 rounded-control px-2.5 py-2 text-sm font-semibold text-content-muted outline-none data-[highlighted]:bg-accent-tint data-[highlighted]:text-content';
const PLAN_PARAMS: { readonly tab: string } = { tab: SETTINGS_TAB.plan };
const TRIGGER: string =
    'grid size-11 shrink-0 place-items-center rounded-full outline-offset-2 transition-shadow hover:shadow-[0_0_0_3px_var(--color-accent-soft)] data-[state=open]:shadow-[0_0_0_3px_var(--color-accent-soft)]';
const SEPARATOR: string = 'mx-0.5 my-1 h-px bg-border';

function providerLabel(user: SessionUser, t: UseTranslationResponse<'common', undefined>['t']): string {
    const provider: string = user.loginProvider === 'google' ? t('providerGoogle') : t('providerFacebook');
    return t('viaProvider', { provider });
}

function FocusFirstItem({ container }: { readonly container: RefObject<HTMLDivElement | null> }): null {
    useEffect((): (() => void) => {
        const timer: number = window.setTimeout((): void => {
            container.current?.querySelector<HTMLElement>('[role="menuitem"]')?.focus();
        }, 0);
        return (): void => {
            window.clearTimeout(timer);
        };
    }, [container]);
    return null;
}

function MenuHeader({ user }: { readonly user: SessionUser }): ReactElement {
    const { t }: UseTranslationResponse<'common', undefined> = useTranslation();
    return (
        <div className="flex items-center gap-2.5 px-2.5 pt-2 pb-2.5">
            <Avatar name={user.name} className="size-[34px]" />
            <span className="min-w-0">
                <b className="block truncate text-sm">{user.name}</b>
                <span className="block text-xs text-content-muted">{providerLabel(user, t)}</span>
            </span>
        </div>
    );
}

function PlanChip(): ReactElement | null {
    const { t }: UseTranslationResponse<'billing', undefined> = useTranslation('billing');
    const { plan, isLoading }: BillingState = useBilling();
    if (isLoading || plan === 'self_hosted') {
        return null;
    }
    return (
        <Badge className="ml-auto" tone={plan === 'premium' ? 'accent' : 'neutral'}>
            {t(plan === 'premium' ? 'plan.premium' : 'plan.free')}
        </Badge>
    );
}

function MenuLinks(): ReactElement {
    const { t }: UseTranslationResponse<'common', undefined> = useTranslation();
    const hosted: boolean = currentSettingsMode() === SETTINGS_MODE.hosted;
    return (
        <>
            {hosted ? (
                <Menu.Item asChild>
                    <Link to="/settings/$tab" params={PLAN_PARAMS} className={ITEM}>
                        <Crown className="size-4" aria-hidden="true" />
                        {t('userMenuPlan')}
                        <PlanChip />
                    </Link>
                </Menu.Item>
            ) : null}
            <Menu.Item asChild>
                <Link to="/settings" className={ITEM}>
                    <Settings className="size-4" aria-hidden="true" />
                    {t('userMenuSettings')}
                </Link>
            </Menu.Item>
        </>
    );
}

function MenuBody({ user, onSignOut }: { readonly user: SessionUser; readonly onSignOut: () => void }): ReactElement {
    const { t }: UseTranslationResponse<'common', undefined> = useTranslation();
    const contentRef: RefObject<HTMLDivElement | null> = useRef<HTMLDivElement>(null);
    return (
        <Menu.Content ref={contentRef} align="end" sideOffset={6} className={CONTENT}>
            <FocusFirstItem container={contentRef} />
            <MenuHeader user={user} />
            <Menu.Separator className={SEPARATOR} />
            <MenuLinks />
            <Menu.Separator className={SEPARATOR} />
            <Menu.Item className={ITEM} onSelect={onSignOut}>
                <LogOut className="size-4" aria-hidden="true" />
                {t('signOut')}
            </Menu.Item>
        </Menu.Content>
    );
}

export function UserMenu(): ReactElement | null {
    const { t }: UseTranslationResponse<'common', undefined> = useTranslation();
    const { user, signOut }: SessionContext = useSession();
    const navigate: UseNavigateResult<string> = useNavigate();

    if (user === null) {
        return null;
    }

    const handleSignOut = (): void => {
        signOut();
        void navigate({ to: '/login', replace: true });
    };

    return (
        <Menu.Root
            onOpenChange={(open: boolean): void => {
                if (open) {
                    track('user_menu_opened');
                }
            }}
        >
            <Menu.Trigger aria-label={t('openUserMenu')} className={TRIGGER}>
                <Avatar name={user.name} className="size-[34px]" />
            </Menu.Trigger>
            <Menu.Portal>
                <MenuBody user={user} onSignOut={handleSignOut} />
            </Menu.Portal>
        </Menu.Root>
    );
}
