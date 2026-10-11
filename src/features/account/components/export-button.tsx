import type { ReactElement } from 'react';
import type { UseMutationResult } from '@tanstack/react-query';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { useToast, type ToastApi } from '@/app/providers/toast-provider';
import { Button } from '@/shared/ui/button';
import { useExportData } from '../api/use-export-data.mutation';
import { accountErrorMessage } from '../lib/account-error-message';

export function ExportButton({ variant = 'secondary' }: { readonly variant?: 'primary' | 'secondary' }): ReactElement {
    const { t }: UseTranslationResponse<'account', undefined> = useTranslation('account');
    const toast: ToastApi = useToast();
    const exportData: UseMutationResult<void, Error, void> = useExportData();

    const handleClick = (): void => {
        if (exportData.isPending) {
            return;
        }
        exportData.mutate(undefined, {
            onSuccess: (): void => {
                toast.show({ tone: 'positive', title: t('exportDone') });
            },
            onError: (error: Error): void => {
                toast.show({ tone: 'critical', title: accountErrorMessage(t, error, 'export') });
            }
        });
    };

    return (
        <Button type="button" variant={variant} loading={exportData.isPending} onClick={handleClick}>
            {exportData.isPending ? t('exportDownloading') : t('exportButton')}
        </Button>
    );
}
