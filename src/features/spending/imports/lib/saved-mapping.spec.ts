import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { CsvMapping } from '../schemas/mapping.schema';
import { loadSavedMapping, saveMapping } from './saved-mapping';

const MAPPING: CsvMapping = {
    hasHeader: false,
    dateColumn: 0,
    descriptionColumn: 2,
    debitColumn: 3,
    creditColumn: 4,
    dateFormat: 'yyyy-MM-dd',
    decimalSeparator: '.',
    invertSign: true
};

describe('saved-mapping', () => {
    beforeEach(() => {
        window.localStorage.clear();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('guarda e lê o mapeamento pelo nome sem extensão', () => {
        saveMapping('Extrato-Banco.csv', MAPPING);

        expect(loadSavedMapping('extrato-banco.txt')).toEqual(MAPPING);
        expect(loadSavedMapping('outro.csv')).toBeNull();
    });

    it('nome sem extensão também vale', () => {
        saveMapping('extrato', MAPPING);

        expect(loadSavedMapping('extrato.csv')).toEqual(MAPPING);
    });

    it('ignora conteúdo guardado que não é um mapeamento', () => {
        window.localStorage.setItem('vera.spending.import-mapping.quebrado', '{"hasHeader":"sim"}');
        window.localStorage.setItem('vera.spending.import-mapping.texto', 'não é json');

        expect(loadSavedMapping('quebrado.csv')).toBeNull();
        expect(loadSavedMapping('texto.csv')).toBeNull();
    });

    it('localStorage que lança erro não quebra a leitura nem a gravação', () => {
        vi.spyOn(Storage.prototype, 'getItem').mockImplementation((): never => {
            throw new Error('bloqueado');
        });
        vi.spyOn(Storage.prototype, 'setItem').mockImplementation((): never => {
            throw new Error('bloqueado');
        });

        expect(loadSavedMapping('extrato.csv')).toBeNull();
        expect(() => {
            saveMapping('extrato.csv', MAPPING);
        }).not.toThrow();
    });
});
