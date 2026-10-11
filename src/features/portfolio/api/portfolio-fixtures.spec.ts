import type { HoldingsResponse, Overview } from '../types';
import { describe, expect, it } from 'vitest';
import {
    SAMPLE_TOTAL_MINOR,
    defaultClasses,
    emptyHoldings,
    emptyOverview,
    sampleHoldings,
    sampleOverview
} from '../../../../test/fixtures/portfolio';

describe('fixtures do patrimônio', () => {
    it('a carteira de exemplo tem 19 itens e o total do protótipo', () => {
        const holdings: HoldingsResponse = sampleHoldings();

        expect(holdings.data).toHaveLength(19);
        expect(holdings.data.reduce((sum: number, item): number => sum + item.valueMinor, 0)).toBe(SAMPLE_TOTAL_MINOR);
    });

    it('as classes padrão somam 100% de meta', () => {
        expect(defaultClasses().data.reduce((sum: number, item): number => sum + item.targetBps, 0)).toBe(10000);
    });

    it('a visão geral bate com os números do contrato de API', () => {
        const overview: Overview = sampleOverview();

        expect(overview.totalMinor).toBe(177310040);
        expect(overview.classes.map((item) => item.shareBps)).toEqual([2082, 1161, 728, 1242, 656, 2091, 869, 1171]);
        expect(overview.classes.map((item) => item.deviationBps)).toEqual([82, 361, -472, -258, -44, -409, 69, 671]);
        expect(overview.classes.map((item) => item.shareBps).reduce((sum: number, bps: number): number => sum + bps, 0)).toBe(10000);
        expect(overview.dollarExposure.shareBps).toBe(4743);
        expect(overview.outsideCount).toBe(1);
        expect(overview.classes[2]?.gapMinor).toBe(8377205);
        expect(overview.classes[7]?.gapMinor).toBe(-11893098);
        expect(overview.largestDeviation).toMatchObject({ classId: 'class-cripto', status: 'above', gapMinor: -11893098 });
    });

    it('o estado neutro é vazio', () => {
        expect(emptyHoldings().data).toEqual([]);
        expect(emptyOverview()).toMatchObject({ empty: true, totalMinor: 0, outsideCount: 0, largestDeviation: null });
    });
});
