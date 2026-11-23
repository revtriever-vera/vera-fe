import { describe, expect, it } from 'vitest';
import { resolveAssetsTab } from './assets-tab';

describe('resolveAssetsTab', () => {
    it('usa a lista sem aba na URL', () => {
        expect(resolveAssetsTab(undefined)).toBe('list');
    });

    it('mantém uma aba disponível', () => {
        expect(resolveAssetsTab('fixed-income')).toBe('fixed-income');
    });

    it('cai na lista quando a aba ainda não existe', () => {
        expect(resolveAssetsTab('concentration')).toBe('list');
    });
});
