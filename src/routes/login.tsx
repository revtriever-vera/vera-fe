import type { ReactElement } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { LoginPage } from '@/features/auth/pages/login-page';
import { safeRedirect } from '@/features/auth/lib/safe-redirect';

interface LoginSearch {
    readonly redirect?: string;
}

function LoginRoute(): ReactElement {
    const { redirect }: LoginSearch = Route.useSearch();
    return <LoginPage redirectTo={safeRedirect(redirect)} />;
}

export const Route = createFileRoute('/login')({
    validateSearch: (search: Record<string, unknown>): LoginSearch =>
        typeof search.redirect === 'string' ? { redirect: search.redirect } : {},
    component: LoginRoute
});
