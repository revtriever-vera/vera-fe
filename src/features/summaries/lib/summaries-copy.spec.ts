import { describe, expect, it } from 'vitest';
import enSummaries from '@/shared/lib/i18n/resources/en/summaries.json';
import ptBRSummaries from '@/shared/lib/i18n/resources/pt-BR/summaries.json';

function leaves(node: unknown): string[] {
    if (typeof node === 'string') {
        return [node];
    }
    if (typeof node === 'object' && node !== null) {
        return Object.values(node).flatMap(leaves);
    }
    return [];
}

const FORBIDDEN: RegExp = /\bIA\b|\bAI\b|inteligência artificial|artificial intelligence|assistente|assistant/i;

describe('tom de voz dos resumos', () => {
    it.each([
        ['pt-BR', ptBRSummaries],
        ['en', enSummaries]
    ])('%s não usa "IA", "inteligência artificial" nem "assistente"', (_locale, dictionary) => {
        const offending: string[] = leaves(dictionary).filter((text: string): boolean => FORBIDDEN.test(text));
        expect(offending).toEqual([]);
    });

    it.each([
        ['pt-BR', ptBRSummaries],
        ['en', enSummaries]
    ])('%s não tem exclamação nem emoji', (_locale, dictionary) => {
        const offending: string[] = leaves(dictionary).filter((text: string): boolean => /!|\p{Extended_Pictographic}/u.test(text));
        expect(offending).toEqual([]);
    });

    it('o pedido de permissão e o cartão de privacidade dizem que o provedor treina com os dados', () => {
        expect(ptBRSummaries.consent.notice).toContain('treinar os modelos');
        expect(ptBRSummaries.privacy.description).toContain('treinar os modelos');
        expect(enSummaries.consent.notice).toContain('train its own models');
        expect(enSummaries.privacy.description).toContain('train its own models');
    });
});
