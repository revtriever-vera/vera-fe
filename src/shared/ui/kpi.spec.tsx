import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Star } from 'lucide-react';
import { KpiTile } from './kpi';

describe('KpiTile', () => {
    it('mostra o rótulo e o valor', () => {
        render(<KpiTile label="Patrimônio" value="R$ 10,00" />);

        expect(screen.getByText('Patrimônio')).toBeInTheDocument();
        expect(screen.getByText('R$ 10,00')).toBeInTheDocument();
    });

    it('mostra o texto de apoio quando existe', () => {
        render(<KpiTile label="Meta" value="20%" support="faixa de 5 pp" />);

        expect(screen.getByText('faixa de 5 pp')).toBeInTheDocument();
    });

    it('não renderiza apoio quando ele não é informado', () => {
        render(<KpiTile label="Meta" value="20%" />);

        expect(screen.queryByText('faixa de 5 pp')).not.toBeInTheDocument();
    });

    it('mostra o ícone quando informado', () => {
        const { container } = render(<KpiTile label="Meta" value="20%" icon={Star} tone="info" />);

        expect(container.querySelector('svg')).not.toBeNull();
    });
});
