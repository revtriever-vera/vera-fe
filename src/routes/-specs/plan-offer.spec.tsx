import { afterEach, describe, expect, it, vi } from 'vitest';
import { screen, within } from '@testing-library/react';
import userEvent, { type UserEvent } from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import type { BillingMe } from '@/features/billing/types';
import { billingMe, billingSubscription, freeBilling } from '../../../test/fixtures/billing';
import { server } from '../../../test/msw/server';
import { renderRouterAt } from '../../../test/router';

vi.mock('@/shared/lib/analytics', () => ({ track: vi.fn(), resetAnalytics: vi.fn(), initAnalytics: vi.fn() }));

const RULES: NonNullable<BillingMe['offer']> = {
    trial: { kind: 'none', days: null },
    rules: [
        { percent: 50, fromCycle: 1, toCycle: 3 },
        { percent: 25, fromCycle: 4, toCycle: 6 }
    ],
    redeemedAt: '2026-11-20T12:00:00.000Z',
    expiresAt: '2026-12-20T12:00:00.000Z'
};

function mockMe(me: BillingMe): { bodies: unknown[] } {
    const mock: { bodies: unknown[] } = { bodies: [] };
    server.use(
        http.get('*/billing/me', (): Response => HttpResponse.json(me)),
        http.post('*/billing/subscription', async ({ request }): Promise<Response> => {
            mock.bodies.push(await request.json());
            return HttpResponse.json({ next: 'card_capture', captureUrl: 'https://pay.example/capture' }, { status: 201 });
        })
    );
    return mock;
}

async function openPlan(): Promise<UserEvent> {
    renderRouterAt('/settings/plan', { signedIn: true });
    await screen.findByRole('heading', { name: 'Configurações', level: 1 });
    return userEvent.setup();
}

afterEach((): void => {
    vi.restoreAllMocks();
});

describe('aba Plano: oferta resgatada', () => {
    it('Free com régua: mostra os descontos, o prazo e o preço do ciclo 1 no checkout', async () => {
        mockMe(freeBilling({ offer: RULES }));
        const user: UserEvent = await openPlan();

        const card: HTMLElement = (await screen.findByRole('heading', { name: 'Sua oferta' })).parentElement as HTMLElement;
        expect(within(card).getByText('50% de desconto nos ciclos 1 a 3')).toBeInTheDocument();
        expect(within(card).getByText('25% de desconto nos ciclos 4 a 6')).toBeInTheDocument();
        expect(within(card).getByText('Depois, preço cheio.')).toBeInTheDocument();
        expect(
            within(card).getByText('Para usar, assine até 20 de dezembro de 2026. Depois disso, preço cheio e sem teste.')
        ).toBeInTheDocument();

        await user.click(screen.getByRole('button', { name: 'Assinar o Premium' }));

        expect(await screen.findByText(/R\$\s7,45/)).toBeInTheDocument();
    });

    it('teste com cartão: só cartão, nada cobrado hoje e botão de salvar o cartão', async () => {
        const mock: { bodies: unknown[] } = mockMe(freeBilling({ offer: { ...RULES, trial: { kind: 'card', days: 14 } } }));
        const user: UserEvent = await openPlan();

        await user.click(await screen.findByRole('button', { name: 'Assinar o Premium' }));

        expect(await screen.findByText(/Nada é cobrado hoje\. Em .* cobramos R\$\s7,45\./)).toBeInTheDocument();
        expect(screen.getByText('Com o teste, o pagamento é só no cartão.')).toBeInTheDocument();
        expect(screen.queryByRole('radio', { name: 'Cartão de crédito' })).not.toBeInTheDocument();
        await user.click(screen.getByRole('button', { name: 'Salvar o cartão' }));
        expect(await screen.findByRole('button', { name: 'Ir para o pagamento' })).toBeInTheDocument();
        expect(mock.bodies).toEqual([{ method: 'card' }]);
    });

    it('sem oferta, o cartão de oferta não aparece', async () => {
        mockMe(freeBilling());
        await openPlan();

        await screen.findByRole('heading', { name: 'Seu plano' });
        expect(screen.queryByRole('heading', { name: 'Sua oferta' })).not.toBeInTheDocument();
    });
});

describe('aba Plano: teste', () => {
    it('sem cartão com folga: faixa "Premium grátis até"', async () => {
        mockMe(billingMe({ trial: { kind: 'no_card', endsAt: '2026-12-01T12:00:00.000Z', daysLeft: 8 }, subscription: null }));
        await openPlan();

        expect(await screen.findByText('Premium grátis até 1 de dezembro de 2026')).toBeInTheDocument();
    });

    it('sem cartão a 3 dias do fim: avisa e assina no teste com a cobrança no fim dele', async () => {
        mockMe(
            billingMe({
                trial: { kind: 'no_card', endsAt: '2026-12-01T12:00:00.000Z', daysLeft: 3 },
                subscription: null,
                offer: { ...RULES, trial: { kind: 'no_card', days: 14 } }
            })
        );
        const user: UserEvent = await openPlan();

        expect(await screen.findByText('Seu teste acaba em 1 de dezembro de 2026.')).toBeInTheDocument();
        expect(screen.getByText('Assine para não perder os resumos e o WhatsApp.')).toBeInTheDocument();
        await user.click(screen.getAllByRole('button', { name: 'Assinar o Premium' })[0] as HTMLElement);

        expect(await screen.findByText('Nada é cobrado hoje. Em 1 de dezembro de 2026 cobramos R$ 7,45.')).toBeInTheDocument();
    });

    it('com cartão em teste: diz quando a primeira cobrança acontece, sem inventar o valor', async () => {
        mockMe(
            billingMe({
                trial: { kind: 'card', endsAt: '2026-12-01T12:00:00.000Z', daysLeft: 8 },
                subscription: billingSubscription({ status: 'trialing', nextChargeAt: '2026-12-01T12:00:00.000Z' })
            })
        );
        await openPlan();

        expect(await screen.findByText('Em teste')).toBeInTheDocument();
        expect(screen.getByText('Nada é cobrado até 1 de dezembro de 2026. Nesse dia cobramos no cartão salvo.')).toBeInTheDocument();
        expect(screen.getByText('1 de dezembro de 2026, no fim do teste.')).toBeInTheDocument();
    });
});
