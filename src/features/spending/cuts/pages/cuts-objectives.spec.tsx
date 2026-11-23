import { beforeEach, describe, expect, it, vi } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent, { type UserEvent } from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { track } from '@/shared/lib/analytics';
import type { CutsResponse } from '@/features/spending/types';
import { sessionIdentity } from '../../../../../test/fixtures/auth';
import { canonicalCuts } from '../../../../../test/fixtures/spending';
import { installCutsApi, type CutsApi } from '../../../../../test/helpers/cuts-api';
import { server } from '../../../../../test/msw/server';
import { renderRouterAt } from '../../../../../test/router';

vi.mock('@/shared/lib/analytics', () => ({ track: vi.fn() }));

const PATH: string = '/spending/cuts?month=2026-09';

function withObjectives(objectives: CutsResponse['objectives']): CutsResponse {
    return { ...canonicalCuts('goal20'), objectives };
}

beforeEach(() => {
    vi.mocked(track).mockClear();
});

describe('Onde cortar: objetivos', () => {
    it('diz quanto os objetivos pedem, compara com a meta e oferece o atalho', async () => {
        const api: CutsApi = installCutsApi({
            override: withObjectives({ monthlyNeededMinor: 210000, behindCount: 1, asGoalBps: 3750 })
        });
        const user: UserEvent = userEvent.setup();
        renderRouterAt(PATH, { signedIn: true });

        expect(await screen.findByRole('heading', { name: /^Seus objetivos pedem R\$\s2\.100 por mês$/ })).toBeInTheDocument();
        expect(screen.getByText(/Sua meta de 20% da renda dá/)).toBeInTheDocument();
        expect(screen.getByText('1 objetivo atrasado.')).toBeInTheDocument();
        expect(screen.getByRole('link', { name: 'Ver objetivos' })).toHaveAttribute('href', '/portfolio/goals');

        await user.click(screen.getByRole('button', { name: /^Usar R\$\s2\.100 como meta$/ }));

        expect(await screen.findByText('Meta atualizada pelos objetivos')).toBeInTheDocument();
        expect(api.puts).toEqual([{ savingsGoalBps: 3750 }]);
        expect(track).toHaveBeenCalledWith('spending_goal_from_objectives');
    });

    it('sem renda no mês não oferece o atalho', async () => {
        installCutsApi({ override: withObjectives({ monthlyNeededMinor: 210000, behindCount: 0, asGoalBps: null }) });
        renderRouterAt(PATH, { signedIn: true });

        expect(await screen.findByRole('heading', { name: /^Seus objetivos pedem R\$\s2\.100 por mês$/ })).toBeInTheDocument();
        expect(screen.queryByRole('button', { name: /como meta/ })).not.toBeInTheDocument();
        expect(screen.queryByText(/atrasado/)).not.toBeInTheDocument();
    });

    it('com a meta já igual ao valor dos objetivos, não repete o atalho', async () => {
        installCutsApi({
            savedBps: 2000,
            override: withObjectives({ monthlyNeededMinor: 140000, behindCount: 0, asGoalBps: 2000 })
        });
        renderRouterAt(PATH, { signedIn: true });

        expect(await screen.findByRole('heading', { name: /^Seus objetivos pedem R\$\s1\.400 por mês$/ })).toBeInTheDocument();
        expect(screen.queryByRole('button', { name: /como meta/ })).not.toBeInTheDocument();
    });

    it('sem objetivo a pagar, o cartão não aparece', async () => {
        installCutsApi();
        renderRouterAt(PATH, { signedIn: true });

        await screen.findByRole('slider', { name: 'Meta de economia' });
        expect(screen.queryByRole('heading', { name: /Seus objetivos pedem/ })).not.toBeInTheDocument();
    });

    it('quem só lê vê o valor, sem o atalho', async () => {
        installCutsApi({ override: withObjectives({ monthlyNeededMinor: 210000, behindCount: 1, asGoalBps: 3750 }) });
        renderRouterAt(PATH, { signedIn: true });
        server.use(http.get('*/auth/me', () => HttpResponse.json(sessionIdentity({ role: 'viewer' }))));

        expect(await screen.findByRole('heading', { name: /^Seus objetivos pedem R\$\s2\.100 por mês$/ })).toBeInTheDocument();
        expect(screen.queryByRole('button', { name: /como meta/ })).not.toBeInTheDocument();
    });
});
