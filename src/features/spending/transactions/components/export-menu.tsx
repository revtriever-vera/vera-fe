import { Download } from 'lucide-react';
import type { ReactElement } from 'react';
import type { UseMutationResult } from '@tanstack/react-query';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { useToast, type ToastApi } from '@/app/providers/toast-provider';
import { track } from '@/shared/lib/analytics';
import { ApiError } from '@/shared/lib/api/api-error';
import { Button } from '@/shared/ui/button';
import { DropdownMenu, type DropdownItem } from '@/shared/ui/dropdown-menu';
import { useExportTransactions, type ExportTransactionsInput } from '../api/use-export-transactions.mutation';
import { exportErrorMessage } from '../lib/export-error-message';
import { EXPORT_FORMATS, type ExportFormat } from '../lib/export-formats';
import type { TransactionsQuery } from '../../types';

export interface ExportMenuProps {
    readonly filters: TransactionsQuery;
}

export function ExportMenu({ filters }: ExportMenuProps): ReactElement {
    const { t }: UseTranslationResponse<'spendingTransactions', undefined> = useTranslation('spendingTransactions');
    const toast: ToastApi = useToast();
    const exporter: UseMutationResult<void, ApiError, ExportTransactionsInput> = useExportTransactions();
    const items: readonly DropdownItem[] = EXPORT_FORMATS.map((format: ExportFormat): DropdownItem => ({
        key: format,
        label: t(`export.${format}`),
        onSelect: (): void => {
            exporter.mutate(
                { format, filters },
                {
                    onSuccess: (): void => {
                        track('spending_export_downloaded', { format });
                        toast.show({ tone: 'positive', title: t('export.done') });
                    },
                    onError: (error: Error): void => {
                        toast.show({ tone: 'critical', title: exportErrorMessage(t, error) });
                    }
                }
            );
        }
    }));
    return (
        <DropdownMenu
            items={items}
            trigger={
                <Button variant="secondary" loading={exporter.isPending}>
                    {exporter.isPending ? null : <Download className="size-4" aria-hidden="true" />}
                    {exporter.isPending ? t('export.exporting') : t('export.button')}
                </Button>
            }
        />
    );
}
