import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Alert } from './alert';

describe('Alert', () => {
    it('anuncia o título como alerta', () => {
        render(<Alert title="Algo deu errado" />);

        expect(screen.getByRole('alert')).toBeInTheDocument();
        expect(screen.getByText('Algo deu errado')).toHaveClass('text-critical');
        expect(screen.queryByText(/requestId:/)).not.toBeInTheDocument();
    });

    it('mostra o detalhe e o requestId quando existem', () => {
        render(<Alert title="Falhou" detail="A cobrança não pôde ser criada." requestId="req-123" />);

        expect(screen.getByText('A cobrança não pôde ser criada.')).toBeInTheDocument();
        expect(screen.getByText('requestId: req-123')).toBeInTheDocument();
    });

    it('usa o tom de cautela quando pedido', () => {
        render(<Alert title="Atenção" tone="caution" />);

        expect(screen.getByText('Atenção')).toHaveClass('text-caution');
    });

    it('mostra a ação quando recebida', () => {
        render(<Alert title="Falhou" action={<span>Tentar de novo</span>} />);

        expect(screen.getByText('Tentar de novo')).toBeInTheDocument();
    });

    it('mostra o ícone no tom do alerta quando é passado', () => {
        render(<Alert tone="caution" title="Atenção" icon={<svg data-testid="alert-icon" />} />);
        expect(screen.getByTestId('alert-icon').parentElement).toHaveClass('text-caution');
    });
});
