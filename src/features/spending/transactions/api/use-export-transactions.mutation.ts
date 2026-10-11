import { useMutation, type UseMutationResult } from '@tanstack/react-query';
import type { ApiError } from '@/shared/lib/api/api-error';
import { apiClient, unwrap } from '@/shared/lib/api/client';
import type { ExportFormat } from '../lib/export-formats';
import { downloadBlob } from '../lib/download-blob';
import { filenameFromDisposition } from '../lib/filename-from-disposition';
import type { TransactionsQuery } from '../../types';

export interface ExportTransactionsInput {
    readonly format: ExportFormat;
    readonly filters: TransactionsQuery;
}

interface ExportResult {
    readonly data?: Blob;
    readonly error?: unknown;
    readonly response: Response;
}

export function fallbackFilename(format: ExportFormat): string {
    return `vera-transacoes.${format}`;
}

export function useExportTransactions(): UseMutationResult<void, ApiError, ExportTransactionsInput> {
    return useMutation({
        mutationFn: async ({ format, filters }: ExportTransactionsInput): Promise<void> => {
            const result: ExportResult = await apiClient.GET('/spending/transactions/export', {
                params: { query: { ...filters, format } },
                parseAs: 'blob'
            });
            const blob: Blob = unwrap<Blob>(result);
            const disposition: string | null = result.response.headers.get('content-disposition');
            downloadBlob(blob, filenameFromDisposition(disposition, fallbackFilename(format)));
        }
    });
}
