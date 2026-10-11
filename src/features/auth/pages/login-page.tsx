import type { ReactElement } from 'react';
import { Navigate } from '@tanstack/react-router';
import { useSession } from '@/app/providers/session-provider';
import { LoginBox } from '../components/login-box';
import { LoginHero } from '../components/login-hero';
import { PoweredBy } from '../components/powered-by';

export function LoginPage({ redirectTo = '/' }: { readonly redirectTo?: string }): ReactElement {
    const { isRestoring, isAuthenticated } = useSession();

    if (isRestoring) {
        return <main className="min-h-dvh bg-surface" />;
    }
    if (isAuthenticated) {
        return <Navigate to={redirectTo} replace />;
    }

    return (
        <main className="grid min-h-dvh grid-cols-[minmax(0,1fr)] grid-rows-[220px_1fr] bg-surface min-[861px]:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] min-[861px]:grid-rows-1">
            <LoginHero />
            <div className="relative grid grid-cols-[minmax(0,1fr)] place-content-center place-items-center px-[clamp(16px,5vw,64px)] py-10 min-[861px]:pb-16">
                <LoginBox />
                <PoweredBy />
            </div>
        </main>
    );
}
