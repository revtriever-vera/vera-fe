import { describe, expect, it } from 'vitest';
import { canonicalCuts, emptyCuts } from '../../../../../test/fixtures/spending';
import type { CutsResponse } from '../../types';
import { cutsStatusView, type CutsStatusView } from './cuts-status-text';

describe('cutsStatusView', () => {
    it('cut_suggested: falta por mês em caution, com o total e as categorias', () => {
        expect(cutsStatusView(canonicalCuts('goal20'))).toEqual({
            labelKey: 'status.gapLabel',
            textKey: 'status.cutSuggested',
            amountMinor: 224000,
            tone: 'caution',
            count: 6
        });
    });

    it('cut_suggested com uma categoria só leva a contagem 1 para o plural', () => {
        const single: CutsResponse = { ...canonicalCuts('goal20'), categoriesWithCut: 1 };

        expect(cutsStatusView(single)?.count).toBe(1);
    });

    it('exceeds_flexible: mesma etiqueta, outra frase', () => {
        const view: CutsStatusView | null = cutsStatusView(canonicalCuts('goal60'));

        expect(view?.labelKey).toBe('status.gapLabel');
        expect(view?.textKey).toBe('status.exceedsFlexible');
        expect(view?.amountMinor).toBe(1344000);
        expect(view?.tone).toBe('caution');
    });

    it('goal_met: meta atingida em positive com o excedente', () => {
        expect(cutsStatusView(canonicalCuts('goal10'))).toEqual({
            labelKey: 'status.metLabel',
            textKey: 'status.goalMet',
            amountMinor: 56000,
            tone: 'positive',
            count: 0
        });
    });

    it('no_income: só a frase, sem valor', () => {
        const view: CutsStatusView | null = cutsStatusView(emptyCuts('2026-09', { status: 'no_income' }));

        expect(view).toEqual({ labelKey: null, textKey: 'status.noIncome', amountMinor: null, tone: null, count: 0 });
    });

    it('no_data: nada a mostrar', () => {
        expect(cutsStatusView(emptyCuts('2026-09'))).toBeNull();
    });
});
