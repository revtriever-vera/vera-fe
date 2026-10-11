import { describe, expect, it } from 'vitest';
import { allWithinOverview, emptyOverview, sampleOverview } from '../../../../../test/fixtures/portfolio';
import type { Overview, OverviewClass } from '../../types';
import { buildOverviewViewModel, type ClassRow, type OverviewViewModel } from './overview-view-model';

describe('buildOverviewViewModel', () => {
    it('mantém a ordem da API e monta os segmentos de atual e meta', () => {
        const model: OverviewViewModel = buildOverviewViewModel(sampleOverview());

        expect(model.rows.map((row: ClassRow): string => row.classId)).toEqual(
            sampleOverview().classes.map((item: OverviewClass) => item.classId)
        );
        expect(model.actual).toHaveLength(8);
        expect(model.target[5]).toEqual({ classId: 'class-acoes-eua', widthPercent: 25, colorKey: 'c6' });
    });

    it('a meta em valor é o valor atual mais a lacuna', () => {
        const row: ClassRow | undefined = buildOverviewViewModel(sampleOverview()).rows[5];

        expect(row?.targetValueMinor).toBe(44327510);
    });

    it('marca como esmaecida só a classe sem valor e sem meta', () => {
        const overview: Overview = sampleOverview();
        const classes: OverviewClass[] = overview.classes.map((item: OverviewClass, index: number): OverviewClass =>
            index === 0 ? { ...item, valueMinor: 0, targetBps: 0 } : index === 1 ? { ...item, valueMinor: 0 } : item
        );

        const rows: readonly ClassRow[] = buildOverviewViewModel({ ...overview, classes }).rows;

        expect(rows.map((row: ClassRow): boolean => row.dimmed).slice(0, 3)).toEqual([true, false, false]);
    });

    it('monta o texto do destaque com a classe de maior desvio', () => {
        const model: OverviewViewModel = buildOverviewViewModel(sampleOverview());

        expect(model.callout).toEqual({ classId: 'class-cripto', systemKey: 'cripto', name: null, status: 'above', deviationBps: 671 });
    });

    it('sem desvio fora da faixa não há destaque', () => {
        expect(buildOverviewViewModel(allWithinOverview()).callout).toBeNull();
        expect(buildOverviewViewModel(emptyOverview()).callout).toBeNull();
    });

    it('ignora um destaque cuja classe não está na lista', () => {
        const overview: Overview = sampleOverview();
        const model: OverviewViewModel = buildOverviewViewModel({
            ...overview,
            largestDeviation: { classId: 'sumiu', deviationBps: 900, gapMinor: 1, status: 'above' }
        });

        expect(model.callout).toBeNull();
    });
});
