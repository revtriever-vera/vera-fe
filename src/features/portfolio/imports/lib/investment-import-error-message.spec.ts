import { describe, expect, it } from 'vitest';
import type { TFunction } from 'i18next';
import { ApiError } from '@/shared/lib/api/api-error';
import { i18n } from '@/shared/lib/i18n';
import { investmentImportErrorMessage } from './investment-import-error-message';

const t: TFunction<'portfolioImports'> = i18n.getFixedT('pt-BR', 'portfolioImports');

function apiError(type: string, status: number = 422): ApiError {
    return new ApiError({ type, title: 'x', status, detail: 'd', requestId: null });
}

describe('investmentImportErrorMessage', () => {
    it.each([
        ['format.not_recognized', 'Não reconhecemos esse relatório'],
        ['file.too_large', 'O arquivo passa de 10 MB'],
        ['format.too_many_rows', 'linhas demais'],
        ['preview.expired', 'A conferência expirou'],
        ['import.undo_blocked', 'Não dá para desfazer'],
        ['import.has_blocked_lines', 'Ainda há linhas para corrigir'],
        ['import.position_mode_required', 'Escolha o que fazer'],
        ['import.invalid_edit', 'Uma das correções não bate'],
        ['identity.insufficient_role', 'não permite importar']
    ])('traduz %s', (type: string, fragment: string) => {
        expect(investmentImportErrorMessage(t, apiError(type))).toContain(fragment);
    });

    it('429 vira o aviso de excesso, e o resto cai no texto genérico', () => {
        expect(investmentImportErrorMessage(t, apiError('rate_limited', 429))).toContain('Muitas importações');
        expect(investmentImportErrorMessage(t, apiError('desconhecido'))).toContain('Tente de novo');
        expect(investmentImportErrorMessage(t, new Error('rede'))).toContain('Tente de novo');
        expect(investmentImportErrorMessage(t, null)).toContain('Tente de novo');
    });
});
