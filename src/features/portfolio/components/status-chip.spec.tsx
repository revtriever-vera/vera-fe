import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { i18n } from '@/shared/lib/i18n';
import { StatusChip } from './status-chip';

describe('StatusChip', () => {
    it('na faixa mostra o texto e o ícone de check', () => {
        const { container } = render(<StatusChip status="within" deviationBps={82} />);

        expect(screen.getByText('na faixa')).toBeInTheDocument();
        expect(container.querySelector('svg')).toHaveClass('lucide-check');
    });

    it('acima mostra o desvio com sinal e a seta para cima', () => {
        const { container } = render(<StatusChip status="above" deviationBps={671} />);

        expect(screen.getByText('+6,7 pp acima')).toBeInTheDocument();
        expect(container.querySelector('svg')).toHaveClass('lucide-arrow-up');
    });

    it('abaixo mostra o desvio com menos tipográfico e a seta para baixo', () => {
        const { container } = render(<StatusChip status="below" deviationBps={-472} />);

        expect(screen.getByText('−4,7 pp abaixo')).toBeInTheDocument();
        expect(container.querySelector('svg')).toHaveClass('lucide-arrow-down');
    });

    it('o significado está no texto, não só na cor, e o ícone é decorativo', () => {
        const { container } = render(<StatusChip status="above" deviationBps={361} />);

        expect(container.querySelector('svg')).toHaveAttribute('aria-hidden', 'true');
        expect(container).toHaveTextContent('acima');
    });

    it('traduz para inglês', async () => {
        await i18n.changeLanguage('en');
        render(<StatusChip status="below" deviationBps={-472} />);

        expect(screen.getByText('−4.7 pp below')).toBeInTheDocument();
    });
});
