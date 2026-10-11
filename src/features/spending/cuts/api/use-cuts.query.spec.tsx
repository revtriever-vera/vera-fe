import { describe, expect, it } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { installCutsApi, type CutsApi } from '../../../../../test/helpers/cuts-api';
import { createQueryWrapper, type QueryWrapper } from '../../../../../test/render';
import { spendingKeys } from '../../api/spending-keys';
import { useCuts } from './use-cuts.query';

describe('useCuts', () => {
    it('sem mês e sem meta, não manda parâmetro nenhum', async () => {
        const api: CutsApi = installCutsApi();
        const { wrapper }: QueryWrapper = createQueryWrapper();

        const { result } = renderHook(() => useCuts(null, null), { wrapper });

        await waitFor(() => {
            expect(result.current.data?.status).toBe('cut_suggested');
        });
        expect(api.requests).toHaveLength(1);
        expect(api.requests[0]?.toString()).toBe('');
    });

    it('manda o mês e a meta simulada na query e guarda sob a chave dos dois', async () => {
        const api: CutsApi = installCutsApi();
        const { client, wrapper }: QueryWrapper = createQueryWrapper();

        const { result } = renderHook(() => useCuts('2026-09', 3500), { wrapper });

        await waitFor(() => {
            expect(result.current.data?.goal.simulated).toBe(true);
        });
        expect(api.requests[0]?.get('month')).toBe('2026-09');
        expect(api.requests[0]?.get('goalBps')).toBe('3500');
        expect(client.getQueryData(spendingKeys.cuts('2026-09', 3500))).toBeDefined();
    });

    it('mantém o resultado anterior enquanto a nova meta carrega', async () => {
        installCutsApi();
        const { wrapper }: QueryWrapper = createQueryWrapper();
        const { result, rerender } = renderHook(({ bps }: { bps: number | null }) => useCuts(null, bps), {
            wrapper,
            initialProps: { bps: null as number | null }
        });
        await waitFor(() => {
            expect(result.current.data?.gapMinor).toBe(224000);
        });

        rerender({ bps: 3500 });

        expect(result.current.data?.gapMinor).toBe(224000);
        expect(result.current.isPlaceholderData).toBe(true);
        await waitFor(() => {
            expect(result.current.data?.gapMinor).toBe(644000);
        });
    });
});
