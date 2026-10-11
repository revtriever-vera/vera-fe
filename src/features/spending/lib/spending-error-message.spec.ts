import { describe, expect, it } from 'vitest';
import type { TFunction } from 'i18next';
import { ApiError } from '@/shared/lib/api/api-error';
import { i18n } from '@/shared/lib/i18n';
import { SPENDING_ERROR_KEYS, spendingErrorMessage } from './spending-error-message';

const EPIC_CODES: readonly string[] = [
    'validation_failed',
    'categories.category_not_found',
    'categories.invalid_rule',
    'categories.limit_reached',
    'categories.name_taken',
    'categories.name_required',
    'categories.flexibility_not_applicable',
    'categories.rule_conflict',
    'categories.rule_not_found',
    'categories.system_category_locked',
    'connections.connection_not_found',
    'connections.credentials_missing',
    'connections.invalid_credentials',
    'connections.item_not_found',
    'connections.provider_unavailable',
    'connections.provider_disabled',
    'connections.sync_in_progress',
    'connections.sync_unavailable',
    'core.secret_open_failed',
    'core.secret_sealer_mismatch',
    'core.too_many_attempts',
    'imports.currency_mismatch',
    'imports.file_too_large',
    'imports.import_not_found',
    'imports.invalid_file',
    'imports.mapping_required',
    'imports.too_many_rows',
    'imports.unsupported_format',
    'summary.declared_income_required',
    'summary.invalid_month',
    'transactions.account_managed_by_connection',
    'transactions.account_not_found',
    'transactions.category_kind_mismatch',
    'transactions.export_too_large',
    'transactions.limit_reached',
    'transactions.transaction_not_found'
];

function problem(type: string): ApiError {
    return new ApiError({ type, title: 'x', status: 422, detail: 'detail', requestId: null });
}

const ptBR: TFunction<'spending'> = i18n.getFixedT('pt-BR', 'spending');
const en: TFunction<'spending'> = i18n.getFixedT('en', 'spending');

describe('spendingErrorMessage', () => {
    it('cobre cada código do épico, nos dois idiomas', () => {
        expect(Object.keys(SPENDING_ERROR_KEYS).sort()).toEqual([...EPIC_CODES].sort());
        for (const code of EPIC_CODES) {
            const key: string | undefined = SPENDING_ERROR_KEYS[code];
            expect(key).toBeDefined();
            expect(spendingErrorMessage(ptBR, problem(code))).not.toBe(ptBR('errors.generic'));
            expect(spendingErrorMessage(en, problem(code))).not.toBe(en('errors.generic'));
        }
    });

    it('traduz um código conhecido', () => {
        expect(spendingErrorMessage(ptBR, problem('categories.rule_conflict'))).toBe('Já existe uma regra igual a essa.');
        expect(spendingErrorMessage(en, problem('categories.rule_conflict'))).toBe('A rule just like this one already exists.');
    });

    it('cai no genérico com código desconhecido', () => {
        expect(spendingErrorMessage(ptBR, problem('outro.codigo'))).toBe(ptBR('errors.generic'));
    });

    it('cai no genérico com erro de rede e sem erro', () => {
        expect(spendingErrorMessage(ptBR, new TypeError('Failed to fetch'))).toBe(ptBR('errors.generic'));
        expect(spendingErrorMessage(ptBR, null)).toBe(ptBR('errors.generic'));
    });
});
