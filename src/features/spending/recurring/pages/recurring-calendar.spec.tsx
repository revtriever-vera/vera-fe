import { describe, expect, it } from 'vitest';
import { screen, waitFor, within } from '@testing-library/react';
import userEvent, { type UserEvent } from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import type { CalendarEntry, RecurringOverview, RecurringSeriesView, UpdateSeriesBody } from '@/features/spending/recurring/types';
import { problem, sessionIdentity } from '../../../../../test/fixtures/auth';
import {
    calendarEntry,
    confirmedLight,
    recurringAlert,
    recurringOverview,
    recurringSeries,
    SERIES_ID_LIGHT
} from '../../../../../test/fixtures/recurring';
import { server } from '../../../../../test/msw/server';
import { renderRouterAt } from '../../../../../test/router';

const PATH: string = '/spending/recurring';

function serve(overview: RecurringOverview, calendar: readonly CalendarEntry[] = []): void {
    server.use(
        http.get('*/spending/recurring', () => HttpResponse.json(overview)),
        http.get('*/spending/recurring/calendar', () => HttpResponse.json(calendar))
    );
}

function alertList(): HTMLElement {
    return screen.getByRole('list', { name: 'Alertas das assinaturas e contas' });
}

function open(role: 'owner' | 'editor' | 'viewer' = 'owner'): UserEvent {
    renderRouterAt(PATH, { signedIn: true });
    if (role !== 'owner') {
        server.use(http.get('*/auth/me', () => HttpResponse.json(sessionIdentity({ role }))));
    }
    return userEvent.setup();
}

const CALENDAR: readonly CalendarEntry[] = [
    calendarEntry(),
    calendarEntry({
        date: '2026-11-27',
        seriesId: SERIES_ID_LIGHT,
        name: 'Enel',
        amountMinor: 18200,
        isEstimate: true,
        accountKind: 'checking',
        accountName: 'Conta Itaú',
        institutionName: 'Itaú'
    }),
    calendarEntry({ date: '2026-12-03', name: 'Spotify', isSuggestion: true }),
    calendarEntry({ date: '2026-11-12', name: 'Academia', state: 'missed' })
];

describe('RecurringPage: calendário', () => {
    it('lista os débitos por semana, com cartão, estimativa, sugestão e atraso', async () => {
        serve(recurringOverview(), CALENDAR);
        open();

        expect(await screen.findByRole('heading', { name: 'Próximos 60 dias' })).toBeInTheDocument();
        const week: HTMLElement = await screen.findByRole('table', { name: 'Débitos previstos de 23/11 a 29/11' });
        expect(within(week).getByText('no cartão Nubank')).toBeInTheDocument();
        expect(within(week).getByText('Itaú · Conta Itaú')).toBeInTheDocument();
        expect(within(week).getByText('≈ R$ 182,00')).toBeInTheDocument();
        expect(screen.getByText('Sugestão')).toBeInTheDocument();
        expect(screen.getByText('Não cobrou em 12/11')).toBeInTheDocument();
    });

    it('troca para a grade do mês e abre o detalhe de um débito', async () => {
        serve(recurringOverview(), CALENDAR);
        const user: UserEvent = open();

        await user.click(await screen.findByRole('radio', { name: 'Mês' }));
        await user.click(await screen.findByRole('button', { name: 'Ver Enel, 27/11' }));

        expect(await screen.findByRole('dialog', { name: 'Enel' })).toBeInTheDocument();
    });

    it('diz quando não há débito previsto', async () => {
        serve(recurringOverview());
        open();

        expect(await screen.findByText('Nenhum débito previsto nos próximos 60 dias.')).toBeInTheDocument();
    });

    it('mostra a falha do calendário e tenta de novo', async () => {
        serve(recurringOverview());
        server.use(http.get('*/spending/recurring/calendar', () => HttpResponse.json(problem('internal', 500), { status: 500 })));
        const user: UserEvent = open();

        expect(await screen.findByText('Não foi possível carregar o calendário de débitos')).toBeInTheDocument();
        serve(recurringOverview(), CALENDAR);
        await user.click(screen.getAllByRole('button', { name: 'Tentar de novo' })[0] as HTMLElement);

        expect(await screen.findByRole('table', { name: 'Débitos previstos de 23/11 a 29/11' })).toBeInTheDocument();
    });
});

describe('RecurringPage: alertas', () => {
    it('mostra a linha do alerta e marca como visto', async () => {
        serve(recurringOverview({ alerts: [recurringAlert()] }));
        const user: UserEvent = open();
        let seen: string | null = null;
        server.use(
            http.post('*/spending/recurring/alerts/:id/seen', ({ params }) => {
                seen = String(params['id']);
                return HttpResponse.json({ id: seen, seen: true });
            })
        );

        expect(await screen.findByText('Enel subiu de R$ 44,90 para R$ 55,90 em outubro (+25%)')).toBeInTheDocument();
        expect(screen.getByText('A Vera não cancela assinaturas. Cancele no app do serviço ou do banco.')).toBeInTheDocument();
        await user.click(screen.getByRole('button', { name: 'Enel: visto' }));

        await waitFor(() => {
            expect(seen).toBe(recurringAlert().id);
        });
        expect(await screen.findByText('Alerta marcado como visto')).toBeInTheDocument();
    });

    it('oferece "Cancelei" na renovação e "Ver cobranças" abre a série', async () => {
        serve(
            recurringOverview({
                alerts: [recurringAlert({ kind: 'renewal', canMarkSeen: false, data: { amountMinor: 23900, daysUntil: 18 } })]
            })
        );
        const user: UserEvent = open();

        expect(await screen.findByText('Enel renova em 18 dias: R$ 239,00')).toBeInTheDocument();
        expect(screen.queryByRole('button', { name: 'Enel: visto' })).not.toBeInTheDocument();
        await user.click(within(alertList()).getByRole('button', { name: 'Enel: cancelei' }));
        expect(await screen.findByText('Enel marcada como cancelada')).toBeInTheDocument();
    });

    it('oferece "Não é recorrente" na sugestão que ninguém revisou', async () => {
        serve(
            recurringOverview({
                alerts: [
                    recurringAlert({
                        kind: 'still_using',
                        seriesId: recurringSeries().id,
                        seriesName: 'Netflix',
                        data: { amountMinor: 5590, chargeCount: 4 }
                    })
                ]
            })
        );
        const user: UserEvent = open();

        await screen.findByText(/Netflix cobrou 4 vezes/);
        await user.click(within(alertList()).getByRole('button', { name: 'Netflix: não é recorrente' }));

        expect(await screen.findByText(/Netflix saiu das sugestões/)).toBeInTheDocument();
    });

    it('esconde as ações de edição de quem só consulta', async () => {
        serve(recurringOverview({ alerts: [recurringAlert()] }));
        open('viewer');

        expect(await screen.findByText(/Enel subiu de/)).toBeInTheDocument();
        expect(screen.queryByRole('button', { name: 'Enel: visto' })).not.toBeInTheDocument();
        await userEvent.click(screen.getByRole('button', { name: 'Enel: ver cobranças' }));
        expect(await screen.findByRole('dialog', { name: 'Enel' })).toBeInTheDocument();
    });
});

describe('RecurringPage: detalhe da série', () => {
    it('edita a série confirmada', async () => {
        serve(recurringOverview());
        const user: UserEvent = open();
        let sent: UpdateSeriesBody | null = null;
        server.use(
            http.patch('*/spending/recurring/:id', async ({ request }) => {
                sent = (await request.json()) as UpdateSeriesBody;
                return HttpResponse.json(confirmedLight());
            })
        );

        await user.click(await screen.findByRole('button', { name: 'Detalhes de Enel' }));
        const detail: HTMLElement = await screen.findByRole('dialog', { name: 'Enel' });
        await user.click(within(detail).getByRole('button', { name: 'Editar' }));
        const form: HTMLElement = await screen.findByRole('dialog', { name: 'Editar Enel' });
        await user.clear(within(form).getByRole('textbox', { name: 'Nome' }));
        await user.type(within(form).getByRole('textbox', { name: 'Nome' }), 'Luz de casa');
        await user.click(within(form).getByRole('button', { name: 'Salvar' }));

        await waitFor(() => {
            expect(sent).toEqual({ name: 'Luz de casa', cadence: 'monthly', expectedDay: 8, valueMode: 'variable', kind: 'bill' });
        });
        expect(await screen.findByText('Luz de casa atualizada')).toBeInTheDocument();
    });

    it('recusa um dia inválido sem chamar a API', async () => {
        serve(recurringOverview());
        const user: UserEvent = open();
        let called: boolean = false;
        server.use(
            http.patch('*/spending/recurring/:id', () => {
                called = true;
                return HttpResponse.json(confirmedLight());
            })
        );

        await user.click(await screen.findByRole('button', { name: 'Detalhes de Enel' }));
        await user.click(await screen.findByRole('button', { name: 'Editar' }));
        const form: HTMLElement = await screen.findByRole('dialog', { name: 'Editar Enel' });
        await user.clear(within(form).getByRole('textbox', { name: 'Dia do mês' }));
        await user.type(within(form).getByRole('textbox', { name: 'Dia do mês' }), '40');
        await user.click(within(form).getByRole('button', { name: 'Salvar' }));

        expect(await within(form).findByText('Informe um dia de 1 a 31')).toBeInTheDocument();
        expect(called).toBe(false);
    });

    it('tira uma cobrança da série depois de confirmar', async () => {
        const light: RecurringSeriesView = confirmedLight({
            lastCharges: [{ transactionId: '00000000-0000-4000-8000-0000000000f9', date: '2026-11-08', amountMinor: 15000 }]
        });
        serve(recurringOverview({ confirmed: [light] }));
        const user: UserEvent = open();
        let removed: string | null = null;
        server.use(
            http.delete('*/spending/recurring/:id/charges/:transactionId', ({ params }) => {
                removed = String(params['transactionId']);
                return new HttpResponse(null, { status: 204 });
            })
        );

        await user.click(await screen.findByRole('button', { name: 'Detalhes de Enel' }));
        await user.click(await screen.findByRole('button', { name: /^08\/11\/2026, R\$\s150,00: não é desta assinatura$/ }));
        const dialog: HTMLElement = await screen.findByRole('dialog', { name: 'Tirar essa cobrança de Enel?' });
        expect(within(dialog).getByText(/não volta/)).toBeInTheDocument();
        await user.click(within(dialog).getByRole('button', { name: 'Tirar da série' }));

        await waitFor(() => {
            expect(removed).toBe('00000000-0000-4000-8000-0000000000f9');
        });
        expect(await screen.findByText('Cobrança tirada de Enel')).toBeInTheDocument();
    });

    it('traduz o erro de uma cobrança que já saiu da série', async () => {
        const light: RecurringSeriesView = confirmedLight({
            lastCharges: [{ transactionId: '00000000-0000-4000-8000-0000000000f9', date: '2026-11-08', amountMinor: 15000 }]
        });
        serve(recurringOverview({ confirmed: [light] }));
        const user: UserEvent = open();
        server.use(
            http.delete('*/spending/recurring/:id/charges/:transactionId', () =>
                HttpResponse.json(problem('recurring.charge_not_found', 404), { status: 404 })
            )
        );

        await user.click(await screen.findByRole('button', { name: 'Detalhes de Enel' }));
        await user.click(await screen.findByRole('button', { name: /^08\/11\/2026, R\$\s150,00: não é desta assinatura$/ }));
        await user.click(within(await screen.findByRole('dialog')).getByRole('button', { name: 'Tirar da série' }));

        expect(await screen.findByText('Essa cobrança já não faz parte da série. Atualize a tela.')).toBeInTheDocument();
    });

    it('mostra o detalhe sem editar para quem só consulta', async () => {
        serve(recurringOverview());
        const user: UserEvent = open('viewer');

        await user.click(await screen.findByRole('button', { name: 'Detalhes de Enel' }));

        const detail: HTMLElement = await screen.findByRole('dialog', { name: 'Enel' });
        expect(within(detail).getByText('Nenhuma cobrança nesta série.')).toBeInTheDocument();
        expect(within(detail).queryByRole('button', { name: 'Editar' })).not.toBeInTheDocument();
    });
});
