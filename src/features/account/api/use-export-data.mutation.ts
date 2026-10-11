import { useMutation, type UseMutationResult } from '@tanstack/react-query';
import { apiClient, unwrap } from '@/shared/lib/api/client';
import { downloadBlob } from '../lib/download-blob';
import { exportFilename } from '../lib/export-filename';
import { accountKeys } from './account-keys';

interface ExportResult {
    readonly data?: Blob;
    readonly error?: unknown;
    readonly response: Response;
}

export function useExportData(): UseMutationResult<void, Error, void> {
    return useMutation({
        mutationKey: accountKeys.export(),
        mutationFn: async (): Promise<void> => {
            const result: ExportResult = await apiClient.GET('/account/export', { parseAs: 'blob' });
            const blob: Blob = unwrap<Blob>(result);
            downloadBlob(blob, exportFilename(result.response.headers.get('content-disposition')));
        }
    });
}
