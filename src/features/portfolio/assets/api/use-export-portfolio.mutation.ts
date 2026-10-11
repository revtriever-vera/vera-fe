import { useMutation, type UseMutationResult } from '@tanstack/react-query';
import { apiClient, unwrap } from '@/shared/lib/api/client';
import type { ApiError } from '@/shared/lib/api/api-error';
import { downloadBlob } from '../lib/download-blob';
import { filenameFromDisposition } from '../lib/filename-from-disposition';
import type { ExportFormat } from '../types';

export interface ExportPortfolioInput {
    readonly format: ExportFormat;
}

interface ExportResult {
    readonly data?: Blob;
    readonly error?: unknown;
    readonly response: Response;
}

export function fallbackFilename(format: ExportFormat): string {
    return `vera-carteira.${format}`;
}

export function useExportPortfolio(): UseMutationResult<void, ApiError, ExportPortfolioInput> {
    return useMutation({
        mutationFn: async ({ format }: ExportPortfolioInput): Promise<void> => {
            const result: ExportResult = await apiClient.GET('/portfolio/export', { params: { query: { format } }, parseAs: 'blob' });
            const blob: Blob = unwrap<Blob>(result);
            const disposition: string | null = result.response.headers.get('content-disposition');
            downloadBlob(blob, filenameFromDisposition(disposition, fallbackFilename(format)));
        }
    });
}
