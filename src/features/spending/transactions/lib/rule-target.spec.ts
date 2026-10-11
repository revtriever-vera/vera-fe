import { describe, expect, it } from 'vitest';
import { descriptionTargetOf, displayDescription, ruleTargetOf } from './rule-target';

describe('displayDescription', () => {
    it('tira o prefixo do meio de pagamento', () => {
        expect(displayDescription('Pix enviado · Maria Souza')).toBe('Maria Souza');
    });

    it('mantém a descrição sem prefixo e apara as pontas', () => {
        expect(displayDescription('  PADARIA ESTRELA ')).toBe('PADARIA ESTRELA');
    });
});

describe('ruleTargetOf', () => {
    it('com favorecido, o escopo é counterparty com o nome', () => {
        expect(ruleTargetOf({ counterpartyName: 'Maria Souza', description: 'Pix enviado · Maria Souza' }, displayDescription)).toEqual({
            scope: 'counterparty',
            label: 'Maria Souza'
        });
    });

    it('sem favorecido, o escopo é description e o prefixo sai do rótulo', () => {
        expect(ruleTargetOf({ counterpartyName: null, description: 'Pix enviado · Padaria Estrela' }, displayDescription)).toEqual({
            scope: 'description',
            label: 'Padaria Estrela'
        });
    });

    it('favorecido em branco conta como ausente', () => {
        expect(ruleTargetOf({ counterpartyName: '  ', description: 'LOJA X' }, displayDescription).scope).toBe('description');
    });
});

describe('descriptionTargetOf', () => {
    it('ignora o favorecido', () => {
        expect(
            descriptionTargetOf({ counterpartyName: 'Maria Souza', description: 'Pix enviado · Maria Souza' }, displayDescription)
        ).toEqual({
            scope: 'description',
            label: 'Maria Souza'
        });
    });
});
