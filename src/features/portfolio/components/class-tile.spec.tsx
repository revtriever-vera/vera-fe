import { describe, expect, it } from 'vitest';
import { render, type RenderResult } from '@testing-library/react';
import { CLASS_COLOR_KEYS } from '../types';
import { ClassTile } from './class-tile';

function tile(container: HTMLElement): HTMLElement {
    return container.firstElementChild as HTMLElement;
}

describe('ClassTile', () => {
    it.each(CLASS_COLOR_KEYS)('%s aplica o token de classe certo', (colorKey) => {
        const { container } = render(<ClassTile systemKey={null} colorKey={colorKey} />);
        const number: string = colorKey.slice(1);

        expect(tile(container)).toHaveClass(`text-class-${number}`, `bg-class-${number}-soft`);
    });

    it('usa o ícone da classe padrão e é decorativo', () => {
        const { container } = render(<ClassTile systemKey="cripto" colorKey="c8" />);

        expect(tile(container)).toHaveAttribute('aria-hidden', 'true');
        expect(container.querySelector('svg')).toHaveClass('lucide-hexagon');
    });

    it('classe do usuário usa o ícone genérico', () => {
        const { container } = render(<ClassTile systemKey={null} colorKey="c9" />);

        expect(container.querySelector('svg')).toHaveClass('lucide-layers');
    });

    it('tem tamanho pequeno e médio', () => {
        const small: RenderResult = render(<ClassTile systemKey={null} colorKey="c1" size="sm" />);
        const medium: RenderResult = render(<ClassTile systemKey={null} colorKey="c1" />);

        expect(tile(small.container)).toHaveClass('h-8');
        expect(tile(medium.container)).toHaveClass('h-10');
    });
});
