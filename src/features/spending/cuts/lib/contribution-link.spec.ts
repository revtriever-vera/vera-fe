import { describe, expect, it } from 'vitest';
import { contributionAmount, contributionLink } from './contribution-link';

describe('contributionLink', () => {
    it('56.000 centavos viram amount=560, em reais', () => {
        expect(contributionLink(56000)).toBe('/portfolio/contribution?amount=560');
        expect(contributionAmount(56000)).toBe(560);
    });

    it('56.099 centavos também viram 560: arredonda para baixo', () => {
        expect(contributionLink(56099)).toBe('/portfolio/contribution?amount=560');
    });

    it('zero, menos de um real e negativo não geram link', () => {
        expect(contributionLink(0)).toBeNull();
        expect(contributionLink(99)).toBeNull();
        expect(contributionLink(-100)).toBeNull();
        expect(contributionAmount(0)).toBeNull();
    });
});
