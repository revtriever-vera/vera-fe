import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';
import { gaugePositions } from '../lib/gauge-positions';
import { Gauge } from './gauge';

describe('gaugePositions', () => {
    it('escala pelo maior valor com folga de 25%', () => {
        expect(gaugePositions(1000, 500)).toEqual({ fill: 80, mark: 40 });
    });

    it('usa uma escala mínima quando tudo é zero', () => {
        expect(gaugePositions(0, 0)).toEqual({ fill: 0, mark: 0 });
    });
});

describe('Gauge', () => {
    it('desenha a barra do atual e a marca da meta nas posições certas', () => {
        const { container } = render(<Gauge shareBps={1000} targetBps={500} colorKey="c4" />);
        const parts: HTMLElement[] = Array.from((container.firstElementChild as HTMLElement).children) as HTMLElement[];

        expect(parts[0]).toHaveStyle({ width: '80%' });
        expect(parts[0]).toHaveClass('bg-class-4');
        expect(parts[1]).toHaveStyle({ left: 'calc(40% - 1px)' });
    });

    it('é decorativo para leitor de tela', () => {
        const { container } = render(<Gauge shareBps={1000} targetBps={500} colorKey="c4" />);

        expect(container.firstElementChild).toHaveAttribute('aria-hidden', 'true');
    });
});
