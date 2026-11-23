import type { ReactElement } from 'react';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { useRole } from '@/app/providers/use-role';
import { useToast, type ToastApi } from '@/app/providers/toast-provider';
import type { ApiError } from '@/shared/lib/api/api-error';
import { Button } from '@/shared/ui/button';
import type { TransactionView } from '../../types';
import { useMarkRecurring } from '../api/use-mark-recurring.mutation';
import { recurringErrorMessage } from '../lib/recurring-error-message';
import type { MarkRecurringResult } from '../types';

export function canMarkRecurring(transaction: TransactionView, canEdit: boolean): boolean {
    return canEdit && transaction.amountMinor < 0 && !transaction.isRecurring && !transaction.isSample;
}

export function MarkRecurringButton({ transaction }: { readonly transaction: TransactionView }): ReactElement | null {
    const { t }: UseTranslationResponse<'spendingRecurring', undefined> = useTranslation('spendingRecurring');
    const { canEdit } = useRole();
    const toast: ToastApi = useToast();
    const mutation: ReturnType<typeof useMarkRecurring> = useMarkRecurring();
    if (!canMarkRecurring(transaction, canEdit)) {
        return null;
    }
    return (
        <Button
            variant="ghost"
            size="sm"
            loading={mutation.isPending}
            onClick={(): void => {
                mutation.mutate(transaction.id, {
                    onSuccess: (series: MarkRecurringResult): void => {
                        toast.show({ tone: 'positive', title: t('toast.confirmed', { name: series.name }) });
                    },
                    onError: (error: ApiError): void => {
                        toast.show({ tone: 'critical', title: recurringErrorMessage(t, error) });
                    }
                });
            }}
        >
            {t('touchpoints.mark')}
        </Button>
    );
}
