import { describe, expect, it } from 'vitest';
import { investmentPreview } from '../../../../../test/fixtures/investment-imports';
import type { InvestmentPreview } from '../types';
import { readInvestmentPreview } from './read-preview';

describe('readInvestmentPreview', () => {
    it('devolve a prévia quando o objeto tem a forma da resposta da prévia', () => {
        const preview: InvestmentPreview = investmentPreview();

        expect(readInvestmentPreview({ ...preview })?.previewId).toBe('preview-1');
    });

    it('devolve null quando falta o previewId ou uma das listas', () => {
        expect(readInvestmentPreview({})).toBeNull();
        expect(readInvestmentPreview({ ...investmentPreview(), operations: 'x' })).toBeNull();
        expect(readInvestmentPreview({ ...investmentPreview(), previewId: 1 })).toBeNull();
    });
});
