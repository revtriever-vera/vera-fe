import { useMutation, useQueryClient, type QueryClient, type UseMutationResult } from '@tanstack/react-query';
import { track } from '@/shared/lib/analytics';
import type { ApiError } from '@/shared/lib/api/api-error';
import type { ApiPaths } from '@/shared/lib/api/api-paths';
import { apiClient, unwrap } from '@/shared/lib/api/client';
import type { ImportCreated, ImportFormat } from '../../types';
import { invalidateSpending } from '../../api/invalidate-spending';
import { buildImportFormData, type ImportTarget } from '../lib/build-import-form-data';
import type { CsvMapping } from '../schemas/mapping.schema';

type CommitBody = ApiPaths['/spending/imports']['post']['requestBody']['content']['multipart/form-data'];

export interface CommitImportInput {
    readonly file: File;
    readonly format: ImportFormat;
    readonly mapping?: CsvMapping;
    readonly target: ImportTarget;
}

export function useCommitImport(): UseMutationResult<ImportCreated, ApiError, CommitImportInput> {
    const queryClient: QueryClient = useQueryClient();
    return useMutation({
        mutationFn: async (input: CommitImportInput): Promise<ImportCreated> =>
            unwrap(await apiClient.POST('/spending/imports', { body: buildImportFormData(input) as unknown as CommitBody })),
        onSuccess: async (created: ImportCreated): Promise<void> => {
            track('spending_import_completed', { format: created.format, inserted: created.inserted, duplicates: created.duplicates });
            await invalidateSpending(queryClient);
        }
    });
}
