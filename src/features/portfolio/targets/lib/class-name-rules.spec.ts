import type { AssetClassView } from '../../types';
import { describe, expect, it } from 'vitest';
import { assetClass, defaultClasses } from '../../../../../test/fixtures/portfolio';
import { normalizeClassName, takenClassNames } from './class-name-rules';

describe('normalizeClassName', () => {
    it('ignora espaços nas pontas e diferença de caixa', () => {
        expect(normalizeClassName('  Imóveis ')).toBe('imóveis');
    });
});

describe('takenClassNames', () => {
    it('inclui o nome padrão nos dois idiomas das classes padrão sem renome', () => {
        const taken: readonly string[] = takenClassNames(defaultClasses().data, null);

        expect(taken).toContain('fiis');
        expect(taken).toContain('brazilian reits (fiis)');
        expect(taken).toContain('ações eua');
        expect(taken).toContain('us stocks');
    });

    it('usa o nome do usuário e não o padrão quando a classe foi renomeada', () => {
        const renamed: AssetClassView = assetClass({ id: 'class-fii', systemKey: 'fii', name: 'Imóveis' });
        const taken: readonly string[] = takenClassNames([renamed], null);

        expect(taken).toEqual(['imóveis']);
    });

    it('ignora a própria classe ao renomear', () => {
        const taken: readonly string[] = takenClassNames(defaultClasses().data, 'class-fii');

        expect(taken).not.toContain('fiis');
        expect(taken).toContain('reits');
    });

    it('ignora uma chave padrão desconhecida e uma classe sem nome nem chave', () => {
        const unknown: AssetClassView = assetClass({ systemKey: 'inexistente', name: null });
        const blank: AssetClassView = assetClass({ id: 'blank', systemKey: null, name: null });

        expect(takenClassNames([unknown, blank], null)).toEqual([]);
    });
});
