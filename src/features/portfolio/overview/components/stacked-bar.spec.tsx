import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { buildOverviewViewModel, type OverviewViewModel } from '../lib/overview-view-model';
import { emptyOverview, sampleOverview } from '../../../../../test/fixtures/portfolio';
import { StackedBar } from './stacked-bar';

describe('StackedBar', () => {
    it('um botão focável por segmento com larguras proporcionais e rótulo com os valores', () => {
        const model: OverviewViewModel = buildOverviewViewModel(sampleOverview());
        render(<StackedBar rows={model.rows} segments={model.actual} emphasis="actual" currency="BRL" />);

        const buttons: HTMLElement[] = screen.getAllByRole('button');
        expect(buttons).toHaveLength(8);
        expect(buttons[0]).toHaveStyle({ width: '20.82%' });
        expect(buttons[0]).toHaveAccessibleName('Renda fixa pós: atual 20,8%, meta 20%');
        expect(buttons[0]).toHaveClass('bg-class-1');
    });

    it('carteira vazia não desenha segmentos de atual, só a trilha', () => {
        const model: OverviewViewModel = buildOverviewViewModel(emptyOverview());
        render(<StackedBar rows={model.rows} segments={model.actual} emphasis="actual" currency="BRL" />);

        expect(screen.queryAllByRole('button')).toHaveLength(0);
    });

    it('a linha da meta fica atenuada', () => {
        const model: OverviewViewModel = buildOverviewViewModel(sampleOverview());
        const { container } = render(<StackedBar rows={model.rows} segments={model.target} emphasis="target" currency="BRL" />);

        expect(container.firstElementChild).toHaveClass('opacity-75');
    });
});
