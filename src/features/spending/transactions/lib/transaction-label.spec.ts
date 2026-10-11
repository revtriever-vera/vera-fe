import { describe, expect, it } from 'vitest';
import { transactionTitle } from './transaction-label';

describe('transactionTitle', () => {
    it('acrescenta o favorecido quando a descrição não o traz', () => {
        expect(transactionTitle({ description: 'Pix enviado', counterpartyName: 'Maria Souza' })).toBe('Pix enviado · Maria Souza');
    });

    it('não repete o favorecido que já está na descrição, mesmo sem acento ou caixa', () => {
        expect(transactionTitle({ description: 'Pix enviado · Maria Souza', counterpartyName: 'maria souza' })).toBe(
            'Pix enviado · Maria Souza'
        );
    });

    it('sem favorecido devolve a descrição', () => {
        expect(transactionTitle({ description: 'SPOTIFY', counterpartyName: null })).toBe('SPOTIFY');
    });
});
