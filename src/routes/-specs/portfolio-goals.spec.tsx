import { describe, expect, it } from 'vitest';
import { http, HttpResponse } from 'msw';
import { screen, within } from '@testing-library/react';
import userEvent, { type UserEvent } from '@testing-library/user-event';
import type { AnyRouter } from '@tanstack/react-router';
import type { GoalsList } from '@/features/portfolio/goals/types';
import { sessionIdentity } from '../../../test/fixtures/auth';
import { behindTravel, emptyGoals, goal, goalsList } from '../../../test/fixtures/goals';
import { member, membersList } from '../../../test/fixtures/members';
import { ANA } from '../../../test/fixtures/people';
import { signedInHandlers } from '../../../test/msw/handlers/auth.handlers';
import { server } from '../../../test/msw/server';
import { renderRouterAt } from '../../../test/router';

type Role = 'owner' | 'editor' | 'viewer';

function openAs(role: Role, path: string = '/portfolio/goals'): AnyRouter {
    server.use(
        http.get('*/auth/me', (): Response => HttpResponse.json(sessionIdentity({ role }))),
        ...signedInHandlers()
    );
    return renderRouterAt(path);
}

function alone(): void {
    server.use(http.get('*/members', (): Response => HttpResponse.json(membersList({ members: [member()], invites: [] }))));
}

function serve(body: GoalsList): string[] {
    const holders: string[] = [];
    server.use(
        http.get('*/goals', ({ request }): Response => {
            holders.push(new URL(request.url).searchParams.get('holder') ?? '');
            return HttpResponse.json(body);
        })
    );
    return holders;
}

describe('objetivos: conteúdo', () => {
    it('mostra os totais e um cartão por objetivo', async () => {
        alone();
        serve(goalsList());
        openAs('owner');

        const list: HTMLElement = await screen.findByRole('list', { name: 'Seus objetivos' });
        const cards: HTMLElement[] = within(list)
            .getAllByRole('listitem')
            .filter((item: HTMLElement): boolean => item.classList.contains('surface-card'));
        expect(cards).toHaveLength(2);
        expect(screen.getByText('Guardar por mês').parentElement?.parentElement).toHaveTextContent('R$ 3.468,58');
        expect(screen.getAllByText('Em dia')[0]?.parentElement?.parentElement).toHaveTextContent('1');
        expect(screen.getByText('Atrasados').parentElement?.parentElement).toHaveTextContent('1');
        expect(screen.getByText('A conta não inclui rendimento futuro.')).toBeInTheDocument();
    });

    it('escreve o que falta, o valor por mês e a data no cartão em dia', async () => {
        alone();
        serve(goalsList([goal()]));
        openAs('owner');

        const card: HTMLElement = (await screen.findByRole('heading', { name: 'Reserva de emergência' })).closest('li') as HTMLElement;
        expect(within(card).getByText('Em dia')).toBeInTheDocument();
        expect(within(card).getByText('R$ 22.320,00 de R$ 31.200,00')).toBeInTheDocument();
        expect(within(card).getByText('Faltam R$ 8.880,00. R$ 1.268,58 por mês até junho de 2027.')).toBeInTheDocument();
        expect(within(card).getByText('+R$ 380,00 neste mês')).toBeInTheDocument();
        expect(within(card).getByText('Tesouro Selic 2029 60%')).toBeInTheDocument();
        expect(within(card).getByRole('progressbar', { name: 'Progresso de Reserva de emergência' })).toHaveAttribute('value', '71');
    });

    it('no atrasado, diz quanto era e quanto é, e mostra o valor fora da carteira', async () => {
        alone();
        serve(goalsList([behindTravel()]));
        openAs('owner');

        const card: HTMLElement = (await screen.findByRole('heading', { name: 'Viagem' })).closest('li') as HTMLElement;
        expect(within(card).getByText('Atrasado')).toBeInTheDocument();
        expect(within(card).getByText('Eram R$ 1.200,00 por mês; agora são R$ 2.200,00.')).toBeInTheDocument();
        expect(within(card).getByText('−R$ 420,00 neste mês')).toBeInTheDocument();
        expect(within(card).getByText('Fora da carteira: R$ 1.000,00')).toBeInTheDocument();
        expect(within(card).getByText('iShares S&P 500 25%')).toBeInTheDocument();
    });

    it('trata prazo vencido, objetivo concluído e ativo removido', async () => {
        alone();
        serve(
            goalsList([
                goal({ status: 'overdue', name: 'Atrasada', removedHoldings: 1 }),
                goal({ id: 'done', status: 'done', name: 'Pronta', remainingMinor: 0, balanceMinor: 3120000 })
            ])
        );
        openAs('owner');

        expect(await screen.findByText('Prazo vencido')).toBeInTheDocument();
        expect(screen.getByText('Faltam R$ 8.880,00. O prazo era junho de 2027.')).toBeInTheDocument();
        expect(screen.getByText('1 ativo vinculado foi removido')).toBeInTheDocument();
        expect(screen.getByText('Objetivo atingido.')).toBeInTheDocument();
        expect(screen.getByText('1 concluído')).toBeInTheDocument();
    });

    it('com duas pessoas, mostra o titular e manda o filtro para a API', async () => {
        const holders: string[] = serve(goalsList([goal({ holderUserId: ANA.userId }), behindTravel()]));
        const user: UserEvent = userEvent.setup();
        openAs('owner');

        expect(await screen.findByText('Titular: Ana Souza')).toBeInTheDocument();
        expect(screen.getByText('Titular: Conta toda')).toBeInTheDocument();
        await user.click(screen.getByRole('radio', { name: 'Conta toda' }));
        await screen.findByRole('list', { name: 'Seus objetivos' });
        expect(holders).toContain('all');
    });
});

describe('objetivos: estados', () => {
    it('mostra o estado vazio com as duas ações para quem edita', async () => {
        serve(emptyGoals());
        const router: AnyRouter = openAs('editor');
        const user: UserEvent = userEvent.setup();

        expect(await screen.findByRole('heading', { name: 'Nenhum objetivo criado' })).toBeInTheDocument();
        expect(screen.getByText(/A Vera calcula quanto guardar por mês/)).toBeInTheDocument();
        expect(screen.getByRole('link', { name: 'Criar outro objetivo' })).toBeInTheDocument();
        await user.click(screen.getByRole('link', { name: 'Criar reserva de emergência' }));
        expect(router.state.location.search).toMatchObject({ create: 'emergency_reserve' });
    });

    it('esconde as ações de criar do Leitor', async () => {
        serve(emptyGoals());
        openAs('viewer');

        expect(await screen.findByRole('heading', { name: 'Nenhum objetivo criado' })).toBeInTheDocument();
        expect(screen.queryByRole('link', { name: /Criar/ })).not.toBeInTheDocument();
        expect(screen.queryByRole('link', { name: 'Novo objetivo' })).not.toBeInTheDocument();
    });

    it('mostra o botão Novo objetivo para o Editor e não para o Leitor, com a lista cheia', async () => {
        serve(goalsList());
        openAs('editor');
        expect(await screen.findByRole('link', { name: 'Novo objetivo' })).toBeInTheDocument();
    });

    it('o Leitor vê os cartões, sem ação de criar', async () => {
        serve(goalsList());
        openAs('viewer');
        await screen.findByRole('list', { name: 'Seus objetivos' });
        expect(screen.queryByRole('link', { name: 'Novo objetivo' })).not.toBeInTheDocument();
    });

    it('com filtro de titular e nenhum objetivo, pede para trocar o filtro', async () => {
        serve(emptyGoals());
        openAs('owner', `/portfolio/goals?holder=${ANA.userId}`);
        expect(await screen.findByRole('heading', { name: 'Nenhum objetivo deste titular' })).toBeInTheDocument();
    });

    it('mostra o erro traduzido e deixa tentar de novo', async () => {
        server.use(
            http.get('*/goals', (): Response =>
                HttpResponse.json(
                    { type: 'identity.unauthorized', title: 'x', status: 500, detail: 'boom', requestId: 'r1' },
                    { status: 500 }
                )
            )
        );
        openAs('owner');
        expect(await screen.findByText('Não foi possível carregar os objetivos')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Tentar de novo' })).toBeInTheDocument();
    });
});

describe('objetivos: navegação', () => {
    it('marca Objetivos no menu e na aba, depois de Onde aportar', async () => {
        alone();
        serve(goalsList());
        openAs('owner');

        const tabs: HTMLElement = await screen.findByRole('navigation', { name: 'Seções da carteira' });
        const labels: string[] = Array.from(tabs.querySelectorAll('a')).map((link: HTMLElement): string => link.textContent ?? '');
        expect(labels).toEqual([
            'Visão geral',
            'Carteira-alvo',
            'Onde aportar',
            'Objetivos',
            'Meus ativos',
            'Agenda',
            'O que mudou',
            'Raio-X do mês'
        ]);
    });

    it('degrada um parâmetro create inválido sem lançar', async () => {
        alone();
        serve(goalsList());
        const router: AnyRouter = openAs('owner', '/portfolio/goals?create=talvez');
        await screen.findByRole('list', { name: 'Seus objetivos' });
        expect(router.state.location.search).toEqual({});
    });
});
