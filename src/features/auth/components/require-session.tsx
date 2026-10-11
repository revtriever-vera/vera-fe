import type { ReactElement } from 'react';
import { Navigate, Outlet, useRouterState } from '@tanstack/react-router';
import { useSession } from '@/app/providers/session-provider';

const LOGIN_PATH: string = '/login';

export function RequireSession(): ReactElement | null {
    const { isRestoring, isAuthenticated } = useSession();
    const href: string = useRouterState({ select: (state): string => state.location.href });
    const pathname: string = useRouterState({ select: (state): string => state.location.pathname });

    if (isRestoring) {
        return <div className="min-h-dvh bg-surface" />;
    }
    if (isAuthenticated) {
        return <Outlet />;
    }
    return pathname === LOGIN_PATH ? null : <Navigate to={LOGIN_PATH} search={{ redirect: href }} replace />;
}
