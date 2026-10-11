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
});
