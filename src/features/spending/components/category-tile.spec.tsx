import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';
import { systemCategory } from '../../../../test/fixtures/spending';
import { CategoryTile } from './category-tile';

function tileOf(container: HTMLElement): HTMLElement {
    return container.firstElementChild as HTMLElement;
}

describe('CategoryTile', () => {
    it('gasto flexível usa o tom de destaque e o ícone da categoria', () => {
        const { container } = render(<CategoryTile category={systemCategory('eating_out')} />);

        expect(tileOf(container)).toHaveClass('bg-accent-soft', 'text-accent-strong');
        expect(container.querySelector('svg')).toHaveClass('lucide-utensils-crossed');
    });

    it('gasto fixo usa o tom neutro', () => {
        const { container } = render(<CategoryTile category={systemCategory('housing')} />);

        expect(tileOf(container)).toHaveClass('bg-surface-muted', 'text-content-muted');
        expect(container.querySelector('svg')).toHaveClass('lucide-house');
    });

    it('sem categoria usa o tom de atenção e o ponto de interrogação', () => {
        const { container } = render(<CategoryTile category={null} />);

        expect(tileOf(container)).toHaveClass('bg-caution-soft', 'text-caution');
        expect(container.querySelector('svg')).toHaveClass('lucide-circle-question-mark');
    });

    it('renda usa o tom positivo', () => {
        const { container } = render(<CategoryTile category={systemCategory('income')} />);

        expect(tileOf(container)).toHaveClass('bg-positive-soft', 'text-positive');
    });

    it('transferência usa o tom neutro com as setas, seja qual for o ícone', () => {
        const { container } = render(<CategoryTile category={systemCategory('investments')} />);

        expect(tileOf(container)).toHaveClass('bg-surface-muted');
        expect(container.querySelector('svg')).toHaveClass('lucide-arrow-left-right');
    });

    it('é decorativo para leitores de tela', () => {
        const { container } = render(<CategoryTile category={null} size="sm" />);

        expect(tileOf(container)).toHaveAttribute('aria-hidden', 'true');
    });
});
