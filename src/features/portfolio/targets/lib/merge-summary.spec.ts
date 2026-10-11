import type { AssetClassView } from '../../types';
import { describe, expect, it } from 'vitest';
import { assetClass } from '../../../../../test/fixtures/portfolio';
import { mergeSummary } from './merge-summary';

describe('mergeSummary', () => {
    it('soma as metas de FIIs e REITs em pontos-base e conta os ativos movidos', () => {
        const fii: AssetClassView = assetClass({ id: 'class-fii', systemKey: 'fii', name: null, targetBps: 700 });
        const reits: AssetClassView = assetClass({ id: 'class-reits', systemKey: 'reits', name: null, targetBps: 800 });

        expect(mergeSummary(fii, reits, 2)).toEqual({
            sourceTargetBps: 700,
            destinationTargetBps: 800,
            sumBps: 1500,
            movedCount: 2
        });
    });

    it('aceita classe de origem vazia e sem meta', () => {
        const empty: AssetClassView = assetClass({ targetBps: 0 });
        const other: AssetClassView = assetClass({ id: 'other', targetBps: 1000 });

        expect(mergeSummary(empty, other, 0)).toEqual({ sourceTargetBps: 0, destinationTargetBps: 1000, sumBps: 1000, movedCount: 0 });
    });
});
