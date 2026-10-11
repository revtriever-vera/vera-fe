import type { ReactElement } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { LoginPage } from '@/features/auth/pages/login-page';
import { safeRedirect } from '@/features/auth/lib/safe-redirect';

interface LoginSearch {
    readonly redirect?: string;
    readonly deleted?: '1';
}

function LoginRoute(): ReactElement {
    const { redirect, deleted }: LoginSearch = Route.useSearch();
    return <LoginPage redirectTo={safeRedirect(redirect)} accountDeleted={deleted === '1'} />;
}

export const Route = createFileRoute('/login')({
    validateSearch: (search: Record<string, unknown>): LoginSearch => ({
        ...(typeof search.redirect === 'string' ? { redirect: search.redirect } : {}),
        ...(search.deleted === '1' || search.deleted === 1 ? { deleted: '1' as const } : {})
    }),
    component: LoginRoute
});
