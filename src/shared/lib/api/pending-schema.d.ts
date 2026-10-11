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

export interface PendingTransactionView {
    id: string;
    accountId: string;
    accountName: string;
    date: string;
    amountMinor: number;
    currency: string;
    description: string;
    counterpartyName: string | null;
    categoryId: string | null;
    categorySource: 'user' | 'rule' | 'dictionary' | 'provider' | 'none';
    ruleId: string | null;
    source: 'pluggy' | 'ofx' | 'csv' | 'sample';
    installment: {
        number: number;
        total: number;
    } | null;
    isSample: boolean;
}

export interface PendingTransactionsQuery {
    month?: string;
    from?: string;
    to?: string;
    accountId?: string;
    categoryId?: string;
    uncategorized?: boolean;
    direction?: 'in' | 'out';
    q?: string;
    page?: number;
    pageSize?: number;
}

export interface PendingTransactionsResponse {
    data: PendingTransactionView[];
    pagination: PendingPageInfo;
    totals: {
        inMinor: number;
        outMinor: number;
        count: number;
    };
}

export interface PendingUncategorizedCount {
    count: number;
}

export interface PendingRecategorizeBody {
    categoryId: string | null;
    rule?: {
        scope: 'counterparty' | 'description';
    } | null;
}

export interface PendingRecategorizeResult extends PendingRecategorized {
    transaction: PendingTransactionView;
    rule: PendingRuleView | null;
}

export interface PendingAccountView {
    id: string;
    name: string;
    kind: 'checking' | 'savings' | 'credit_card' | 'other';
    institutionName: string | null;
    numberLast4: string | null;
    currency: string;
    source: 'pluggy' | 'file';
    transactionCount: number;
    lastTransactionDate: string | null;
    isSample: boolean;
}

export interface PendingAccountsResponse {
    accounts: PendingAccountView[];
}

export interface PendingCutSuggestion {
    categoryId: string;
    systemKey: string | null;
    name: string | null;
    icon: string;
    spentMinor: number;
    averageMinor: number | null;
    excessMinor: number;
    cutMinor: number;
    limitMinor: number;
}

export interface PendingCutsResponse {
    month: string;
    limitMonth: string;
    isPartial: boolean;
    status: 'no_data' | 'no_income' | 'goal_met' | 'cut_suggested' | 'exceeds_flexible';
    goal: {
        bps: number;
        minor: number;
        simulated: boolean;
    };
    incomeMinor: number;
    savedMinor: number;
    savingsRateBps: number | null;
    gapMinor: number;
    surplusMinor: number;
    totalCutMinor: number;
    flexibleTotalMinor: number;
    excessTotalMinor: number;
    categoriesWithCut: number;
    uncategorizedMinor: number;
    averageMonths: number;
    suggestions: PendingCutSuggestion[];
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

export type PendingImportFormat = 'ofx' | 'csv_nubank_card' | 'csv_nubank_account' | 'csv_generic';

export type PendingImportRejectionReason = 'invalid_date' | 'invalid_amount' | 'zero_amount' | 'empty_description';

export interface PendingImportRejection {
    line: number;
    reason: PendingImportRejectionReason;
}

export interface PendingImportPreview {
    detectedFormat: PendingImportFormat;
    format: PendingImportFormat;
    fileName: string;
    rows: number;
    rejected: number;
    rejections: PendingImportRejection[];
    periodStart: string | null;
    periodEnd: string | null;
    currency: string | null;
    sample: {
        date: string;
        description: string;
        amountMinor: number;
    }[];
    columns: string[] | null;
    accountHint: {
        institution: string | null;
        numberLast4: string | null;
    } | null;
    suggestedAccountId: string | null;
    alreadyImportedAt: string | null;
}

export interface PendingImportView {
    id: string;
    accountId: string;
    accountName: string;
    format: PendingImportFormat;
    fileName: string;
    rows: number;
    inserted: number;
    duplicates: number;
    rejected: number;
    periodStart: string | null;
    periodEnd: string | null;
    status: 'completed' | 'undone' | 'failed';
    createdAt: string;
}

export interface PendingImportCreated extends PendingImportView {
    rejections: PendingImportRejection[];
}

export interface PendingImportsResponse {
    data: PendingImportView[];
    pagination: PendingPageInfo;
}

export interface PendingMultipartBody {
    content: {
        'multipart/form-data': {
            file: string;
            format?: PendingImportFormat;
            mapping?: string;
            accountId?: string;
            newAccountName?: string;
            newAccountKind?: 'checking' | 'savings' | 'credit_card' | 'other';
            newAccountInstitution?: string;
        };
    };
}

export interface PendingRemoved {
    removed: number;
}

export interface PendingIdPath {
    id: string;
}

export interface PendingTransactionsPath extends PendingPathItem {
    get: PendingOperation<PendingTransactionsQuery, PendingNoPath, never, { 200: PendingJson<PendingTransactionsResponse> }>;
}

export interface PendingUncategorizedCountPath extends PendingPathItem {
    get: PendingOperation<never, PendingNoPath, never, { 200: PendingJson<PendingUncategorizedCount> }>;
}

export interface PendingTransactionPath extends PendingPathItem {
    parameters: { query?: never; header?: never; path: PendingIdPath; cookie?: never };
    patch: PendingOperation<
        never,
        PendingIdPath,
        PendingJsonBody<PendingRecategorizeBody>,
        { 200: PendingJson<PendingRecategorizeResult> }
    >;
}

export interface PendingAccountsPath extends PendingPathItem {
    get: PendingOperation<never, PendingNoPath, never, { 200: PendingJson<PendingAccountsResponse> }>;
}

export interface PendingAccountPath extends PendingPathItem {
    parameters: { query?: never; header?: never; path: PendingIdPath; cookie?: never };
    patch: PendingOperation<never, PendingIdPath, PendingJsonBody<{ name: string }>, { 200: PendingJson<PendingAccountView> }>;
    delete: PendingOperation<never, PendingIdPath, never, { 204: PendingNoContent }>;
}

export interface PendingCutsPath extends PendingPathItem {
    get: PendingOperation<{ month?: string; goalBps?: number }, PendingNoPath, never, { 200: PendingJson<PendingCutsResponse> }>;
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

export interface PendingImportPreviewPath extends PendingPathItem {
    post: PendingOperation<never, PendingNoPath, PendingMultipartBody, { 200: PendingJson<PendingImportPreview> }>;
}

export interface PendingImportsPath extends PendingPathItem {
    get: PendingOperation<{ page?: number; pageSize?: number }, PendingNoPath, never, { 200: PendingJson<PendingImportsResponse> }>;
    post: PendingOperation<never, PendingNoPath, PendingMultipartBody, { 201: PendingJson<PendingImportCreated> }>;
}

export interface PendingImportPath extends PendingPathItem {
    parameters: { query?: never; header?: never; path: PendingIdPath; cookie?: never };
    delete: PendingOperation<never, PendingIdPath, never, { 200: PendingJson<PendingRemoved> }>;
}

export interface PendingPaths {
    '/spending/transactions': PendingTransactionsPath;
    '/spending/transactions/uncategorized-count': PendingUncategorizedCountPath;
    '/spending/transactions/{id}': PendingTransactionPath;
    '/spending/accounts': PendingAccountsPath;
    '/spending/accounts/{id}': PendingAccountPath;
    '/spending/cuts': PendingCutsPath;
    '/spending/connections/credentials': PendingCredentialsPath;
    '/spending/connections/credentials/test': PendingCredentialsTestPath;
    '/spending/connections': PendingConnectionsPath;
    '/spending/connections/sync': PendingConnectionsSyncPath;
    '/spending/connections/{id}': PendingConnectionPath;
    '/spending/connections/{id}/sync': PendingConnectionSyncPath;
    '/spending/imports/preview': PendingImportPreviewPath;
    '/spending/imports': PendingImportsPath;
    '/spending/imports/{id}': PendingImportPath;
}
