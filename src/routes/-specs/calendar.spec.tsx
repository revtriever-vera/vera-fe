import { afterEach, describe, expect, it, vi, type MockInstance } from 'vitest';
import { screen, waitFor, within } from '@testing-library/react';
import userEvent, { type UserEvent } from '@testing-library/user-event';
import type { AnyRouter } from '@tanstack/react-router';
import { http, HttpResponse } from 'msw';
import type { BillingMe } from '@/features/billing/types';
import type { ConnectionView, EventItem } from '@/features/calendar/types';
import * as analytics from '@/shared/lib/analytics';
import { problem } from '../../../test/fixtures/auth';
import { billingMe, freeBilling, selfHostedBilling } from '../../../test/fixtures/billing';
import { activeConnection, connectionView, eventItem, eventsView, GOOGLE_URL } from '../../../test/fixtures/calendar';
import { server } from '../../../test/msw/server';
import { renderRouterAt } from '../../../test/router';

interface Mock {
    connection: ConnectionView;
    disconnected: number;
    started: number;
}

function mockCalendar(connection: ConnectionView, events: EventItem[] = [], billing: BillingMe = billingMe()): Mock {
    const mock: Mock = { connection, disconnected: 0, started: 0 };
    server.use(
        http.get('*/billing/me', (): Response => HttpResponse.json(billing)),
        http.get('*/calendar/connection', (): Response => HttpResponse.json(mock.connection)),
        http.get('*/calendar/events', (): Response => HttpResponse.json(eventsView(events))),
        http.get('*/calendar/google/start', (): Response => {
            mock.started += 1;
            return HttpResponse.json({ url: GOOGLE_URL });
        }),
        http.delete('*/calendar/connection', (): Response => {
            mock.disconnected += 1;
            mock.connection = connectionView();
            return new HttpResponse(null, { status: 204 });
        })
    );
    return mock;
}

async function openTab(search: string = ''): Promise<void> {
    renderRouterAt(`/settings/calendar${search}`, { signedIn: true });
    await screen.findByRole('heading', { name: 'Configurações', level: 1 });
}

afterEach(() => {
    vi.restoreAllMocks();
});

describe('aba Google Agenda: estados', () => {
    it('no Free mostra o cartão bloqueado com a ação para o plano', async () => {
        mockCalendar(connectionView(), [], freeBilling());
        await openTab();

        expect(await screen.findByText('Disponível no Premium, junto com a Vera no WhatsApp.')).toBeInTheDocument();
        expect(screen.getByRole('link', { name: 'Ver o Premium' })).toHaveAttribute('href', '/settings/plan');
        expect(screen.queryByRole('button', { name: 'Conectar Google Agenda' })).not.toBeInTheDocument();
    });

    it('na auto-hospedada sem chave leva às integrações', async () => {
        mockCalendar(connectionView(), [], selfHostedBilling({ features: { ai: 'disabled', whatsapp: 'disabled', calendar: 'disabled' } }));
        await openTab();

        expect(await screen.findByText('Sem as chaves do Google nesta instalação.')).toBeInTheDocument();
        expect(screen.getByRole('link', { name: 'Ver integrações' })).toHaveAttribute('href', '/settings/integrations');
    });

    it('na hospedada fora do ar avisa sem ação', async () => {
        mockCalendar(connectionView(), [], billingMe({ features: { ai: 'available', whatsapp: 'available', calendar: 'disabled' } }));
        await openTab();

        expect(await screen.findByText('O Google Agenda está indisponível agora.')).toBeInTheDocument();
        expect(screen.queryByRole('link', { name: 'Ver integrações' })).not.toBeInTheDocument();
    });

    it('quando a conexão responde provider_disabled mostra o aviso de indisponível', async () => {
        mockCalendar(connectionView());
        server.use(
            http.get('*/calendar/connection', (): Response =>
                HttpResponse.json(problem('calendar.provider_disabled', 503), { status: 503 })
            )
        );
        await openTab();

        expect(await screen.findByText('O Google Agenda está indisponível agora.')).toBeInTheDocument();
    });

    it('desconectado oferece conectar', async () => {
        mockCalendar(connectionView());
        await openTab();

        expect(await screen.findByRole('button', { name: 'Conectar Google Agenda' })).toBeInTheDocument();
        expect(screen.queryByText('A permissão foi revogada no Google. Conecte de novo.')).not.toBeInTheDocument();
    });

    it('revogado avisa e oferece conectar de novo', async () => {
        mockCalendar(connectionView({ status: 'revoked', email: 'ana@exemplo.com' }));
        await openTab();

        expect(await screen.findByText('A permissão foi revogada no Google. Conecte de novo.')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Conectar Google Agenda' })).toBeInTheDocument();
    });

    it('conectado mostra o e-mail, a permissão e o selo', async () => {
        mockCalendar(activeConnection());
        await openTab();

        expect(await screen.findByText('ana@exemplo.com')).toBeInTheDocument();
        expect(screen.getByText('Permissão: ver e editar eventos da agenda principal.')).toBeInTheDocument();
        expect(screen.getByText('conectado')).toBeInTheDocument();
    });

    it('conectado só com leitura diz a permissão real', async () => {
        mockCalendar(activeConnection({ access: 'read_only' }));
        await openTab();

        expect(await screen.findByText('Permissão: só ver eventos da agenda principal.')).toBeInTheDocument();
    });

    it('erro ao ler a conexão mostra a mensagem genérica', async () => {
        mockCalendar(connectionView());
        server.use(http.get('*/calendar/connection', (): Response => HttpResponse.json(problem('core.internal', 400), { status: 400 })));
        await openTab();

        expect(await screen.findByText('Não deu certo agora. Tente de novo em instantes.')).toBeInTheDocument();
    });
});

describe('aba Google Agenda: conectar', () => {
    it('o modal explica a permissão, cancela e leva ao Google', async () => {
        const user: UserEvent = userEvent.setup();
        const assign: MockInstance = vi.fn();
        vi.stubGlobal('location', { assign });
        const track: MockInstance<typeof analytics.track> = vi.spyOn(analytics, 'track');
        const mock: Mock = mockCalendar(connectionView());
        await openTab();

        await user.click(await screen.findByRole('button', { name: 'Conectar Google Agenda' }));
        const dialog: HTMLElement = await screen.findByRole('dialog', { name: 'Conectar o Google Agenda' });
        expect(within(dialog).getByText('Permissão pedida: ver e editar eventos')).toBeInTheDocument();
        expect(within(dialog).getByText('O que a Vera não acessa')).toBeInTheDocument();
        await user.click(within(dialog).getByRole('button', { name: 'Cancelar' }));
        await waitFor(() => {
            expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
        });
        expect(mock.started).toBe(0);

        await user.click(screen.getByRole('button', { name: 'Conectar Google Agenda' }));
        await user.click(await screen.findByRole('button', { name: 'Continuar no Google' }));

        await waitFor(() => {
            expect(assign).toHaveBeenCalledWith(GOOGLE_URL);
        });
        expect(track).toHaveBeenCalledWith('calendar_connect_started');
        vi.unstubAllGlobals();
    });

    it('não redireciona para uma URL que não é https', async () => {
        const user: UserEvent = userEvent.setup();
        const assign: MockInstance = vi.fn();
        vi.stubGlobal('location', { assign });
        mockCalendar(connectionView());
        server.use(http.get('*/calendar/google/start', (): Response => HttpResponse.json({ url: 'javascript:alert(1)' })));
        await openTab();

        await user.click(await screen.findByRole('button', { name: 'Conectar Google Agenda' }));
        await user.click(await screen.findByRole('button', { name: 'Continuar no Google' }));

        expect(await screen.findByText('Não deu certo agora. Tente de novo em instantes.')).toBeInTheDocument();
        expect(assign).not.toHaveBeenCalled();
        vi.unstubAllGlobals();
    });

    it('erro do start vira toast', async () => {
        const user: UserEvent = userEvent.setup();
        mockCalendar(connectionView());
        server.use(
            http.get('*/calendar/google/start', (): Response =>
                HttpResponse.json(problem('calendar.provider_disabled', 503), { status: 503 })
            )
        );
        await openTab();

        await user.click(await screen.findByRole('button', { name: 'Conectar Google Agenda' }));
        await user.click(await screen.findByRole('button', { name: 'Continuar no Google' }));

        expect(await screen.findByText('O Google Agenda está indisponível agora.')).toBeInTheDocument();
    });
});

describe('aba Google Agenda: volta do Google', () => {
    it('connected=1 mostra o aviso, registra e limpa a query', async () => {
        const track: MockInstance<typeof analytics.track> = vi.spyOn(analytics, 'track');
        mockCalendar(activeConnection());
        const router: AnyRouter = renderRouterAt('/settings/calendar?connected=1', { signedIn: true });

        expect(await screen.findByText('Google Agenda conectado')).toBeInTheDocument();
        expect(track).toHaveBeenCalledWith('calendar_connected');
        await waitFor(() => {
            expect(router.state.location.search).toEqual({});
        });
    });

    it.each([
        ['calendar.consent_denied', 'Você não autorizou a agenda. Nada foi conectado.'],
        ['calendar.scope_missing', 'A permissão de ver e editar eventos não foi marcada. Conecte de novo e marque a opção.'],
        ['calendar.state_invalid', 'O pedido venceu. Conecte de novo.'],
        ['calendar.outra', 'Não deu certo agora. Tente de novo em instantes.']
    ])('error=%s mostra a mensagem', async (code, message) => {
        const track: MockInstance<typeof analytics.track> = vi.spyOn(analytics, 'track');
        mockCalendar(connectionView());
        renderRouterAt(`/settings/calendar?error=${code}`, { signedIn: true });

        expect(await screen.findByText(message)).toBeInTheDocument();
        expect(track).toHaveBeenCalledWith('calendar_connect_failed', { code });
    });
});

describe('aba Google Agenda: desconectar', () => {
    it('confirma, desconecta e volta ao estado de conectar', async () => {
        const user: UserEvent = userEvent.setup();
        const track: MockInstance<typeof analytics.track> = vi.spyOn(analytics, 'track');
        const mock: Mock = mockCalendar(activeConnection());
        await openTab();

        await user.click(await screen.findByRole('button', { name: 'Desconectar' }));
        const dialog: HTMLElement = await screen.findByRole('alertdialog').catch(() => screen.findByRole('dialog'));
        expect(within(dialog).getByText('A Vera para de criar e listar reuniões. A permissão é revogada no Google.')).toBeInTheDocument();
        await user.click(within(dialog).getByRole('button', { name: 'Desconectar' }));

        expect(await screen.findByText('Google Agenda desconectado e permissão revogada')).toBeInTheDocument();
        expect(mock.disconnected).toBe(1);
        expect(track).toHaveBeenCalledWith('calendar_disconnected');
        expect(await screen.findByRole('button', { name: 'Conectar Google Agenda' })).toBeInTheDocument();
    });

    it('cancelar não desconecta', async () => {
        const user: UserEvent = userEvent.setup();
        const mock: Mock = mockCalendar(activeConnection());
        await openTab();

        await user.click(await screen.findByRole('button', { name: 'Desconectar' }));
        const dialog: HTMLElement = await screen.findByRole('dialog');
        await user.click(within(dialog).getByRole('button', { name: 'Cancelar' }));

        expect(mock.disconnected).toBe(0);
        expect(screen.getByText('ana@exemplo.com')).toBeInTheDocument();
    });

    it('falha ao desconectar avisa', async () => {
        const user: UserEvent = userEvent.setup();
        mockCalendar(activeConnection());
        server.use(http.delete('*/calendar/connection', (): Response => HttpResponse.json(problem('core.internal', 500), { status: 500 })));
        await openTab();

        await user.click(await screen.findByRole('button', { name: 'Desconectar' }));
        const dialog: HTMLElement = await screen.findByRole('dialog');
        await user.click(within(dialog).getByRole('button', { name: 'Desconectar' }));

        expect(await screen.findByText('Não deu certo agora. Tente de novo em instantes.')).toBeInTheDocument();
    });
});

describe('aba Google Agenda: próximos compromissos', () => {
    it('lista com dia, hora e o selo só nos que a Vera criou', async () => {
        mockCalendar(activeConnection(), [
            eventItem(),
            eventItem({ id: 'evt2', title: 'Dentista', byVera: false, start: '2026-11-25T15:30:00.000Z' }),
            eventItem({ id: 'evt3', title: 'Feriado', byVera: false, allDay: true, start: '2026-11-26T00:00:00.000Z' })
        ]);
        await openTab();

        expect(await screen.findByText('Revisão da carteira com a Ana')).toBeInTheDocument();
        expect(screen.getByText('Dentista')).toBeInTheDocument();
        expect(screen.getAllByText('pela Vera')).toHaveLength(1);
        expect(screen.getByText(/^ter 24\/11 · \d{2}:\d{2}$/)).toBeInTheDocument();
        expect(screen.getByText('qui 26/11')).toBeInTheDocument();
    });

    it('vazio mostra a mensagem', async () => {
        mockCalendar(activeConnection());
        await openTab();

        expect(await screen.findByText('Nenhum compromisso nos próximos 7 dias.')).toBeInTheDocument();
    });

    it('erro mostra o aviso e tenta de novo', async () => {
        const user: UserEvent = userEvent.setup();
        mockCalendar(activeConnection());
        let calls: number = 0;
        server.use(
            http.get('*/calendar/events', (): Response => {
                calls += 1;
                return calls === 1
                    ? HttpResponse.json(problem('calendar.provider_unavailable', 400), { status: 400 })
                    : HttpResponse.json(eventsView([eventItem()]));
            })
        );
        await openTab();

        expect(await screen.findByText('Não deu para ler a agenda agora.')).toBeInTheDocument();
        await user.click(screen.getByRole('button', { name: 'Tentar de novo' }));

        expect(await screen.findByText('Revisão da carteira com a Ana')).toBeInTheDocument();
    });
});
