import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DataSourcesNote } from './data-sources-note';

describe('DataSourcesNote', () => {
    it('lista todas as origens dos dados', () => {
        render(<DataSourcesNote />);

        expect(screen.getByRole('heading', { name: 'De onde vêm os dados' })).toBeInTheDocument();
        expect(screen.getByText(/brapi/)).toBeInTheDocument();
        expect(screen.getByText(/Finnhub/)).toBeInTheDocument();
        expect(screen.getByText(/PTAX/)).toBeInTheDocument();
        expect(screen.getByText(/Tesouro Transparente/)).toBeInTheDocument();
        expect(screen.getByText(/séries do Banco Central/)).toBeInTheDocument();
        expect(screen.getByText(/estimativas/)).toBeInTheDocument();
    });

    it('mostra a atribuição da CoinGecko com link seguro', () => {
        render(<DataSourcesNote />);

        const link: HTMLElement = screen.getByRole('link', { name: 'Dados fornecidos pela CoinGecko' });

        expect(link).toHaveAttribute('href', 'https://www.coingecko.com/');
        expect(link).toHaveAttribute('rel', 'noopener noreferrer');
        expect(link).toHaveAttribute('target', '_blank');
    });
});
