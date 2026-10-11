export interface ProblemDetails {
    readonly type: string;
    readonly title: string;
    readonly status: number;
    readonly detail: string;
    readonly requestId: string | null;
    readonly meta?: Record<string, unknown>;
}

export interface FieldIssue {
    readonly path: string;
    readonly message: string;
}

function isProblem(value: unknown): value is Partial<ProblemDetails> {
    return typeof value === 'object' && value !== null;
}

export class ApiError extends Error {
    public readonly problem: ProblemDetails;

    public constructor(problem: ProblemDetails) {
        super(problem.detail);
        this.name = 'ApiError';
        this.problem = problem;
    }

    public get status(): number {
        return this.problem.status;
    }

    public get requestId(): string | null {
        return this.problem.requestId;
    }

    public fieldIssues(): FieldIssue[] {
        const raw: unknown = this.problem.meta?.['errors'];
        if (!Array.isArray(raw)) {
            return [];
        }
        return raw.flatMap((issue): { path: string; message: string }[] => {
            const candidate: { path?: unknown; message?: unknown } = issue as { path?: unknown; message?: unknown };
            const path: string = Array.isArray(candidate.path) ? candidate.path.join('.') : '';
            return path && typeof candidate.message === 'string' ? [{ path, message: candidate.message }] : [];
        });
    }

    public static fromUnknown(value: unknown, status: number): ApiError {
        if (!isProblem(value)) {
            return new ApiError({
                type: 'about:blank',
                title: 'Error',
                status,
                detail: 'The operation could not be completed.',
                requestId: null
            });
        }
        const problem: Partial<ProblemDetails> = value;
        return new ApiError({
            type: problem.type ?? 'about:blank',
            title: problem.title ?? 'Error',
            status: problem.status ?? status,
            detail: problem.detail ?? 'The operation could not be completed.',
            requestId: problem.requestId ?? null,
            meta: problem.meta
        });
    }
}
