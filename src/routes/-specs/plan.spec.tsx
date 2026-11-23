import { afterEach, describe, expect, it, vi, type MockInstance } from 'vitest';
import { act, screen, waitFor, within } from '@testing-library/react';
import userEvent, { type UserEvent } from '@testing-library/user-event';
import type { AnyRouter } from '@tanstack/react-router';
import { http, HttpResponse } from 'msw';
import type { AnalyticsEventName } from '@/shared/lib/analytics/events';
import type { BillingMe, InvoicesPage } from '@/features/billing/types';
import { problem } from '../../../test/fixtures/auth';
import { billingMe, billingSubscription, billingUsage, freeBilling, invoiceRow } from '../../../test/fixtures/billing';
import { member, membersList } from '../../../test/fixtures/members';
import { server } from '../../../test/msw/server';
import { renderRouterAt } from '../../../test/router';

const tracked: { name: string; props: unknown }[] = [];

vi.mock('@/shared/lib/analytics', () => ({
    track: (name: AnalyticsEventName, props?: unknown): void => {
        tracked.push({ name, props });
    },
    resetAnalytics: vi.fn(),
    initAnalytics: vi.fn()
}));

interface Mock {
    me: BillingMe;
    posts: string[];
    bodies: unknown[];
    invoices: InvoicesPage;
}

function mockBilling(me: BillingMe, extra: Partial<Mock> = {}): Mock {
    const mock: Mock = { me, posts: [], bodies: [], invoices: { items: [], page: 1, total: 0 }, ...extra };
    server.use(
        http.get('*/billing/me', (): Response => HttpResponse.json(mock.me)),
        http.get('*/billing/invoices', (): Response => HttpResponse.json(mock.invoices)),
        http.get('*/billing/invoices/:id/payment-link', (): Response =>
            HttpResponse.json({ url: 'https://pay.example/inv', kind: 'invoice' })
        ),
        http.post('*/billing/subscription', async ({ request }): Promise<Response> => {
            mock.bodies.push(await request.json());
            return HttpResponse.json({ next: 'card_capture', captureUrl: 'https://pay.example/capture' }, { status: 201 });
        }),
        http.post('*/billing/subscription/cancel', (): Response => {
            mock.posts.push('cancel');
            return HttpResponse.json({ ...mock.me, endedNow: false });
        }),
        http.post('*/billing/subscription/resume', (): Response => {
            mock.posts.push('resume');
            return HttpResponse.json(mock.me);
        }),
        http.post('*/billing/payment-method/capture-session', (): Response =>
            HttpResponse.json({ captureUrl: 'https://pay.example/swap' })
        ),
        http.post('*/billing/payment-method/confirm', (): Response => {
            mock.posts.push('confirm');
            return HttpResponse.json(mock.me);
        })
    );
    return mock;
}

async function openPlan(path: string = '/settings/plan'): Promise<UserEvent> {
    renderRouterAt(path, { signedIn: true });
    await screen.findByRole('heading', { name: 'Configurações', level: 1 });
    return userEvent.setup();
}

function premiumMe(overrides: Partial<BillingMe> = {}): BillingMe {
    return billingMe({ subscription: billingSubscription(), usage: billingUsage(), ...overrides });
}

function focusWindow(): void {
    act((): void => {
        document.dispatchEvent(new Event('visibilitychange'));
    });
}

afterEach((): void => {
    tracked.length = 0;
    vi.restoreAllMocks();
});

describe('aba Plano: Free', () => {
    it('mostra os dois planos, o comparativo e a nota da cota', async () => {
        mockBilling(freeBilling());
        await openPlan();

        expect(await screen.findByText('Free: carteira e gastos completos, sem custo e sem prazo.')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Assinar o Premium' })).toBeInTheDocument();
        expect(screen.getByText('Plano atual')).toBeInTheDocument();
        const table: HTMLElement = screen.getByRole('table', { name: 'Free e Premium lado a lado' });
        expect(within(table).getAllByRole('row')).toHaveLength(8);
        expect(screen.getByText(/não existe cobrança extra/)).toBeInTheDocument();
        expect(tracked).toContainEqual({ name: 'plan_viewed', props: { plan: 'free' } });
    });

    it('quem não é Dono não vê o botão de assinar', async () => {
        mockBilling(freeBilling({ canManage: false }));
        await openPlan();

        expect(await screen.findByText('Só o Dono da conta muda o plano.')).toBeInTheDocument();
        expect(screen.queryByRole('button', { name: 'Assinar o Premium' })).not.toBeInTheDocument();
    });

    it('só Pix: o checkout esconde o cartão', async () => {
        mockBilling(freeBilling({ methods: ['pix'] }));
        const user: UserEvent = await openPlan();

        await user.click(await screen.findByRole('button', { name: 'Assinar o Premium' }));

        expect(await screen.findByRole('button', { name: 'Assinar com Pix' })).toBeInTheDocument();
        expect(screen.queryByRole('radio', { name: 'Cartão de crédito' })).not.toBeInTheDocument();
    });
});

describe('checkout', () => {
    it('cartão: confirma o aviso e vai para a página de captura na mesma aba', async () => {
        const mock: Mock = mockBilling(freeBilling());
        const user: UserEvent = await openPlan();
        await user.click(await screen.findByRole('button', { name: 'Assinar o Premium' }));
        await user.click(await screen.findByRole('radio', { name: 'Cartão de crédito' }));

        await user.click(screen.getByRole('button', { name: /Assinar por R\$\s14,90\/mês/ }));

        const confirm: HTMLElement = await screen.findByRole('button', { name: 'Ir para o pagamento' });
        const assign: ReturnType<typeof vi.fn> = vi.fn();
        vi.spyOn(window, 'location', 'get').mockReturnValue({ assign } as unknown as Location);
        await user.click(confirm);

        expect(assign).toHaveBeenCalledWith('https://pay.example/capture');
        expect(mock.bodies).toEqual([{ method: 'card' }]);
        expect(tracked).toContainEqual({ name: 'checkout_started', props: { method: 'card' } });
    });

    it('Pix: gera a cobrança, abre a página no clique e espera o Premium ao focar', async () => {
        const mock: Mock = mockBilling(freeBilling());
        server.use(
            http.post('*/billing/subscription', (): Response => {
                mock.bodies.push({ method: 'pix' });
                return HttpResponse.json({ next: 'pay_invoice' }, { status: 201 });
            })
        );
        const user: UserEvent = await openPlan();
        await user.click(await screen.findByRole('button', { name: 'Assinar o Premium' }));
        await user.click(await screen.findByRole('button', { name: 'Assinar com Pix' }));
        expect(await screen.findByText('Gerando a cobrança…')).toBeInTheDocument();

        mock.me = freeBilling({ openInvoice: { id: 'inv_1', status: 'issued', totalCents: 1490, dueDate: '2026-11-30T12:00:00.000Z' } });
        focusWindow();
        const tab: { opener: unknown; location: { href: string }; close: () => void } = {
            opener: 'app',
            location: { href: '' },
            close: vi.fn()
        };
        const open: MockInstance = vi.spyOn(window, 'open').mockReturnValue(tab as unknown as Window);
        await user.click(await screen.findByRole('button', { name: 'Pagar com Pix' }));

        expect(open).toHaveBeenCalledWith('about:blank', '_blank');
        await waitFor((): void => {
            expect(tab.location.href).toBe('https://pay.example/inv');
        });
        expect(await screen.findByText('Confirmando o pagamento…')).toBeInTheDocument();

        mock.me = premiumMe({ subscription: billingSubscription({ method: 'pix', card: null }) });
        focusWindow();

        expect(await screen.findByText('Por onde começar. Cada função pede a sua permissão antes de ligar.')).toBeInTheDocument();
        expect(screen.getByRole('link', { name: 'Abrir' })).toHaveAttribute('href', '/spending');
        expect(tracked).toContainEqual({ name: 'checkout_completed', props: { method: 'pix' } });
    });

    it('mostra a mensagem do código de erro da API', async () => {
        mockBilling(freeBilling());
        server.use(
            http.post('*/billing/subscription', (): Response =>
                HttpResponse.json(problem('billing.provider_unavailable', 502), { status: 502 })
            )
        );
        const user: UserEvent = await openPlan();
        await user.click(await screen.findByRole('button', { name: 'Assinar o Premium' }));
        await user.click(await screen.findByRole('button', { name: 'Assinar com Pix' }));

        expect(await screen.findByText('A página de pagamento está fora do ar. Tente de novo em alguns minutos.')).toBeInTheDocument();
        expect(tracked).toContainEqual({ name: 'checkout_failed', props: { method: 'pix', code: 'billing.provider_unavailable' } });
    });
});

describe('volta da página de cartão', () => {
    it('?card=saved confirma o cartão e espera o Premium', async () => {
        const mock: Mock = mockBilling(freeBilling());
        const router: AnyRouter = renderRouterAt('/settings/plan?card=saved', { signedIn: true });
        expect(await screen.findByText('Confirmando o pagamento…')).toBeInTheDocument();

        await waitFor((): void => {
            expect(mock.posts).toContain('confirm');
        });
        expect(router.state.location.search).toEqual({});
        mock.me = premiumMe();
        focusWindow();

        expect(await screen.findByRole('heading', { name: 'Premium ativo' })).toBeInTheDocument();
        expect(tracked).toContainEqual({ name: 'card_capture_returned', props: { result: 'saved' } });
    });

    it('?card=canceled avisa que nada foi cobrado e fica no Free', async () => {
        const mock: Mock = mockBilling(freeBilling());
        renderRouterAt('/settings/plan?card=canceled', { signedIn: true });

        expect(await screen.findByText('Cartão não salvo. Nada foi cobrado.')).toBeInTheDocument();
        expect(mock.posts).not.toContain('confirm');
        expect(screen.getByRole('button', { name: 'Assinar o Premium' })).toBeInTheDocument();
    });
});

describe('aba Plano: Premium', () => {
    it('cartão ativo: assinatura, próxima cobrança, forma de pagamento, uso e histórico', async () => {
        mockBilling(premiumMe(), { invoices: { items: [invoiceRow()], page: 1, total: 1 } });
        server.use(http.get('*/members', (): Response => HttpResponse.json(membersList({ members: [member()] }))));
        await openPlan();

        expect(await screen.findByText('Premium ativo')).toBeInTheDocument();
        expect(screen.getByText(/R\$\s14,90\/mês · assinante desde 9 de setembro de 2026/)).toBeInTheDocument();
        expect(screen.getByText(/9 de dezembro de 2026 · R\$\s14,90/)).toBeInTheDocument();
        expect(screen.getByText('Cartão visa final 4242, renovação automática')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Trocar cartão' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Cancelar assinatura' })).toBeInTheDocument();
        expect(screen.getByText('Uso do mês')).toBeInTheDocument();
        const history: HTMLElement = await screen.findByRole('table', { name: 'Histórico de cobranças' });
        expect(within(history).getByText('Paga')).toBeInTheDocument();
        expect(screen.queryByText('Ver pessoas')).not.toBeInTheDocument();
    });

    it('com desconto vigente: mostra o valor da próxima cobrança vindo da API e até quando vale', async () => {
        mockBilling(
            premiumMe({
                subscription: billingSubscription({
                    nextChargeAmountMinor: 1118,
                    discount: { percent: 25, cycle: 4, endsAt: '2027-03-09T12:00:00.000Z' }
                })
            })
        );
        await openPlan();

        expect(await screen.findByText(/9 de dezembro de 2026 · R\$\s11,18 · 25% de desconto até 9 de março de 2027/)).toBeInTheDocument();
    });

    it('Pix: a próxima cobrança chega por e-mail e não há "Usar Pix"', async () => {
        mockBilling(premiumMe({ subscription: billingSubscription({ method: 'pix', card: null }) }));
        await openPlan();

        expect(await screen.findByText(/a cobrança Pix chega por e-mail/)).toBeInTheDocument();
        expect(screen.getByText('Pix, uma cobrança por mês')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Usar cartão' })).toBeInTheDocument();
        expect(screen.queryByRole('button', { name: /Usar Pix/ })).not.toBeInTheDocument();
    });

    it('com 3 pessoas mostra a linha Pessoas', async () => {
        mockBilling(premiumMe());
        server.use(
            http.get('*/members', (): Response =>
                HttpResponse.json(membersList({ members: [member(), member({ userId: 'u2' }), member({ userId: 'u3' })] }))
            )
        );
        await openPlan();

        expect(await screen.findByText('Vale para as 3 pessoas da conta.')).toBeInTheDocument();
        expect(screen.getByRole('link', { name: 'Ver pessoas' })).toHaveAttribute('href', '/settings/people');
    });

    it('"Usar cartão" abre a sessão de captura e vai para a página', async () => {
        mockBilling(premiumMe({ subscription: billingSubscription({ method: 'pix', card: null }) }));
        const user: UserEvent = await openPlan();

        await user.click(await screen.findByRole('button', { name: 'Usar cartão' }));
        const assign: ReturnType<typeof vi.fn> = vi.fn();
        await screen.findByText('Você vai para a página segura de pagamento. A Vera não vê nem guarda os dados do cartão.');
        vi.spyOn(window, 'location', 'get').mockReturnValue({ assign } as unknown as Location);
        await user.click(screen.getByRole('button', { name: 'Ir para o pagamento' }));

        expect(assign).toHaveBeenCalledWith('https://pay.example/swap');
    });

    it('fatura aberta: "Pagar" abre a página de pagamento da fatura', async () => {
        mockBilling(
            premiumMe({
                subscription: billingSubscription({ method: 'pix', card: null }),
                openInvoice: { id: 'inv_9', status: 'issued', totalCents: 1490, dueDate: '2026-11-30T12:00:00.000Z' }
            })
        );
        const tab: { opener: unknown; location: { href: string }; close: () => void } = {
            opener: 'app',
            location: { href: '' },
            close: vi.fn()
        };
        vi.spyOn(window, 'open').mockReturnValue(tab as unknown as Window);
        const user: UserEvent = await openPlan();

        await user.click(await screen.findByRole('button', { name: 'Pagar' }));

        await waitFor((): void => {
            expect(tab.location.href).toBe('https://pay.example/inv');
        });
        expect(tracked).toContainEqual({ name: 'invoice_pay_clicked', props: { from: 'plan' } });
    });

    it('atrasada: avisa até quando o Premium continua, com Pagar e Usar cartão', async () => {
        mockBilling(
            premiumMe({
                subscription: billingSubscription({ status: 'past_due', graceEndsAt: '2026-11-26T12:00:00.000Z' }),
                openInvoice: { id: 'inv_9', status: 'overdue', totalCents: 1490, dueDate: '2026-11-23T12:00:00.000Z' }
            })
        );
        await openPlan();

        const alert: HTMLElement = await screen.findByRole('alert', { name: '' });
        expect(within(alert).getByText('Não conseguimos cobrar. Seu Premium continua até 26 de novembro de 2026.')).toBeInTheDocument();
        expect(within(alert).getByRole('button', { name: 'Pagar' })).toBeInTheDocument();
        expect(within(alert).getByRole('button', { name: 'Usar cartão' })).toBeInTheDocument();
    });

    it('cancelada: sem próxima cobrança e com Reativar só se canResume', async () => {
        const canceled = (canResume: boolean): BillingMe =>
            premiumMe({ subscription: billingSubscription({ status: 'canceled', nextChargeAt: null, canResume }) });
        const mock: Mock = mockBilling(canceled(true));
        const user: UserEvent = await openPlan();

        expect(await screen.findByText(/Nenhuma\. O Premium vale até 9 de dezembro de 2026/)).toBeInTheDocument();
        expect(screen.queryByRole('button', { name: 'Cancelar assinatura' })).not.toBeInTheDocument();
        await user.click(screen.getByRole('button', { name: 'Reativar assinatura' }));

        await waitFor((): void => {
            expect(mock.posts).toContain('resume');
        });
        expect(await screen.findByText(/Assinatura reativada/)).toBeInTheDocument();
        expect(tracked).toContainEqual({ name: 'subscription_resumed', props: undefined });
    });

    it('cancelada sem canResume não oferece reativar', async () => {
        mockBilling(premiumMe({ subscription: billingSubscription({ status: 'canceled', nextChargeAt: null, canResume: false }) }));
        await openPlan();

        expect(await screen.findByText('cancelada')).toBeInTheDocument();
        expect(screen.queryByRole('button', { name: 'Reativar assinatura' })).not.toBeInTheDocument();
    });

    it('cancelar fora do arrependimento mostra os três itens e cancela', async () => {
        const mock: Mock = mockBilling(premiumMe());
        const user: UserEvent = await openPlan();

        await user.click(await screen.findByRole('button', { name: 'Cancelar assinatura' }));
        const dialog: HTMLElement = await screen.findByRole('dialog', { name: 'Cancelar o Premium?' });
        expect(within(dialog).getAllByRole('listitem')).toHaveLength(3);
        expect(within(dialog).queryByText(/dentro dos 7 dias/)).not.toBeInTheDocument();
        await user.click(within(dialog).getByRole('button', { name: 'Cancelar assinatura' }));

        await waitFor((): void => {
            expect(mock.posts).toContain('cancel');
        });
        expect(tracked).toContainEqual({ name: 'subscription_canceled', props: { endedNow: false } });
    });

    it('cancelar dentro dos 7 dias avisa do estorno', async () => {
        const soon: string = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString();
        mockBilling(premiumMe({ subscription: billingSubscription({ withdrawalEndsAt: soon }) }));
        const user: UserEvent = await openPlan();

        await user.click(await screen.findByRole('button', { name: 'Cancelar assinatura' }));

        expect(
            await screen.findByText('Você está dentro dos 7 dias: o Premium termina agora e o valor volta para você em até 10 dias úteis.')
        ).toBeInTheDocument();
    });

    it('sem canManage não há botões de mudança', async () => {
        mockBilling(premiumMe({ canManage: false }));
        await openPlan();

        expect(await screen.findByText('Só o Dono da conta muda o plano.')).toBeInTheDocument();
        for (const name of ['Cancelar assinatura', 'Trocar cartão', 'Reativar assinatura', 'Pagar']) {
            expect(screen.queryByRole('button', { name })).not.toBeInTheDocument();
        }
    });

    it('teste sem cartão: mostra os dias que faltam e o botão de assinar', async () => {
        mockBilling(
            premiumMe({
                subscription: null,
                trial: { kind: 'no_card', endsAt: '2026-12-01T12:00:00.000Z', daysLeft: 8 }
            })
        );
        await openPlan();

        expect(await screen.findByText('Faltam 8 dias. O teste termina em 1 de dezembro de 2026.')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Assinar o Premium' })).toBeInTheDocument();
    });
});

describe('histórico de cobranças', () => {
    it('pagina e abre a fatura numa aba', async () => {
        const items = Array.from({ length: 12 }, (_unused: unknown, index: number) => invoiceRow({ id: `inv_${String(index)}` }));
        mockBilling(premiumMe(), { invoices: { items, page: 1, total: 24 } });
        const tab: { opener: unknown; location: { href: string }; close: () => void } = {
            opener: 'app',
            location: { href: '' },
            close: vi.fn()
        };
        vi.spyOn(window, 'open').mockReturnValue(tab as unknown as Window);
        const user: UserEvent = await openPlan();

        const table: HTMLElement = await screen.findByRole('table', { name: 'Histórico de cobranças' });
        expect(screen.getByText('1 / 2')).toBeInTheDocument();
        await user.click(within(table).getAllByRole('button', { name: 'Ver fatura' })[0] as HTMLElement);

        await waitFor((): void => {
            expect(tab.location.href).toBe('https://pay.example/inv');
        });
        expect(tracked).toContainEqual({ name: 'invoice_viewed', props: undefined });
    });
});
