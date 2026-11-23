import { describe, expect, it } from 'vitest';
import { http, HttpResponse } from 'msw';
import { screen, within } from '@testing-library/react';
import userEvent, { type UserEvent } from '@testing-library/user-event';
import type { GoalView, GoalsList } from '@/features/portfolio/goals/types';
import type { HoldingView } from '@/features/portfolio/types';
import { behindTravel, goal, goalHolding, goalsList } from '../../../test/fixtures/goals';
import { sampleHoldings } from '../../../test/fixtures/portfolio';
import { mockHoldingsApi } from '../../../test/helpers/holdings-api';
import { installOverviewApi } from '../../../test/helpers/overview-api';
import { server } from '../../../test/msw/server';
import { renderRouterAt } from '../../../test/router';

function serveGoals(list: GoalsList): void {
    server.use(http.get('*/goals', () => HttpResponse.json(list)));
}

describe('/portfolio: card de objetivos na Visão geral', () => {
    it('diz quantos estão atrasados e quanto guardar por mês, e abre Objetivos', async () => {
        installOverviewApi();
        serveGoals(goalsList([goal(), behindTravel()]));
        const user: UserEvent = userEvent.setup();
        const router = renderRouterAt('/portfolio', { signedIn: true });

        const summary: HTMLElement = await screen.findByText(/1 atrasado/);
        expect(summary).toHaveTextContent(/R\$\s3\.468,58 por mês/);
        await user.click(summary);

        expect(router.state.location.pathname).toBe('/portfolio/goals');
    });

    it('com todos em dia mostra só o valor por mês', async () => {
        installOverviewApi();
        serveGoals(goalsList([goal()]));
        renderRouterAt('/portfolio', { signedIn: true });

        expect(await screen.findByText(/Em dia · R\$\s1\.268,58 por mês/)).toBeInTheDocument();
    });

    it('sem objetivo não mostra o card', async () => {
        installOverviewApi();
        renderRouterAt('/portfolio', { signedIn: true });

        await screen.findByText('R$ 1.773.100,40');
        expect(screen.queryByText(/por mês/)).not.toBeInTheDocument();
    });
});

describe('/portfolio/assets: selo do objetivo no ativo', () => {
    it('marca o ativo vinculado com o nome e a parte, e ignora vínculo removido', async () => {
        mockHoldingsApi();
        const target: HoldingView = sampleHoldings().data[0] as HoldingView;
        const reserve: GoalView = goal({
            holdings: [goalHolding({ kind: target.kind, holdingId: target.id, shareBps: 6000 })]
        });
        const travel: GoalView = behindTravel({
            holdings: [goalHolding({ kind: target.kind, holdingId: target.id, shareBps: 2500, removed: true })]
        });
        serveGoals(goalsList([reserve, travel]));
        renderRouterAt('/portfolio/assets', { signedIn: true });

        const badges: HTMLElement[] = await screen.findAllByRole('list', { name: 'Objetivos deste ativo' });
        expect(badges.length).toBeGreaterThan(0);
        const first: HTMLElement = badges[0] as HTMLElement;
        expect(within(first).getByText('Reserva de emergência 60%')).toBeInTheDocument();
        expect(screen.queryByText(/Viagem 25%/)).not.toBeInTheDocument();
    });
});
