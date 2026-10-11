import { useEffect, useState, type ReactElement } from 'react';
import { Navigate, useNavigate, type UseNavigateResult } from '@tanstack/react-router';
import { useSession } from '@/app/providers/session-provider';
import { LoginBox } from '../components/login-box';
import { LoginHero } from '../components/login-hero';
import { PoweredBy } from '../components/powered-by';

interface LoginPageProps {
    readonly redirectTo?: string;
    readonly accountDeleted?: boolean;
}

export function LoginPage({ redirectTo = '/', accountDeleted = false }: LoginPageProps): ReactElement {
    const { isRestoring, isAuthenticated } = useSession();
    const navigate: UseNavigateResult<string> = useNavigate();
    const [showDeleted] = useState<boolean>(accountDeleted);

    useEffect((): void => {
        if (accountDeleted) {
            void navigate({ to: '/login', search: (previous: { redirect?: string }) => ({ redirect: previous.redirect }), replace: true });
        }
    }, [accountDeleted, navigate]);

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
                <LoginBox accountDeleted={showDeleted} />
                <PoweredBy />
            </div>
        </main>
    );
}
