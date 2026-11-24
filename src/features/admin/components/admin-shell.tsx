import type { ReactElement, ReactNode } from 'react';
import { Link, useNavigate, type UseNavigateResult } from '@tanstack/react-router';
import { KeyRound, Link2, ScrollText, Users, type LucideIcon } from 'lucide-react';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { useSession } from '@/app/providers/session-provider';
import type { SessionContext } from '@/app/providers/session-context';
import { Badge } from '@/shared/ui/badge';
import { BrandLogo } from '@/shared/ui/brand-logo';
import { Button } from '@/shared/ui/button';

interface AdminNavItem {
    readonly to: '/admin/links' | '/admin/accounts' | '/admin/tokens' | '/admin/audit';
    readonly labelKey: 'navLinks' | 'navAccounts' | 'navTokens' | 'navAudit';
    readonly icon: LucideIcon;
}

const ADMIN_NAV: readonly AdminNavItem[] = [
    { to: '/admin/links', labelKey: 'navLinks', icon: Link2 },
    { to: '/admin/accounts', labelKey: 'navAccounts', icon: Users },
    { to: '/admin/tokens', labelKey: 'navTokens', icon: KeyRound },
    { to: '/admin/audit', labelKey: 'navAudit', icon: ScrollText }
];

export function AdminShell({ children }: { readonly children: ReactNode }): ReactElement {
    const { t }: UseTranslationResponse<'admin', undefined> = useTranslation('admin');
    const { user, signOut }: SessionContext = useSession();
    const navigate: UseNavigateResult<string> = useNavigate();

    const handleSignOut = (): void => {
        signOut();
        void navigate({ to: '/admin/login', replace: true });
    };

    return (
        <div className="min-h-dvh bg-canvas">
            <header className="flex flex-wrap items-center gap-x-6 gap-y-2 border-b border-border bg-surface px-page-x py-3">
                <span className="flex items-center gap-2">
                    <BrandLogo />
                    <Badge tone="accent">{t('brand')}</Badge>
                </span>
                <nav aria-label={t('navLabel')} className="flex flex-1 flex-wrap gap-1">
                    {ADMIN_NAV.map((item: AdminNavItem): ReactElement => (
                        <Link
                            key={item.to}
                            to={item.to}
                            className="flex min-h-11 items-center gap-2 rounded-control px-3 text-sm font-medium transition-colors hover:bg-accent-tint [&.active]:bg-accent-soft [&.active]:font-semibold"
                        >
                            <item.icon className="size-4" aria-hidden="true" />
                            {t(item.labelKey)}
                        </Link>
                    ))}
                </nav>
                <span className="flex items-center gap-3 text-sm text-content-muted">
                    {user?.email}
                    <Button variant="secondary" size="sm" onClick={handleSignOut}>
                        {t('signOut')}
                    </Button>
                </span>
            </header>
            <main>{children}</main>
        </div>
    );
}
