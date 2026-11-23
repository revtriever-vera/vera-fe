import { useState } from 'react';
import type { UseMutationResult } from '@tanstack/react-query';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { useToast, type ToastApi } from '@/app/providers/toast-provider';
import type { ApiError } from '@/shared/lib/api/api-error';
import { track } from '@/shared/lib/analytics';
import type { BillingState } from '@/shared/lib/billing/billing-context';
import { useBilling } from '@/shared/lib/billing/use-billing';
import { useRegenerateSummary } from '../api/use-regenerate-summary.mutation';
import type { SummaryKind, SummaryParams, SummaryView } from '../types';

export interface Regenerate {
    readonly run: () => Promise<void>;
    readonly pending: boolean;
    readonly error: Error | null;
}

export function useRegenerate(kind: SummaryKind, params: SummaryParams): Regenerate {
    const { t }: UseTranslationResponse<'summaries', undefined> = useTranslation('summaries');
    const toast: ToastApi = useToast();
    const billing: BillingState = useBilling();
    const mutation: UseMutationResult<SummaryView | null, ApiError, void> = useRegenerateSummary(kind, params);
    const [failure, setFailure] = useState<Error | null>(null);
    const run = async (): Promise<void> => {
        setFailure(null);
        try {
            await mutation.mutateAsync();
            track('summary_regenerated', { kind });
            toast.show({ tone: 'positive', title: t('regenerate.done') });
            await billing.refresh();
        } catch (error) {
            setFailure(error instanceof Error ? error : new Error('regenerate failed'));
        }
    };
    return { run, pending: mutation.isPending, error: failure };
}
