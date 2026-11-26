import { describe, expect, it } from 'vitest';
import type { TFunction } from 'i18next';
import { i18n } from '@/shared/lib/i18n';
import { noteText } from './note-text';

const t: TFunction<'portfolioImports'> = i18n.getFixedT('pt-BR', 'portfolioImports');

describe('noteText', () => {
    it.each([
        'lines_to_check',
        'crypto_transfer_check',
        'crypto_usd_rate_applied',
        'crypto_fee_not_converted',
        'foreign_rate_fallback',
        'foreign_rate_missing'
    ])('tem texto próprio para %s, no singular e no plural', (code: string) => {
        const generic: string = noteText(t, { code: 'desconhecido', count: 2 });
        expect(noteText(t, { code, count: 1 })).not.toBe(noteText(t, { code: 'desconhecido', count: 1 }));
        expect(noteText(t, { code, count: 2 })).not.toBe(generic);
    });
});
