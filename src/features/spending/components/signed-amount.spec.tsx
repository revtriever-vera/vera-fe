import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SignedAmount } from './signed-amount';

describe('SignedAmount', () => {
    it('saída leva o sinal de menos tipográfico e a cor normal', () => {
        const { container } = render(<SignedAmount amountMinor={-35000} currency="BRL" />);

        expect(container).toHaveTextContent('−R$ 350,00');
        expect(container.firstElementChild).not.toHaveClass('text-positive');
    });

    it('entrada leva o sinal de mais e a cor positiva', () => {
        const { container } = render(<SignedAmount amountMinor={2800000} currency="BRL" />);

        expect(container).toHaveTextContent('+R$ 28.000,00');
        expect(container.firstElementChild).toHaveClass('text-positive');
    });

    it('zero não leva sinal', () => {
        const { container } = render(<SignedAmount amountMinor={0} currency="BRL" />);

        expect(container).toHaveTextContent(/^R\$\s0,00$/);
    });

    it('usa a moeda do dado', () => {
        render(<SignedAmount amountMinor={-1050} currency="USD" />);

        expect(screen.getByText(/US\$\s10,50/)).toBeInTheDocument();
    });
});
