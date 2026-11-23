import { afterEach, describe, expect, it, vi } from 'vitest';
import { readContributionMinor, writeContributionMinor } from './contribution-amount-store';

describe('contribution-amount-store', () => {
    afterEach(() => {
        window.sessionStorage.clear();
        vi.restoreAllMocks();
    });

    it('lê de volta o último valor gravado da empresa', () => {
        writeContributionMinor('company-1', 1_000_000);
        expect(readContributionMinor('company-1')).toBe(1_000_000);
    });

    it('guarda um valor por empresa', () => {
        writeContributionMinor('company-1', 500_000);
        expect(readContributionMinor('company-2')).toBeUndefined();
    });

    it('ignora o que não é um inteiro positivo', () => {
        window.sessionStorage.setItem('vera.contribution-amount.company-1', 'abc');
        expect(readContributionMinor('company-1')).toBeUndefined();
        window.sessionStorage.setItem('vera.contribution-amount.company-1', '0');
        expect(readContributionMinor('company-1')).toBeUndefined();
    });

    it('não quebra quando o armazenamento está indisponível', () => {
        vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
            throw new Error('blocked');
        });
        vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
            throw new Error('blocked');
        });
        expect(readContributionMinor('company-1')).toBeUndefined();
        expect(() => {
            writeContributionMinor('company-1', 100);
        }).not.toThrow();
    });
});
