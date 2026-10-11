import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';
import { Gauge } from './gauge';

describe('Gauge', () => {
    it('desenha a barra do atual e a marca da meta, escondidas do leitor de tela', () => {
        const { container } = render(<Gauge shareBps={4000} targetBps={3000} colorKey="c4" />);

        const root: HTMLElement = container.firstElementChild as HTMLElement;
        expect(root).toHaveAttribute('aria-hidden', 'true');
        const [fill, mark] = Array.from(root.children) as HTMLElement[];
        expect(fill).toHaveStyle({ width: '80%' });
        expect(fill?.className).toContain('bg-class-4');
        expect(mark).toHaveStyle({ left: 'calc(60% - 1px)' });
    });
});
