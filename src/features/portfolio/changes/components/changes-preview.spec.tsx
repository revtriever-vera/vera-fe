import { describe, expect, it } from 'vitest';
import { http, HttpResponse } from 'msw';
import { screen, within } from '@testing-library/react';
import { problem } from '../../../../../test/fixtures/auth';
import { changeItem, sampleChanges } from '../../../../../test/fixtures/changes';
import { installOverviewApi } from '../../../../../test/helpers/overview-api';
import { server } from '../../../../../test/msw/server';
import { renderRouterAt } from '../../../../../test/router';

import type { ChangeItem } from '../types';

describe('O que mudou na visão geral', () => {
    it('mostra os 3 primeiros itens, o link Ver tudo e a linha fixa', async () => {
        installOverviewApi();
        const items: ChangeItem[] = ['AAA1', 'BBB2', 'CCC3', 'DDD4'].map((symbol: string, index: number) =>
            changeItem({ id: `00000000-0000-4000-8000-00000000010${String(index)}`, symbol, weightLine: `${symbol} é 5% da sua carteira.` })
        );
        server.use(http.get('*/portfolio-watch/changes', () => HttpResponse.json(sampleChanges(items))));
        renderRouterAt('/portfolio', { signedIn: true });

        const block: HTMLElement = await screen.findByRole('region', { name: 'O que mudou' });

        expect(within(block).getByText('AAA1')).toBeInTheDocument();
        expect(within(block).getByText('CCC3')).toBeInTheDocument();
        expect(within(block).queryByText('DDD4')).toBeNull();
        expect(within(block).getByRole('link', { name: 'Ver tudo' })).toHaveAttribute(
            'href',
            expect.stringContaining('/portfolio/changes')
        );
        expect(within(block).getByText('Isto não é uma recomendação de compra ou venda.')).toBeInTheDocument();
    });

    it('sem documentos o bloco não aparece', async () => {
        installOverviewApi();
        renderRouterAt('/portfolio', { signedIn: true });
        await screen.findByText('R$ 1.773.100,40');

        expect(screen.queryByRole('region', { name: 'O que mudou' })).toBeNull();
    });

    it('no Free mostra o cadeado com a contagem', async () => {
        installOverviewApi();
        server.use(
            http.get('*/portfolio-watch/changes', () =>
                HttpResponse.json({ ...problem('plan.feature_locked', 402), meta: { documentCount: 1 } }, { status: 402 })
            )
        );
        renderRouterAt('/portfolio', { signedIn: true });

        expect(await screen.findByText(/1 documento novo sobre os seus ativos nesta semana/)).toBeInTheDocument();
    });
});
