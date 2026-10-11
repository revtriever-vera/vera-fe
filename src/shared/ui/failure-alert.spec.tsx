import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ApiError } from '@/shared/lib/api/api-error';
import { FailureAlert } from './failure-alert';

function apiError(status: number): ApiError {
    return new ApiError({
        type: 'portfolio.asset_not_found',
        title: 'AssetNotFoundError',
        status,
        detail: 'Ativo não encontrado.',
        requestId: 'req-42'
    });
}

describe('FailureAlert', () => {
    it('não renderiza nada sem erro', () => {
        const { container } = render(<FailureAlert error={null} title="Erro" />);

        expect(container).toBeEmptyDOMElement();
    });

    it('usa o título da tela e a mensagem traduzida da api, sem o nome da exceção', () => {
        render(<FailureAlert error={apiError(404)} title="Não foi possível carregar o ativo" />);

        expect(screen.getByText('Não foi possível carregar o ativo')).toBeInTheDocument();
        expect(screen.getByText('Ativo não encontrado.')).toBeInTheDocument();
        expect(screen.queryByText('AssetNotFoundError')).not.toBeInTheDocument();
    });

    it('esconde o requestId quando a pessoa ainda pode resolver tentando de novo', () => {
        render(<FailureAlert error={apiError(404)} title="Erro" />);

        expect(screen.queryByText(/requestId:/)).not.toBeInTheDocument();
    });

    it('mostra o requestId quando a falha é do servidor e só o suporte resolve', () => {
        render(<FailureAlert error={apiError(500)} title="Erro" />);

        expect(screen.getByText('requestId: req-42')).toBeInTheDocument();
    });

    it('cai na mensagem do erro comum quando não veio da api', () => {
        render(<FailureAlert error={new Error('rede caiu')} title="Não foi possível carregar" />);

        expect(screen.getByText('Não foi possível carregar')).toBeInTheDocument();
        expect(screen.getByText('rede caiu')).toBeInTheDocument();
        expect(screen.queryByText(/requestId:/)).not.toBeInTheDocument();
    });
});
