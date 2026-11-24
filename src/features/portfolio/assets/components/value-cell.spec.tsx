import { describe, expect, it } from 'vitest';
import { screen } from '@testing-library/react';
import { holding } from '../../../../../test/fixtures/portfolio';
import { renderWithProviders } from '../../../../../test/render';
import type { HoldingView } from '../../types';
import { ValueCell } from './value-cell';

function fundHolding(overrides: Partial<HoldingView> = {}): HoldingView {
    return { ...holding({ priceDate: '2026-11-20', ...overrides }), market: 'CVM' } as unknown as HoldingView;
}

describe('ValueCell', () => {
    it('mostra valor bruto e a data da cota num fundo da CVM', () => {
        renderWithProviders(<ValueCell holding={fundHolding()} baseCurrency="BRL" />);

        expect(screen.getByText('valor bruto · cota de 20/11/2026')).toBeInTheDocument();
    });

    it('mantém o aviso de cota velha ao lado do selo', () => {
        renderWithProviders(<ValueCell holding={fundHolding({ stale: true })} baseCurrency="BRL" />);

        expect(screen.getByText('valor bruto · cota de 20/11/2026')).toBeInTheDocument();
        expect(screen.getByText('cotação de 20/11/2026')).toBeInTheDocument();
    });

    it('fundo sem cotação mostra só o estado pendente', () => {
        renderWithProviders(<ValueCell holding={fundHolding({ missingQuote: true, valueMinor: 0 })} baseCurrency="BRL" />);

        expect(screen.queryByText(/valor bruto/)).not.toBeInTheDocument();
        expect(screen.getByText('sem cotação ainda')).toBeInTheDocument();
    });

    it('não mostra o selo fora da CVM', () => {
        renderWithProviders(<ValueCell holding={holding()} baseCurrency="BRL" />);

        expect(screen.queryByText(/valor bruto/)).not.toBeInTheDocument();
    });
});
