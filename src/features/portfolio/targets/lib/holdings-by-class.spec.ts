import { describe, expect, it } from 'vitest';
import { holding, sampleHoldings } from '../../../../../test/fixtures/portfolio';
import { holdingsByClass } from './holdings-by-class';

describe('holdingsByClass', () => {
    it('agrupa os ativos pela classe', () => {
        const counts: ReadonlyMap<string, number> = holdingsByClass(sampleHoldings().data);

        expect(counts.get('class-acoes-br')).toBe(3);
        expect(counts.get('class-fii')).toBe(2);
        expect(counts.get('class-sem-ativos')).toBeUndefined();
    });

    it('devolve um mapa vazio sem ativos', () => {
        expect(holdingsByClass([]).size).toBe(0);
        expect(holdingsByClass([holding({ classId: 'x' })]).get('x')).toBe(1);
    });
});
