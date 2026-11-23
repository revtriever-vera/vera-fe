import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { billingUsage } from '../../../test/fixtures/billing';
import { QuotaMeter } from './quota-meter';

describe('QuotaMeter', () => {
    it('shows the normal band with what is left', () => {
        render(<QuotaMeter usage={billingUsage()} />);

        expect(screen.getByText('Cota de outubro')).toBeInTheDocument();
        expect(screen.getByText('34% usada')).toBeInTheDocument();
        expect(screen.getByRole('meter', { name: 'Cota de uso do mês' })).toHaveValue(34);
        expect(screen.getByText('Renova em 1º de novembro')).toBeInTheDocument();
        expect(screen.getByText('Sobram 66%')).toBeInTheDocument();
    });

    it('warns when it is close to the limit', () => {
        render(<QuotaMeter usage={billingUsage({ usedBps: 8500, state: 'warning' })} />);

        expect(screen.getByText('Perto do limite')).toBeInTheDocument();
    });

    it('says it is paused until the renewal at 100%', () => {
        render(<QuotaMeter usage={billingUsage({ usedBps: 10000, state: 'paused' })} />);

        expect(screen.getByRole('meter')).toHaveValue(100);
        expect(screen.getByText('Pausado até a renovação')).toBeInTheDocument();
    });

    it('splits the usage by feature in the full variant', () => {
        render(<QuotaMeter full usage={billingUsage({ byFeature: { ai: { usedBps: 2000 }, whatsapp: { usedBps: 1400 } } })} />);

        expect(screen.getByText(/Explicações 20% · WhatsApp 14%/)).toBeInTheDocument();
        expect(screen.getByText(/a cota cobre o uso normal de um mês/)).toBeInTheDocument();
    });

    it('leaves the split out of the compact variant', () => {
        render(<QuotaMeter usage={billingUsage()} />);

        expect(screen.queryByText(/WhatsApp/)).not.toBeInTheDocument();
    });
});
