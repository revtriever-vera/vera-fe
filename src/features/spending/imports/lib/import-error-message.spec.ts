import type { TFunction } from 'i18next';
import { describe, expect, it } from 'vitest';
import { ApiError } from '@/shared/lib/api/api-error';
import { i18n } from '@/shared/lib/i18n';
import { importErrorMessage } from './import-error-message';

const t: TFunction<'spending'> = i18n.getFixedT('pt-BR', 'spending');
const ti: TFunction<'spendingImports'> = i18n.getFixedT('pt-BR', 'spendingImports');

function apiError(type: string): ApiError {
    return new ApiError({ type, title: 'x', status: 422, detail: 'd', requestId: null });
}

describe('importErrorMessage', () => {
    it.each([
        ['imports.unsupported_format', 'Não reconhecemos este arquivo. Use OFX ou CSV.'],
        ['imports.file_too_large', 'O arquivo passa de 5 MB.'],
        ['imports.invalid_file', 'Não foi possível ler esse arquivo.'],
        ['imports.too_many_rows', 'O arquivo tem linhas demais.'],
        ['transactions.account_not_found', 'Essa conta não existe mais.']
    ])('%s', (code: string, message: string) => {
        expect(importErrorMessage(t, ti, apiError(code), { statement: null, account: null })).toBe(message);
    });

    it('moeda diferente cita as duas moedas', () => {
        expect(importErrorMessage(t, ti, apiError('imports.currency_mismatch'), { statement: 'USD', account: 'BRL' })).toBe(
            'Este extrato está em USD e a conta é em BRL.'
        );
    });

    it('moeda diferente sem as moedas cai na mensagem genérica do código', () => {
        expect(importErrorMessage(t, ti, apiError('imports.currency_mismatch'), { statement: null, account: null })).toBe(
            'A moeda do arquivo é diferente da moeda da conta escolhida.'
        );
    });

    it('erro de rede cai no genérico', () => {
        expect(importErrorMessage(t, ti, new TypeError('fetch failed'), { statement: null, account: null })).toBe(
            'Não foi possível concluir. Tente de novo em instantes.'
        );
    });
});
