import { describe, expect, it } from 'vitest';
import { screen, waitFor, within } from '@testing-library/react';
import userEvent, { type UserEvent } from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import type { ConfirmSeriesBody, RecurringOverview } from '@/features/spending/recurring/types';
import { sessionIdentity } from '../../../../../test/fixtures/auth';
import {
    confirmedLight,
    emptyRecurring,
    recurringOverview,
    recurringSeries,
    SERIES_ID_NETFLIX
} from '../../../../../test/fixtures/recurring';
import { emptyTransactions, transactionView } from '../../../../../test/fixtures/spending';
import { server } from '../../../../../test/msw/server';
import { renderRouterAt } from '../../../../../test/router';
import { problem } from '../../../../../test/fixtures/auth';

const PATH: string = '/spending/recurring';

function serve(overview: RecurringOverview): void {
    server.use(http.get('*/spending/recurring', () => HttpResponse.json(overview)));
}

function open(role: 'owner' | 'editor' | 'viewer' = 'owner'): UserEvent {
    renderRouterAt(PATH, { signedIn: true });
    if (role !== 'owner') {
        server.use(http.get('*/auth/me', () => HttpResponse.json(sessionIdentity({ role }))));
    }
    return userEvent.setup();
}

describe('RecurringPage: com séries', () => {
    it('mostra os totais, as sugestões e as confirmadas', async () => {
        serve(recurringOverview());
        open();

        expect(await screen.findByText('R$ 2.184,00')).toBeInTheDocument();
        expect(screen.getByText('+R$ 55,90 por mês em 1 sugestão para revisar')).toBeInTheDocument();
        expect(screen.getByRole('heading', { name: 'Para revisar (1)' })).toBeInTheDocument();
        const table: HTMLElement = screen.getByRole('table', { name: 'Assinaturas e contas confirmadas' });
        expect(within(table).getByText('Enel')).toBeInTheDocument();
        expect(within(table).getByText('R$ 150,00 a R$ 210,00')).toBeInTheDocument();
    });

    it('mostra o contador de sugestões no menu', async () => {
        serve(recurringOverview());
        open();

        const tab: HTMLElement = await screen.findByRole('link', { name: /1 sugestão para revisar/ });
        expect(tab).toBeInTheDocument();
    });

    it('descarta a sugestão com "Não é recorrente"', async () => {
        serve(recurringOverview());
        const user: UserEvent = open();
        let dismissed: string | null = null;
        server.use(
            http.post('*/spending/recurring/:id/dismiss', ({ params }) => {
                dismissed = String(params['id']);
                return HttpResponse.json(recurringSeries({ status: 'dismissed' }));
            })
        );

        await user.click(await screen.findByRole('button', { name: 'Netflix: não é recorrente' }));

        await waitFor(() => {
            expect(dismissed).toBe(SERIES_ID_NETFLIX);
        });
        expect(await screen.findByText(/Netflix saiu das sugestões/)).toBeInTheDocument();
    });

    it('oculta a sugestão com "Agora não"', async () => {
        serve(recurringOverview());
        const user: UserEvent = open();

        await user.click(await screen.findByRole('button', { name: 'Netflix: agora não' }));

        expect(await screen.findByText('Netflix fica oculta por 30 dias')).toBeInTheDocument();
    });

    it('confirma com categoria e regra "sempre para"', async () => {
        serve(recurringOverview());
        const user: UserEvent = open();
        let sent: ConfirmSeriesBody | null = null;
        server.use(
            http.post('*/spending/recurring/:id/confirm', async ({ request }) => {
                sent = (await request.json()) as ConfirmSeriesBody;
                return HttpResponse.json({
                    series: recurringSeries({ status: 'confirmed' }),
                    categoryRule: { created: true, recategorized: 2 }
                });
            })
        );

        await user.click(await screen.findByRole('button', { name: 'Confirmar Netflix' }));
        const dialog: HTMLElement = await screen.findByRole('dialog', { name: 'Confirmar Netflix' });
        await within(dialog).findByRole('button', { name: 'Categoria' });
        await user.clear(within(dialog).getByRole('textbox', { name: 'Nome' }));
        await user.type(within(dialog).getByRole('textbox', { name: 'Nome' }), 'Netflix Premium');
        await user.click(within(dialog).getByRole('button', { name: 'Confirmar' }));

        await waitFor(() => {
            expect(sent).toMatchObject({
                name: 'Netflix Premium',
                cadence: 'monthly',
                expectedDay: 12,
                kind: 'subscription',
                createRule: true
            });
        });
        expect(await screen.findByText('Confirmada: Netflix Premium')).toBeInTheDocument();
        await waitFor(() => {
            expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
        });
    });

    it('recusa um dia fora de 1 a 31 sem chamar a API', async () => {
        serve(recurringOverview());
        const user: UserEvent = open();
        let called: boolean = false;
        server.use(
            http.post('*/spending/recurring/:id/confirm', () => {
                called = true;
                return HttpResponse.json({});
            })
        );

        await user.click(await screen.findByRole('button', { name: 'Confirmar Netflix' }));
        const dialog: HTMLElement = await screen.findByRole('dialog', { name: 'Confirmar Netflix' });
        await user.clear(within(dialog).getByRole('textbox', { name: 'Dia do mês' }));
        await user.type(within(dialog).getByRole('textbox', { name: 'Dia do mês' }), '40');
        await user.click(within(dialog).getByRole('button', { name: 'Confirmar' }));

        expect(await within(dialog).findByText('Informe um dia de 1 a 31')).toBeInTheDocument();
        expect(called).toBe(false);
    });

    it('traduz o erro da API ao confirmar', async () => {
        serve(recurringOverview());
        const user: UserEvent = open();
        server.use(
            http.post('*/spending/recurring/:id/confirm', () => HttpResponse.json(problem('recurring.invalid_state', 409), { status: 409 }))
        );

        await user.click(await screen.findByRole('button', { name: 'Confirmar Netflix' }));
        const dialog: HTMLElement = await screen.findByRole('dialog', { name: 'Confirmar Netflix' });
        await user.click(within(dialog).getByRole('button', { name: 'Confirmar' }));

        expect(await screen.findByText('Essa assinatura ou conta já mudou de situação. Atualize a tela.')).toBeInTheDocument();
    });

    it('marca uma confirmada como cancelada depois de confirmar o aviso', async () => {
        serve(recurringOverview());
        const user: UserEvent = open();

        await user.click(await screen.findByRole('button', { name: 'Enel: cancelei' }));
        const dialog: HTMLElement = await screen.findByRole('dialog');
        expect(within(dialog).getByText(/A Vera não cancela nada/)).toBeInTheDocument();
        await user.click(within(dialog).getByRole('button', { name: 'Marcar como cancelada' }));

        expect(await screen.findByText('Enel marcada como cancelada')).toBeInTheDocument();
    });

    it('desfaz uma série parada ou descartada', async () => {
        serve(
            recurringOverview({
                review: [],
                stopped: [confirmedLight({ status: 'stopped', stoppedBy: 'auto' })],
                dismissed: [recurringSeries({ status: 'dismissed', name: 'Spotify' })]
            })
        );
        const user: UserEvent = open();

        await user.click(await screen.findByText('Paradas e descartadas (2)'));
        expect(screen.getByText(/Sem cobrança no prazo/)).toBeInTheDocument();
        await user.click(screen.getByRole('button', { name: 'Desfazer: Spotify' }));

        expect(await screen.findByText('Spotify voltou')).toBeInTheDocument();
    });

    it('esconde as ações de quem só consulta', async () => {
        serve(recurringOverview());
        open('viewer');

        expect(await screen.findByRole('heading', { name: 'Para revisar (1)' })).toBeInTheDocument();
        await waitFor(() => {
            expect(screen.queryByRole('button', { name: 'Confirmar Netflix' })).not.toBeInTheDocument();
        });
        expect(screen.queryByRole('button', { name: 'Enel: cancelei' })).not.toBeInTheDocument();
    });
});

describe('RecurringPage: sem séries e com falha', () => {
    it('pede o extrato quando não há transações', async () => {
        serve(emptyRecurring());
        open();

        expect(await screen.findByText('Nenhuma transação importada')).toBeInTheDocument();
        expect(screen.getByText('Com 3 meses de extrato, a Vera acha o que se repete.')).toBeInTheDocument();
        expect(screen.getByRole('link', { name: 'Conectar bancos' })).toBeInTheDocument();
    });

    it('avisa que nada se repetiu quando há transações', async () => {
        serve(emptyRecurring());
        server.use(
            http.get('*/spending/transactions', () =>
                HttpResponse.json({
                    ...emptyTransactions(),
                    data: [transactionView()],
                    pagination: { page: 1, pageSize: 1, totalRecords: 12, totalPages: 12 }
                })
            )
        );
        open();

        expect(await screen.findByText('Nada se repetiu nos últimos 13 meses')).toBeInTheDocument();
        expect(screen.getByRole('link', { name: 'Marcar uma transação como recorrente' })).toBeInTheDocument();
    });

    it('mostra a falha e tenta de novo', async () => {
        server.use(http.get('*/spending/recurring', () => HttpResponse.json(problem('internal', 500), { status: 500 })));
        const user: UserEvent = open();

        expect(await screen.findByText('Não foi possível carregar as assinaturas e contas')).toBeInTheDocument();
        serve(recurringOverview());
        await user.click(screen.getByRole('button', { name: 'Tentar de novo' }));

        expect(await screen.findByRole('heading', { name: 'Para revisar (1)' })).toBeInTheDocument();
    });
});
