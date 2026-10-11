import { describe, expect, it } from 'vitest';
import type { ClassFormInput } from '../schemas/class.schema';
import { classChanges } from './class-changes';

const INITIAL: ClassFormInput = { name: 'FIIs', colorKey: 'c5' };

describe('classChanges', () => {
    it('não manda nada quando nada mudou, para não congelar o nome padrão', () => {
        expect(classChanges(INITIAL, INITIAL)).toEqual({});
    });

    it('manda só o nome quando só ele mudou', () => {
        expect(classChanges({ name: 'Imóveis', colorKey: 'c5' }, INITIAL)).toEqual({ name: 'Imóveis' });
    });

    it('manda só a cor quando só ela mudou', () => {
        expect(classChanges({ name: 'FIIs', colorKey: 'c9' }, INITIAL)).toEqual({ colorKey: 'c9' });
    });

    it('manda os dois quando ambos mudaram', () => {
        expect(classChanges({ name: 'Imóveis', colorKey: 'c9' }, INITIAL)).toEqual({ name: 'Imóveis', colorKey: 'c9' });
    });
});
