import type { ReactElement } from 'react';
import { Navigate } from '@tanstack/react-router';
import { useSession } from '@/app/providers/session-provider';
import { AdminLoginBox } from '../components/admin-login-box';

export function AdminLoginPage(): ReactElement {
    const { isRestoring, isAuthenticated } = useSession();
    if (isRestoring) {
        return <main className="min-h-dvh bg-surface" />;
    }
    if (isAuthenticated) {
        return <Navigate to="/admin/audit" replace />;
    }
    return (
        <main className="grid min-h-dvh place-items-center bg-surface px-[clamp(16px,5vw,64px)] py-10">
            <AdminLoginBox />
        </main>
    );
}
