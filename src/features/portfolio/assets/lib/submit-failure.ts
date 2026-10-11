import { ApiError } from '@/shared/lib/api/api-error';

export type SubmitFailure =
    | { readonly kind: 'quantity' }
    | { readonly kind: 'class' }
    | { readonly kind: 'duplicate'; readonly positionId: string | null }
    | { readonly kind: 'alert' }
    | { readonly kind: 'toast' };

const ALERT_CODES: readonly string[] = ['positions.limit_reached', 'validation_failed', 'catalog.asset_not_found'];
const FIXED_INCOME_PREFIX: string = 'fixed_income.';

function duplicateOf(error: ApiError): SubmitFailure {
    const positionId: unknown = error.problem.meta?.['positionId'];
    return { kind: 'duplicate', positionId: typeof positionId === 'string' ? positionId : null };
}

export function classifyFailure(error: Error): SubmitFailure {
    if (!(error instanceof ApiError)) {
        return { kind: 'toast' };
    }
    const code: string = error.problem.type;
    if (code === 'positions.invalid_quantity') {
        return { kind: 'quantity' };
    }
    if (code === 'positions.class_required') {
        return { kind: 'class' };
    }
    if (code === 'positions.asset_already_in_portfolio') {
        return duplicateOf(error);
    }
    return ALERT_CODES.includes(code) || code.startsWith(FIXED_INCOME_PREFIX) ? { kind: 'alert' } : { kind: 'toast' };
}
