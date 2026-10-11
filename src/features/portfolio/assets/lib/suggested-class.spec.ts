import { describe, expect, it } from 'vitest';
import { assetClass, defaultClasses } from '../../../../../test/fixtures/portfolio';
import type { AssetClassView } from '../../types';
import { suggestedClassId } from './suggested-class';

describe('suggestedClassId', () => {
    it('acha a classe pela chave de sistema', () => {
        expect(suggestedClassId(defaultClasses().data, 'acoes_eua')).toBe('class-acoes-eua');
        expect(suggestedClassId(defaultClasses().data, 'rf_ipca')).toBe('class-rf-ipca');
    });

    it('acha a classe pelos apelidos depois de uma junção', () => {
        const classes: AssetClassView[] = [assetClass({ id: 'imoveis', systemKey: 'fii', aliasKeys: ['reits'], name: 'Imóveis' })];

        expect(suggestedClassId(classes, 'fii')).toBe('imoveis');
        expect(suggestedClassId(classes, 'reits')).toBe('imoveis');
    });

    it('prefere a chave de sistema ao apelido quando as duas existem', () => {
        const classes: AssetClassView[] = [
            assetClass({ id: 'a', systemKey: 'fii', aliasKeys: ['reits'] }),
            assetClass({ id: 'b', systemKey: 'reits', aliasKeys: [] })
        ];

        expect(suggestedClassId(classes, 'reits')).toBe('b');
    });

    it('devolve nulo sem sugestão ou sem classe correspondente', () => {
        expect(suggestedClassId(defaultClasses().data, null)).toBeNull();
        expect(suggestedClassId(defaultClasses().data, 'desconhecida')).toBeNull();
    });
});
