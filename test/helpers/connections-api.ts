import { http, HttpResponse } from 'msw';
import type { ConnectionView, CredentialsView } from '@/features/spending/types';
import type { AddItemsBody, ItemResult, SaveCredentialsBody } from '@/features/spending/connections/types';
import { connectionView, notConfiguredCredentials, validCredentials } from '../fixtures/spending';
import { server } from '../msw/server';
import { problemBody } from './rules-api';

export const CLIENT_ID: string = '3f9a1c2e-5b7d-4e8f-9a0b-1c2d3e4f5a6b';
export const SECRET_SENTINEL: string = 'sentinel-secret-9d41f0c2';
export const INVALID_SECRET: string = 'mock-invalid-secret';
export const UNAVAILABLE_SECRET: string = 'mock-unavailable-secret';
export const DISABLED_SECRET: string = 'mock-disabled-secret';
export const ITEM_NUBANK: string = '00000000-0000-4000-8000-00000000a001';
export const ITEM_ITAU: string = '00000000-0000-4000-8000-00000000a002';
export const ITEM_MISSING: string = '00000000-0000-4000-8000-00000000a404';

const SYNC_ERRORS: Readonly<Record<number, string>> = {
    409: 'connections.sync_in_progress',
    503: 'connections.sync_unavailable'
};

export interface ConnectionsApi {
    credentials: CredentialsView;
    connections: ConnectionView[];
    saved: SaveCredentialsBody[];
    added: string[][];
    tests: number;
    removedCredentials: (string | null)[];
    removedConnections: { id: string; purge: string | null }[];
    syncs: string[];
    syncAll: number;
    gets: number;
    settleOnGet: number | null;
    syncStatus: number;
}

export interface ConnectionsApiOptions {
    readonly credentials?: CredentialsView;
    readonly connections?: ConnectionView[];
    readonly settleOnGet?: number;
    readonly syncStatus?: number;
}

const BANKS: Readonly<Record<string, string>> = { a001: 'Nubank', a002: 'Itaú' };

function itemResult(itemId: string, api: ConnectionsApi): ItemResult {
    const suffix: string = itemId.slice(-4);
    const hint: string = `••••${suffix}`;
    const name: string | undefined = BANKS[suffix];
    if (name === undefined) {
        return { itemIdHint: hint, outcome: suffix === 'a500' ? 'failed' : 'not_found', connection: null };
    }
    const connection: ConnectionView = connectionView({
        id: `conn-${suffix}`,
        itemIdHint: hint,
        connectorName: name,
        syncing: true,
        lastSuccessAt: null,
        lastRun: null
    });
    api.connections = [...api.connections, connection];
    return { itemIdHint: hint, outcome: 'connected', connection };
}

function settle(api: ConnectionsApi): void {
    if (api.settleOnGet === null || api.gets < api.settleOnGet) {
        return;
    }
    api.connections = api.connections.map((connection: ConnectionView): ConnectionView => ({
        ...connection,
        syncing: false,
        lastSuccessAt: new Date().toISOString()
    }));
}

function credentialErrorFor(secret: string): Response | null {
    if (secret === INVALID_SECRET) {
        return HttpResponse.json(problemBody('connections.invalid_credentials', 422), { status: 422 });
    }
    if (secret === UNAVAILABLE_SECRET) {
        return HttpResponse.json(problemBody('connections.provider_unavailable', 502), { status: 502 });
    }
    return secret === DISABLED_SECRET ? HttpResponse.json(problemBody('connections.provider_disabled', 503), { status: 503 }) : null;
}

export function installConnectionsApi(options: ConnectionsApiOptions = {}): ConnectionsApi {
    const api: ConnectionsApi = {
        credentials: options.credentials ?? notConfiguredCredentials(),
        connections: options.connections ?? [],
        saved: [],
        added: [],
        tests: 0,
        removedCredentials: [],
        removedConnections: [],
        syncs: [],
        syncAll: 0,
        gets: 0,
        settleOnGet: options.settleOnGet ?? null,
        syncStatus: options.syncStatus ?? 202
    };
    server.use(
        http.get('*/spending/connections', () => {
            api.gets += 1;
            settle(api);
            return HttpResponse.json({ credentials: api.credentials, connections: api.connections });
        }),
        http.put('*/spending/connections/credentials', async ({ request }) => {
            const body: SaveCredentialsBody = (await request.json()) as SaveCredentialsBody;
            api.saved.push(body);
            const failure: Response | null = credentialErrorFor(body.clientSecret);
            if (failure !== null) {
                return failure;
            }
            api.credentials = validCredentials({ clientIdHint: '3f9a…c2e1' });
            return HttpResponse.json(api.credentials);
        }),
        http.post('*/spending/connections/credentials/test', () => {
            api.tests += 1;
            api.credentials = { ...api.credentials, status: 'valid', lastVerifiedAt: '2026-10-11T17:02:00.000Z' };
            return HttpResponse.json(api.credentials);
        }),
        http.delete('*/spending/connections/credentials', ({ request }) => {
            api.removedCredentials.push(new URL(request.url).searchParams.get('purgeTransactions'));
            api.credentials = notConfiguredCredentials();
            api.connections = [];
            return new HttpResponse(null, { status: 204 });
        }),
        http.post('*/spending/connections/sync', () => {
            api.syncAll += 1;
            return api.syncStatus === 202
                ? HttpResponse.json({ queued: api.connections.length }, { status: 202 })
                : HttpResponse.json(problemBody(SYNC_ERRORS[api.syncStatus] ?? 'connections.sync_in_progress', api.syncStatus), {
                      status: api.syncStatus
                  });
        }),
        http.post('*/spending/connections/:id/sync', ({ params }) => {
            api.syncs.push(String(params['id']));
            return api.syncStatus === 202
                ? HttpResponse.json({ queued: true }, { status: 202 })
                : HttpResponse.json(problemBody(SYNC_ERRORS[api.syncStatus] ?? 'connections.sync_in_progress', api.syncStatus), {
                      status: api.syncStatus
                  });
        }),
        http.post('*/spending/connections', async ({ request }) => {
            const body: AddItemsBody = (await request.json()) as AddItemsBody;
            api.added.push(body.itemIds);
            return HttpResponse.json({ results: body.itemIds.map((itemId: string): ItemResult => itemResult(itemId, api)) });
        }),
        http.delete('*/spending/connections/:id', ({ params, request }) => {
            api.removedConnections.push({ id: String(params['id']), purge: new URL(request.url).searchParams.get('purgeTransactions') });
            api.connections = api.connections.filter((connection: ConnectionView): boolean => connection.id !== params['id']);
            return new HttpResponse(null, { status: 204 });
        })
    );
    return api;
}
