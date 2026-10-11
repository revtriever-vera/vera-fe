import { HttpResponse, http } from 'msw';
import { afterEach, describe, expect, it } from 'vitest';
import { server } from '../../../../test/msw/server';
import { apiClient, unwrap } from './client';
import { tokenStore } from './token-store';

const FRESH_TOKEN: string = 'token-renewed';

function guardedHealth(authorizations: (string | null)[]): ReturnType<typeof http.get> {
    return http.get('*/health', ({ request }): Response => {
        authorizations.push(request.headers.get('authorization'));
        if (request.headers.get('authorization') !== `Bearer ${FRESH_TOKEN}`) {
            return new HttpResponse(null, { status: 401 });
        }
        return HttpResponse.json({ status: 'ok' });
    });
}

afterEach((): void => {
    tokenStore.set(null);
});

describe('apiClient session renewal', () => {
    it('renews the token and repeats the call when the session expires', async () => {
        const authorizations: (string | null)[] = [];
        server.use(
            http.post('*/auth/refresh', (): Response => HttpResponse.json({ accessToken: FRESH_TOKEN })),
            guardedHealth(authorizations)
        );
        tokenStore.set('token-expired');

        const body: { status: string } = unwrap<{ status: string }>(await apiClient.GET('/health'));

        expect(body.status).toBe('ok');
        expect(authorizations).toEqual(['Bearer token-expired', `Bearer ${FRESH_TOKEN}`]);
        expect(tokenStore.get()).toBe(FRESH_TOKEN);
    });

    it('clears the token when the refresh is refused', async () => {
        server.use(
            http.post('*/auth/refresh', (): Response => new HttpResponse(null, { status: 401 })),
            http.get('*/health', (): Response => new HttpResponse(null, { status: 401 }))
        );
        tokenStore.set('token-expired');

        await expect(async (): Promise<unknown> => unwrap<unknown>(await apiClient.GET('/health'))).rejects.toThrow();

        expect(tokenStore.get()).toBeNull();
    });

    it('does a single refresh when several calls hit the 401 together', async () => {
        let refreshes: number = 0;
        server.use(
            http.post('*/auth/refresh', (): Response => {
                refreshes += 1;
                return HttpResponse.json({ accessToken: FRESH_TOKEN });
            }),
            guardedHealth([])
        );
        tokenStore.set('token-expired');

        const results: { status: string }[] = await Promise.all(
            Array.from({ length: 5 }, async (): Promise<{ status: string }> => unwrap<{ status: string }>(await apiClient.GET('/health')))
        );

        expect(results).toHaveLength(5);
        expect(refreshes).toBe(1);
    });

    it.each(['/auth/google', '/auth/facebook'])(
        'does not try to renew the session when %s answers 401',
        async (path: string): Promise<void> => {
            let refreshes: number = 0;
            server.use(
                http.post('*/auth/refresh', (): Response => {
                    refreshes += 1;
                    return HttpResponse.json({ accessToken: FRESH_TOKEN });
                }),
                http.post(`*${path}`, (): Response => new HttpResponse(null, { status: 401 }))
            );

            const response: Response = (
                path === '/auth/google'
                    ? await apiClient.POST('/auth/google', { body: { idToken: 'credential-1' } })
                    : await apiClient.POST('/auth/facebook', { body: { accessToken: 'credential-1' } })
            ).response;

            expect(response.status).toBe(401);
            expect(refreshes).toBe(0);
        }
    );
});
