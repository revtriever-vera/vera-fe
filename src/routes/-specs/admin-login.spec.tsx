import { beforeEach, describe, expect, it, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import type { AnyRouter } from '@tanstack/react-router';
import { http, HttpResponse } from 'msw';
import { problem, loginSession, sessionIdentity } from '../../../test/fixtures/auth';
import { server } from '../../../test/msw/server';
import { renderRouterAt } from '../../../test/router';
import type { GoogleCredentialResponse, GoogleIdentity } from '@/features/auth/lib/google-identity';

const google: { callback: ((response: GoogleCredentialResponse) => void) | null } = vi.hoisted(() => ({ callback: null }));

vi.mock('@/shared/config/env', async (importOriginal) => {
    const original = await importOriginal<typeof import('@/shared/config/env')>();
    return { env: { ...original.env, VITE_GOOGLE_CLIENT_ID: 'client-test.apps.example' } };
});

vi.mock('@/features/auth/lib/google-identity', () => ({
    loadGoogleIdentity: (): Promise<GoogleIdentity> =>
        Promise.resolve({
            initialize: (config): void => {
                google.callback = config.callback;
            },
            renderButton: (): void => undefined
        })
}));

describe('AdminLoginBox', () => {
    beforeEach((): void => {
        google.callback = null;
    });

    it('signs in with the admin audience and lands on the audit', async () => {
        let body: unknown = null;
        server.use(
            http.post('*/auth/google', async ({ request }) => {
                body = await request.json();
                return HttpResponse.json(loginSession());
            }),
            http.get('*/auth/me', () => HttpResponse.json(sessionIdentity())),
            http.get('*/platform/audit', () => HttpResponse.json({ items: [] }))
        );
        const router: AnyRouter = renderRouterAt('/admin/login');

        await waitFor((): void => {
            expect(google.callback).not.toBeNull();
        });
        google.callback?.({ credential: 'google-id-token' });

        await waitFor(() => {
            expect(router.state.location.pathname).toBe('/admin/audit');
        });
        expect(body).toEqual({ idToken: 'google-id-token', audience: 'admin' });
    });

    it('shows the refusal for a person outside the system company', async () => {
        server.use(http.post('*/auth/google', () => HttpResponse.json(problem('identity.platform_only', 403), { status: 403 })));
        renderRouterAt('/admin/login');

        await waitFor((): void => {
            expect(google.callback).not.toBeNull();
        });
        google.callback?.({ credential: 'google-id-token' });

        expect(await screen.findByText('Esta conta não tem acesso ao admin.')).toBeInTheDocument();
    });
});
