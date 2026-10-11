import { describe, expect, it } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { DEFAULT_GOAL_BPS, useGoalDraft } from './goal-draft';

describe('useGoalDraft', () => {
    it('começa igual à meta gravada, sem sujar', () => {
        const { result } = renderHook(() => useGoalDraft(2000));

        expect(result.current).toMatchObject({ savedBps: 2000, draftBps: 2000, dirty: false });
    });

    it('fica sujo quando o rascunho difere do gravado e limpo ao voltar', () => {
        const { result } = renderHook(() => useGoalDraft(2000));

        act(() => {
            result.current.set(3500);
        });
        expect(result.current).toMatchObject({ draftBps: 3500, dirty: true });

        act(() => {
            result.current.set(2000);
        });
        expect(result.current.dirty).toBe(false);
    });

    it('reset descarta o rascunho', () => {
        const { result } = renderHook(() => useGoalDraft(2000));
        act(() => {
            result.current.set(3500);
        });

        act(() => {
            result.current.reset();
        });

        expect(result.current).toMatchObject({ draftBps: 2000, dirty: false });
    });

    it('acompanha a meta gravada quando ela muda e não há rascunho', () => {
        const { result, rerender } = renderHook(({ saved }: { saved: number | undefined }) => useGoalDraft(saved), {
            initialProps: { saved: undefined as number | undefined }
        });
        expect(result.current.savedBps).toBe(DEFAULT_GOAL_BPS);

        rerender({ saved: 3000 });

        expect(result.current).toMatchObject({ savedBps: 3000, draftBps: 3000, dirty: false });
    });
});
