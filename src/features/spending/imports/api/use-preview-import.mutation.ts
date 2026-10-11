import { useMutation, type UseMutationResult } from '@tanstack/react-query';
import { track } from '@/shared/lib/analytics';
import type { ApiError } from '@/shared/lib/api/api-error';
import { apiClient, unwrap } from '@/shared/lib/api/client';
import type { ApiPaths } from '@/shared/lib/api/api-paths';
import type { ImportFormat, ImportPreview } from '../../types';
import { buildImportFormData } from '../lib/build-import-form-data';
import type { CsvMapping } from '../schemas/mapping.schema';

type PreviewBody = ApiPaths['/spending/imports/preview']['post']['requestBody']['content']['multipart/form-data'];

export interface PreviewImportInput {
    readonly file: File;
    readonly format?: ImportFormat;
    readonly mapping?: CsvMapping;
}

export function usePreviewImport(): UseMutationResult<ImportPreview, ApiError, PreviewImportInput> {
    return useMutation({
        mutationFn: async (input: PreviewImportInput): Promise<ImportPreview> =>
            unwrap(
                await apiClient.POST('/spending/imports/preview', {
                    body: buildImportFormData(input) as unknown as PreviewBody
                })
            ),
        onSuccess: (preview: ImportPreview): void => {
            track('spending_import_previewed', { format: preview.format });
        }
    });
}
