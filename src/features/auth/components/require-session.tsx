import type { ReactElement, ReactNode } from 'react';
import { Navigate, Outlet, useRouterState } from '@tanstack/react-router';
import { useSession } from '@/app/providers/session-provider';

const LOGIN_PATH: string = '/login';

export function RequireSession({ children }: { readonly children?: ReactNode }): ReactElement | null {
    const { isRestoring, isAuthenticated } = useSession();
    const href: string = useRouterState({ select: (state): string => state.location.href });
    const pathname: string = useRouterState({ select: (state): string => state.location.pathname });

    if (isRestoring) {
        return <div className="min-h-dvh bg-surface" />;
    }
    if (isAuthenticated) {
        return <>{children ?? <Outlet />}</>;
    }
    return pathname === LOGIN_PATH ? null : <Navigate to={LOGIN_PATH} search={{ redirect: href }} replace />;
}
