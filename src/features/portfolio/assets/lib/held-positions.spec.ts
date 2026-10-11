import { describe, expect, it } from 'vitest';
import { holding } from '../../../../../test/fixtures/portfolio';
import type { HoldingView } from '../../types';
import { countByType, heldPositions } from './held-positions';

describe('held-positions', () => {
    it('mapeia o ativo para a posição, ignorando renda fixa', () => {
        const held: ReadonlyMap<string, string> = heldPositions([
            holding({ id: 'p-1', assetId: 'a-1' }),
            holding({ id: 'f-1', assetId: null, kind: 'fixed_income' })
        ]);

        expect([...held.entries()]).toEqual([['a-1', 'p-1']]);
    });

    it('conta por tipo', () => {
        const items: HoldingView[] = [holding({ typeGroup: 'fii' }), holding({ typeGroup: 'fii' }), holding({ typeGroup: 'cripto' })];

        expect(countByType(items, 'fii')).toBe(2);
        expect(countByType(items, 'tesouro')).toBe(0);
    });
});
