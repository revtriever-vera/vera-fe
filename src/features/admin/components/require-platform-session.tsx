import type { ReactElement, ReactNode } from 'react';
import { Navigate } from '@tanstack/react-router';
import { useSession } from '@/app/providers/session-provider';

export function RequirePlatformSession({ children }: { readonly children: ReactNode }): ReactElement {
    const { isRestoring, isAuthenticated } = useSession();
    if (isRestoring) {
        return <div className="min-h-dvh bg-surface" />;
    }
    if (!isAuthenticated) {
        return <Navigate to="/admin/login" replace />;
    }
    return <>{children}</>;
}
