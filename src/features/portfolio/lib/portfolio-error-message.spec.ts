import type { TFunction } from 'i18next';
import { describe, expect, it } from 'vitest';
import { ApiError } from '@/shared/lib/api/api-error';
import { i18n } from '@/shared/lib/i18n';
import { PORTFOLIO_ERROR_KEYS, portfolioErrorMessage } from './portfolio-error-message';

const EPIC_CODES: readonly string[] = [
    'catalog.asset_not_found',
    'positions.asset_already_in_portfolio',
    'positions.position_not_found',
    'positions.invalid_quantity',
    'positions.class_required',
    'positions.limit_reached',
    'fixed_income.title_not_found',
    'fixed_income.applied_date_out_of_range',
    'fixed_income.invalid_terms',
    'allocation.class_not_found',
    'allocation.class_name_taken',
    'allocation.class_not_empty',
    'allocation.system_class_not_deletable',
    'allocation.cannot_merge_into_self',
    'allocation.class_limit_reached',
    'allocation.assignment_not_found',
    'allocation.targets_must_sum_100',
    'allocation.targets_incomplete',
    'contribution.targets_not_set',
    'market-data.exchange_rate_unavailable',
    'validation_failed'
];

function apiError(type: string): ApiError {
    return new ApiError({ type, title: 'x', status: 422, detail: 'technical detail', requestId: null });
}

describe('portfolioErrorMessage', () => {
    const ptBR: TFunction<'portfolio'> = i18n.getFixedT('pt-BR', 'portfolio');
    const en: TFunction<'portfolio'> = i18n.getFixedT('en', 'portfolio');

    it('cobre todos os códigos do épico', () => {
        expect(Object.keys(PORTFOLIO_ERROR_KEYS).sort()).toEqual([...EPIC_CODES].sort());
    });

    it.each(EPIC_CODES)('%s resolve para uma mensagem própria nos dois idiomas', (code: string) => {
        const generic: string = ptBR('errors.generic');

        expect(portfolioErrorMessage(ptBR, apiError(code))).not.toBe(generic);
        expect(portfolioErrorMessage(ptBR, apiError(code))).not.toBe(code);
        expect(portfolioErrorMessage(en, apiError(code))).not.toBe(en('errors.generic'));
    });

    it('código desconhecido cai no genérico', () => {
        expect(portfolioErrorMessage(ptBR, apiError('algo.novo'))).toBe(ptBR('errors.generic'));
    });

    it('erro de rede cai no genérico', () => {
        expect(portfolioErrorMessage(ptBR, new TypeError('Failed to fetch'))).toBe(ptBR('errors.generic'));
        expect(portfolioErrorMessage(ptBR, null)).toBe(ptBR('errors.generic'));
    });

    it('não inclui o detalhe técnico da API', () => {
        expect(portfolioErrorMessage(ptBR, apiError('allocation.class_name_taken'))).not.toContain('technical detail');
    });
});
