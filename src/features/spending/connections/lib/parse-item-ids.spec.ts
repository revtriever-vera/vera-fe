import { describe, expect, it } from 'vitest';
import { ITEM_ID_LIMIT } from '../types';
import { isUuid, parseItemIds, shortenItemId, type ParsedItemIds } from './parse-item-ids';

const A: string = '8b2c1d3e-1111-4222-8333-444455556666';
const B: string = '41de0f9a-aaaa-4bbb-8ccc-ddddeeeeffff';

describe('parseItemIds', () => {
    it('separa por vírgula, espaço e quebra de linha', () => {
        const parsed: ParsedItemIds = parseItemIds(`${A}, ${B}\n${A.replace('8b2c', '9b2c')}`);

        expect(parsed.valid).toHaveLength(3);
        expect(parsed.invalid).toEqual([]);
    });

    it('aceita ponto e vírgula e linhas em branco', () => {
        expect(parseItemIds(`${A};\n\n${B}`).valid).toEqual([A, B]);
    });

    it('troca maiúsculas por minúsculas', () => {
        expect(parseItemIds(A.toUpperCase()).valid).toEqual([A]);
    });

    it('remove os repetidos', () => {
        expect(parseItemIds(`${A} ${A.toUpperCase()}, ${B}`).valid).toEqual([A, B]);
    });

    it('manda para inválidos o que não é uuid', () => {
        const parsed: ParsedItemIds = parseItemIds(`${A} segredo-colado-aqui 123 segredo-colado-aqui`);

        expect(parsed.valid).toEqual([A]);
        expect(parsed.invalid).toEqual(['segredo-colado-aqui', '123']);
    });

    it('devolve listas vazias para texto vazio', () => {
        expect(parseItemIds('  \n ,, ')).toEqual({ valid: [], invalid: [] });
    });

    it('conta 11 ids como acima do limite', () => {
        const ids: string[] = Array.from(
            { length: ITEM_ID_LIMIT + 1 },
            (_unused: unknown, index: number): string => `00000000-0000-4000-8000-${String(index).padStart(12, '0')}`
        );

        expect(parseItemIds(ids.join('\n')).valid).toHaveLength(ITEM_ID_LIMIT + 1);
    });
});

describe('isUuid e shortenItemId', () => {
    it('reconhece só o formato uuid', () => {
        expect(isUuid(A)).toBe(true);
        expect(isUuid('abc')).toBe(false);
    });

    it('encurta no formato 8b2c…6666 e mantém o que já é curto', () => {
        expect(shortenItemId(A)).toBe('8b2c…6666');
        expect(shortenItemId('abc')).toBe('abc');
    });
});
