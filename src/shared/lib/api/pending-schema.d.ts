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

export interface PendingSyncQueued {
    queued: boolean;
}

export interface PendingSyncAllQueued {
    queued: number;
}

export interface PendingIdPath {
    id: string;
}

export interface PendingConnectionSyncPath extends PendingPathItem {
    parameters: { query?: never; header?: never; path: PendingIdPath; cookie?: never };
    post: PendingOperation<never, PendingIdPath, never, { 202: PendingJson<PendingSyncQueued> }>;
}

export interface PendingConnectionsSyncPath extends PendingPathItem {
    post: PendingOperation<never, PendingNoPath, never, { 202: PendingJson<PendingSyncAllQueued> }>;
}

export interface PendingPaths {
    '/spending/connections/sync': PendingConnectionsSyncPath;
    '/spending/connections/{id}/sync': PendingConnectionSyncPath;
}
