import { describe, expect, it } from 'vitest';
import { ApiError } from '@/shared/lib/api/api-error';
import { classifyFailure } from './submit-failure';

function failure(type: string, meta?: Record<string, unknown>): ApiError {
    return new ApiError({ type, title: type, status: 400, detail: type, requestId: null, meta });
}

describe('classifyFailure', () => {
    it('manda a quantidade e a classe para os campos', () => {
        expect(classifyFailure(failure('positions.invalid_quantity'))).toEqual({ kind: 'quantity' });
        expect(classifyFailure(failure('positions.class_required'))).toEqual({ kind: 'class' });
    });

    it('lê a posição existente no 409', () => {
        expect(classifyFailure(failure('positions.asset_already_in_portfolio', { positionId: 'p-1' }))).toEqual({
            kind: 'duplicate',
            positionId: 'p-1'
        });
        expect(classifyFailure(failure('positions.asset_already_in_portfolio'))).toEqual({ kind: 'duplicate', positionId: null });
    });

    it('leva limites e regras de renda fixa para o alerta', () => {
        expect(classifyFailure(failure('positions.limit_reached'))).toEqual({ kind: 'alert' });
        expect(classifyFailure(failure('fixed_income.invalid_terms'))).toEqual({ kind: 'alert' });
        expect(classifyFailure(failure('validation_failed'))).toEqual({ kind: 'alert' });
    });

    it('trata erro desconhecido e de rede como toast', () => {
        expect(classifyFailure(failure('qualquer.coisa'))).toEqual({ kind: 'toast' });
        expect(classifyFailure(new TypeError('Failed to fetch'))).toEqual({ kind: 'toast' });
    });
});
