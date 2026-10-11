import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Money } from './money';

function normalized(text: string): RegExp {
    return new RegExp(text.replace('$', '\\$').replace(' ', '[\\s\\u00A0]'));
}

describe('Money', () => {
    it('formata os centavos como moeda do dado, no locale ativo', () => {
        render(<Money amountMinor={149900} currency="BRL" />);

        const value: HTMLElement = screen.getByText(normalized('R$ 1.499,00'));
        expect(value).not.toHaveClass('text-positive');
    });

    it('destaca valores positivos quando pedido', () => {
        render(<Money amountMinor={500} currency="BRL" tone="positive" />);

        expect(screen.getByText(normalized('R$ 5,00'))).toHaveClass('text-positive');
    });

    it('usa a moeda do dado, não uma moeda fixa', () => {
        render(<Money amountMinor={2000} currency="USD" />);

        expect(screen.getByText(normalized('US$ 20,00'))).toBeInTheDocument();
    });
});
