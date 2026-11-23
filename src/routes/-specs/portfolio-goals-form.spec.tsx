import { describe, expect, it } from 'vitest';
import { http, HttpResponse } from 'msw';
import { screen, waitFor, within } from '@testing-library/react';
import userEvent, { type UserEvent } from '@testing-library/user-event';
import type { AnyRouter } from '@tanstack/react-router';
import { localTodayIso } from '@/features/portfolio/assets/lib/fixed-income-defaults';
import { addMonthsIso } from '@/features/portfolio/goals/lib/goal-form-values';
import type { CreateGoalBody, GoalView, UpdateGoalBody } from '@/features/portfolio/goals/types';
import type { HoldingsResponse } from '@/features/portfolio/types';
import { sessionIdentity } from '../../../test/fixtures/auth';
import { behindTravel, emergencySuggestion, goal, goalHolding, goalsList, noSpendingSuggestion } from '../../../test/fixtures/goals';
import { member, membersList } from '../../../test/fixtures/members';
import { holding } from '../../../test/fixtures/portfolio';
import { signedInHandlers } from '../../../test/msw/handlers/auth.handlers';
import { server } from '../../../test/msw/server';
import { renderRouterAt } from '../../../test/router';

type Role = 'owner' | 'editor' | 'viewer';

const SELIC_ID: string = '00000000-0000-4000-8000-0000000000c1';
const IVVB_ID: string = '00000000-0000-4000-8000-0000000000c2';

function holdings(): HoldingsResponse {
    return {
        baseCurrency: 'BRL',
        asOf: '2026-11-20',
        data: [
            holding({ kind: 'position', id: IVVB_ID, symbol: 'IVVB11', name: 'iShares S&P 500', typeGroup: 'fixed_income' }),
            holding({ kind: 'fixed_income', id: SELIC_ID, symbol: 'Tesouro Selic 2029', name: 'Tesouro Selic 2029', typeGroup: 'tesouro' })
        ]
    };
}

function open(role: Role, path: string, alone: boolean = true): AnyRouter {
    server.use(
        http.get('*/auth/me', (): Response => HttpResponse.json(sessionIdentity({ role }))),
        ...signedInHandlers(),
        http.get('*/portfolio/holdings', (): Response => HttpResponse.json(holdings()))
    );
    if (alone) {
        server.use(http.get('*/members', (): Response => HttpResponse.json(membersList({ members: [member()], invites: [] }))));
    }
    return renderRouterAt(path);
}

function serveGoals(items: readonly GoalView[]): void {
    server.use(http.get('*/goals', (): Response => HttpResponse.json(goalsList(items))));
}

function serveSuggestion(months: number[] = []): void {
    server.use(
        http.get('*/goals/emergency-suggestion', ({ request }): Response => {
            const asked: number = Number(new URL(request.url).searchParams.get('months') ?? 6);
            months.push(asked);
            return HttpResponse.json(emergencySuggestion({ months: asked, suggestedMinor: 520000 * asked }));
        })
    );
}

function captureCreate(): CreateGoalBody[] {
    const bodies: CreateGoalBody[] = [];
    server.use(
        http.post('*/goals', async ({ request }): Promise<Response> => {
            bodies.push((await request.json()) as CreateGoalBody);
            return HttpResponse.json(goal(), { status: 201 });
        })
    );
    return bodies;
}

function captureUpdate(): UpdateGoalBody[] {
    const bodies: UpdateGoalBody[] = [];
    server.use(
        http.patch('*/goals/:id', async ({ request }): Promise<Response> => {
            bodies.push((await request.json()) as UpdateGoalBody);
            return HttpResponse.json(goal());
        })
    );
    return bodies;
}

async function readyDialog(name: string): Promise<HTMLElement> {
    await screen.findByRole('textbox', { name: 'Nome' });
    return screen.getByRole('dialog', { name });
}

function problem(type: string, status: number): Response {
    return HttpResponse.json({ type, title: 'x', status, detail: 'd', requestId: 'r1' }, { status });
}

describe('objetivos: criar a reserva', () => {
    it('usa a sugestão pela média de gastos e envia o objetivo com a parte do ativo', async () => {
        serveGoals([]);
        serveSuggestion();
        const bodies: CreateGoalBody[] = captureCreate();
        const router: AnyRouter = open('owner', '/portfolio/goals?create=emergency_reserve');
        const user: UserEvent = userEvent.setup();

        const dialog: HTMLElement = await readyDialog('Novo objetivo');
        expect(
            await within(dialog).findByText(
                /Sugestão: R\$ 31\.200,00\. São 6 meses da sua média de gastos de agosto a outubro \(R\$ 5\.200,00\)\./
            )
        ).toBeInTheDocument();
        await user.click(within(dialog).getByRole('button', { name: /^Usar R\$\s31\.200,00$/ }));
        expect(within(dialog).getByLabelText('Valor do objetivo')).toHaveValue('31.200,00');
        expect(within(dialog).getByRole('textbox', { name: 'Nome' })).toHaveValue('Reserva de emergência');
        await user.type(within(dialog).getByLabelText('Tesouro Selic 2029 (parte em %)'), '60');
        await user.click(within(dialog).getByRole('button', { name: 'Criar objetivo' }));

        await waitFor((): void => {
            expect(bodies).toHaveLength(1);
        });
        expect(bodies[0]).toEqual({
            kind: 'emergency_reserve',
            name: 'Reserva de emergência',
            targetMinor: 3120000,
            targetDate: addMonthsIso(localTodayIso(), 12),
            manualMinor: 0,
            reserveMonths: 6,
            holdings: [{ kind: 'fixed_income', holdingId: SELIC_ID, shareBps: 6000 }]
        });
        expect(await screen.findByText('Objetivo criado.')).toBeInTheDocument();
        await waitFor((): void => {
            expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
        });
        expect(router.state.location.search).toEqual({});
    });

    it('troca para 12 meses e pede a sugestão desse prazo', async () => {
        serveGoals([]);
        const asked: number[] = [];
        serveSuggestion(asked);
        open('owner', '/portfolio/goals?create=emergency_reserve');
        const user: UserEvent = userEvent.setup();

        const dialog: HTMLElement = await readyDialog('Novo objetivo');
        await within(dialog).findByText(/Sugestão: R\$ 31\.200,00/);
        await user.click(within(dialog).getByRole('radio', { name: '12 meses' }));
        expect(await within(dialog).findByText(/Sugestão: R\$ 62\.400,00\. São 12 meses/)).toBeInTheDocument();
        expect(asked).toContain(12);
    });

    it('sem gastos importados, pergunta o gasto mensal e calcula o valor', async () => {
        serveGoals([]);
        server.use(http.get('*/goals/emergency-suggestion', (): Response => HttpResponse.json(noSpendingSuggestion())));
        open('owner', '/portfolio/goals?create=emergency_reserve');
        const user: UserEvent = userEvent.setup();

        const dialog: HTMLElement = await readyDialog('Novo objetivo');
        await user.type(await within(dialog).findByLabelText('Quanto você gasta por mês?'), '5200');
        expect(within(dialog).getByLabelText('Valor do objetivo')).toHaveValue('31.200,00');
        expect(within(dialog).getByRole('link', { name: 'Conectar bancos' })).toHaveAttribute('href', '/spending/connections');
        await user.click(within(dialog).getByRole('radio', { name: '3 meses' }));
        expect(within(dialog).getByLabelText('Valor do objetivo')).toHaveValue('15.600,00');
    });

    it('avisa quando a sugestão não carrega e deixa digitar o valor', async () => {
        serveGoals([]);
        server.use(http.get('*/goals/emergency-suggestion', (): Response => problem('identity.unauthorized', 500)));
        open('owner', '/portfolio/goals?create=emergency_reserve');

        const dialog: HTMLElement = await readyDialog('Novo objetivo');
        expect(await within(dialog).findByText('Não foi possível calcular a sugestão. Informe o valor do objetivo.')).toBeInTheDocument();
        expect(within(dialog).getByLabelText('Valor do objetivo')).toBeEnabled();
    });
});

describe('objetivos: criar outro objetivo', () => {
    it('mostra o que falta preencher e não pede a sugestão fora da reserva', async () => {
        serveGoals([]);
        const asked: number[] = [];
        serveSuggestion(asked);
        open('owner', '/portfolio/goals?create=other');
        const user: UserEvent = userEvent.setup();

        const dialog: HTMLElement = await readyDialog('Novo objetivo');
        await user.click(within(dialog).getByRole('button', { name: 'Criar objetivo' }));
        expect(await within(dialog).findByText('Dê um nome ao objetivo')).toBeInTheDocument();
        expect(within(dialog).getByText('Informe o valor do objetivo')).toBeInTheDocument();
        expect(within(dialog).getByText('Escolha a data')).toBeInTheDocument();
        expect(asked).toEqual([]);
    });

    it('troca o modelo para Viagem, com valor, data e valor fora da carteira', async () => {
        serveGoals([]);
        const bodies: CreateGoalBody[] = captureCreate();
        open('owner', '/portfolio/goals?create=other');
        const user: UserEvent = userEvent.setup();

        const dialog: HTMLElement = await readyDialog('Novo objetivo');
        await user.click(within(dialog).getByRole('radio', { name: 'Viagem' }));
        expect(within(dialog).getByRole('textbox', { name: 'Nome' })).toHaveValue('Viagem');
        await user.type(within(dialog).getByLabelText('Valor do objetivo'), '15000');
        await user.type(within(dialog).getByRole('textbox', { name: 'Data' }), '10032099');
        await user.type(within(dialog).getByLabelText('Fora da carteira'), '1000');
        await user.click(within(dialog).getByRole('button', { name: 'Criar objetivo' }));

        await waitFor((): void => {
            expect(bodies).toHaveLength(1);
        });
        expect(bodies[0]).toEqual({
            kind: 'travel',
            name: 'Viagem',
            targetMinor: 1500000,
            targetDate: '2099-03-10',
            manualMinor: 100000,
            holdings: []
        });
    });

    it('recusa a parte que passa do que está livre e mostra quanto sobra', async () => {
        serveGoals([goal({ holdings: [goalHolding({ holdingId: SELIC_ID, shareBps: 7000 })] })]);
        open('owner', '/portfolio/goals?create=other');
        const user: UserEvent = userEvent.setup();

        const dialog: HTMLElement = await readyDialog('Novo objetivo');
        const field: HTMLElement = await within(dialog).findByLabelText('Tesouro Selic 2029 (parte em %)');
        expect(within(dialog).getByText('Livre: 30% deste ativo')).toBeInTheDocument();
        await user.type(field, '40');
        await user.click(within(dialog).getByRole('button', { name: 'Criar objetivo' }));
        expect(await within(dialog).findByText('A parte passa do que está livre neste ativo')).toBeInTheDocument();
        await user.clear(field);
        await user.type(field, 'abc');
        await user.click(within(dialog).getByRole('button', { name: 'Criar objetivo' }));
        expect(await within(dialog).findByText('Informe uma parte entre 0,01% e 100%')).toBeInTheDocument();
    });

    it('traduz o erro da API sem fechar o modal', async () => {
        serveGoals([]);
        server.use(http.post('*/goals', (): Response => problem('goals.limit_reached', 422)));
        open('owner', '/portfolio/goals?create=emergency_reserve');
        server.use(http.get('*/goals/emergency-suggestion', (): Response => HttpResponse.json(emergencySuggestion())));
        const user: UserEvent = userEvent.setup();

        const dialog: HTMLElement = await readyDialog('Novo objetivo');
        await user.click(await within(dialog).findByRole('button', { name: /^Usar R\$\s31\.200,00$/ }));
        await user.click(within(dialog).getByRole('button', { name: 'Criar objetivo' }));
        expect(
            await within(dialog).findByText('A conta chegou ao limite de 20 objetivos. Remova um para criar outro.')
        ).toBeInTheDocument();
        expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('com duas pessoas, pergunta o titular e envia Conta toda por padrão', async () => {
        serveGoals([]);
        const bodies: CreateGoalBody[] = captureCreate();
        open('owner', '/portfolio/goals?create=other', false);
        const user: UserEvent = userEvent.setup();

        const dialog: HTMLElement = await readyDialog('Novo objetivo');
        expect(await within(dialog).findByText('Titular')).toBeInTheDocument();
        await user.type(within(dialog).getByRole('textbox', { name: 'Nome' }), 'Carro');
        await user.type(within(dialog).getByLabelText('Valor do objetivo'), '50000');
        await user.type(within(dialog).getByRole('textbox', { name: 'Data' }), '01012099');
        await user.click(within(dialog).getByRole('button', { name: 'Criar objetivo' }));

        await waitFor((): void => {
            expect(bodies).toHaveLength(1);
        });
        expect(bodies[0]).toMatchObject({ kind: 'other', name: 'Carro', holderUserId: null });
    });
});

describe('objetivos: editar', () => {
    it('abre pelo botão do cartão, preenche o formulário e envia só o que mudou', async () => {
        serveGoals([goal({ holdings: [goalHolding({ holdingId: SELIC_ID, shareBps: 6000 })] })]);
        serveSuggestion();
        const bodies: UpdateGoalBody[] = captureUpdate();
        const router: AnyRouter = open('editor', '/portfolio/goals');
        const user: UserEvent = userEvent.setup();

        await user.click(await screen.findByRole('link', { name: 'Editar Reserva de emergência' }));
        expect(router.state.location.search).toMatchObject({ edit: expect.any(String) as string });
        const dialog: HTMLElement = await readyDialog('Editar Reserva de emergência');
        expect(within(dialog).queryByRole('radio', { name: 'Viagem' })).not.toBeInTheDocument();
        expect(within(dialog).getByLabelText('Valor do objetivo')).toHaveValue('31.200,00');
        expect(within(dialog).getByLabelText('Tesouro Selic 2029 (parte em %)')).toHaveValue('60');
        await user.type(within(dialog).getByLabelText('Fora da carteira'), '2500');
        await user.click(within(dialog).getByRole('button', { name: 'Salvar' }));

        await waitFor((): void => {
            expect(bodies).toHaveLength(1);
        });
        expect(bodies[0]).toEqual({ manualMinor: 250000 });
        expect(await screen.findByText('Objetivo salvo.')).toBeInTheDocument();
    });

    it('mostra a média que mudou e atualiza o valor e os meses da reserva', async () => {
        const reserve: GoalView = goal({
            reserve: { months: 12, baseMinor: 260000, averageMinor: 590000, suggestedMinor: 7080000, deltaBps: 2692, shouldUpdate: true }
        });
        serveGoals([reserve]);
        serveSuggestion();
        const bodies: UpdateGoalBody[] = captureUpdate();
        open('owner', `/portfolio/goals?edit=${reserve.id}`);
        const user: UserEvent = userEvent.setup();

        const dialog: HTMLElement = await readyDialog('Editar Reserva de emergência');
        expect(within(dialog).getByText('Sua média de gastos mudou para R$ 5.900,00. Reserva sugerida: R$ 70.800,00.')).toBeInTheDocument();
        await user.click(within(dialog).getByRole('button', { name: 'Atualizar o valor' }));
        expect(within(dialog).getByLabelText('Valor do objetivo')).toHaveValue('70.800,00');
        await user.click(within(dialog).getByRole('button', { name: 'Salvar' }));

        await waitFor((): void => {
            expect(bodies).toHaveLength(1);
        });
        expect(bodies[0]).toEqual({ targetMinor: 7080000 });
    });

    it('mantém ligado o vínculo do ativo removido fora do envio e troca a parte de outro', async () => {
        serveGoals([
            behindTravel({
                holdings: [goalHolding({ kind: 'position', holdingId: IVVB_ID, shareBps: 2500, name: 'iShares S&P 500', symbol: 'IVVB11' })]
            })
        ]);
        const bodies: UpdateGoalBody[] = captureUpdate();
        open('owner', '/portfolio/goals?edit=00000000-0000-4000-8000-0000000000b2');
        const user: UserEvent = userEvent.setup();

        const dialog: HTMLElement = await readyDialog('Editar Viagem');
        const field: HTMLElement = await within(dialog).findByLabelText('IVVB11 · iShares S&P 500 (parte em %)');
        expect(field).toHaveValue('25');
        await user.clear(field);
        await user.type(field, '50');
        await user.click(within(dialog).getByRole('button', { name: 'Salvar' }));

        await waitFor((): void => {
            expect(bodies).toHaveLength(1);
        });
        expect(bodies[0]).toEqual({ holdings: [{ kind: 'position', holdingId: IVVB_ID, shareBps: 5000 }] });
    });

    it('avisa quando o objetivo do link não existe mais', async () => {
        serveGoals([goal()]);
        open('owner', '/portfolio/goals?edit=00000000-0000-4000-8000-0000000000ff');

        const dialog: HTMLElement = await screen.findByRole('dialog');
        expect(await within(dialog).findByText('Não foi possível abrir o objetivo')).toBeInTheDocument();
    });
});

describe('objetivos: papéis', () => {
    it('o Leitor não vê o botão de editar nem abre o modal pelo link', async () => {
        serveGoals([goal()]);
        open('viewer', '/portfolio/goals?create=other');

        await screen.findByRole('list', { name: 'Seus objetivos' });
        expect(screen.queryByRole('link', { name: /Editar/ })).not.toBeInTheDocument();
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
});
