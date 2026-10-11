import { describe, expect, it } from 'vitest';
import { IVVB11, UNMAPPED_ETF } from '../../../../../test/fixtures/assets';
import { defaultClasses } from '../../../../../test/fixtures/portfolio';
import type { AssetClassView } from '../../types';
import { defaultClassId, hasClass, positionDefaults } from './position-defaults';

describe('position-defaults', () => {
    const classes: AssetClassView[] = defaultClasses().data;

    it('pré-seleciona a classe sugerida', () => {
        expect(positionDefaults(classes, IVVB11, undefined)).toEqual({ quantity: '', averagePrice: '', classId: 'class-acoes-eua' });
    });

    it('deixa a classe vazia quando não há sugestão', () => {
        expect(positionDefaults(classes, UNMAPPED_ETF, undefined).classId).toBe('');
        expect(positionDefaults(classes, null, undefined).classId).toBe('');
    });

    it('prefere a classe de entrada quando ela existe', () => {
        expect(defaultClassId(classes, 'acoes_eua', 'class-fii')).toBe('class-fii');
        expect(defaultClassId(classes, 'acoes_eua', 'inexistente')).toBe('class-acoes-eua');
        expect(hasClass(classes, undefined)).toBe(false);
    });
});
