import createClient, { type Client, type Middleware } from 'openapi-fetch';
import { env } from '@/shared/config/env';
import { ApiError } from './api-error';
import { tokenStore } from './token-store';
import type { paths } from './schema';

const REFRESH_PATH: string = '/auth/refresh';

const OWN_CREDENTIAL_PATHS: readonly string[] = [REFRESH_PATH, '/auth/logout', '/auth/google', '/auth/facebook'];

function carriesOwnCredential(url: string): boolean {
    return OWN_CREDENTIAL_PATHS.some((path: string): boolean => url.endsWith(path));
}

export type SessionRenewal = () => Promise<string | null>;

async function renewWithRefreshCookie(): Promise<string | null> {
    const response: Response = await fetch(`${env.VITE_API_URL}${REFRESH_PATH}`, { method: 'POST', credentials: 'include' });
    if (!response.ok) {
        return null;
    }
    const body: { accessToken: string } = (await response.json()) as { accessToken: string };
    return body.accessToken;
}

let renewal: SessionRenewal = renewWithRefreshCookie;

export function setSessionRenewal(next: SessionRenewal): () => void {
    const previous: SessionRenewal = renewal;
    renewal = next;
    return (): void => {
        renewal = previous;
    };
}

let pendingRefresh: Promise<boolean> | null = null;

async function requestRefresh(): Promise<boolean> {
    const token: string | null = await renewal().catch((): null => null);
    tokenStore.set(token);
    return token !== null;
}

export async function refreshSession(): Promise<boolean> {
    pendingRefresh ??= requestRefresh().finally((): void => {
        pendingRefresh = null;
    });
    return pendingRefresh;
}

const retriable: WeakMap<Request, Request> = new WeakMap();

const authMiddleware: Middleware = {
    onRequest({ request }: { request: Request }): Request {
        const token: string | null = tokenStore.get();
        if (token) {
            request.headers.set('authorization', `Bearer ${token}`);
        }
        retriable.set(request, request.clone());
        return request;
    },
    async onResponse({ request, response }: { request: Request; response: Response }): Promise<Response> {
        if (response.status !== 401 || carriesOwnCredential(request.url)) {
            return response;
        }
        const refreshed: boolean = await refreshSession();
        if (!refreshed) {
            return response;
        }
        const retry: Request | undefined = retriable.get(request);
        if (retry === undefined) {
            return response;
        }
        retry.headers.set('authorization', `Bearer ${tokenStore.get() ?? ''}`);
        return fetch(retry);
    }
};

export const apiClient: Client<paths> = createClient<paths>({
    baseUrl: env.VITE_API_URL,
    credentials: 'include',
    fetch: async (request: Request) => globalThis.fetch(request)
});
apiClient.use(authMiddleware);

export function unwrap<T>(result: { data?: T; error?: unknown; response: Response }): T {
    if (result.error !== undefined || !result.response.ok) {
        throw ApiError.fromUnknown(result.error, result.response.status);
    }
    return result.data as T;
}

export function unwrapEmpty(result: { error?: unknown; response: Response }): void {
    if (result.error !== undefined || !result.response.ok) {
        throw ApiError.fromUnknown(result.error, result.response.status);
    }
}
