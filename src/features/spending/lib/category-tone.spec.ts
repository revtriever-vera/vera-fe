import { describe, expect, it } from 'vitest';
import type { CategoryView } from '../types';
import { CATEGORY_TONE_CLASSES, CATEGORY_TONE_ICONS, toneOf } from './category-tone';

type ToneInput = Pick<CategoryView, 'kind' | 'flexibility'>;

describe('toneOf', () => {
    it.each<[string, ToneInput | null, string]>([
        ['gasto flexível', { kind: 'expense', flexibility: 'flexible' }, 'flexible'],
        ['gasto fixo', { kind: 'expense', flexibility: 'fixed' }, 'fixed'],
        ['renda', { kind: 'income', flexibility: null }, 'income'],
        ['transferência', { kind: 'transfer', flexibility: null }, 'transfer'],
        ['sem categoria', null, 'uncategorized']
    ])('%s', (_name: string, category: ToneInput | null, tone: string) => {
        expect(toneOf(category)).toBe(tone);
    });

    it('gasto sem natureza definida conta como fixo', () => {
        expect(toneOf({ kind: 'expense', flexibility: null })).toBe('fixed');
    });
});

describe('tons', () => {
    it('cada tom tem classes só de tokens', () => {
        expect(Object.keys(CATEGORY_TONE_CLASSES).sort()).toEqual(['fixed', 'flexible', 'income', 'transfer', 'uncategorized']);
        for (const classes of Object.values(CATEGORY_TONE_CLASSES)) {
            expect(classes).not.toMatch(/#|\[|rgb|hsl/);
        }
    });

    it('sem categoria e transferência têm ícone próprio', () => {
        expect(Object.keys(CATEGORY_TONE_ICONS).sort()).toEqual(['transfer', 'uncategorized']);
    });
});
