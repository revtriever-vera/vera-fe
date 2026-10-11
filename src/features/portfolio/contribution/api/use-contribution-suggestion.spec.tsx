import { describe, expect, it } from 'vitest';
import { renderHook, waitFor, type RenderHookResult } from '@testing-library/react';
import type { UseQueryResult } from '@tanstack/react-query';
import { ApiError } from '@/shared/lib/api/api-error';
import { installContributionApi, type ContributionApi } from '../../../../../test/helpers/contribution-api';
import { createQueryWrapper, type QueryWrapper } from '../../../../../test/render';
import { portfolioKeys } from '../../api/portfolio-keys';
import type { ContributionSuggestion } from '../types';
import { useContributionSuggestion } from './use-contribution-suggestion.query';

describe('useContributionSuggestion', () => {
    it('só chama a API com valor inteiro maior que zero', () => {
        const api: ContributionApi = installContributionApi();
        const { wrapper }: QueryWrapper = createQueryWrapper();

        const nothing: RenderHookResult<UseQueryResult<ContributionSuggestion>, unknown> = renderHook(
            () => useContributionSuggestion(null),
            { wrapper }
        );
        const zero: RenderHookResult<UseQueryResult<ContributionSuggestion>, unknown> = renderHook(() => useContributionSuggestion(0), {
            wrapper
        });
        const fractional: RenderHookResult<UseQueryResult<ContributionSuggestion>, unknown> = renderHook(
            () => useContributionSuggestion(10.5),
            { wrapper }
        );

        expect(nothing.result.current.fetchStatus).toBe('idle');
        expect(zero.result.current.fetchStatus).toBe('idle');
        expect(fractional.result.current.fetchStatus).toBe('idle');
        expect(api.amounts).toEqual([]);
    });

    it('guarda sob a chave do valor e mantém o resultado anterior enquanto o novo carrega', async () => {
        const api: ContributionApi = installContributionApi();
        const { client, wrapper }: QueryWrapper = createQueryWrapper();
        const { result, rerender } = renderHook(({ amount }: { amount: number }) => useContributionSuggestion(amount), {
            wrapper,
            initialProps: { amount: 1000000 }
        });
        await waitFor(() => {
            expect(result.current.isSuccess).toBe(true);
        });
        expect(client.getQueryData(portfolioKeys.contribution(1000000))).toBeDefined();

        rerender({ amount: 2500000 });

        expect(result.current.isPlaceholderData).toBe(true);
        expect(result.current.data?.amountMinor).toBe(1000000);
        await waitFor(() => {
            expect(result.current.isPlaceholderData).toBe(false);
        });
        expect(result.current.data?.amountMinor).toBe(2500000);
        expect(api.amounts).toEqual([1000000, 2500000]);
    });

    it('entrega o ApiError 422 com o código', async () => {
        installContributionApi({ failure: { type: 'contribution.targets_not_set', status: 422 } });
        const { wrapper }: QueryWrapper = createQueryWrapper();
        const { result } = renderHook(() => useContributionSuggestion(1000000), { wrapper });

        await waitFor(() => {
            expect(result.current.isError).toBe(true);
        });

        expect(result.current.error).toBeInstanceOf(ApiError);
        expect((result.current.error as ApiError).problem.type).toBe('contribution.targets_not_set');
    });
});
