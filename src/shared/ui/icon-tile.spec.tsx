import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';
import { Star } from 'lucide-react';
import { IconTile } from './icon-tile';

describe('IconTile', () => {
    it('é decorativo e aplica o tom e o tamanho', () => {
        const { container } = render(<IconTile icon={Star} tone="positive" size="lg" />);
        const tile: HTMLElement = container.firstElementChild as HTMLElement;

        expect(tile).toHaveAttribute('aria-hidden', 'true');
        expect(tile).toHaveClass('text-positive', 'h-14');
    });

    it('usa o tamanho médio por padrão', () => {
        const { container } = render(<IconTile icon={Star} tone="neutral" />);

        expect(container.firstElementChild).toHaveClass('h-10');
    });
});
