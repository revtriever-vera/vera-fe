import { describe, expectTypeOf, it } from 'vitest';
import type { ParseKeys } from 'i18next';

describe('tipagem das chaves de tradução', () => {
    it('aceita uma chave existente do namespace common', () => {
        expectTypeOf<'close'>().toExtend<ParseKeys>();
        expectTypeOf<'cancel'>().toExtend<ParseKeys>();
    });

    it('rejeita uma chave inexistente do namespace common', () => {
        expectTypeOf<'chave-inexistente'>().not.toExtend<ParseKeys>();
    });

    it('conhece os cinco namespaces do patrimônio', () => {
        expectTypeOf<'layout.title'>().toExtend<ParseKeys<'portfolio'>>();
        expectTypeOf<'title'>().toExtend<ParseKeys<'portfolioOverview'>>();
        expectTypeOf<'title'>().toExtend<ParseKeys<'portfolioAssets'>>();
        expectTypeOf<'title'>().toExtend<ParseKeys<'portfolioTargets'>>();
        expectTypeOf<'title'>().toExtend<ParseKeys<'portfolioContribution'>>();
    });

    it('rejeita uma chave inexistente do namespace portfolio', () => {
        expectTypeOf<'chave-inexistente'>().not.toExtend<ParseKeys<'portfolio'>>();
    });
});
