import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';
import { statementFile, stubNodeMultipart } from '../../../../../test/helpers/node-multipart';
import { buildImportFormData } from './build-import-form-data';
import type { CsvMapping } from '../schemas/mapping.schema';

const MAPPING: CsvMapping = {
    hasHeader: true,
    dateColumn: 0,
    descriptionColumn: 1,
    amountColumn: 2,
    dateFormat: 'dd/MM/yyyy',
    decimalSeparator: ',',
    invertSign: false
};

function keysOf(form: FormData): string[] {
    return Array.from(form.keys()).sort();
}

describe('buildImportFormData', () => {
    let file: File;

    beforeEach(async () => {
        await stubNodeMultipart();
        file = statementFile('OFXHEADER:100', 'extrato.ofx');
    });

    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it('só o arquivo, para a prévia', () => {
        expect(keysOf(buildImportFormData({ file }))).toEqual(['file']);
    });

    it('conta existente leva só o accountId', () => {
        const form: FormData = buildImportFormData({ file, format: 'ofx', target: { accountId: 'acc-1' } });

        expect(keysOf(form)).toEqual(['accountId', 'file', 'format']);
        expect(form.get('accountId')).toBe('acc-1');
    });

    it('conta nova leva nome, tipo e instituição, nunca o accountId', () => {
        const form: FormData = buildImportFormData({
            file,
            format: 'ofx',
            target: { newAccountName: 'Reserva', newAccountKind: 'savings', newAccountInstitution: 'Banco X' }
        });

        expect(keysOf(form)).toEqual(['file', 'format', 'newAccountInstitution', 'newAccountKind', 'newAccountName']);
        expect(form.has('accountId')).toBe(false);
    });

    it('omite a instituição vazia ou ausente', () => {
        const withoutInstitution: FormData = buildImportFormData({ file, target: { newAccountName: 'A', newAccountKind: 'other' } });
        const empty: FormData = buildImportFormData({
            file,
            target: { newAccountName: 'A', newAccountKind: 'other', newAccountInstitution: '' }
        });

        expect(withoutInstitution.has('newAccountInstitution')).toBe(false);
        expect(empty.has('newAccountInstitution')).toBe(false);
    });

    it('serializa o mapeamento como JSON', () => {
        const form: FormData = buildImportFormData({ file, format: 'csv_generic', mapping: MAPPING });

        expect(JSON.parse(form.get('mapping') as string)).toEqual(MAPPING);
    });

    it('um alvo com os dois conjuntos de campos nunca sai misturado', () => {
        const form: FormData = buildImportFormData({
            file,
            target: { accountId: 'acc-1', newAccountName: 'X', newAccountKind: 'other' } as never
        });

        expect(form.has('accountId')).toBe(true);
        expect(form.has('newAccountName')).toBe(false);
    });
});
