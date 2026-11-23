import { describe, expect, it } from 'vitest';
import { holderSearchSchema } from '../schemas/holder.schema';
import { holderBody, holderKind, holderQuery, holderValueOf, personName } from './holder-filter';

const ANA_ID: string = '00000000-0000-4000-8000-000000000002';

describe('holderKind', () => {
    it('separa todos, conta toda e pessoa', () => {
        expect(holderKind(undefined)).toBe('any');
        expect(holderKind('all')).toBe('all');
        expect(holderKind(ANA_ID)).toBe('person');
    });
});

describe('holderQuery', () => {
    it('omite o filtro de todos e leva os outros', () => {
        expect(holderQuery(undefined)).toEqual({});
        expect(holderQuery('all')).toEqual({ holder: 'all' });
        expect(holderQuery(ANA_ID)).toEqual({ holder: ANA_ID });
    });
});

describe('holderBody', () => {
    it('não manda titular com uma pessoa só', () => {
        expect(holderBody('all', false)).toEqual({});
    });

    it('conta toda vira nulo e a pessoa vai pelo id', () => {
        expect(holderBody('all', true)).toEqual({ holderUserId: null });
        expect(holderBody(ANA_ID, true)).toEqual({ holderUserId: ANA_ID });
    });
});

describe('holderValueOf e personName', () => {
    it('devolve conta toda para nulo e o nome da pessoa', () => {
        expect(holderValueOf(null)).toBe('all');
        expect(holderValueOf(ANA_ID)).toBe(ANA_ID);
        expect(personName([{ userId: ANA_ID, name: 'Ana Souza' }], ANA_ID)).toBe('Ana Souza');
        expect(personName([], ANA_ID)).toBe('');
    });
});

describe('holderSearchSchema', () => {
    it('aceita all e um uuid e descarta o resto', () => {
        expect(holderSearchSchema.parse('all')).toBe('all');
        expect(holderSearchSchema.parse(ANA_ID)).toBe(ANA_ID);
        expect(holderSearchSchema.parse('any')).toBeUndefined();
        expect(holderSearchSchema.parse('lixo')).toBeUndefined();
        expect(holderSearchSchema.parse(undefined)).toBeUndefined();
    });
});
