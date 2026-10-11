import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { buildOverviewViewModel, type ClassRow } from '../lib/overview-view-model';
import { sampleOverview } from '../../../../../test/fixtures/portfolio';
import { ClassSegmentTooltip } from './class-segment-tooltip';

describe('ClassSegmentTooltip', () => {
    const rows: readonly ClassRow[] = buildOverviewViewModel(sampleOverview()).rows;

    function rowOf(systemKey: string): ClassRow {
        const found: ClassRow | undefined = rows.find((item: ClassRow): boolean => item.systemKey === systemKey);
        if (found === undefined) {
            throw new Error(systemKey);
        }
        return found;
    }

    it('mostra nome, atual, meta, desvio e a frase da situação', () => {
        render(<ClassSegmentTooltip row={rowOf('cripto')} emphasis="actual" currency="BRL" />);

        expect(screen.getByText('Cripto')).toBeInTheDocument();
        expect(screen.getByText('Atual: 11,7% · R$ 207.586,00')).toBeInTheDocument();
        expect(screen.getByText('Meta: 5% · R$ 88.655,02')).toBeInTheDocument();
        expect(screen.getByText('Desvio: +6,7 pp')).toBeInTheDocument();
        expect(screen.getByText('R$ 118.930,98 acima da meta')).toBeInTheDocument();
    });

    it('abaixo da meta, diz quanto falta', () => {
        const row: ClassRow = { ...rowOf('rf_pos'), status: 'below', gapMinor: 8377205, deviationBps: -900 };
        render(<ClassSegmentTooltip row={row} emphasis="both" currency="BRL" />);

        expect(screen.getByText('Faltam R$ 83.772,05 para a meta')).toBeInTheDocument();
        expect(screen.getByText('Desvio: −9,0 pp')).toBeInTheDocument();
    });
});
