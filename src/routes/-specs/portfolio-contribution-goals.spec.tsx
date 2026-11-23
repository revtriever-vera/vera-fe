import { describe, expect, it } from 'vitest';
import { http, HttpResponse } from 'msw';
import { screen, waitFor, within } from '@testing-library/react';
import userEvent, { type UserEvent } from '@testing-library/user-event';
import type { ContributionGoal, ContributionSuggestion } from '@/features/portfolio/contribution/types';
import { sampleSuggestion } from '../../../test/fixtures/contribution';
import { behindTravel, goal, goalsList } from '../../../test/fixtures/goals';
import { installContributionApi, type ContributionApi } from '../../../test/helpers/contribution-api';
import { server } from '../../../test/msw/server';
import { renderRouterAt } from '../../../test/router';

const PATH: string = '/portfolio/contribution?amount=10000';

function travelShare(overrides: Partial<ContributionGoal> = {}): ContributionGoal {
    return {
        goalId: 'goal-travel',
        kind: 'travel',
        name: 'Viagem',
        targetDate: '2027-03-10',
        amountMinor: 220000,
        destination: { kind: 'position', id: 'position-9', symbol: 'IVVB11', name: 'iShares S&P 500', typeGroup: 'acoes_eua', hint: null },
        ...overrides
    };
}

function withGoals(goals: readonly ContributionGoal[]): ContributionSuggestion {
    return {
        ...sampleSuggestion(),
        goals: [...goals],
        goalsAmountMinor: goals.reduce((sum: number, item: ContributionGoal): number => sum + item.amountMinor, 0)
    };
}

describe('aporte: objetivos atrasados', () => {
    it('mostra o bloco antes das classes, com o destino e a dica da renda fixa', async () => {
        installContributionApi({
            suggestion: withGoals([
                travelShare(),
                travelShare({
                    goalId: 'goal-reserve',
                    name: 'Reserva de emergência',
                    amountMinor: 148000,
                    destination: {
                        kind: 'fixed_income',
                        id: 'title-1',
                        symbol: 'Banco Exemplo',
                        name: 'Tesouro Selic 2029',
                        typeGroup: 'tesouro',
                        hint: 'new_or_reinforce'
                    }
                })
            ])
        });
        server.use(http.get('*/goals', () => HttpResponse.json(goalsList([goal(), behindTravel()]))));
        renderRouterAt(PATH, { signedIn: true });

        const block: HTMLElement = await screen.findByRole('region', { name: 'Objetivos atrasados' });
        expect(within(block).getByText('Viagem')).toBeInTheDocument();
        expect(within(block).getByText('IVVB11 · iShares S&P 500')).toBeInTheDocument();
        expect(within(block).getByText('Reserva de emergência')).toBeInTheDocument();
        expect(within(block).getByText('novo título ou reforço')).toBeInTheDocument();
        expect(block).toHaveTextContent(/R\$\s3\.680,00/);
    });

    it('o interruptor vem ligado e, desligado, pede a sugestão sem priorizar', async () => {
        const api: ContributionApi = installContributionApi({ suggestion: withGoals([travelShare()]) });
        server.use(http.get('*/goals', () => HttpResponse.json(goalsList([behindTravel()]))));
        const user: UserEvent = userEvent.setup();
        renderRouterAt(PATH, { signedIn: true });

        const toggle: HTMLElement = await screen.findByRole('switch', { name: 'Começar pelos objetivos atrasados' });
        expect(toggle).toBeChecked();
        expect(api.prioritize).toEqual([true]);

        await user.click(toggle);

        await waitFor(() => {
            expect(api.prioritize).toEqual([true, false]);
        });
        expect(screen.getByRole('switch', { name: 'Começar pelos objetivos atrasados' })).not.toBeChecked();
    });

    it('sem objetivo atrasado não mostra o interruptor nem o bloco', async () => {
        installContributionApi();
        server.use(http.get('*/goals', () => HttpResponse.json(goalsList([goal()]))));
        renderRouterAt(PATH, { signedIn: true });

        await screen.findByText('Renda fixa IPCA+');
        expect(screen.queryByRole('switch', { name: 'Começar pelos objetivos atrasados' })).not.toBeInTheDocument();
        expect(screen.queryByRole('region', { name: 'Objetivos atrasados' })).not.toBeInTheDocument();
    });
});
