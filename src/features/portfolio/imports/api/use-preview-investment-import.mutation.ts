import { useMutation, type UseMutationResult } from '@tanstack/react-query';
import type { ApiError } from '@/shared/lib/api/api-error';
import type { ApiPaths } from '@/shared/lib/api/api-paths';
import { apiClient, unwrap } from '@/shared/lib/api/client';
import { buildPreviewFormData, type PreviewFormInput } from '../lib/build-preview-form-data';
import type { InvestmentPreview } from '../types';

type PreviewBody = ApiPaths['/investment-imports/preview']['post']['requestBody']['content']['multipart/form-data'];

export function usePreviewInvestmentImport(): UseMutationResult<InvestmentPreview, ApiError, PreviewFormInput> {
    return useMutation({
        mutationFn: async (input: PreviewFormInput): Promise<InvestmentPreview> =>
            unwrap(await apiClient.POST('/investment-imports/preview', { body: buildPreviewFormData(input) as unknown as PreviewBody }))
    });
}
