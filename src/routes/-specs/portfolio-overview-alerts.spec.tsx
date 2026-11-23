import { describe, expect, it } from 'vitest';
import { http, HttpResponse } from 'msw';
import { screen } from '@testing-library/react';
import userEvent, { type UserEvent } from '@testing-library/user-event';
import type { AnyRouter } from '@tanstack/react-router';
import { track } from '@/shared/lib/analytics';
import { fgcCoverage, maturities, maturityItem } from '../../../test/fixtures/fixed-income';
import { installOverviewApi } from '../../../test/helpers/overview-api';
import { server } from '../../../test/msw/server';
import { renderRouterAt } from '../../../test/router';

async function openOverview(): Promise<AnyRouter> {
    const router: AnyRouter = renderRouterAt('/portfolio', { signedIn: true });
    await screen.findByText('R$ 1.773.100,40');
    return router;
}

function fail(path: string): void {
    server.use(http.get(path, () => HttpResponse.json({ type: 'x', title: 'x', status: 400, detail: 'x', requestId: null }, { status: 400 })));
}

describe('/portfolio: avisos de vencimento e FGC', () => {
    it('sem aviso não renderiza nada', async () => {
        installOverviewApi();
        await openOverview();

        expect(screen.queryByRole('list', { name: 'Avisos da carteira' })).not.toBeInTheDocument();
    });

    it('mostra o primeiro vencimento próximo e Realocar leva ao Onde aportar', async () => {
        installOverviewApi();
        server.use(http.get('*/portfolio/maturities', () => HttpResponse.json(maturities([maturityItem(), maturityItem({ id: 'b', name: 'Outro' })]))));
        const user: UserEvent = userEvent.setup();
        const router: AnyRouter = await openOverview();

        expect(await screen.findByText('CDB Banco Alfa vence em 42 dias, em 20/11/2026, com cerca de R$ 12.300,00 para realocar.')).toBeInTheDocument();
        expect(screen.queryByText(/Outro vence/)).not.toBeInTheDocument();
        await user.click(screen.getByRole('button', { name: 'Realocar o valor de CDB Banco Alfa' }));

        expect(router.state.location.pathname).toBe('/portfolio/contribution');
        expect(router.state.location.search).toEqual({ amount: 12300 });
        expect(track).toHaveBeenCalledWith('overview_alert_clicked', { kind: 'maturity' });
    });

    it('ignora vencimento que não é próximo', async () => {
        installOverviewApi();
        server.use(http.get('*/portfolio/maturities', () => HttpResponse.json(maturities([maturityItem({ soon: false, daysToMaturity: 200 })]))));
        await openOverview();

        expect(screen.queryByRole('list', { name: 'Avisos da carteira' })).not.toBeInTheDocument();
    });

    it('mostra o grupo acima do limite e Ver cobertura abre a aba certa', async () => {
        installOverviewApi();
        server.use(http.get('*/portfolio/fgc', () => HttpResponse.json(fgcCoverage())));
        const user: UserEvent = userEvent.setup();
        const router: AnyRouter = await openOverview();

        expect(await screen.findByText('R$ 50.000,00 em Conglomerado Alfa acima do limite de R$ 250 mil do FGC.')).toBeInTheDocument();
        await user.click(screen.getByRole('link', { name: 'Ver cobertura' }));

        expect(router.state.location.pathname).toBe('/portfolio/assets');
        expect(router.state.location.search).toEqual({ tab: 'fixed-income' });
        expect(await screen.findByRole('tab', { name: 'Renda fixa', selected: true })).toBeInTheDocument();
        expect(track).toHaveBeenCalledWith('overview_alert_clicked', { kind: 'fgc' });
    });

    it('mostra os dois avisos juntos', async () => {
        installOverviewApi();
        server.use(
            http.get('*/portfolio/maturities', () => HttpResponse.json(maturities())),
            http.get('*/portfolio/fgc', () => HttpResponse.json(fgcCoverage()))
        );
        await openOverview();

        expect(await screen.findAllByRole('listitem')).not.toHaveLength(0);
        expect(await screen.findByText(/vence em 42 dias/)).toBeInTheDocument();
        expect(await screen.findByText(/acima do limite de R\$ 250 mil/)).toBeInTheDocument();
    });

    it('erro de uma consulta esconde só os avisos dela', async () => {
        installOverviewApi();
        fail('*/portfolio/maturities');
        server.use(http.get('*/portfolio/fgc', () => HttpResponse.json(fgcCoverage())));
        await openOverview();

        expect(await screen.findByText(/acima do limite de R\$ 250 mil/)).toBeInTheDocument();
        expect(screen.queryByText(/vence em/)).not.toBeInTheDocument();
        expect(screen.getByText('R$ 1.773.100,40')).toBeInTheDocument();
    });
});
