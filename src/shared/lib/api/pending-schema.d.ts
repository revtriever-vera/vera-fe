export interface PendingJson<Body> {
    headers: {
        [name: string]: unknown;
    };
    content: {
        'application/json': Body;
    };
}

export interface PendingNoContent {
    headers: {
        [name: string]: unknown;
    };
    content?: never;
}

export type PendingNoPath = Record<string, never>;

export type PendingPathParameter<Path> = [Path] extends [PendingNoPath] ? { path?: never } : { path: Path };

export type PendingRequestBody<Body> = [Body] extends [never] ? { requestBody?: never } : { requestBody: Body };

export type PendingOperation<Query, Path, Body, Responses> = {
    parameters: {
        query?: Query;
        header?: never;
        cookie?: never;
    } & PendingPathParameter<Path>;
    responses: Responses;
} & PendingRequestBody<Body>;

export interface PendingPathItem {
    parameters: {
        query?: never;
        header?: never;
        path?: never;
        cookie?: never;
    };
    get?: never;
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
}

export type PendingJsonBody<Body> = { content: { 'application/json': Body } };

export interface PendingRecategorized {
    recategorized: number;
}

export interface PendingRuleView {
    id: string;
    matchType: 'counterparty' | 'description' | 'contains';
    label: string;
    appliesTo: 'out' | 'in' | 'any';
    categoryId: string;
    createdAt: string;
    updatedAt: string;
}

export interface PendingPageInfo {
    page: number;
    pageSize: number;
    totalRecords: number;
    totalPages: number;
}

export interface PendingCredentialsView {
    configured: boolean;
    clientIdHint: string | null;
    status: 'valid' | 'invalid' | null;
    lastVerifiedAt: string | null;
    updatedAt: string | null;
}

export interface PendingConnectionView {
    id: string;
    itemIdHint: string;
    connectorName: string | null;
    status: 'active' | 'needs_attention' | 'revoked' | 'paused';
    statusReason: string | null;
    consentExpiresAt: string | null;
    lastSyncAt: string | null;
    lastSuccessAt: string | null;
    syncing: boolean;
    accounts: {
        accountId: string;
        name: string;
        kind: string;
        numberLast4: string | null;
    }[];
    lastRun: {
        trigger: string;
        status: string;
        startedAt: string;
        finishedAt: string | null;
        inserted: number;
        failureCode: string | null;
    } | null;
}

export interface PendingConnectionsResponse {
    credentials: PendingCredentialsView;
    connections: PendingConnectionView[];
}

export interface PendingSaveCredentialsBody {
    clientId: string;
    clientSecret: string;
}

export interface PendingPurgeQuery {
    purgeTransactions?: boolean;
}

export interface PendingAddConnectionsBody {
    itemIds: string[];
}

export interface PendingAddConnectionsResponse {
    results: {
        itemIdHint: string;
        outcome: 'connected' | 'already_connected' | 'not_found' | 'limit_reached' | 'failed';
        connection: PendingConnectionView | null;
    }[];
}

export interface PendingSyncQueued {
    queued: boolean;
}

export interface PendingSyncAllQueued {
    queued: number;
}

export interface PendingIdPath {
    id: string;
}

export interface PendingCredentialsPath extends PendingPathItem {
    get: PendingOperation<never, PendingNoPath, never, { 200: PendingJson<PendingCredentialsView> }>;
    put: PendingOperation<never, PendingNoPath, PendingJsonBody<PendingSaveCredentialsBody>, { 200: PendingJson<PendingCredentialsView> }>;
    delete: PendingOperation<PendingPurgeQuery, PendingNoPath, never, { 204: PendingNoContent }>;
}

export interface PendingCredentialsTestPath extends PendingPathItem {
    post: PendingOperation<never, PendingNoPath, never, { 200: PendingJson<PendingCredentialsView> }>;
}

export interface PendingConnectionsPath extends PendingPathItem {
    get: PendingOperation<never, PendingNoPath, never, { 200: PendingJson<PendingConnectionsResponse> }>;
    post: PendingOperation<
        never,
        PendingNoPath,
        PendingJsonBody<PendingAddConnectionsBody>,
        { 200: PendingJson<PendingAddConnectionsResponse> }
    >;
}

export interface PendingConnectionPath extends PendingPathItem {
    parameters: { query?: never; header?: never; path: PendingIdPath; cookie?: never };
    delete: PendingOperation<PendingPurgeQuery, PendingIdPath, never, { 204: PendingNoContent }>;
}

export interface PendingConnectionSyncPath extends PendingPathItem {
    parameters: { query?: never; header?: never; path: PendingIdPath; cookie?: never };
    post: PendingOperation<never, PendingIdPath, never, { 202: PendingJson<PendingSyncQueued> }>;
}

export interface PendingConnectionsSyncPath extends PendingPathItem {
    post: PendingOperation<never, PendingNoPath, never, { 202: PendingJson<PendingSyncAllQueued> }>;
}

export interface PendingPaths {
    '/spending/connections/credentials': PendingCredentialsPath;
    '/spending/connections/credentials/test': PendingCredentialsTestPath;
    '/spending/connections': PendingConnectionsPath;
    '/spending/connections/sync': PendingConnectionsSyncPath;
    '/spending/connections/{id}': PendingConnectionPath;
    '/spending/connections/{id}/sync': PendingConnectionSyncPath;
}
